import React, {useCallback, useRef} from 'react'
import {useClickAway} from 'ahooks'
import {useExperimentGraph} from "@/common/model/task-graph";
import {graphPointToOffsetPoint} from '@/common/utils/graph'
import {ListItemIcon, ListItemText, Menu, MenuItem} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {DeleteOutlined, EditOutlined, FileCopyOutlined, PlayArrowOutlined} from "@material-ui/icons";
import {useObservableState} from "@/common/hooks/useObservableState";

const useStyles = makeStyles(() => ({
  root: {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "#fff"
  }
}))
export const NodeContextMenu = (props) => {
  const {experimentId, data} = props
  const containerRef = useRef(null)
  const expGraph = useExperimentGraph(experimentId)
  const [activeNodeInstance] = useObservableState(
    () => expGraph.activeNodeInstance$,
  )
  const classes = useStyles()

  useClickAway(() => {
    expGraph.clearContextMenuInfo()
  }, containerRef)

  const onNodeCopy = useCallback(async () => {
    await expGraph.onCopyNode(data.node)
  }, [expGraph, data.node])

  const onNodeDel = useCallback(async () => {
    await expGraph.requestDeleteNodes([data.node.id])
  }, [expGraph, data.node.id])

  const onGraphRun = useCallback(async () => {
    await expGraph.runGraph()
  }, [expGraph])

  const {x: left, y: top} = graphPointToOffsetPoint(
    expGraph.graph,
    data,
    expGraph.wrapper,
  )

  return (
    <div
      ref={containerRef}
      className={classes.root}
      style={{top, left}}
    >
      <Menu open={true}>
        <MenuItem onClick={onNodeCopy}>
          <ListItemIcon>
            <FileCopyOutlined fontSize="small"/>
          </ListItemIcon>
          <ListItemText>
            复制
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={onNodeDel}>
          <ListItemIcon>
            <DeleteOutlined fontSize="small"/>
          </ListItemIcon>
          <ListItemText>
            删除
          </ListItemText>
        </MenuItem>
        <MenuItem disabled={true}>
          <ListItemIcon>
            <EditOutlined fontSize="small"/>
          </ListItemIcon>
          <ListItemText>
            重命名
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={onGraphRun}>
          <ListItemIcon>
            <PlayArrowOutlined fontSize="small"/>
          </ListItemIcon>
          <ListItemText>
            运行
          </ListItemText>
        </MenuItem>
      </Menu>
    </div>
  )
}
