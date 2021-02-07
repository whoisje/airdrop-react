import React, {useCallback, useRef} from 'react'
import {useClickAway} from 'ahooks'
import {useExperimentGraph} from "@/common/model/task-graph";
import {graphPointToOffsetPoint} from '@/common/utils/graph'
import {DeleteOutlined} from "@material-ui/icons";
import {ListItemIcon, ListItemText, Menu, MenuItem} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  root: {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "#fff"
  }
}))
export const EdgeContextMenu = (props) => {
  const {experimentId, data} = props
  const containerRef = useRef(null)
  const expGraph = useExperimentGraph(experimentId)
  const classes = useStyles()
  useClickAway(() => {
    expGraph.clearContextMenuInfo()
  }, containerRef)

  const onDeleteEdge = useCallback(() => {
    expGraph.deleteEdgeFromContextMenu(data.edge)
  }, [expGraph, data])

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
        <MenuItem onClick={onDeleteEdge}>
          <ListItemIcon>
            <DeleteOutlined fontSize="small"/>
          </ListItemIcon>
          <ListItemText>
            删除
          </ListItemText>
        </MenuItem>
      </Menu>
    </div>
  )
}
