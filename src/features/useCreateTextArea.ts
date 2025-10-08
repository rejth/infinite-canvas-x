import {
  COLORS,
  DEFAULT_SCALE,
  DEFAULT_TEXT_AREA_HEIGHT,
  DEFAULT_TEXT_AREA_WIDTH,
  SMALL_PADDING,
} from '@/shared/constants';
import { Tools } from '@/shared/interfaces';

import { CanvasRect, RectSubtype } from '@/entities/CanvasRect';
import { Layer } from '@/entities/Layer';
import { Point } from '@/entities/Point';

import { useCanvasContext, useActiveLayerContext, useToolbarContext, useTextEditorContext } from '@/context';

import { useCanvasOnDoubleClick } from '@/features/useCanvasOnDoubleClick';

export const useCreateTextArea = () => {
  const { renderManager } = useCanvasContext();
  const { setActiveLayer } = useActiveLayerContext();
  const { setTool } = useToolbarContext();
  const { setFontSize } = useTextEditorContext();

  const showTextEditor = useCanvasOnDoubleClick();

  return function (e: React.MouseEvent<HTMLCanvasElement>, { x, y }: Point) {
    if (!renderManager) return;

    const textArea = new CanvasRect(
      {
        x,
        y,
        width: DEFAULT_TEXT_AREA_WIDTH,
        height: DEFAULT_TEXT_AREA_HEIGHT,
        color: COLORS.TRANSPARENT,
        scale: DEFAULT_SCALE,
      },
      RectSubtype.TEXT,
    );

    const layer = new Layer({
      x: x - SMALL_PADDING,
      y: y - SMALL_PADDING,
      width: DEFAULT_TEXT_AREA_WIDTH + SMALL_PADDING * 2,
      height: DEFAULT_TEXT_AREA_HEIGHT + SMALL_PADDING * 2,
      scale: DEFAULT_SCALE,
    });

    layer.addChild(textArea);
    layer.setActive(true);
    renderManager.addLayer(layer);

    setActiveLayer(layer);
    showTextEditor(e, layer);
    setTool(Tools.SELECT);
    setFontSize(62);
  };
};
