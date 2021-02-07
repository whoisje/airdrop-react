import React from 'react'
import classNames from 'classnames'
import {ConfigProvider} from 'antd'
import {filter, map} from 'rxjs/operators'
import {useObservableState} from '@/common/hooks/useObservableState'
import {ANT_PREFIX, STEP_ERROR, STEP_RUNNING} from '@/constants/global'
import {useExperimentGraph} from "@/common/model/task-graph";
import styles from './node-element.css'
import {AutorenewOutlined, ErrorOutlined, StorageOutlined} from "@material-ui/icons";
import StepPopover from "@/components/AirStepPopover";
import {NodeStatus} from "@/common/graph-common/node-status";

const stepAttrs = {
  name: '生成记录',
  status: -1,
  statusDesc: '运行中',
  startTime: '2021-02-06 00:00:00',
  inCount: "1000",
  outCount: "1000",
  inSpeed: "500",
  outSpeed: "500",
  errorCount: "0",
}
export const NodeElement = (props) => {
  const {experimentId, node} = props
  const experimentGraph = useExperimentGraph(experimentId)
  const [instanceStatus] = useObservableState(
    () =>
      experimentGraph.executionStatus$.pipe(
        filter((x) => !!x),
        map((x) => x.execInfo),
      ),
    {},
  )
  const data = node.getData() || {}
  const {name, id, selected} = data
  const nodeStatus = instanceStatus[id] || {}

  return (
    <ConfigProvider prefixCls={ANT_PREFIX}>
      <StepPopover
        stepInfo={stepAttrs}
        hidden={stepAttrs.status !== 1}
      >
        <div
          className={classNames(styles.nodeElement, {
            [styles.selected]: !!selected,
          })}
        >
          <div className={styles.icon}>
            <StorageOutlined style={{color: '#1890ff'}}/>
          </div>
          <div className={styles.notation}>
            <div className={styles.name}>{name}</div>
            {nodeStatus.jobStatus && (
              <NodeStatus
                className={styles.statusIcon}
                status={nodeStatus.jobStatus}
              />
            )}
          </div>

          <AutorenewOutlined
            fontSize="small"
            className={stepAttrs.status === STEP_RUNNING ? styles.spin : styles.hide}/>
          <ErrorOutlined
            fontSize="small"
            className={stepAttrs.status === STEP_ERROR ? styles.error : styles.hide}/>
        </div>
      </StepPopover>
    </ConfigProvider>
  )
}
