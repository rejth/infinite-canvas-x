import type { DoubleClickCustomEvent } from '@/shared/interfaces';

import { Point } from '@/entities/Point';
import { isCanvasRect } from '@/entities/lib';
import { CanvasEntityType, LayerInterface } from '@/entities/interfaces';

import { type Renderer } from '@/services/Renderer';
import { geometry } from '@/services/Geometry';

export class Camera {
  static #instance: Camera | null = null;

  #ctx!: CanvasRenderingContext2D;
  #renderer!: Renderer;
  #currentTransformedPosition!: Point;
  #currentPosition!: Point;
  #dragStartPosition!: Point;

  isDragging = false;

  constructor(context: CanvasRenderingContext2D, renderer: Renderer) {
    if (Camera.#instance) {
      return Camera.#instance;
    }

    this.#ctx = context;
    this.#renderer = renderer;
    this.#dragStartPosition = new Point(0, 0);
    this.#currentTransformedPosition = new Point(0, 0);
    this.#currentPosition = new Point(0, 0);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleWheelChange = this.handleWheelChange.bind(this);

    Camera.#instance = this;
  }

  handleMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.#dragStartPosition = this.#renderer.getTransformedPoint(new Point(e.pageX, e.pageY));
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;

    this.#currentTransformedPosition = this.#renderer.getTransformedPoint(new Point(e.pageX, e.pageY));

    this.#ctx.translate(
      this.#currentTransformedPosition.x - this.#dragStartPosition.x,
      this.#currentTransformedPosition.y - this.#dragStartPosition.y,
    );
  }

  handleClick(e: MouseEvent | TouchEvent): Point {
    const point = geometry.calculatePosition(e);
    return this.#renderer.getTransformedPoint(point);
  }

  handleDoubleClick(e: CustomEvent<DoubleClickCustomEvent>, activeLayer: LayerInterface): Point {
    const { pageX, pageY, transformedPageX, transformedPageY } = e.detail;

    const rect = activeLayer.getChildByType(CanvasEntityType.RECT);
    if (!rect || !isCanvasRect(rect)) return new Point(pageX, pageY);

    const rectOptions = rect.getOptions();
    const transformMatrix = this.#renderer.getTransformMatrix();

    const { scaleX, initialScale } = transformMatrix;
    const scale = scaleX !== initialScale ? scaleX / initialScale : 1;

    return new Point(
      pageX + (rectOptions.x - transformedPageX) * scale,
      pageY + (rectOptions.y - transformedPageY) * scale,
    );
  }

  handleWheelChange(e: WheelEvent) {
    this.#dragStartPosition = this.#renderer.getTransformedPoint(new Point(e.pageX, e.pageY));
    this.#currentPosition = new Point(e.pageX, e.pageY);

    if (e.ctrlKey) {
      this.#zoomCanvas(e);
    } else {
      this.#moveCanvas(e);
    }
  }

  #moveCanvas(e: WheelEvent) {
    this.#currentPosition = new Point(this.#currentPosition.x + e.deltaX * -1, this.#currentPosition.y + e.deltaY * -1);
    this.#currentTransformedPosition = this.#renderer.getTransformedPoint(this.#currentPosition);

    this.#ctx.translate(
      this.#currentTransformedPosition.x - this.#dragStartPosition.x,
      this.#currentTransformedPosition.y - this.#dragStartPosition.y,
    );
  }

  #zoomCanvas(e: WheelEvent) {
    this.#currentPosition = new Point(this.#currentPosition.x + e.deltaX * -1, this.#currentPosition.y + e.deltaY * -1);
    this.#currentTransformedPosition = this.#renderer.getTransformedPoint(this.#currentPosition);

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const transformMatrix = this.#renderer.getTransformMatrix();

    const nextZoomPercentage = this.#scaleToPercentage(transformMatrix.scaleX * zoom);
    const scale = this.#zoomPercentageToScale(nextZoomPercentage) / transformMatrix.scaleX;

    if (nextZoomPercentage <= 200 && nextZoomPercentage >= 10) {
      this.#ctx.translate(this.#currentTransformedPosition.x, this.#currentTransformedPosition.y);
      this.#renderer.scale(scale, scale);
      this.#ctx.translate(-this.#currentTransformedPosition.x, -this.#currentTransformedPosition.y);
    }
  }

  #scaleToPercentage(scale: number): number {
    return Math.max(10, Math.min(Math.ceil((scale * 200) / 10), 200));
  }

  #zoomPercentageToScale(percentage: number): number {
    return (percentage * 10) / 200;
  }
}
