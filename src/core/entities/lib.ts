import { CanvasEntityType, BaseCanvasEntityInterface, BaseDrawOptions } from '@/core/entities/interfaces';
import { CanvasImage } from '@/core/entities/CanvasImage';
import { CanvasText } from '@/core/entities/CanvasText';
import { CanvasRect } from '@/core/entities/CanvasRect';
import { Selection } from '@/core/entities/Selection';
import { CanvasCircle } from '@/core/entities/CanvasCirce';
import { CanvasSpline } from '@/core/entities/CanvasSpline';

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
