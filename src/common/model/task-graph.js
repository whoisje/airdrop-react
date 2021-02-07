import React, {useEffect} from 'react'
import ReactDOM from 'react-dom'
import {ANT_PREFIX} from '@/constants/global'
import classnames from 'classnames'
import {BehaviorSubject, fromEventPattern, timer} from 'rxjs'
import {filter, take} from 'rxjs/operators'
import produce from 'immer'
import {ConfigProvider, message, Tooltip} from 'antd'
import {RERENDER_EVENT} from '@/constants/graph'
import {GraphCore} from './graph-core'
import {X6DemoGroupNode, X6DemoNode} from "@/common/graph-common/shape/node";
import {GuideEdge, X6DemoGroupEdge} from "@/common/graph-common/shape/edge";
import {NodeElement} from "@/components/AirGraph/AirCanvas/elements/node-element";
import {NodeGroup} from "@/components/AirGraph/AirCanvas/elements/node-group";
import {expandGroupAccordingToNodes, formatGraphData, formatNodeInfoToNodeMeta,} from './graph-util'
import {addNode, copyNode, queryGraph} from '@/mock/graph'
import {queryGraphStatus, runGraph, stopGraphRun} from '@/mock/status'

export function parseStatus(data) {
  const {execInfo, instStatus} = data
  Object.entries(execInfo).forEach(([id, val]) => {
    // 更新execInfo中的执行状态，后端可能不同步
    val.jobStatus = instStatus[id]
  })
  return data
}


class ExperimentGraph extends GraphCore {
  // 重新声明节点元信息的类型
  nodeMetas;
  // 重新声明边的元信息的类型
  edgeMetas;
  // 等待渲染的节点，由于初次渲染 group 时需要 group 内的节点和边都渲染完成，因此放到 afterLayout 里面渲染 group
  pendingNodes = [];
  // 实验 id
  experimentId;

  // 实验图加载状态
  loading$ = new BehaviorSubject(false);

  // 实验图运行状态
  running$ = new BehaviorSubject(false)

  // 实验数据
  experiment$ = new BehaviorSubject(
    null,
  )

  // 实验图数据
  experimentGraph$ = new BehaviorSubject(
    null,
  )

  // 当前选中节点
  activeNodeInstance$ = new BehaviorSubject(
    null,
  )

  // 当前执行状态
  executionStatus$ = new BehaviorSubject(
    null,
  )

  // 当前弹窗
  activeModal$ = new BehaviorSubject(null)

  // 当前选中的群组
  selectedGroup$ = new BehaviorSubject(undefined)

  // 图数据的订阅
  experimentGraphSub

  // 查询执行状态的定时器订阅
  executionStatusQuerySub

  // 主动触发的重新渲染订阅
  reRenderSub

  constructor(expId) {
    super({
      history: true,
      frozen: true,
      selecting: {
        enabled: true,
        rubberband: false,
        multiple: true,
        strict: true,
        showNodeSelectionBox: false,
        selectNodeOnMoved: false,
      },
      keyboard: {
        enabled: true,
      },
      connecting: {
        snap: {radius: 10},
        allowBlank: false,
        highlight: true,
        connector: 'pai',
        sourceAnchor: 'bottom',
        targetAnchor: 'center',
        connectionPoint: 'anchor',
        createEdge() {
          return new GuideEdge({
            attrs: {
              line: {
                strokeDasharray: '5 5',
                stroke: '#808080',
                strokeWidth: 1,
                targetMarker: {
                  name: 'block',
                  args: {
                    size: '6',
                  },
                },
              },
            },
          })
        },
        validateEdge: (args) => {
          const {edge} = args
          return !!(edge.target).port
        },
        // 是否触发交互事件
        validateMagnet({magnet}) {
          return magnet.getAttribute('port-group') !== 'in'
        },
        // 显示可用的链接桩
        validateConnection({
                             sourceView,
                             targetView,
                             sourceMagnet,
                             targetMagnet,
                           }) {
          // 不允许连接到自己
          if (sourceView === targetView) {
            return false
          }

          // 只能从输出链接桩创建连接
          if (
            !sourceMagnet ||
            sourceMagnet.getAttribute('port-group') === 'in'
          ) {
            return false
          }

          // 只能连接到输入链接桩
          if (
            !targetMagnet ||
            targetMagnet.getAttribute('port-group') !== 'in'
          ) {
            return false
          }

          // 判断目标链接桩是否可连接
          const portId = targetMagnet.getAttribute('port')
          const node = targetView.cell
          const port = node.getPort(portId)
          return !(port && port.connected)
        },
      },
      scroller: {
        enabled: true,
        pageVisible: false,
        pageBreak: false,
        pannable: true,
      },
      highlighting: {
        nodeAvailable: {
          name: 'className',
          args: {
            className: 'available',
          },
        },
        magnetAvailable: {
          name: 'className',
          args: {
            className: 'available',
          },
        },
        magnetAdsorbed: {
          name: 'className',
          args: {
            className: 'adsorbed',
          },
        },
      },
      onPortRendered(args) {
        const {port} = args
        const {contentSelectors} = args
        const container = contentSelectors && contentSelectors.content

        const placement = port.group === 'in' ? 'top' : 'bottom'

        if (container) {
          ReactDOM.render(
            (
              <ConfigProvider prefixCls={ANT_PREFIX}>
                <Tooltip
                  title={(port).description}
                  placement={placement}
                >
                  <span
                    className={classnames('ais-port', {
                      connected: (port).connected,
                    })}
                  />
                </Tooltip>
              </ConfigProvider>
            ),
            container,
          )
        }
      },
    })
    this.experimentId = expId
    this.initialize()
  }

