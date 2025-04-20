import { DEFAULT_RECT_SIZE } from '@/shared/constants';
import { TextDecoration } from '@/shared/interfaces';

import { useTextEditorContext } from '@/context';
import { useActiveLayerContext } from '@/context';
import { useCanvasContext } from '@/context';

import { CanvasEntityType } from '@/entities/interfaces';
import { CanvasText } from '@/entities/CanvasText';

export function useCreateText() {
  const { renderer } = useCanvasContext();
  const { activeLayer } = useActiveLayerContext();
  const { text, textAlign, fontSize, bold, italic, underline } = useTextEditorContext();

  return function () {
    if (!activeLayer || !renderer) return;

    const sticker = activeLayer.getChildByType(CanvasEntityType.RECT);
    if (!sticker) return;

    const [x, y] = sticker.getXY();
    const scale = sticker.getScale();
    const { initialPixelRatio } = renderer.getCanvasOptions();
    const textDecoration = underline ? TextDecoration.UNDERLINE : TextDecoration.NONE;
    let fontStyle = '';

    if (italic) fontStyle = `${fontStyle} italic`;
    if (bold) fontStyle = `${fontStyle} bold`;

    const canvasText = new CanvasText({
      x,
      y,
      width: DEFAULT_RECT_SIZE,
      height: DEFAULT_RECT_SIZE,
      text,
      textAlign,
      textDecoration,
      fontSize,
      fontStyle,
      scale,
      canvasScale: initialPixelRatio,
    });

    activeLayer.addChild(canvasText);
  };
}
