import { Colors, Point } from '@/core/interfaces';
import { DEFAULT_SCALE, SMALL_PADDING } from '@/core/constants';

import { BaseDrawOptions, CanvasEntityType } from '@/core/entities/interfaces';
import { BaseCanvasEntity } from '@/core/entities/BaseCanvasEntity';
import { CanvasRect, RectSubtype } from '@/core/entities/CanvasRect';
import { Layer } from '@/core/entities/Layer';

import { BezierCurve, Vector, MBR } from '@/core/math';

export interface SplineDrawOptions extends BaseDrawOptions {
  text: string;
  points: number[][];
  font: string;
  lineWidth: number;
  color: string;
  shift: number;
  spread: number;
}

export class CanvasSpline extends BaseCanvasEntity<SplineDrawOptions> {
  spline: number[][] = [];
  curves: BezierCurve[] = [];
  handles: Point[][] = [];
  allControlPoints: Point[] = [];
  controlPointToSplineIndex: number[] = [];
  mbr: MBR;

  // Caching properties for control point dragging
  private selectedControlPointIndex: number | null = null;
  private isDraggingControlPoint = false;

  constructor(options: SplineDrawOptions) {
    super(options);
    this.setType(CanvasEntityType.SPLINE);

    this.spline = options.points;
    this.mbr = this.computeMBR();
    this.computeSpline();
  }

  private computeSpline = () => {
    this.curves.length = 0;
    this.handles.length = 0;
    this.allControlPoints.length = 0;
    this.controlPointToSplineIndex.length = 0;

    // Create control points for all spline points (handles and knots)
    for (let i = 0; i < this.spline.length; i++) {
      const [x, y] = this.spline[i];
      this.allControlPoints.push({ x, y });
      this.controlPointToSplineIndex.push(i);
    }

    // Compute curves from spline points
    for (let i = 0; i < (this.spline.length - 2) / 3; i++) {
      const points = this.spline.slice(3 * i, 3 * i + 4);
      const p = points.flat();

      const curve = new BezierCurve(
        new Vector(p[0], p[1]),
        new Vector(p[2], p[3]),
        new Vector(p[4], p[5]),
        new Vector(p[6], p[7]),
      );

      const curvePoints = curve.p;
      const leftHandle = [curvePoints[0], curvePoints[1]];
      const rightHandle = [curvePoints[2], curvePoints[3]];

      this.curves.push(curve);
      this.handles.push(leftHandle, rightHandle);
    }
  };

  private computeMBR = () => {
    const baseMBR = new MBR(...this.spline.map((point) => new Vector(point[0], point[1])));

    // Add padding for control point radius and safety margin
    // Using 25px for control point radius + 10px extra safety margin
    const padding = 35;

    // Expand the MBR by the padding amount
    baseMBR.min.x -= padding;
    baseMBR.min.y -= padding;
    baseMBR.max.x += padding;
    baseMBR.max.y += padding;

    return baseMBR;
  };

  private vAdd(a: number[], b: number[]) {
    return [a[0] + b[0], a[1] + b[1]];
  }

  private vSub(a: number[], b: number[]) {
    return [a[0] - b[0], a[1] - b[1]];
  }

  private dragControlPoint = (cp: Point, cpIndex: number) => {
    const { x, y } = cp;

    // Map control point index to spline index
    const splineIndex = this.controlPointToSplineIndex[cpIndex];

    // Calculate the movement delta
    const oldX = this.spline[splineIndex][0];
    const oldY = this.spline[splineIndex][1];
    const deltaX = x - oldX;
    const deltaY = y - oldY;

    if (splineIndex % 3 === 0) {
      // We're dragging a knot, so move the handles with it (relative movement)
      this.spline[splineIndex] = [x, y];

      // Move adjacent handles by the same delta
      if (splineIndex > 0) {
        this.spline[splineIndex - 1] = [
          this.spline[splineIndex - 1][0] + deltaX,
          this.spline[splineIndex - 1][1] + deltaY,
        ];
      }
      if (splineIndex < this.spline.length - 1) {
        this.spline[splineIndex + 1] = [
          this.spline[splineIndex + 1][0] + deltaX,
          this.spline[splineIndex + 1][1] + deltaY,
        ];
      }
    } else {
      // We're dragging a handle
      this.spline[splineIndex] = [x, y];

      // Figure out which handle is its "mirror"
      const m = splineIndex % 3 === 1 ? splineIndex - 2 : splineIndex + 2;
      if (m >= 0 && m < this.spline.length) {
        // Find the knot between them
        const k = splineIndex % 3 === 1 ? splineIndex - 1 : splineIndex + 1;
        // Set the mirror handle so that it's symmetric with the one being moved
        this.spline[m] = this.vAdd(this.spline[k], this.vSub(this.spline[k], this.spline[splineIndex]));
      }
    }

    this.computeSpline();
    this.mbr = this.computeMBR();
  };

  private getControlPointAtPosition = (x: number, y: number, threshold: number = 50): number | null => {
    const thresholdSquared = threshold * threshold;

    for (let i = 0; i < this.allControlPoints.length; i++) {
      const controlPoint = this.allControlPoints[i];
      const dx = x - controlPoint.x;
      const dy = y - controlPoint.y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared <= thresholdSquared) {
        return i;
      }
    }

    return null;
  };

  // Method to start control point drag - call this on mousedown
  startControlPointDrag = (x: number, y: number, threshold: number = 50): number | null => {
    // If already dragging, return cached index
    if (this.isDraggingControlPoint && this.selectedControlPointIndex !== null) {
      return this.selectedControlPointIndex;
    }

    // Find control point and cache it
    this.selectedControlPointIndex = this.getControlPointAtPosition(x, y, threshold);
    if (this.selectedControlPointIndex !== null) {
      this.isDraggingControlPoint = true;
    }

    return this.selectedControlPointIndex;
  };

  // Method to continue control point drag - call this on mousemove
  continueControlPointDrag = (cp: Point): boolean => {
    if (this.isDraggingControlPoint && this.selectedControlPointIndex !== null) {
      this.dragControlPoint(cp, this.selectedControlPointIndex);
      return true;
    }

    return false;
  };

  stopControlPointDrag = () => {
    this.isDraggingControlPoint = false;
    this.selectedControlPointIndex = null;
  };

  enableTextEditor() {
    const x = this.mbr.min.x;
    const y = this.mbr.min.y;
    const bboxWidth = this.mbr.size().x;
    const bboxHeight = this.mbr.size().y;

    const textArea = new CanvasRect(
      {
        x,
        y,
        width: bboxWidth,
        height: bboxHeight,
        color: Colors.TRANSPARENT,
        scale: DEFAULT_SCALE,
      },
      RectSubtype.TEXT,
    );

    const layer = new Layer({
      x: x - SMALL_PADDING,
      y: y - SMALL_PADDING,
      width: bboxWidth + SMALL_PADDING * 2,
      height: bboxHeight + SMALL_PADDING * 2,
      scale: DEFAULT_SCALE,
    });

    layer.addChild(textArea);
    layer.setActive(true);

    return layer;
  }
}
