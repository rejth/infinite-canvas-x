import { LayerId, PixelRatio, RectCorners } from '@/core/interfaces';
import { Point } from '@/core/entities/Point';

export const enum CanvasEntityType {
  BASE = 'BASE',
  LAYER = 'LAYER',
  RECT = 'RECT',
  CIRCLE = 'CIRCLE',
  SPLINE = 'SPLINE',
  TEXT = 'TEXT',
  SELECTION = 'SELECTION',
  IMAGE = 'IMAGE',
}

export interface BaseDrawOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  initialWidth?: number;
  initialHeight?: number;
  canvasScale?: number;
  text?: string;
  image?: CanvasImageSource;
  opacity?: number;
}

export interface BaseCanvasEntityInterface<T extends BaseDrawOptions = BaseDrawOptions> {
  getOptions(): T;
  setOptions(options: Partial<T>): void;

  getType(): CanvasEntityType;
  setType(type: CanvasEntityType): void;

  getXY(): number[];
  setXY(x: number, y: number): void;

  getScale(): PixelRatio;
  setScale(scale: PixelRatio): void;
  calculateScale(width: number, height: number): PixelRatio;

  getOpacity(): number;
  setOpacity(opacity: number): void;

  getMinDimension(): number;
  getWidthHeight(): number[];
  setWidthHeight(width: number, height: number): void;

  move(movementX: number, movementY: number): void;
  resize(movementX: number, movementY: number): void;

  isPointInside(point: Point, padding?: number): boolean;

  getCorners(): Record<keyof RectCorners, { x: number; y: number }>;
}

export interface LayerInterface extends BaseCanvasEntityInterface<BaseDrawOptions> {
  isActive(): boolean;
  setActive(state: boolean): void;

  getId(): LayerId | null;
  setId(id: LayerId): void;

  addChild<T extends BaseDrawOptions>(child: BaseCanvasEntityInterface<T>): void;
  getChildren<T extends BaseDrawOptions>(): Array<BaseCanvasEntityInterface<T>>;

  move(movementX: number, movementY: number): void;
  resize(movementX: number, movementY: number, direction?: string): void;

  resizeBottomRight(movementX: number, movementY: number): void;
  resizeBottomLeft(movementX: number, movementY: number): void;
  resizeTopRight(movementX: number, movementY: number): void;
  resizeTopLeft(movementX: number, movementY: number): void;

  moveChildrenAccordingly(movementX: number, movementY: number): void;
  resizeChildrenAccordingly(movementX: number, movementY: number): void;

  containsChildWithType(type: CanvasEntityType): boolean;
  getChildByType<T extends BaseDrawOptions>(type: CanvasEntityType): BaseCanvasEntityInterface<T> | null;

  setShouldBeRendered(shouldRender: boolean): void;
  shouldBeRendered(): boolean;
}
