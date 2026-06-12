import {
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_RESIZE_DIRECTION,
  DEFAULT_SCALE,
  DEFAULT_ZOOM_PERCENTAGE,
  TextAlign,
} from '@infinite-canvas-x/canvas-engine'

import type { CanvasAppState } from './CanvasAppState'
import { computeLayerUi, type LayerUiSlice, layerUiEqual } from './layerUi'
import { DEFAULT_CURSOR, DEFAULT_FILTERS, DEFAULT_TOOL } from './types'

const noop = (..._args: unknown[]): undefined => undefined

export type SliceActions = {
  [K in string]: (...args: any[]) => unknown
}

export type NoopActions<TActions extends SliceActions> = {
  [K in keyof TActions]: (...args: Parameters<TActions[K]>) => undefined
}

export type CanvasSliceConfig<
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
> = {
  readonly definition: SliceDefinition<TSlice>
  readonly bindActions: (state: CanvasAppState) => TActions
  readonly noopActions: NoopActions<TActions>
}

export function defineCanvasSlice<
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(
  definition: SliceDefinition<TSlice>,
  bindActions: (state: CanvasAppState) => TActions,
  noopActions: NoopActions<TActions>,
): CanvasSliceConfig<TSlice, TActions> {
  return { definition, bindActions, noopActions }
}

export type TextEditorSlice = Pick<
  CanvasAppState,
  | 'isLayerEditable'
  | 'text'
  | 'textScale'
  | 'textAlign'
  | 'fontSize'
  | 'bold'
  | 'italic'
  | 'underline'
>

export type ToolbarSlice = Pick<
  CanvasAppState,
  'tool' | 'cursor' | 'resizeDirection' | 'zoomPercentage'
>

export type ActiveLayerSlice = Pick<CanvasAppState, 'activeLayer' | 'lastActiveLayer' | 'opacity'>

export type ImageEditorSlice = Pick<CanvasAppState, 'image' | 'filters'>

export type { LayerUiSlice }

export type SliceDefinition<TSlice> = {
  select: (state: CanvasAppState) => TSlice
  isEqual: (prev: TSlice, next: TSlice) => boolean
  defaults: TSlice
}

export const textEditorSlice: SliceDefinition<TextEditorSlice> = {
  defaults: {
    isLayerEditable: false,
    text: '',
    textScale: DEFAULT_SCALE,
    textAlign: TextAlign.LEFT,
    fontSize: DEFAULT_FONT_SIZE,
    bold: false,
    italic: false,
    underline: false,
  },
  select: (state) => ({
    isLayerEditable: state.isLayerEditable,
    text: state.text,
    textScale: state.textScale,
    textAlign: state.textAlign,
    fontSize: state.fontSize,
    bold: state.bold,
    italic: state.italic,
    underline: state.underline,
  }),
  isEqual: (prev, next) =>
    prev.isLayerEditable === next.isLayerEditable &&
    prev.text === next.text &&
    prev.textScale === next.textScale &&
    prev.textAlign === next.textAlign &&
    prev.fontSize === next.fontSize &&
    prev.bold === next.bold &&
    prev.italic === next.italic &&
    prev.underline === next.underline,
}

export const toolbarSlice: SliceDefinition<ToolbarSlice> = {
  defaults: {
    tool: DEFAULT_TOOL,
    cursor: DEFAULT_CURSOR,
    resizeDirection: DEFAULT_RESIZE_DIRECTION,
    zoomPercentage: DEFAULT_ZOOM_PERCENTAGE,
  },
  select: (state) => ({
    tool: state.tool,
    cursor: state.cursor,
    resizeDirection: state.resizeDirection,
    zoomPercentage: state.zoomPercentage,
  }),
  isEqual: (prev, next) =>
    prev.tool === next.tool &&
    prev.cursor === next.cursor &&
    prev.resizeDirection === next.resizeDirection &&
    prev.zoomPercentage === next.zoomPercentage,
}

export const activeLayerSlice: SliceDefinition<ActiveLayerSlice> = {
  defaults: {
    activeLayer: null,
    lastActiveLayer: null,
    opacity: DEFAULT_OPACITY,
  },
  select: (state) => ({
    activeLayer: state.activeLayer,
    lastActiveLayer: state.lastActiveLayer,
    opacity: state.opacity,
  }),
  isEqual: (prev, next) =>
    prev.activeLayer === next.activeLayer &&
    prev.lastActiveLayer === next.lastActiveLayer &&
    prev.opacity === next.opacity,
}

export const layerUiSlice: SliceDefinition<LayerUiSlice> = {
  defaults: {
    canShowSidebar: false,
    hasActiveLayer: false,
    showTextSidebar: false,
    hasImage: false,
    backgroundColor: '',
    showStickerColorPicker: false,
    isTextArea: false,
  },
  select: (state) => computeLayerUi(state),
  isEqual: layerUiEqual,
}

