import type { COLORS } from '@/shared/constants';

import { BaseDrawOptions, CanvasEntityType } from '@/entities/interfaces';
import { BaseCanvasEntity } from '@/entities/BaseCanvasEntity';

export interface RectDrawOptions extends BaseDrawOptions {
  color: COLORS;
  shadowColor?: string;
  shadowOffsetY?: number;
  shadowOffsetX?: number;
  shadowBlur?: number;
}

export class CanvasRect extends BaseCanvasEntity<RectDrawOptions> {
  constructor(options: RectDrawOptions) {
    super(options);
    this.setType(CanvasEntityType.RECT);
  }
}
