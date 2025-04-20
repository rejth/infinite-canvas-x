import { CanvasEntityType, BaseCanvasEntityInterface, BaseDrawOptions } from '@/entities/interfaces';
import { CanvasImage } from '@/entities/CanvasImage';
import { CanvasText } from '@/entities/CanvasText';
import { CanvasRect } from '@/entities/CanvasRect';
import { Selection } from '@/entities/Selection';

export function isCanvasRect(entity: BaseCanvasEntityInterface<BaseDrawOptions>): entity is CanvasRect {
  return entity.getType() === CanvasEntityType.RECT;
}

export function isCanvasText(entity: BaseCanvasEntityInterface<BaseDrawOptions>): entity is CanvasText {
  return entity.getType() === CanvasEntityType.TEXT;
}

export function isCanvasImage(entity: BaseCanvasEntityInterface<BaseDrawOptions>): entity is CanvasImage {
  return entity.getType() === CanvasEntityType.IMAGE;
}

export function isCanvasSelection(entity: BaseCanvasEntityInterface<BaseDrawOptions>): entity is Selection {
  return entity.getType() === CanvasEntityType.SELECTION;
}
