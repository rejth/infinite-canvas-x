import {
  CanvasImage,
  DEFAULT_IMAGE_MAX_SIZE,
  DEFAULT_SCALE,
  Layer,
  type Point,
} from '@infinite-canvas-x/canvas-engine'

import type { CanvasAppState } from '../CanvasAppState'
import { DEFAULT_CURSOR, Tools } from '../types'

export function createImage(state: CanvasAppState, point: Point, imageSource: ImageBitmap): void {
  const { renderManager } = state
  if (!renderManager) return

  const { x, y } = point
  const imageWidth = imageSource.width
  const imageHeight = imageSource.height
  const aspectRatio = imageWidth / imageHeight

  let width: number
  let height: number

  if (aspectRatio > 1) {
    width = DEFAULT_IMAGE_MAX_SIZE
    height = DEFAULT_IMAGE_MAX_SIZE / aspectRatio
  } else {
    width = DEFAULT_IMAGE_MAX_SIZE * aspectRatio
    height = DEFAULT_IMAGE_MAX_SIZE
  }

  const image = new CanvasImage({
    x,
    y,
    width,
    height,
    scale: DEFAULT_SCALE,
    image: imageSource,
  })

  const layer = new Layer({
    x,
    y,
    width,
    height,
    scale: DEFAULT_SCALE,
  })

  layer.addChild(image)
  layer.setActive(true)
  renderManager.addLayer(layer)

  state.setActiveLayer(layer)
  state.setImage(null)
  state.setCursor(DEFAULT_CURSOR)
  state.setTool(Tools.SELECT)
}
