import React from 'react'
import classNames from 'classnames'
import {ConfigProvider} from 'antd'
import {filter, map} from 'rxjs/operators'
import {useObservableState} from '@/common/hooks/useObservableState'
import {ANT_PREFIX} from '@/constants/global'
import {useExperimentGraph} from "@/common/model/task-graph";
import {NodeStatus} from '@/common/graph-common/node-status'
import {NodePopover} from '@/common/graph-common/node-popover'
import styles from './node-element.css'
import {StorageOutlined} from "@material-ui/icons";


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
      <NodePopover status={nodeStatus}>
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
        </div>
      </NodePopover>
    </ConfigProvider>
  )
}
