import React from 'react'
import {useObservableState} from '@/common/hooks/useObservableState'
import {useExperimentGraph} from "@/common/model/task-graph";
import {ReplayOutlined} from "@material-ui/icons";


export const GraphRunningStatus = (props) => {
  const {className, experimentId} = props
  const experimentGraph = useExperimentGraph(experimentId)
  const [executionStatus] = useObservableState(
    () => experimentGraph.executionStatus$,
  )

  return (
    <div className={className}>
      {executionStatus?.status === 'preparing' && (
        <>
          <ReplayOutlined style={{marginRight: 4}}/> 准备中...
        </>
      )}
    </div>
  )
}
