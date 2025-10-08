import { DEFAULT_FONT, DEFAULT_SCALE, SMALL_PADDING, COLORS } from '@/shared/constants';

import { BaseDrawOptions, CanvasEntityType } from '@/entities/interfaces';
import { BaseCanvasEntity } from '@/entities/BaseCanvasEntity';
import { CanvasSpline } from '@/entities/CanvasSpline';
import { Layer } from '@/entities/Layer';

import { Vector, MBR } from '@/services/Geometry';

export interface RectDrawOptions extends BaseDrawOptions {
  color: COLORS;
  shadowColor?: string;
  shadowOffsetY?: number;
  shadowOffsetX?: number;
  shadowBlur?: number;
}

export const enum RectSubtype {
  RECT = 'RECT',
  TEXT = 'TEXT',
}

export class CanvasRect extends BaseCanvasEntity<RectDrawOptions> {
  subtype: RectSubtype;

  constructor(options: RectDrawOptions, subtype: RectSubtype = RectSubtype.RECT) {
    super(options);
    this.subtype = subtype;
    this.setType(CanvasEntityType.RECT);
  }

  enableTextTransformation(text: string) {
    const { x, y, width, height } = this.getOptions();

    const customSpline = [
      [325, 376],
      [445, 376],
      [569, 289],
      [653, 300],
      [737, 311],
      [844, 387],
      [945, 346],
    ];

    const bbox = new MBR(...customSpline.map((point) => new Vector(point[0], point[1])));
    const bboxWidth = bbox.size().x;
    const bboxHeight = bbox.size().y;

    // Calculate scale factors to fit within layer bounds (with padding)
    const availableWidth = width - SMALL_PADDING * 2;
    const availableHeight = height - SMALL_PADDING * 2;
    const scaleX = availableWidth / bboxWidth;
    const scaleY = availableHeight / bboxHeight;

    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(scaleX, scaleY);

    // Scale and position points to fit within layer bounds
    const adjustedPoints = customSpline.map(([px, py]) => [
      (px - bbox.min.x) * scale + x + SMALL_PADDING,
      (py - bbox.min.y) * scale + y + SMALL_PADDING,
    ]);

    const spline = new CanvasSpline({
      x,
      y,
      width,
      height,
      text,
      points: adjustedPoints,
      color: COLORS.CURVE,
      scale: DEFAULT_SCALE,
      font: DEFAULT_FONT,
      lineWidth: 2,
      shift: 0.5,
      spread: 1,
    });

    const layer = new Layer(
      {
        x: x - SMALL_PADDING,
        y: y - SMALL_PADDING,
        width: width + SMALL_PADDING * 2,
        height: height + SMALL_PADDING * 2,
        scale: DEFAULT_SCALE,
      },
      {
        withSelection: false,
        minDimension: Number.POSITIVE_INFINITY,
      },
    );

    layer.addChild(spline);
    layer.setActive(true);

    return layer;
  }
}
