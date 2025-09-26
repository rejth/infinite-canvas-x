import type {
  BezierCurveDrawOptions,
  CanvasOptions,
  ImageDrawOptions,
  CircleDrawOptions,
  PixelRatio,
  QuadraticCurveDrawOptions,
  RectDimension,
  RectDrawOptions,
  RoundedRectDrawOptions,
  StrokeDrawOptions,
  TextDrawOptions,
  TransformationMatrix,
  StrokeLineDrawOptions,
  SplineDrawOptions,
} from '@/shared/interfaces';
import { TextAlign, TextDecoration } from '@/shared/interfaces';
import {
  COLORS,
  DEFAULT_CANVAS_SCALE,
  DEFAULT_CORNER,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_SCALE,
  SMALL_PADDING,
} from '@/shared/constants';

import { Point } from '@/entities/Point';

import { geometry, BezierCurve, SplineArcLengthMap } from '@/services/Geometry';
import { ProxyCanvasRenderingContext2D, RenderMode } from '@/services/RenderManager';
import { SPATIAL_TILE_SIZE } from '@/services/SpatialTileIndex';

export class Renderer {
  private width: number;
  private height: number;
  private initialPixelRatio: PixelRatio;
  private pixelRatio: PixelRatio;

  constructor(protected readonly ctx: ProxyCanvasRenderingContext2D) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.initialPixelRatio = DEFAULT_CANVAS_SCALE;
    this.pixelRatio = DEFAULT_CANVAS_SCALE;

    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  getContext(): ProxyCanvasRenderingContext2D {
    return this.ctx;
  }

  getCanvasOptions(): CanvasOptions {
    return {
      width: this.width,
      height: this.height,
      initialPixelRatio: this.initialPixelRatio,
      pixelRatio: this.pixelRatio,
    };
  }

  getTransformMatrix(): TransformationMatrix {
    const transform = this.ctx.getTransform();

    return {
      scaleX: transform.a,
      skewY: transform.b,
      skewX: transform.c,
      scaleY: transform.d,
      translationX: transform.e,
      translationY: transform.f,
      initialScale: this.initialPixelRatio,
    };
  }

  setTransformMatrix(transformMatrix: TransformationMatrix) {
    this.ctx.setTransform(
      transformMatrix.scaleX,
      transformMatrix.skewY,
      transformMatrix.skewX,
      transformMatrix.scaleY,
      transformMatrix.translationX,
      transformMatrix.translationY,
    );
  }

  /*
   * https://roblouie.com/article/617/transforming-mouse-coordinates-to-canvas-coordinates/
   * This method has been modified. The original method doesn't take in account current scale.
   * https://math.hws.edu/graphicsbook/c6/s5.html#webgl.5.1
   * */
  getTransformedPoint({ x, y }: Point): Point {
    const transform = this.getTransformMatrix();
    const inverseZoom = 1 / (transform.scaleX / transform.initialScale);

    const transformedX = inverseZoom * x - inverseZoom * (transform.translationX / transform.initialScale);
    const transformedY = inverseZoom * y - inverseZoom * (transform.translationY / transform.initialScale);

    return new Point(transformedX, transformedY);
  }

  /**
   * This method calculates the transformed area of the canvas relative to the window.
   * The method takes into account the translation and scale of the canvas.
   */
  getTransformedArea(): RectDimension {
    const transformMatrix = this.getTransformMatrix();
    const inverseScale = 2 / transformMatrix.scaleX < 2 ? 2 : 2 / transformMatrix.scaleX;

    return {
      x: transformMatrix.translationX > 0 ? -transformMatrix.translationX * inverseScale : 0,
      y: transformMatrix.translationY > 0 ? -transformMatrix.translationY * inverseScale : 0,
      width: window.innerWidth * inverseScale + Math.abs(transformMatrix.translationX) * inverseScale,
      height: window.innerHeight * inverseScale + Math.abs(transformMatrix.translationY) * inverseScale,
    };
  }

  getTransformedViewport(): RectDimension {
    const transformMatrix = this.getTransformMatrix();
    const scale = transformMatrix.scaleX / transformMatrix.initialScale;

    return {
      x: -transformMatrix.translationX / scale,
      y: -transformMatrix.translationY / scale,
      width: window.innerWidth / scale,
      height: window.innerHeight / scale,
    };
  }

  translate(x: number, y: number) {
    this.ctx.translate(x, y);
  }

  scale(scaleX: number, scaleY: number) {
    this.ctx.scale(scaleX, scaleY);
    const transform = this.getTransformMatrix();
    this.pixelRatio = transform.scaleX ?? DEFAULT_SCALE;
  }

  /**
   * Clear the specified rectangle of the canvas on the next animation frame (typically 60fps = ~16.67ms later)
   *
   * @param x - The x-coordinate of the top-left corner of the rectangle to clear.
   * @param y - The y-coordinate of the top-left corner of the rectangle to clear.
   * @param width - The width of the rectangle to clear.
   * @param height - The height of the rectangle to clear.
   * @param callBack - A function to be called after clearing the rectangle.
   */
  clearRectOnNextFrame({ x, y, width, height }: RectDimension, callBack: () => void) {
    requestAnimationFrame(() => {
      this.ctx.clearRect(x, y, width, height);
      callBack();
    });
  }

