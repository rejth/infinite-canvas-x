import { CanvasEntityType } from '@/core/entities/interfaces';
import { RectDrawOptions } from '@/core/entities/CanvasRect';
import { TextDrawOptions } from '@/core/entities/CanvasText';

import { SerializedCanvasObject } from './types';

export const isSerializedEntityRect = (
  serializedEntity: SerializedCanvasObject,
): serializedEntity is SerializedCanvasObject<RectDrawOptions> => {
  return serializedEntity.type === CanvasEntityType.RECT;
};

export const isSerializedEntityText = (
  serializedEntity: SerializedCanvasObject,
): serializedEntity is SerializedCanvasObject<TextDrawOptions> => {
  return serializedEntity.type === CanvasEntityType.TEXT;
};
