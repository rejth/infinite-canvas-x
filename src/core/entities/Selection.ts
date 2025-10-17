import { DEFAULT_CORNER } from '@/core/constants';

import { BaseDrawOptions, CanvasEntityType } from '@/core/entities/interfaces';
import { BaseCanvasEntity } from '@/core/entities/BaseCanvasEntity';
import { Point } from '@/core/entities/Point';

import { geometry } from '@/core/math';

export interface StrokeDrawOptions extends BaseDrawOptions {
  lineWidth: number;
  color: string;
}

export class Selection extends BaseCanvasEntity<StrokeDrawOptions> {
  constructor(options: StrokeDrawOptions) {
    super(options);
    this.setType(CanvasEntityType.SELECTION);
  }

  isPointInStroke(pointX: number, pointY: number): string | null {
    const { height } = this.getOptions();
    const { topLeft, topRight, bottomLeft, bottomRight } = this.getCorners();
    const point = new Point(pointX, pointY);

    if (!this.isPointInside(point, DEFAULT_CORNER)) {
      return null;
    }
    if (Math.abs(geometry.getDistanceBetweenPointAndLine(point, topLeft, topRight)) / height <= DEFAULT_CORNER) {
      return 'top';
    }
    if (Math.abs(geometry.getDistanceBetweenPointAndLine(point, topLeft, bottomLeft)) <= DEFAULT_CORNER) {
      return 'left';
    }
    if (Math.abs(geometry.getDistanceBetweenPointAndLine(point, topRight, bottomRight)) <= DEFAULT_CORNER) {
      return 'right';
    }
    if (Math.abs(geometry.getDistanceBetweenPointAndLine(point, bottomLeft, bottomRight)) / height <= DEFAULT_CORNER) {
      return 'bottom';
    }

    return null;
  }

  isPointInCorner(pointX: number, pointY: number): string | null {
    const { topLeft, topRight, bottomLeft, bottomRight } = this.getCorners();
    const point = new Point(pointX, pointY);

    if (geometry.getDistanceBetweenPoints(point, topLeft) <= DEFAULT_CORNER * 2) {
      return 'top-left';
    }
    if (geometry.getDistanceBetweenPoints(point, topRight) <= DEFAULT_CORNER * 2) {
      return 'top-right';
    }
    if (geometry.getDistanceBetweenPoints(point, bottomLeft) <= DEFAULT_CORNER * 2) {
      return 'bottom-left';
    }
    if (geometry.getDistanceBetweenPoints(point, bottomRight) <= DEFAULT_CORNER * 2) {
      return 'bottom-right';
    }

    return null;
  }
}
