import type { PixelRatio, RectCorners } from '@/core/interfaces';
import { DEFAULT_RECT_SIZE, DEFAULT_SCALE } from '@/core/constants';

import { BaseCanvasEntityInterface, BaseDrawOptions, CanvasEntityType } from '@/core/entities/interfaces';
import { Point } from '@/core/entities/Point';

import { geometry } from '@/core/math';

export abstract class BaseCanvasEntity<T extends BaseDrawOptions> implements BaseCanvasEntityInterface<T> {
  private type: CanvasEntityType;
  private options: T;
  private minDimension: number;

  constructor(drawOptions: T, minDimension = DEFAULT_RECT_SIZE) {
    this.type = CanvasEntityType.BASE;

    const { width, height, scale = DEFAULT_SCALE } = drawOptions;
    const initialWidth = drawOptions.initialWidth || width;
    const initialHeight = drawOptions.initialHeight || height;

    this.options = {
      ...drawOptions,
      width: width * scale,
      height: height * scale,
      initialWidth,
      initialHeight,
    };

    this.minDimension = Math.min(minDimension, initialWidth, initialHeight);
  }

  getOptions(): T {
    return { ...this.options };
  }

  setOptions(options: Partial<T>) {
    this.options = { ...this.options, ...options };
  }

  getType(): CanvasEntityType {
    return this.type;
  }

  setType(type: CanvasEntityType) {
    this.type = type;
  }

  getXY(): number[] {
    return [this.options.x, this.options.y];
  }

  setXY(x: number, y: number) {
    this.options.x = x;
    this.options.y = y;
  }

  getScale(): PixelRatio {
    return this.options.scale ?? DEFAULT_SCALE;
  }

  setScale(scale: PixelRatio) {
    this.options.scale = scale;
  }

  getOpacity(): number {
    return this.options.opacity ?? 1;
  }

  setOpacity(opacity: number) {
    this.options.opacity = opacity;
  }

  calculateScale(width: number, height: number): PixelRatio {
    const { initialWidth = width, initialHeight = height } = this.options;
    const newValue = Math.min(width, height);
    const prevValue = Math.min(initialWidth, initialHeight);
    return newValue / prevValue;
  }

  getMinDimension(): number {
    return this.minDimension;
  }

  getWidthHeight(): number[] {
    return [this.options.width, this.options.height];
  }

  setWidthHeight(width: number, height: number) {
    if (width >= this.minDimension && height >= this.minDimension) {
      const newScale = this.calculateScale(width, height);
      this.options.width = width;
      this.options.height = height;
      this.options.scale = newScale;
    }
  }

  move(movementX: number, movementY: number) {
    const { x, y } = this.options;
    this.setXY(x + movementX, y + movementY);
  }

  resize(movementX: number, movementY: number) {
    const { width, height } = this.options;
    const increase = (movementX + movementY) / 2;
    const layerWidth = width + increase;
    const layerHeight = height + increase;

    if (layerWidth >= this.minDimension && layerHeight >= this.minDimension) {
      this.setWidthHeight(layerWidth, layerHeight);
    }
  }

  isPointInside(point: Point, padding = 0) {
    const { x, y, width, height } = this.getOptions();
    return geometry.isPointInside(point, { x, y, width, height }, padding);
  }

  getCorners(): RectCorners {
    const { x, y, width, height } = this.getOptions();
    return geometry.getRectCorners(x, y, width, height);
  }
}
