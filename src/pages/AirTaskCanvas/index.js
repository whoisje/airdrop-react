import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {AirCanvas} from "@/components/AirGraph/AirCanvas";


const AirTaskCanvas = (props) => {
  const {experimentId = '1'} = props

  return (
    <DndProvider backend={HTML5Backend}>
      <AirCanvas
        experimentId={experimentId}
      />
    </DndProvider>
  )
}

export default AirTaskCanvas
