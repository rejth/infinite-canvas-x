import type { BaseRenderManager, Point } from '@infinite-canvas-x/canvas-engine'

import type { CanvasAppState } from '../CanvasAppState'

export function selectTool(
  state: CanvasAppState,
  renderManager: BaseRenderManager,
  point: Point,
  onSaveText: () => void,
): void {
  const { activeLayer } = state

  if (!activeLayer) {
    const layer = renderManager.findLayerByCoordinates(point)

    if (layer) {
      layer.setActive(true)
      state.setActiveLayer(layer)
      renderManager.reDrawOnNextFrame()
    }
    return
  }

  if (!activeLayer.isPointInside(point)) {
    const layer = renderManager.findLayerByCoordinates(point)

    onSaveText()

    if (layer) {
      layer.setActive(true)
      activeLayer.setActive(false)
      state.resetTextEditor()
      state.setActiveLayer(layer)
    } else {
      activeLayer.setActive(false)
      state.resetTextEditor()
      state.setLastActiveLayer(activeLayer)
      state.setActiveLayer(null)
    }

    renderManager.reDrawOnNextFrame()
    return
  }

  const layers = renderManager.findMultipleLayersByCoordinates(point)

  if (layers.length > 1) {
    let layersLength = layers.length
    let activeLayerIndex = 0

    for (const layer of layers) {
      if (layer.getId() === activeLayer.getId()) {
        activeLayerIndex = layersLength
      } else if (layersLength >= activeLayerIndex) {
        layer.setActive(true)
        activeLayer.setActive(false)
        onSaveText()
        state.resetTextEditor()
        state.setActiveLayer(layer)
        renderManager.reDrawOnNextFrame()
        break
      }

      layersLength -= 1
    }
  }
}
