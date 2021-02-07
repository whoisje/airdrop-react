import React, {useEffect} from 'react'
import {useExperimentGraph, useUnmountExperimentGraph} from "@/common/model/task-graph";
import {CanvasContent} from './canvas-content'
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    flexGrow: 1,
    padding: theme.spacing(1)
  },
}));

export const AirCanvas = (props) => {
  const {experimentId, className} = props
  const expGraph = useExperimentGraph(experimentId)
  const classes = useStyles()
  // 处理画布卸载
  useUnmountExperimentGraph(experimentId)

  // 自定义算法组件的渲染控制
  useEffect(() => {
    ;(window).renderForm = expGraph.setActiveAlgoData
    return () => {
      delete (window).renderForm
    }
  }, [expGraph])

  return (
    <CanvasContent
      experimentId={experimentId}
      className={classes.root}
    />
  )
}
