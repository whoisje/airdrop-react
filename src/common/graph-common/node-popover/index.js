import React from 'react'
import {Popover} from 'antd'
import {isEmpty} from 'lodash-es'
import css from './index.css'
import {ReplayOutlined} from "@material-ui/icons";


export const NodePopover = ({children, status}) => {
  const componentNode = (
    <div style={{width: '100%', height: '100%'}}>{children}</div>
  )
  if (isEmpty(status)) {
    return componentNode
  }
  return (
    <Popover
      placement="bottomLeft"
      content={<PopoverContent status={status}/>}
      overlayClassName={css.content}
    >
      {componentNode}
    </Popover>
  )
}

const nodeAtts = {
  name: '节点名称',
  defName: '算法名称',
  jobStatus: '运行状态',
  startTime: '开始时间',
  endTime: '结束时间',
}

const PopoverContent = ({status}) => (
  <ul className={css.list}>
    {!status.name && <ReplayOutlined/>}
    {Object.entries(nodeAtts).map(([key, text]) => {
      const value = status[key]
      if (value) {
        return (
          <li key={key} className={css.item}>
            <span className={css.label}>{text}</span>
            <span className={css.text}>{value}</span>
          </li>
        )
      }
      return null
    })}
  </ul>
)
