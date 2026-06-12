import {
  CanvasEntitySubtype,
  CanvasEntityType,
  Colors,
  isCanvasImage,
  isCanvasRect,
  type LayerInterface,
} from '@infinite-canvas-x/canvas-engine'

import type { CanvasAppState } from './CanvasAppState'

export type LayerUiSlice = {
  canShowSidebar: boolean
  hasActiveLayer: boolean
  showTextSidebar: boolean
  hasImage: boolean
  backgroundColor: string
  showStickerColorPicker: boolean
  isTextArea: boolean
}

export function readLayerBackgroundColor(layer: LayerInterface | null): string {
  const rect = layer?.getChildByType(CanvasEntityType.RECT)
  if (rect && isCanvasRect(rect)) return rect.getOptions().color
  return Colors.TRANSPARENT
}

export function computeLayerUi(state: CanvasAppState): LayerUiSlice {
  const { renderManager, activeLayer, layerBackgroundColor } = state
  const canShowSidebar = Boolean(renderManager)

  if (!activeLayer) {
    return {
      canShowSidebar,
      hasActiveLayer: false,
      showTextSidebar: false,
      hasImage: false,
      backgroundColor: layerBackgroundColor,
      showStickerColorPicker: false,
      isTextArea: false,
    }
  }

  const rect = activeLayer.getChildByType(CanvasEntityType.RECT)
  const image = activeLayer.getChildByType(CanvasEntityType.IMAGE)
  const spline = activeLayer.getChildByType(CanvasEntityType.SPLINE)
  const isTextArea = Boolean(
    rect && isCanvasRect(rect) && rect.getSubtype() === CanvasEntitySubtype.TEXT,
  )

  return {
    canShowSidebar,
    hasActiveLayer: true,
    showTextSidebar: Boolean(
      spline || (rect && isCanvasRect(rect) && rect.getSubtype() === CanvasEntitySubtype.TEXT),
    ),
    hasImage: Boolean(image && isCanvasImage(image)),
    backgroundColor: layerBackgroundColor,
    showStickerColorPicker: Boolean(rect && isCanvasRect(rect) && !isTextArea),
    isTextArea,
  }
}

export function layerUiEqual(prev: LayerUiSlice, next: LayerUiSlice): boolean {
  return (
    prev.canShowSidebar === next.canShowSidebar &&
    prev.hasActiveLayer === next.hasActiveLayer &&
    prev.showTextSidebar === next.showTextSidebar &&
    prev.hasImage === next.hasImage &&
    prev.backgroundColor === next.backgroundColor &&
    prev.showStickerColorPicker === next.showStickerColorPicker &&
    prev.isTextArea === next.isTextArea
  )
}
