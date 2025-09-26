import type { COLORS } from '@/shared/constants';

import { BaseDrawOptions, CanvasEntityType } from '@/entities/interfaces';
import { BaseCanvasEntity } from '@/entities/BaseCanvasEntity';

export interface CircleDrawOptions extends BaseDrawOptions {
  radius: number;
  color: COLORS;
  stroke?: boolean;
  strokeColor?: string;
  lineWidth?: number;
}

export class CanvasCircle extends BaseCanvasEntity<CircleDrawOptions> {
  constructor(options: CircleDrawOptions) {
    super(options);
    this.setType(CanvasEntityType.CIRCLE);
  }
}
