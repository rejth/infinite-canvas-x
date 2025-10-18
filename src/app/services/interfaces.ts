import { SerializedLayer } from '@/core/services/LayerSerializer';

export interface LayerDocument extends SerializedLayer {
  _id: string;
  _rev: string;
}