export const imageEditorSlice: SliceDefinition<ImageEditorSlice> = {
  defaults: {
    image: null,
    filters: DEFAULT_FILTERS,
  },
  select: (state) => ({
    image: state.image,
    filters: state.filters,
  }),
  isEqual: (prev, next) => prev.image === next.image && prev.filters === next.filters,
}

export type TextEditorActions = {
  setIsLayerEditable: CanvasAppState['setIsLayerEditable']
  setText: CanvasAppState['setText']
  setTextScale: CanvasAppState['setTextScale']
  setTextAlign: CanvasAppState['setTextAlign']
  setFontSize: CanvasAppState['setFontSize']
  setBold: CanvasAppState['setBold']
  setItalic: CanvasAppState['setItalic']
  setUnderline: CanvasAppState['setUnderline']
  resetTextEditor: CanvasAppState['resetTextEditor']
  setTextEditor: CanvasAppState['setTextEditor']
}

export type ToolbarActions = {
  setTool: CanvasAppState['setTool']
  setCursor: CanvasAppState['setCursor']
  setResizeDirection: CanvasAppState['setResizeDirection']
  setZoomPercentage: CanvasAppState['setZoomPercentage']
}

export type ActiveLayerActions = {
  setActiveLayer: CanvasAppState['setActiveLayer']
  setLastActiveLayer: CanvasAppState['setLastActiveLayer']
  setOpacity: CanvasAppState['setOpacity']
}

export type ImageEditorActions = {
  setImage: CanvasAppState['setImage']
  setFilters: CanvasAppState['setFilters']
  resetImageEditor: CanvasAppState['resetImageEditor']
}

export function bindTextEditorActions(state: CanvasAppState): TextEditorActions {
  return {
    setIsLayerEditable: state.setIsLayerEditable.bind(state),
    setText: state.setText.bind(state),
    setTextScale: state.setTextScale.bind(state),
    setTextAlign: state.setTextAlign.bind(state),
    setFontSize: state.setFontSize.bind(state),
    setBold: state.setBold.bind(state),
    setItalic: state.setItalic.bind(state),
    setUnderline: state.setUnderline.bind(state),
    resetTextEditor: state.resetTextEditor.bind(state),
    setTextEditor: state.setTextEditor.bind(state),
  }
}

export const textEditorNoopActions = {
  setIsLayerEditable: noop,
  setText: noop,
  setTextScale: noop,
  setTextAlign: noop,
  setFontSize: noop,
  setBold: noop,
  setItalic: noop,
  setUnderline: noop,
  resetTextEditor: noop,
  setTextEditor: noop,
} satisfies NoopActions<TextEditorActions>

export function bindToolbarActions(state: CanvasAppState): ToolbarActions {
  return {
    setTool: state.setTool.bind(state),
    setCursor: state.setCursor.bind(state),
    setResizeDirection: state.setResizeDirection.bind(state),
    setZoomPercentage: state.setZoomPercentage.bind(state),
  }
}

export const toolbarNoopActions = {
  setTool: noop,
  setCursor: noop,
  setResizeDirection: noop,
  setZoomPercentage: noop,
} satisfies NoopActions<ToolbarActions>

export function bindActiveLayerActions(state: CanvasAppState): ActiveLayerActions {
  return {
    setActiveLayer: state.setActiveLayer.bind(state),
    setLastActiveLayer: state.setLastActiveLayer.bind(state),
    setOpacity: state.setOpacity.bind(state),
  }
}

export const activeLayerNoopActions = {
  setActiveLayer: noop,
  setLastActiveLayer: noop,
  setOpacity: noop,
} satisfies NoopActions<ActiveLayerActions>

export function bindImageEditorActions(state: CanvasAppState): ImageEditorActions {
  return {
    setImage: state.setImage.bind(state),
    setFilters: state.setFilters.bind(state),
    resetImageEditor: state.resetImageEditor.bind(state),
  }
}

export const imageEditorNoopActions = {
  setImage: noop,
  setFilters: noop,
  resetImageEditor: noop,
} satisfies NoopActions<ImageEditorActions>

export const textEditorSliceConfig = defineCanvasSlice(
  textEditorSlice,
  bindTextEditorActions,
  textEditorNoopActions,
)

export const toolbarSliceConfig = defineCanvasSlice(
  toolbarSlice,
  bindToolbarActions,
  toolbarNoopActions,
)

export const activeLayerSliceConfig = defineCanvasSlice(
  activeLayerSlice,
  bindActiveLayerActions,
  activeLayerNoopActions,
)

export const imageEditorSliceConfig = defineCanvasSlice(
  imageEditorSlice,
  bindImageEditorActions,
  imageEditorNoopActions,
)

export const layerUiSliceConfig = defineCanvasSlice(
  layerUiSlice,
  (): Record<never, never> => ({}),
  {},
)
