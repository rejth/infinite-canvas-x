export {
  CustomEvents,
  type ImageFilterState,
  type TextEditorData,
  type Tool,
  Tools,
} from '@infinite-canvas-x/canvas-app'

export const enum ShapeType {
  NOTE = 'NOTE',
  AREA = 'AREA',
  TEXT = 'TEXT',
}

export interface Color {
  value: string
  label: string
}