  // 获取实验和图及执行状态信息
  async initialize() {
    // tslint:disable-next-line: no-this-assignment
    const {experimentId} = this
    this.loading$.next(true)
    try {
      await this.loadExperiment(experimentId)
      await this.loadExperimentGraph(experimentId)
      await this.loadExecutionStatus(experimentId)
      this.loading$.next(false)
    } catch (e) {
      this.loading$.next(false)
      console.error('加载实验错误', e)
    }
  }

  // 切换实验
  async changeExperiment(id) {
    this.experimentId = id
    await this.initialize()
  }

  // 获取实验
  async loadExperiment(experimentId) {
    try {
      const res = {
        projectName: 'sre_mpi_algo_dev',
        gmtCreate: '2020-08-18 02:21:41',
        description: '用户流失数据建模demo',
        name: '建模流程 DEMO',
        id: 353355,
      }
      this.experiment$.next(res)
      return {success: true}
    } catch (e) {
      console.error('加载实验错误', e)
      return {success: false}
    }
  }

  // 获取图
  async loadExperimentGraph(experimentId) {
    const graphRes = await queryGraph(experimentId)
    this.experimentGraph$.next(graphRes.data)
  }

  // 更新图元
  async updateExperimentGraph(
    nodes = [],
    links = [],
  ) {
    const oldGraph = this.experimentGraph$.getValue()
    const newGraph = produce(oldGraph, (nextGraph) => {
      if (nodes.length) {
        nextGraph.nodes.push(...nodes)
      }
      if (links.length) {
        nextGraph.links.push(...links)
      }
    })
    this.experimentGraph$.next(newGraph)
  }

  // 删除图元
  async delExperimentGraphElement(
    nodes = [],
    links = [],
  ) {
    const oldGraph = this.experimentGraph$.getValue()
    const newGraph = produce(oldGraph, (nextGraph) => {
      if (nodes.length) {
        nextGraph.nodes = oldGraph.nodes.filter(
          (node) => !nodes.includes(node.id.toString()),
        )
      } else {
        nextGraph.links = oldGraph.links.filter((link) => {
          return !links.find((delLink) => {
            return (
              delLink.inputPortId.toString() === link.inputPortId.toString() &&
              delLink.outputPortId.toString() === link.outputPortId.toString()
            )
          })
        })
      }
    })
    this.experimentGraph$.next(newGraph)
  }

  // 获取执行状态
  loadExecutionStatus = async (experimentId) => {
    if (this.executionStatusQuerySub)
      this.executionStatusQuerySub.unsubscribe()
    // 每三秒查询一次执行状态
    this.executionStatusQuerySub = timer(0, 5000).subscribe(
      async (resPromise) => {
        const execStatusRes = await queryGraphStatus()
        this.executionStatus$.next(execStatusRes.data)
        this.updateEdgeStatus()
        // 执行完成时停止查询状态
        const {status} = execStatusRes.data
        if (status === 'default') {
          this.running$.next(false)
          this.executionStatusQuerySub.unsubscribe()
        } else {
          this.running$.next(true)
        }
      },
    )
  }

