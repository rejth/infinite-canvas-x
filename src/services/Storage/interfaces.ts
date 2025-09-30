import { TransformationMatrix } from '@/shared/interfaces';

import { SerializedLayer } from '@/entities/LayerSerializer';

export const enum StoreName {
  CANVAS_STATE = 'canvas-state',
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
