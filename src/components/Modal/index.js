import React from 'react'
import ReactDOM from 'react-dom'
import {ConfigProvider, Modal} from 'antd'
import {isPromise} from '@/common/utils'


export const showModal = (props) => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  let config = {
    ...props,
    visible: true,
    onCancel: close,
    onOk: (e) => {
      if (typeof props.onOk === 'function') {
        const ret = props.onOk(e)
        if (isPromise(ret)) {
          ;(ret).then(() => {
            close()
          })
        }
      } else {
        close()
      }
    },
  }

  function destroy(...args) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div)
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div)
    }
    if (typeof props.afterClose === 'function') {
      props.afterClose(...args)
    }
  }

  function update(newConfig) {
    config = {
      ...config,
      ...newConfig,
    }
    render(config)
  }

  function close(...args) {
    const nextConfig = {
      ...config,
      visible: false,
      afterClose: destroy.bind(undefined, ...args),
    }
    update(nextConfig)
  }

  function render(usedConfig) {
    const {children, ...others} = usedConfig
    setTimeout(() => {
      ReactDOM.render(
        <ConfigProvider>
          <Modal {...others}>{children}</Modal>
        </ConfigProvider>,
        div,
      )
    }, 0)
  }

  render(config)

  return {
    close,
    update,
  }
}
