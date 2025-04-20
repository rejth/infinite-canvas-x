import { BaseCanvasEntity } from '@/entities/BaseCanvasEntity';
import { BaseDrawOptions, CanvasEntityType } from '@/entities/interfaces';

export interface ImageDrawOptions extends BaseDrawOptions {
  image: CanvasImageSource;
}

export class CanvasImage extends BaseCanvasEntity<ImageDrawOptions> {
  constructor(options: ImageDrawOptions) {
    super(options);
    this.setType(CanvasEntityType.IMAGE);
  }
}
