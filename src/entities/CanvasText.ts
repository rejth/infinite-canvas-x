import { DEFAULT_CANVAS_SCALE, DEFAULT_FONT_WEIGHT, DEFAULT_SCALE } from '@/shared/constants';
import { TextAlign, TextDecoration } from '@/shared/interfaces';

import { BaseDrawOptions, CanvasEntityType } from '@/entities/interfaces';
import { BaseCanvasEntity } from '@/entities/BaseCanvasEntity';

export interface TextDrawOptions extends BaseDrawOptions {
  text: string;
  textAlign: TextAlign;
  textDecoration: TextDecoration;
  font: string;
  fontSize: number;
  fontStyle: string;
}

export const enum TextMode {
  DEFAULT = 'default',
  CURVED = 'curved',
}

export class CanvasText extends BaseCanvasEntity<TextDrawOptions> {
  private snapshot: CanvasImageSource | null = null;
  private preparedText: string[] = [];

  mode = TextMode.DEFAULT;

  constructor(options: TextDrawOptions) {
    super(options);
    this.setType(CanvasEntityType.TEXT);
    this.prepareText(options.text, options.fontSize, options.fontStyle);
  }

  setMode(mode: TextMode) {
    this.mode = mode;
  }

  getPreparedText(): string[] {
    return this.preparedText;
  }

  getSnapshot(): CanvasImageSource | null {
    return this.snapshot;
  }

  setSnapshot(snapshot: CanvasImageSource | null) {
    this.snapshot = snapshot;
  }

  setText(text: string, fontSize: number, fontStyle: string, textAlign: TextAlign, textDecoration: TextDecoration) {
    const options = this.getOptions();
    this.prepareText(text, fontSize, fontStyle);

    if (
      text !== options.text ||
      fontSize !== options.fontSize ||
      fontStyle !== options.fontStyle ||
      textAlign !== options.textAlign ||
      textDecoration !== options.textDecoration
    ) {
      this.setSnapshot(null);
    }

    this.setOptions({ text, fontSize, fontStyle, textAlign, textDecoration });
  }

  setWidthHeight(width: number, height: number) {
    super.setWidthHeight(width, height);
    this.setSnapshot(null);
  }

  private prepareText(text: string, fontSize: number, fontStyle = '') {
    const { width, height, scale = DEFAULT_SCALE, canvasScale = DEFAULT_CANVAS_SCALE } = this.getOptions();

    const offscreenCanvas = new OffscreenCanvas(width, height);
    offscreenCanvas.width = Math.floor(width * canvasScale);
    offscreenCanvas.height = Math.floor(height * canvasScale);

    const ctx = offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    ctx.scale(canvasScale, canvasScale);
    ctx.font = `${fontStyle ? fontStyle : DEFAULT_FONT_WEIGHT} ${fontSize}px monospace`;

    const fragments = text.split(/[\r\n]/);
    const preparedText: string[] = [];
    let textToRender = '';

    for (const fragment of fragments) {
      if (fragment === '') {
        preparedText.push('');
      } else {
        for (const substring of fragment) {
          const textMetrics = ctx.measureText(textToRender + substring);
          const rectWidth = width - 10 * scale;

          if (textMetrics.width * scale >= rectWidth) {
            preparedText.push(textToRender);
            textToRender = '';
          }

          textToRender += substring;
        }

        if (textToRender !== '') {
          preparedText.push(textToRender);
          textToRender = '';
        }
      }
    }

    this.preparedText = preparedText;
  }
}
