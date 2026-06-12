import type { Point, TextAlign } from '@infinite-canvas-x/canvas-engine'

export enum Tools {
  STICKER = 'STICKER',
  AREA = 'AREA',
  TEXT = 'TEXT',
  HAND = 'HAND',
  SELECT = 'SELECT',
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  RESIZER = 'RESIZER',
  IMAGE = 'IMAGE',
}

export type Tool = `${Tools}`

export enum CustomEvents {
  DOUBLE_CLICK = 'double-click',
  OUT_CLICK = 'out-click',
  ZOOMING_STOPPED = 'zooming-stopped',
}

export interface ImageFilterState {
  brightness: number
  contrast: number
  saturation: number
  vibrance: number
  hue: number
  blur: number
  noise: number
  pixelate: number
}

export const DEFAULT_FILTERS: ImageFilterState = {
  brightness: 50,
  contrast: 50,
  saturation: 50,
  vibrance: 50,
  hue: 0,
  blur: 0,
  noise: 0,
  pixelate: 0,
}

export const DEFAULT_TOOL = Tools.SELECT
export const DEFAULT_CURSOR = 'default'

export enum StickerColors {
  STICKER_YELLOW = '#ffd670',
}

export interface DoubleClickDetail {
  pageX: number
  pageY: number
  transformedPageX: number
  transformedPageY: number
  layer: import('@infinite-canvas-x/canvas-engine').LayerInterface
}

export interface TextEditorData {
  anchorId: string
  position: Point
  text: string
  bold: boolean
  underline: boolean
  italic: boolean
  font: string
  fontSize: number
  textAlign: TextAlign
  isEditable: boolean
}
