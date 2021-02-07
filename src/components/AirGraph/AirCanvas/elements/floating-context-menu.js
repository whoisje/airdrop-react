import React from 'react'
import {useObservableState} from '@/common/hooks/useObservableState'
import {useExperimentGraph} from "@/common/model/task-graph";
import {EdgeContextMenu} from './context-menu/edge-context-menu'
import {GraphContextMenu} from './context-menu/graph-context-menu'
import {NodeContextMenu} from './context-menu/node-context-menu'
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  root: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 99999,
  }
}))
export const ContextMenu = (props) => {
  const {experimentId, menuType, menuData} = props
  switch (menuType) {
    case 'edge':
      return <EdgeContextMenu experimentId={experimentId} data={menuData}/>
    case 'graph':
      return <GraphContextMenu experimentId={experimentId} data={menuData}/>
    case 'node':
      return <NodeContextMenu experimentId={experimentId} data={menuData}/>
    default:
      return null
  }
}

export const FloatingContextMenu = (props) => {
  const {experimentId} = props
  const expGraph = useExperimentGraph(experimentId)
  const [contextMenuInfo] = useObservableState(() => expGraph.contextMenuInfo$)
  const classes = useStyles()

  if (!contextMenuInfo?.type) {
    return null
  }

  return (
    <div className={classes.root}>
      <ContextMenu
        experimentId={experimentId}
        menuData={contextMenuInfo.data}
        menuType={contextMenuInfo.type}
      />
    </div>
  )
}
