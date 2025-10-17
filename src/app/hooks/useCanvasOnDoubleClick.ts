import { CustomEvents } from '@/app/shared/interfaces';
import { useActiveLayerContext, useCanvasContext, useTextEditorContext } from '@/app/store';

import { CanvasEntityType } from '@/core/entities/interfaces';
import { Layer } from '@/core/entities/Layer';

export const useCanvasOnDoubleClick = () => {
  const { camera, renderManager } = useCanvasContext();
  const { activeLayer } = useActiveLayerContext();
  const { setIsLayerEditable } = useTextEditorContext();

  return (e: React.MouseEvent<HTMLCanvasElement>, layer?: Layer) => {
    e.preventDefault();

    const currentActiveLayer = layer || activeLayer;
    if (!currentActiveLayer || !renderManager || !camera) return;

    const { x, y } = camera.handleClick(e.nativeEvent);

    window.dispatchEvent(
      new CustomEvent(CustomEvents.DOUBLE_CLICK, {
        detail: {
          pageX: e.pageX,
          pageY: e.pageY,
          transformedPageX: x,
          transformedPageY: y,
          layer: currentActiveLayer,
        },
      }),
    );

    setIsLayerEditable(true);
    renderManager.reDrawSync({ exceptLayer: currentActiveLayer });
    renderManager.drawLayer(currentActiveLayer, { exceptType: CanvasEntityType.TEXT });
  };
};