  // 判断画布是否准备完成（主要用于 react 组件中）
  isGraphReady() {
    return !!this.graph
  }

  // 渲染画布
  renderGraph = (wrapper, container) => {
    this.experimentGraphSub = this.experimentGraph$
      .pipe(
        filter((x) => !!x), // 过滤出有效数据
        take(1), // 只做一次挂载渲染
      )
      .subscribe((graphData) => {
        if (!this.graph) {
          const {nodes, edges} = formatGraphData(graphData)
          super.render({
            wrapper,
            container,
            nodes,
            edges,
          })
        }
      })

    // 监听主动触发的重新渲染事件，避免从 IDE 返回后画布消失
    this.reRenderSub = fromEventPattern(
      (handler) => {
        window.addEventListener(RERENDER_EVENT, handler)
      },
      (handler) => {
        window.removeEventListener(RERENDER_EVENT, handler)
      },
    ).subscribe(this.handlerResize)
  }

  renderNode(nodeMeta) {
    const {experimentId} = this
    const {data} = nodeMeta
    const {type, includedNodes = []} = data
    if (type === 'node') {
      const node = this.graph.addNode(
        new X6DemoNode({
          ...nodeMeta,
          shape: 'ais-rect-port',
          component: <NodeElement experimentId={experimentId}/>,
        }),
      )
      if ((nodeMeta.data).hide) {
        this.pendingNodes.push(node)
      }
      return node
    }
    if (type === 'group' && includedNodes.length) {
      const group = this.graph.addNode(
        new X6DemoGroupNode({
          ...nodeMeta,
          shape: 'react-shape',
          component: <NodeGroup experimentId={experimentId}/>,
        }),
      )
      includedNodes.forEach((normalNode) => {
        const targetNode = this.getNodeById(normalNode.id)
        group.addChild(targetNode)
      })
      return group
    }
    return undefined
  }

  afterLayout() {
    super.afterLayout()
    this.pendingNodes.forEach((node) => {
      node.hide()
    })
    this.pendingNodes = []
  }

  renderEdge(edgeMeta) {
    const {type} = edgeMeta
    if (type === 'group') {
      return this.graph.addEdge(new X6DemoGroupEdge(edgeMeta))
    }
    return this.graph.addEdge(new GuideEdge(edgeMeta))
  }

  validateContextMenu = (info) => {
    return !(
      info.type === 'edge' && (info.data.edge).isGroupEdge()
    )
  }

  onSelectNodes(nodes) {
    const selectedNodes = nodes.filter(
      (cell) => cell.isNode() && !cell.isGroup(),
    )
    const selectedGroups = nodes.filter(
      (cell) => cell.isNode() && cell.isGroup(),
    )
    if (selectedNodes.length === 1) {
      // 当只选中了一个节点时，激活当前选中项
      const cell = selectedNodes[0]
      const nodeData = cell.getData()
      const currentActiveNode = this.activeNodeInstance$.getValue()
      if (!currentActiveNode || currentActiveNode.id !== (nodeData).id) {
        this.activeNodeInstance$.next(nodeData)
      }
    } else {
      this.selectedNodes$.next(selectedNodes)
      this.activeNodeInstance$.next(null) // 当没选中任何东西时，清空选中的节点信息
    }
    if (selectedGroups.length === 1) {
      this.selectedGroup$.next(selectedGroups[0])
    } else {
      this.selectedGroup$.next(undefined)
    }
  }

  handlerResize = (e) => {
    if (e.detail === this.experimentId) {
      this.resizeGraph()
    }
  }

