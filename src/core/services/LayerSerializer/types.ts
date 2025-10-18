import { LayerId } from '@/core/interfaces';
import { BaseDrawOptions, CanvasEntitySubtype, CanvasEntityType } from '@/core/entities/interfaces';

export type SerializedLayer<T extends BaseDrawOptions = BaseDrawOptions> = {
  id: LayerId | null;
  type: CanvasEntityType;
  subtype: CanvasEntitySubtype | null;
  options: T;
  children: SerializedCanvasObject<T>[];
};

export type SerializedCanvasObject<T extends BaseDrawOptions = BaseDrawOptions> = {
  type: CanvasEntityType;
  subtype: CanvasEntitySubtype | null;
  options: T;
  minDimension: number;
};
