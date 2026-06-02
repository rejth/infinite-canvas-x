import { SerializedLayer } from '@infinite-canvas-x/canvas-engine'

export interface LayerDocument extends SerializedLayer {
  _id: string
  _rev: string
}
