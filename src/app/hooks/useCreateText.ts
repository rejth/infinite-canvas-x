import { useTextEditorContext, useActiveLayerContext, useCanvasContext } from '@/app/store';

import { DEFAULT_FONT, DEFAULT_RECT_SIZE, DEFAULT_TEXT_AREA_HEIGHT, DEFAULT_TEXT_AREA_WIDTH } from '@/core/constants';
import { TextDecoration } from '@/core/interfaces';

import { CanvasEntityType } from '@/core/entities/interfaces';
import { CanvasText } from '@/core/entities/CanvasText';
import { RectSubtype } from '@/core/entities/CanvasRect';
import { isCanvasRect } from '@/core/entities/lib';

export function useCreateText() {
  const { renderer } = useCanvasContext();
  const { activeLayer } = useActiveLayerContext();
  const { text, textAlign, fontSize, bold, italic, underline } = useTextEditorContext();

  return function () {
    if (!activeLayer || !renderer) return;

    const rect = activeLayer.getChildByType(CanvasEntityType.RECT);
    if (!rect || !isCanvasRect(rect)) return;

    const [x, y] = rect.getXY();
    const scale = rect.getScale();
    const { initialPixelRatio } = renderer.getCanvasOptions();
    const textDecoration = underline ? TextDecoration.UNDERLINE : TextDecoration.NONE;
    const font = DEFAULT_FONT;
    const isTextArea = rect.subtype === RectSubtype.TEXT;

    let fontStyle = '';
    if (italic) fontStyle = `${fontStyle} italic`;
    if (bold) fontStyle = `${fontStyle} bold`;

    const width = isTextArea ? DEFAULT_TEXT_AREA_WIDTH : DEFAULT_RECT_SIZE;
    const height = isTextArea ? DEFAULT_TEXT_AREA_HEIGHT : DEFAULT_RECT_SIZE;

    const canvasText = new CanvasText({
      x,
      y,
      width,
      height,
      text,
      textAlign,
      textDecoration,
      font,
      fontSize,
      fontStyle,
      scale,
      canvasScale: initialPixelRatio,
    });

    activeLayer.addChild(canvasText);
  };
}
