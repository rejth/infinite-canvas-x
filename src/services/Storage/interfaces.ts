import { TransformationMatrix } from '@/shared/interfaces';
import { SerializedLayer } from '../LayerSerializer';

export const enum StoreName {
  CANVAS_STATE = 'canvas-state',
}

export interface CanvasStateDB {
  _id: string;
  layers: SerializedLayer[];
  transformMatrix: TransformationMatrix;
  tool: string;
  zoomPercentage: number;
  _rev?: string;
}
