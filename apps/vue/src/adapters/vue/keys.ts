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
import type { InjectionKey, ShallowRef } from 'vue'

export const CanvasAppKey: InjectionKey<ShallowRef<CanvasApp | null>> = Symbol('CanvasApp')

export type CanvasSliceRefMap = {
  textEditor: ShallowRef<TextEditorSlice>
  toolbar: ShallowRef<ToolbarSlice>
  activeLayer: ShallowRef<ActiveLayerSlice>
  imageEditor: ShallowRef<ImageEditorSlice>
  layerUi: ShallowRef<LayerUiSlice>
}

export const CanvasSliceManagerKey: InjectionKey<CanvasSliceSubscriptionManager> =
  Symbol('CanvasSliceManager')

export const CanvasSliceRefsKey: InjectionKey<CanvasSliceRefMap> = Symbol('CanvasSliceRefs')

export type { CanvasSliceKey }
