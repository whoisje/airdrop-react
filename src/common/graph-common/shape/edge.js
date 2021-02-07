import {Edge, Shape} from '@antv/x6'

export class BaseEdge extends Shape.Edge {
  isGroupEdge() {
    return false
  }
}

export class GuideEdge extends BaseEdge {
}

GuideEdge.config({
  shape: 'GuideEdge',
  connector: {name: 'pai'},
  zIndex: 2,
  attrs: {
    line: {
      stroke: '#808080',
      strokeWidth: 1,
      targetMarker: {
        stroke: 'none',
        fill: 'none',
      },
    },
  },
})

export class X6DemoGroupEdge extends GuideEdge {
  isGroupEdge() {
    return true
  }
}

X6DemoGroupEdge.config({
  shape: 'X6DemoGroupEdge',
})

Edge.registry.register({
  GuideEdge,
  X6DemoGroupEdge,
})
