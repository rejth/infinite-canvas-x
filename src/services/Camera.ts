import type { DoubleClickCustomEvent } from '@/shared/interfaces';
import { ZOOM_MIN, ZOOM_MAX } from '@/shared/constants';

import { Point } from '@/entities/Point';
import { isCanvasRect } from '@/entities/lib';
import { CanvasEntityType, LayerInterface } from '@/entities/interfaces';

import { type Renderer } from '@/services/Renderer';
import { geometry } from '@/services/Geometry';

export class Camera {
  static #instance: Camera | null = null;

  #renderer!: Renderer;
  #currentTransformedPosition!: Point;
  #currentPosition!: Point;
  #dragStartPosition!: Point;

  isDragging = false;

  constructor(renderer: Renderer) {
    if (Camera.#instance) {
      return Camera.#instance;
    }

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

    this.#renderer.translate(
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
    const startPoint = new Point(e.pageX, e.pageY);
    this.#dragStartPosition = this.#renderer.getTransformedPoint(startPoint);
    this.#currentPosition = startPoint;
  }

  moveCanvas(e: WheelEvent) {
    this.#currentPosition = new Point(this.#currentPosition.x + e.deltaX * -1, this.#currentPosition.y + e.deltaY * -1);

    if (this.#dragStartPosition.isNull()) {
      return false;
    }

    this.#currentTransformedPosition = this.#renderer.getTransformedPoint(this.#currentPosition);
    this.#renderer.translate(
      this.#currentTransformedPosition.x - this.#dragStartPosition.x,
      this.#currentTransformedPosition.y - this.#dragStartPosition.y,
    );

    return true;
  }

  zoomCanvas(e: WheelEvent) {
    this.#currentPosition = new Point(this.#currentPosition.x + e.deltaX * -1, this.#currentPosition.y + e.deltaY * -1);
    this.#currentTransformedPosition = this.#renderer.getTransformedPoint(this.#currentPosition);

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const transformMatrix = this.#renderer.getTransformMatrix();

    const nextZoomPercentage = geometry.scaleToPercentage(transformMatrix.scaleX * zoom);
    const scale = geometry.zoomPercentageToScale(nextZoomPercentage) / transformMatrix.scaleX;

    let isZoomed = false;

    if (nextZoomPercentage <= ZOOM_MAX && nextZoomPercentage >= ZOOM_MIN) {
      this.#renderer.translate(this.#currentTransformedPosition.x, this.#currentTransformedPosition.y);
      this.#renderer.scale(scale, scale);
      this.#renderer.translate(-this.#currentTransformedPosition.x, -this.#currentTransformedPosition.y);
      isZoomed = true;
    }

    return { isZoomed, nextZoomPercentage, scale };
  }

  zoomCanvasWithStep(zoomPercentage: number, step: number, edge: number, activeLayer: LayerInterface | null) {
    const { scaleX } = this.#renderer.getTransformMatrix();

    const nextZoomPercentage = step > 0 ? Math.min(zoomPercentage + step, edge) : Math.max(zoomPercentage + step, edge);
    const scale = geometry.zoomPercentageToScale(nextZoomPercentage) / scaleX;

    let currentTransformedPosition = this.#renderer.getTransformedPoint(
      new Point(window.innerWidth / 2, window.innerHeight / 2),
    );

    if (activeLayer) {
      const options = activeLayer.getOptions();

      currentTransformedPosition = new Point(
        options.x + (options.width * scale) / 2,
        options.y + (options.height * scale) / 2,
      );
    }

    let isZoomed = false;

    if (step > 0 ? nextZoomPercentage <= edge : nextZoomPercentage >= edge) {
      this.#renderer.translate(currentTransformedPosition.x, currentTransformedPosition.y);
      this.#renderer.scale(scale, scale);
      this.#renderer.translate(-currentTransformedPosition.x, -currentTransformedPosition.y);
      isZoomed = true;
    }

    return { isZoomed, nextZoomPercentage, scale };
  }

  handleDragStopped() {
    this.#dragStartPosition = new Point(0, 0);
  }
}
