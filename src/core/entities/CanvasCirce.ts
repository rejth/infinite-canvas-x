import { BaseDrawOptions, CanvasEntityType } from '@/core/entities/interfaces';
import { BaseCanvasEntity } from '@/core/entities/BaseCanvasEntity';

export interface CircleDrawOptions extends BaseDrawOptions {
  radius: number;
  color: string;
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
