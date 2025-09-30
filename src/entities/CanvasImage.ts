import { BaseCanvasEntity } from '@/entities/BaseCanvasEntity';
import { BaseDrawOptions, CanvasEntityType } from '@/entities/interfaces';

export interface ImageDrawOptions extends BaseDrawOptions {
  image: CanvasImageSource;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  vibrance?: number;
  hue?: number;
  blur?: number;
  noise?: number;
  pixelate?: number;
}

interface ImageFilterOptions {
  brightness: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  hue: number;
  blur: number;
  noise: number;
  pixelate: number;
}

export class CanvasImage extends BaseCanvasEntity<ImageDrawOptions> {
  snapshot: CanvasImageSource | null = null;

  constructor(options: ImageDrawOptions) {
    super(options);
    this.setType(CanvasEntityType.IMAGE);
  }

  applyFilters(filters: Partial<ImageFilterOptions>) {
    this.setOptions(filters);
    this.snapshot = null;
  }

  resize(movementX: number, movementY: number) {
    const { width, height } = this.getOptions();
    const increase = (movementX + movementY) / 2;
    const newWidth = width + increase;
    const newHeight = height + increase;
    const minDimension = this.getMinDimension();

    if (newWidth >= minDimension && newHeight >= minDimension) {
      this.setWidthHeight(newWidth, newHeight);
      this.setScale(1.0);
      this.snapshot = null;
    }
  }
}