  async onConnectNode(args) {
    const {edge = {}, isNew} = args
    const {source, target} = edge
    if (isNew) {
      // 处理边虚线样式更新的问题。
      const node = args.currentCell
      const portId = edge.getTargetPortId()
      if (node && portId) {
        // 触发 port 重新渲染
        node.setPortProp(portId, 'connected', true)
        // 更新连线样式
        edge.attr({
          line: {
            strokeDasharray: '',
            targetMarker: '',
            stroke: '#808080',
          },
        })
        const data = {
          source: source.cell,
          target: target.cell,
          outputPortId: source.port,
          inputPortId: target.port,
        }
        edge.setData(data)
        this.updateExperimentGraph([], [data])
      }
    }

    return {success: true}
  }

// eslint-disable-next-line class-methods-use-this
  onConnectionRemoved(args) {
    try {
      const {edge} = args
      const {target} = edge
      const {cell: nodeId, port: portId} = target
      if (nodeId) {
        const targetCell = this.getNodeById(nodeId)
        if (targetCell) {
          // 触发 port 重新渲染
          targetCell.setPortProp(portId, 'connected', false)
        }
      }
    } catch (error) {
      console.warn(error)
    }
  }

// eslint-disable-next-line class-methods-use-this
  onMoveNodeStart(args) {
    const {node} = args
    const parent = node.getParent()
    if (!parent) return
    const parentData = parent.getData()
    if (parentData && !parentData.isCollapsed) {
      expandGroupAccordingToNodes({moveNodes: [node]})
    }
  }

  async onMoveNodes(movedNodes) {
    const targetNodes = movedNodes.filter((arg) => {
      const {node} = arg
      return !node.isGroup()
    })
    if (targetNodes.length) {
      const newPos = targetNodes.map((moveNode) => {
        const {current, node} = moveNode
        const {x, y} = current
        const {id} = node
        this.updateNodeById(id, (node) => {
          node.setData({x, y})
        })
        return {
          nodeInstanceId: id,
          posX: Math.round(x),
          posY: Math.round(y),
        }
      })
      const oldGraph = this.experimentGraph$.getValue()
      const newGraph = produce(oldGraph, (nextGraph) => {
        newPos.forEach((position) => {
          const {nodeInstanceId, posX, posY} = position
          const matchNode = nextGraph.nodes.find(
            (item) => item.id.toString() === nodeInstanceId.toString(),
          )
          if (matchNode) {
            matchNode.positionX = posX
            matchNode.positionY = posY
          }
        })
      })
      this.experimentGraph$.next(newGraph)
    }
  }

