import React from 'react'
import {Popover} from 'antd'
import classNames from 'classnames'
import styles from './index.css'
import {AspectRatioOutlined, SettingsOverscanOutlined, ZoomInOutlined, ZoomOutOutlined} from "@material-ui/icons";


export const CanvasHandler = (props) => {
  const {className, onZoomIn, onZoomOut, onFitContent, onRealContent} = props

  return (
    <ul className={classNames(styles.handler, className)}>
      <Popover
        content="放大"
        placement="left"
      >
        <li onClick={onZoomIn} className={styles.item}>
          <ZoomInOutlined/>
        </li>
      </Popover>
      <Popover
        content="缩小"
        placement="left"
      >
        <li onClick={onZoomOut} className={styles.item}>
          <ZoomOutOutlined/>
        </li>
      </Popover>
      <Popover
        content="实际尺寸"
        placement="left"
      >
        <li onClick={onRealContent} className={styles.item}>
          <AspectRatioOutlined/>
        </li>
      </Popover>
      <Popover
        content="适应画布"
        placement="left"
      >
        <li onClick={onFitContent} className={styles.item}>
          <SettingsOverscanOutlined/>
        </li>
      </Popover>
    </ul>
  )
}
