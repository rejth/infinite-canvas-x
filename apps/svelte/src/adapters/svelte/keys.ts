import type {
  ActiveLayerSlice,
  CanvasApp,
  CanvasSliceKey,
  CanvasSliceSubscriptionManager,
  ImageEditorSlice,
  LayerUiSlice,
  TextEditorSlice,
  ToolbarSlice,
} from '@infinite-canvas-x/canvas-app'

export const CANVAS_APP_CONTEXT_KEY = Symbol('canvas-app-context')

export type CanvasSliceRefMap = {
  textEditor: TextEditorSlice
  toolbar: ToolbarSlice
  activeLayer: ActiveLayerSlice
  imageEditor: ImageEditorSlice
  layerUi: LayerUiSlice
}

export type CanvasAppContextValue = {
  getApp: () => CanvasApp | null
  getSlices: () => CanvasSliceRefMap
  sliceManager: CanvasSliceSubscriptionManager
}

export type { CanvasSliceKey }