  onDeleteNodeOrEdge(args) {
    const {nodes, edges} = args
    const normalNodes = nodes.filter(
      (node) => !node.isGroup(),
    )
    if (normalNodes.length) {
      this.requestDeleteNodes(normalNodes.map((node) => node.id))
    }
    if (edges.length) {
      this.requestDeleteEdges(edges)
    }
  }

// eslint-disable-next-line class-methods-use-this
  validateNodeCopyable(cell) {
    return cell.isNode() && !cell.isGroup()
  }

// eslint-disable-next-line consistent-return
  onCopyNode(node) {
    try {
      const nodeData = node.getData()
      const res = copyNode(nodeData)
      const newNode = formatNodeInfoToNodeMeta(res)
      this.addNode(newNode)
      this.clearContextMenuInfo()
    } catch (error) {
      message.error('复制节点失败，请重试')
    }
  }

// 更新边的执行状态
  updateEdgeStatus = () => {
    if (this.graph) {
      const {graph} = this
      const executionStatus = this.executionStatus$.getValue()
      const {instStatus} = executionStatus
      const nodeIds = Object.keys(instStatus)
      const runningNodeIds = nodeIds
        .filter((id) => instStatus[id] === 'running')
        .map((i) => i.toString())
      this.updateEdges((edges) => {
        edges.forEach((edge) => {
          const {
            target: {cell: nodeId},
            id,
          } = edge
          const view = graph.findViewByCell(id)
          if (!view) {
            return
          }
          if (runningNodeIds.includes(nodeId.toString())) {
            view.addClass('edgeProcessing')
          } else {
            view.removeClass('edgeProcessing')
          }
        })
      })
    }
  }

// 运行画布或节点
  runGraph = async () => {
    try {
      // tslint:disable-next-line: no-this-assignment
      const {experimentId, nodeMetas = []} = this
      await runGraph(nodeMetas)
      this.running$.next(true)
      this.clearContextMenuInfo()
      this.loadExecutionStatus(experimentId) // 发起执行状态查询
      return {success: true}
    } catch (e) {
      console.error(`执行失败`, e)
      return {success: false}
    }
  }

// 停止实验的执行
  stopRunGraph = async () => {
    try {
      const {experimentId} = this
      const stopRes = await stopGraphRun()
      this.running$.next(false)
      this.clearContextMenuInfo()
      this.loadExecutionStatus(experimentId) // 发起执行状态查询
      return stopRes
    } catch (e) {
      console.error(`停止失败`, e)
      return {success: false}
    }
  }

// 设置自定义算法组件节点
  setActiveAlgoData = (data) => {
    if (!data) {
      this.activeNodeInstance$.next(null)
      return
    }
    const oldData = this.activeNodeInstance$.getValue()
    this.activeNodeInstance$.next({...oldData, ...data}) // 完成两种格式的融合，数据结构更复杂以后，这一句可以变成一个专门的方法
  }

// 发起请求增加节点
  requestAddNode = async (param) => {
    const {graph} = this
    if (graph) {
      const {nodeMeta, clientX, clientY} = param
      const pos = graph.clientToLocal(clientX, clientY)
      const nodeRes = await addNode({...nodeMeta, ...pos})
      await this.updateExperimentGraph([nodeRes])
      const newNode = formatNodeInfoToNodeMeta(nodeRes)
      this.addNode(newNode)
      return {success: true}
    }
    return {success: false}
  }

// 发起请求删除节点
  requestDeleteNodes = async (ids) => {
    const nodeInstanceIds = ([]).concat(ids)
    if (this.graph && nodeInstanceIds.length) {
      this.deleteNodes(nodeInstanceIds)
      this.clearContextMenuInfo()
      // 如果被选中节点中包含当前打开的配置面板的节点，则取消激活
      const activeNodeInstance = this.activeNodeInstance$.getValue()
      if (
        activeNodeInstance &&
        nodeInstanceIds
          .map((i) => i.toString())
          .includes(activeNodeInstance.id.toString())
      ) {
        this.activeNodeInstance$.next(null)
      }
      await this.delExperimentGraphElement(nodeInstanceIds, [])
      return {success: true}
    }
    return {success: false}
  }

// 发起请求删除边
  requestDeleteEdges = async (edges) => {
    const targetEdges = ([]).concat(edges)
    console.log(targetEdges)
    this.deleteEdges(targetEdges)
    await this.delExperimentGraphElement(targetEdges.map((cell) => cell.getData()))
    return {success: true}
  }

// 撤销删除节点
  undoDeleteNode = async () => {
    this.undo()
  }

// 重命名节点
  renameNode = async (nodeInstanceId, newName) => {
    const renameRes = await {success: true}
    if (renameRes.success) {
      const cell = this.getCellById(nodeInstanceId)
      const data = cell.getData()
      const newData = {...data, name: newName}
      cell.setData(newData)
      await this.updateExperimentGraph([newData])
    }
    return renameRes
  }

// 缩放特定比例
  zoomGraph = (factor) => {
    this.zoom(factor)
  }

// 缩放到适应画布
  zoomGraphToFit = () => {
    this.zoom('fit')
  }

// 缩放到实际尺寸
  zoomGraphRealSize = () => {
    this.zoom('real')
  }

// 从右键菜单删除边
  deleteEdgeFromContextMenu = async (edge) => {
    await this.requestDeleteEdges(edge)
    this.clearContextMenuInfo()
  }

// 清除选中节点
  unSelectNode = () => {
    const {graph} = this
    if (graph) {
      graph.cleanSelection()
    }
    this.selectedGroup$.next(null)
    this.selectedNodes$.next([])
  }

// 打开弹窗
  async setModal(params) {
    this.activeModal$.next(params)
  }

  dispose() {
    if (this.experimentGraphSub)
      this.experimentGraphSub.unsubscribe()
    if (this.executionStatusQuerySub)
      this.executionStatusQuerySub.unsubscribe()
    if (this.reRenderSub)
      this.reRenderSub.unsubscribe()
    super.dispose()
  }
}

export const gModelMap = new Map() // 存储实验图的 model

export const useExperimentGraph = (experimentId) => {
  const expId = experimentId.toString()
  let existedExperimentGraph = gModelMap.get(expId)
  if (!existedExperimentGraph) {
    existedExperimentGraph = new ExperimentGraph(expId)
    gModelMap.set(expId, existedExperimentGraph)
  }
  return existedExperimentGraph
}

export const useUnmountExperimentGraph = (experimentId) => {
  useEffect(() => {
    return () => {
      const existedExperimentGraph = gModelMap.get(experimentId)
      if (existedExperimentGraph) {
        existedExperimentGraph.dispose()
        gModelMap.delete(experimentId)
      }
    }
  }, [experimentId])
}
