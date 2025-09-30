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

  drawImageWithFilters(image: CanvasImageSource, ctx: OffscreenCanvasRenderingContext2D, options: ImageDrawOptions) {
    const { width, height, brightness, contrast, saturation, vibrance, hue, blur, noise, pixelate } = options;

    const filters = [];

    if (brightness !== undefined) {
      // Convert from 0-100 range to CSS brightness (0-200%)
      filters.push(`brightness(${Math.max(0, brightness * 2)}%)`);
    }
    if (contrast !== undefined) {
      // Convert from 0-100 range to CSS contrast (0-200%)
      filters.push(`contrast(${Math.max(0, contrast * 2)}%)`);
    }
    if (saturation !== undefined) {
      // Convert from 0-100 range to CSS saturate (0-200%)
      filters.push(`saturate(${Math.max(0, saturation * 2)}%)`);
    }
    if (hue !== undefined) {
      // Convert from 0-100 range to hue rotation (0-360 degrees)
      filters.push(`hue-rotate(${(hue / 100) * 360}deg)`);
    }
    if (blur !== undefined && blur > 0) {
      // Convert from 0-100 range to blur pixels (0-10px)
      filters.push(`blur(${Math.max(0, (blur / 100) * 10)}px)`);
    }

    // Apply CSS filters to the OffscreenCanvas context only
    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    ctx.drawImage(image, 0, 0, width, height);

    // Reset filter to avoid affecting subsequent operations
    ctx.filter = 'none';

    if (pixelate !== undefined && pixelate > 0) {
      this.drawPixelatedImage(ctx, image, options, pixelate);
    } else if (noise !== undefined && noise > 0) {
      this.drawImageWithNoise(ctx, options, noise);
    }

    if (vibrance !== undefined && vibrance !== 50) {
      this.applyVibranceEffect(ctx, options, vibrance);
    }
  }

  private drawPixelatedImage(
    ctx: OffscreenCanvasRenderingContext2D,
    image: CanvasImageSource,
    options: ImageDrawOptions,
    pixelateLevel: number,
  ) {
    const { width, height } = options;

    // Create a smaller version and scale it back up for pixelation effect
    const pixelSize = Math.max(1, Math.floor((pixelateLevel / 100) * Math.min(width, height) * 0.1));
    const smallWidth = Math.max(1, Math.floor(width / pixelSize));
    const smallHeight = Math.max(1, Math.floor(height / pixelSize));

    // Create temporary canvas for pixelation
    const pixelatedCanvas = new OffscreenCanvas(smallWidth, smallHeight);
    const pixelatedCtx = pixelatedCanvas.getContext('2d')!;

    // Disable smoothing for sharp pixels
    pixelatedCtx.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    // Draw small version
    pixelatedCtx.drawImage(image, 0, 0, smallWidth, smallHeight);

    // Clear the main offscreen canvas and draw scaled up version
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(pixelatedCanvas, 0, 0, width, height);

    // Restore smoothing
    ctx.imageSmoothingEnabled = true;
  }

  private drawImageWithNoise(ctx: OffscreenCanvasRenderingContext2D, options: ImageDrawOptions, noiseLevel: number) {
    const { width, height, scale = DEFAULT_SCALE } = options;
    const { pixelRatio } = this.getCanvasOptions();

    // Calculate actual rendered image dimensions in the buffer
    const effectiveWidth = Math.floor(width * scale * pixelRatio);
    const effectiveHeight = Math.floor(height * scale * pixelRatio);

    const imageData = ctx.getImageData(0, 0, effectiveWidth, effectiveHeight);
    const data = imageData.data;
    const noiseIntensity = (noiseLevel / 100) * 50; // Scale noise intensity

    // Add random noise to each pixel
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < noiseLevel / 100) {
        const noise = (Math.random() - 0.5) * noiseIntensity;
        data[i] = Math.max(0, Math.min(255, data[i] + noise)); // Red
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private applyVibranceEffect(ctx: OffscreenCanvasRenderingContext2D, options: ImageDrawOptions, vibrance: number) {
    if (vibrance === 50) return;

    const { width, height, scale = DEFAULT_SCALE } = options;
    const { pixelRatio } = this.getCanvasOptions();

    // Calculate actual rendered image dimensions in the buffer
    const effectiveWidth = Math.floor(width * scale * pixelRatio);
    const effectiveHeight = Math.floor(height * scale * pixelRatio);

    const imageData = ctx.getImageData(0, 0, effectiveWidth, effectiveHeight);
    const data = imageData.data;
    const vibranceAdjustment = ((vibrance - 50) / 50) * 0.5; // Scale to -0.5 to 0.5

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      // Calculate the maximum and average of RGB
      const max = Math.max(r, g, b);
      const avg = (r + g + b) / 3;

      // Apply vibrance (increase saturation of less saturated colors)
      const amount = (max - avg) * vibranceAdjustment;

      data[i] = Math.max(0, Math.min(255, data[i] * (1 + amount)));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * (1 + amount)));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * (1 + amount)));
    }

    ctx.putImageData(imageData, 0, 0);
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

    const textCanvas = new OffscreenCanvas(width, height);
    textCanvas.width = Math.floor(width * pixelRatio);
    textCanvas.height = Math.floor(height * pixelRatio);

    const textCtx = textCanvas.getContext('2d')!;

    textCtx.textAlign = textAlign;
    textCtx.textBaseline = 'alphabetic';
    textCtx.font = `${fontStyle ? fontStyle : DEFAULT_FONT_WEIGHT} ${fontSize}px monospace`;
    textCtx.scale(scale * pixelRatio, scale * pixelRatio);

    const textMetrics = textCtx.measureText(text);
    const transform = textCtx.getTransform();
    const lineHeight = textMetrics.fontBoundingBoxDescent + textMetrics.fontBoundingBoxAscent;

    let newX = SMALL_PADDING;
    if (textAlign === TextAlign.CENTER) {
      newX = textCanvas.width / transform.a / initialPixelRatio;
    }
    if (textAlign === TextAlign.RIGHT) {
      newX = textCanvas.width / transform.a - SMALL_PADDING;
    }

    let newY = lineHeight;
    for (const fragment of fragments) {
      if (fragment === '') {
        newY += lineHeight;
      } else {
        textCtx.fillText(fragment, newX, newY);
        if (textDecoration === TextDecoration.UNDERLINE) {
          this.drawTextUnderline(textCtx, text, newX, newY, fontSize, textAlign);
        }
        newY += lineHeight;
      }
    }

    this.ctx.drawImage(textCanvas, x, y, width, height);

    return textCanvas;
  }

  renderImage(options: ImageDrawOptions) {
    const { width, height } = options;
    const { pixelRatio } = this.getCanvasOptions();

    const imgCanvas = new OffscreenCanvas(width, height);
    imgCanvas.width = Math.floor(width * pixelRatio);
    imgCanvas.height = Math.floor(height * pixelRatio);

    const imgCtx = imgCanvas.getContext('2d')!;
    imgCtx.scale(pixelRatio, pixelRatio);

    this.drawImageWithFilters(options.image, imgCtx, options);

    return imgCanvas;
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
