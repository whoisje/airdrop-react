import React, {useCallback} from 'react'
import {Toolbar} from '@antv/x6-react-components'
import {useObservableState} from '@/common/hooks/useObservableState'
import {useExperimentGraph} from "@/common/model/task-graph";
import styles from './canvas-toolbar.css'
import {PlayArrowOutlined, RestoreOutlined} from "@material-ui/icons";

const {Item, Group} = Toolbar

const Operations = {
  UNDO_DELETE: 'UNDO_DELETE',
  RUN_SELECTED: 'RUN_SELECTED',
}

export const CanvasToolbar = (props) => {
  const {experimentId} = props
  const expGraph = useExperimentGraph(experimentId)
  const [activeNodeInstance] = useObservableState(
    () => expGraph.activeNodeInstance$,
  )
  const [selectedNodes] = useObservableState(() => expGraph.selectedNodes$)
  const [selectedGroup] = useObservableState(() => expGraph.selectedGroup$)

  const onClickItem = useCallback(
    (itemName) => {
      switch (itemName) {
        case Operations.UNDO_DELETE:
          expGraph.undoDeleteNode()
          break
        case Operations.RUN_SELECTED:
          expGraph.runGraph()
          break
        default:
      }
    },
    [expGraph],
  )

  return (
    <div className={styles.canvasToolbar}>
      <Toolbar hoverEffect={true} onClick={onClickItem}>
        <Group>
          <Item
            name={Operations.UNDO_DELETE}
            tooltip="撤销删除节点"
            icon={<RestoreOutlined/>}
          />
        </Group>
        <Group>
          <Item
            name={Operations.RUN_SELECTED}
            disabled={!activeNodeInstance}
            tooltip="执行选择节点"
            icon={<PlayArrowOutlined/>}
          />
        </Group>
      </Toolbar>
    </div>
  )
}
