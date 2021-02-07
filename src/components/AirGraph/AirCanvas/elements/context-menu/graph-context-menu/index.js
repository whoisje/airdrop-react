import React, {useRef} from 'react'
import {useClickAway} from 'ahooks'
import {useExperimentGraph} from "@/common/model/task-graph";
import {graphPointToOffsetPoint} from '@/common/utils/graph'
import {Replay} from "@material-ui/icons";
import {ListItemIcon, ListItemText, Menu, MenuItem} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  root: {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "#fff"
  }
}))
export const GraphContextMenu = (props) => {
  const {experimentId, data} = props
  const containerRef = useRef(null)
  const expGraph = useExperimentGraph(experimentId)
  const classes = useStyles()
  useClickAway(() => {
    expGraph.clearContextMenuInfo()
  }, containerRef)

  const onReload = () => {

  }
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
        <MenuItem onClick={onReload}>
          <ListItemIcon>
            <Replay fontSize="small"/>
          </ListItemIcon>
          <ListItemText>
            刷新
          </ListItemText>
        </MenuItem>
      </Menu>
    </div>
  )
}