  /**
   * Clear the specified rectangle of the canvas immediately when called.
   * Good for immediate cleanup or one-off operations.
   *
   * @param {{ x: number, y: number, width: number, height: number }}
   */
  clearRectSync({ x, y, width, height }: RectDimension) {
    this.ctx.clearRect(x, y, width, height);
  }

  fillRect(options: RectDrawOptions) {
    const { x, y, width, height, color, shadowColor, shadowOffsetY, shadowOffsetX, shadowBlur } = options;

    this.ctx.save();

    if (color) {
      this.ctx.fillStyle = color;
    }
    if (shadowColor) {
      this.ctx.shadowColor = shadowColor;
    }
    if (shadowOffsetY) {
      this.ctx.shadowOffsetY = shadowOffsetY;
    }
    if (shadowOffsetX) {
      this.ctx.shadowOffsetX = shadowOffsetX;
    }
    if (shadowBlur) {
      this.ctx.shadowBlur = shadowBlur;
    }

    this.ctx.fillRect(x, y, width, height);
    this.ctx.restore();
  }

  fillRoundedRect(options: RoundedRectDrawOptions) {
    const { x, y, width, height, radius, color, shadowColor, shadowOffsetY, shadowOffsetX, shadowBlur } = options;

    const { topLeft, topRight, bottomLeft, bottomRight } = geometry.getRectCorners(x, y, width, height);

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 4;

    if (shadowColor) {
      this.ctx.shadowColor = shadowColor;
    }
    if (shadowOffsetY) {
      this.ctx.shadowOffsetY = shadowOffsetY;
    }
    if (shadowOffsetX) {
      this.ctx.shadowOffsetX = shadowOffsetX;
    }
    if (shadowBlur) {
      this.ctx.shadowBlur = shadowBlur;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(topLeft.x + radius, topLeft.y);

    this.ctx.lineTo(topRight.x - radius, topRight.y);
    this.ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + radius);

    this.ctx.lineTo(bottomRight.x, bottomRight.y - radius);
    this.ctx.quadraticCurveTo(bottomRight.x, bottomRight.y, bottomRight.x - radius, bottomRight.y);

    this.ctx.lineTo(bottomLeft.x + radius, bottomLeft.y);
    this.ctx.quadraticCurveTo(bottomLeft.x, bottomLeft.y, bottomLeft.x, bottomLeft.y - radius);

    this.ctx.lineTo(topLeft.x, topLeft.y + radius);
    this.ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + radius, topLeft.y);

    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.restore();
  }

  strokeRect(options: StrokeDrawOptions) {
    const { x, y, width, height, lineWidth, color } = options;

    this.ctx.save();
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.restore();
  }

  fillCircle(options: CircleDrawOptions) {
    if (!this.ctx) return;
    const { x, y, radius, color, stroke = false, strokeColor = COLORS.SELECTION, lineWidth = 1 } = options;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = color;

    if (stroke) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }

    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  strokeLine(options: StrokeLineDrawOptions) {
    if (!this.ctx) return;

    const { x1, y1, x2, y2, color, lineWidth = 2 } = options;

    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  strokeQuadraticCurve(options: QuadraticCurveDrawOptions) {
    const { start, control, end, color = COLORS.CURVE, lineWidth = 2 } = options;

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }

  strokeBezierCurve(options: BezierCurveDrawOptions) {
    const { start, cp1, cp2, end, color, lineWidth = 2 } = options;

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }

  drawImage(options: ImageDrawOptions) {
    const { x, y, width, height, image } = options;

    this.ctx.save();
    this.ctx.drawImage(image, x, y, width, height);
    this.ctx.restore();
  }

  drawTextUnderline(
    ctx: OffscreenCanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    textAlign: string,
  ) {
    const textWidth = ctx.measureText(text).width;
    const startY = y + fontSize / 15;
    const endY = startY;

    let startX = 0;
    let endX = 0;
    let underlineHeight = fontSize / 15;

    if (underlineHeight < 1) {
      underlineHeight = 1;
    }

    ctx.beginPath();

    if (textAlign === TextAlign.CENTER) {
      startX = x - textWidth / 2;
      endX = x + textWidth / 2;
    } else if (textAlign === TextAlign.RIGHT) {
      startX = x - textWidth;
      endX = x;
    } else {
      startX = x;
      endX = x + textWidth;
    }

    ctx.strokeStyle = COLORS.FONT;
    ctx.lineWidth = underlineHeight;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  renderTextSnapshot(fragments: string[], textOptions: TextDrawOptions) {
    const { x, y, width, height, scale = DEFAULT_SCALE } = textOptions;
    const { text, fontSize, fontStyle, textAlign, textDecoration } = textOptions;

    const { initialPixelRatio, pixelRatio } = this.getCanvasOptions();

    const offscreenCanvas = new OffscreenCanvas(width, height);
    offscreenCanvas.width = Math.floor(width * pixelRatio);
    offscreenCanvas.height = Math.floor(height * pixelRatio);

    const ctx = offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

    ctx.textAlign = textAlign;
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${fontStyle ? fontStyle : DEFAULT_FONT_WEIGHT} ${fontSize}px monospace`;
    ctx.scale(scale * pixelRatio, scale * pixelRatio);

    const textMetrics = ctx.measureText(text);
    const transform = ctx.getTransform();
    const lineHeight = textMetrics.fontBoundingBoxDescent + textMetrics.fontBoundingBoxAscent;

    let newX = SMALL_PADDING;
    if (textAlign === TextAlign.CENTER) {
      newX = offscreenCanvas.width / transform.a / initialPixelRatio;
    }
    if (textAlign === TextAlign.RIGHT) {
      newX = offscreenCanvas.width / transform.a - SMALL_PADDING;
    }

    let newY = lineHeight;
    for (const fragment of fragments) {
      if (fragment === '') {
        newY += lineHeight;
      } else {
        ctx.fillText(fragment, newX, newY);
        if (textDecoration === TextDecoration.UNDERLINE) {
          this.drawTextUnderline(ctx, text, newX, newY, fontSize, textAlign);
        }
        newY += lineHeight;
      }
    }

    this.ctx.drawImage(offscreenCanvas, x, y, width, height);

    return offscreenCanvas;
  }

  drawSpline(curves: BezierCurve[], controlPoints: Point[], handles: Point[][]) {
    for (const curve of curves) {
      this.strokeBezierCurve({
        start: curve.p[0],
        cp1: curve.p[1],
        cp2: curve.p[2],
        end: curve.p[3],
        color: COLORS.CURVE,
        lineWidth: 2,
      });
    }
    for (const controlPoint of controlPoints) {
      this.fillCircle({
        x: controlPoint.x,
        y: controlPoint.y,
        radius: DEFAULT_CORNER,
        color: COLORS.SELECTION,
        lineWidth: 1,
      });
    }
    for (const handle of handles) {
      this.strokeLine({
        x1: handle[0].x,
        y1: handle[0].y,
        x2: handle[1].x,
        y2: handle[1].y,
        color: COLORS.CURVE,
        lineWidth: 1,
      });
    }
  }

  drawTextOnSpline(spline: BezierCurve[], options: SplineDrawOptions) {
    if (spline.length === 0) return;

    const { text, shift, spread } = options;

    this.ctx.font = `bold 70px monospace`;

    const map = new SplineArcLengthMap(spline);
    const textLength = this.ctx.measureText(text).width;
    const delta = (map.len(1) - map.len(0)) * shift - (textLength * spread) / 2;
    const t = [map.t(delta)];

    this.ctx.setRenderMode(RenderMode.TEXT);

    let lastWidth = 0;
    for (let i = 1; i <= text.length; i++) {
      const wordWidth = this.ctx.measureText(text.substring(0, i)).width * spread;
      t[i] = map.t(wordWidth + delta);

      const baset = (t[i] + t[i - 1]) / 2;
      const { point: pos, tangent: tan } = map.getPointAtNormalizedPosition(baset);

      // Adjust position by half the character width along the tangent
      const adjustedPosition = pos.sub(tan.scale((wordWidth - lastWidth) / 2));

      this.ctx.save();
      this.ctx.translate(adjustedPosition.x, adjustedPosition.y);
      this.ctx.rotate(Math.atan2(tan.y, tan.x));
      this.ctx.fillText(text[i - 1], 0, 0);
      this.ctx.restore();

      lastWidth = wordWidth;
    }

    this.ctx.setRenderMode(RenderMode.MAIN);
  }

  drawBackground() {
    this.ctx.drawBackground(this.getTransformedArea());
  }

  drawTileGrid(tileSize: number = SPATIAL_TILE_SIZE, viewport: RectDimension) {
    this.ctx.save();

    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    this.ctx.lineWidth = 2;

    // Calculate tile boundaries that intersect with viewport
    const startTileX = Math.floor(viewport.x / tileSize);
    const startTileY = Math.floor(viewport.y / tileSize);
    const endTileX = Math.floor((viewport.x + viewport.width) / tileSize);
    const endTileY = Math.floor((viewport.y + viewport.height) / tileSize);

    // Draw vertical lines
    for (let x = startTileX; x <= endTileX + 1; x++) {
      const lineX = x * tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, viewport.y);
      this.ctx.lineTo(lineX, viewport.y + viewport.height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startTileY; y <= endTileY + 1; y++) {
      const lineY = y * tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(viewport.x, lineY);
      this.ctx.lineTo(viewport.x + viewport.width, lineY);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawDirtyTiles(dirtyTileKeys: Set<string>, tileSize: number = SPATIAL_TILE_SIZE) {
    this.ctx.save();

    this.ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
    this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    this.ctx.lineWidth = 3;

    for (const tileKey of dirtyTileKeys) {
      const [tileX, tileY] = tileKey.split(',').map(Number);
      const x = tileX * tileSize;
      const y = tileY * tileSize;

      this.ctx.fillRect(x, y, tileSize, tileSize);
      this.ctx.strokeRect(x, y, tileSize, tileSize);
    }

    this.ctx.restore();
  }
}
