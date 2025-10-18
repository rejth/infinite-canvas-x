import { TransformationMatrix } from '@/core/interfaces';
import { SerializedLayer } from '@/core/entities/LayerSerializer';

export const enum StoreName {
  CANVAS_SETTINGS = 'canvas-settings',
}

export interface LayerDocument extends SerializedLayer {
  _id: string;
  _rev: string;
}

export interface CanvasSettingsDocument {
  zoomPercentage: number;
  transformMatrix: TransformationMatrix;
  _id: string;
  _rev: string;
}
