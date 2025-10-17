import type { RectBounds, RectDimension, RectPosition, RectCorners, BBox } from '@/core/interfaces';
import { Point } from '@/core/entities/Point';

export class Geometry {
  getMousePosition(e: MouseEvent): Point {
    return new Point(e.pageX, e.pageY);
  }

  getTouchPosition(e: TouchEvent): Point {
    const { left, top } = (<Element>e.target).getBoundingClientRect();
    const { clientX, clientY } = e.changedTouches[0];
    return new Point(clientX - left, clientY - top);
  }

  calculatePosition(e: MouseEvent | TouchEvent): Point {
    if (e instanceof MouseEvent) {
      return this.getMousePosition(e);
    } else if (window.TouchEvent && e instanceof TouchEvent) {
      return this.getTouchPosition(e);
    }
    return new Point(0, 0);
  }

  getPathBounds(path: Point[]): RectBounds | null {
    if (!path.length) return null;
    const from = path[0];
    const to = path[path.length - 1];
    return {
      x0: from.x,
      y0: from.y,
      x1: to.x,
      y1: to.y,
    };
  }

  getRectDimensionFromPath(path: Point[]): RectDimension | null {
    if (!path.length) return null;
    const from = path[0];
    const to = path[path.length - 1];
    return {
      x: Math.min(from.x, to.x),
      y: Math.min(from.y, to.y),
      width: Math.abs(from.x - to.x),
      height: Math.abs(from.y - to.y),
    };
  }

  getRectDimensionFromBounds(bounds: RectBounds): RectDimension {
    const { x0, y0, x1, y1 } = bounds;
    return {
      x: Math.min(x0, x1),
      y: Math.min(y0, y1),
      width: Math.abs(x0 - x1),
      height: Math.abs(y0 - y1),
    };
  }

  getRectBoundsFromDimension(dimension: RectDimension): RectBounds {
    return {
      x0: dimension.x,
      y0: dimension.y,
      x1: dimension.x + dimension.width,
      y1: dimension.y + dimension.height,
    };
  }

  getRectCorners(x: number, y: number, width: number, height: number): RectCorners {
    return {
      topLeft: new Point(x, y),
      topRight: new Point(x + width, y),
      bottomLeft: new Point(x, y + height),
      bottomRight: new Point(x + width, y + height),
    };
  }

  getMiddlePoint(from: number, to: number): number {
    return (from + to) / 2;
  }

  isPointInsideRect(p: Point, rect: DOMRect | RectPosition): boolean {
    return p.x > rect.left && p.x < rect.right && p.y > rect.top && p.y < rect.bottom;
  }

  isPointInside(p: Point, { x, y, width, height }: RectDimension, padding = 0): boolean {
    return p.x > x - padding && p.x < x + width + padding && p.y > y - padding && p.y < y + height + padding;
  }

  getBBox(bounds: RectBounds = { x0: 0, y0: 0, x1: 0, y1: 0 }): BBox {
    const { x0, y0, x1, y1 } = bounds;
    return {
      minX: Math.min(x0, x1),
      minY: Math.min(y0, y1),
      maxX: Math.max(x0, x1),
      maxY: Math.max(y0, y1),
    };
  }

  isOverlapping(rectA: RectBounds, rectB: RectBounds): boolean {
    const rect1 = this.getBBox(rectA);
    const rect2 = this.getBBox(rectB);
    return !(rect1.maxX < rect2.minX || rect1.minX > rect2.maxX || rect1.maxY < rect2.minY || rect1.minY > rect2.maxY);
  }

  boundsIntersect(rectA: RectDimension, rectB: RectDimension): boolean {
    return !(
      rectA.x + rectA.width <= rectB.x || // rect A is to the left of rect B
      rectB.x + rectB.width <= rectA.x || // rect B is to the left of rect A
      rectA.y + rectA.height <= rectB.y || // rect A is above rect B
      rectB.y + rectB.height <= rectA.y // rect B is above rect A
    );
  }

  getDistanceBetweenPoints(pointA: Point, pointB: Point) {
    return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
  }

  getDistanceBetweenPointAndLine({ x, y }: Point, pointA: Point, pointB: Point) {
    return (
      (pointB.x - pointA.x) * (pointA.y - y) -
      ((pointA.x - x) * (pointB.y - pointA.y)) /
        Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2))
    );
  }

  scaleToPercentage(scale: number): number {
    return Math.max(10, Math.min(Math.ceil((scale * 200) / 10), 200));
  }

  zoomPercentageToScale(percentage: number): number {
    return (percentage * 10) / 200;
  }
}

export const geometry = new Geometry();
