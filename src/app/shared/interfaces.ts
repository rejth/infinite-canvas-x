import { Layer } from '@/core/entities/Layer';
import { Point, TextAlign } from '@/core/interfaces';

export const enum Tools {
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

export const enum ShapeType {
  NOTE = 'NOTE',
  AREA = 'AREA',
  TEXT = 'TEXT',
}

export type Tool = keyof typeof Tools;

export interface TextEditorData {
  anchorId: string;
  position: Point;
  text: string;
  bold: boolean;
  underline: boolean;
  italic: boolean;
  font: string;
  fontSize: number;
  textAlign: TextAlign;
  isEditable: boolean;
}

export interface Color {
  value: string;
  label: string;
}

export const enum CustomEvents {
  DOUBLE_CLICK = 'double-click',
  OUT_CLICK = 'out-click',
  ZOOMING_STOPPED = 'zooming-stopped',
}

export interface DoubleClickCustomEvent {
  pageX: number;
  pageY: number;
  transformedPageX: number;
  transformedPageY: number;
  layer: Layer;
}
