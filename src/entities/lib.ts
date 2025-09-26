import { CanvasEntityType, BaseCanvasEntityInterface, BaseDrawOptions } from '@/entities/interfaces';
import { CanvasImage } from '@/entities/CanvasImage';
import { CanvasText } from '@/entities/CanvasText';
import { CanvasRect } from '@/entities/CanvasRect';
import { Selection } from '@/entities/Selection';
import { CanvasCircle } from '@/entities/CanvasCirce';
import { CanvasSpline } from '@/entities/CanvasSpline';

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

export function isCanvasCircle(entity: BaseCanvasEntityInterface<BaseDrawOptions>): entity is CanvasCircle {
  return entity.getType() === CanvasEntityType.CIRCLE;
}

export function isCanvasSpline(entity: BaseCanvasEntityInterface<BaseDrawOptions>): entity is CanvasSpline {
  return entity.getType() === CanvasEntityType.SPLINE;
}
