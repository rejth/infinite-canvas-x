import { SerializedLayer } from '../LayerSerializer';

export type SerializedLayerStored = SerializedLayer & { id: number };

export const enum LogType {
  ADD = 'add',
  PUT = 'put',
  DELETE = 'delete',
}

export const enum StoreName {
  LAYERS = 'layers',
  LOG = 'log',
}
