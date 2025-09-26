import { useActiveLayerContext, useCanvasContext, useTextEditorContext } from '@/context';

import { Point } from '@/entities/Point';

import { useSaveText } from '@/features/useSaveText';

export const useSelectTool = () => {
  const { renderManager } = useCanvasContext();
  const { activeLayer, setActiveLayer, setLastActiveLayer } = useActiveLayerContext();
  const { resetTextEditor } = useTextEditorContext();

  const saveText = useSaveText();

  return function (_e: React.MouseEvent<HTMLCanvasElement>, point: Point) {
    if (!renderManager) return;

    // If there is no active layer selected, find any layer at the point, set it as active and redraw the canvas
    if (!activeLayer) {
      const layer = renderManager.findLayerByCoordinates(point);

      if (layer) {
        layer.setActive(true);
        setActiveLayer(layer);
        renderManager.reDrawOnNextFrame();
      }
    } else if (!activeLayer.isPointInside(point)) {
      // If the active layer is not at the point, find any other layer at the point, set it as active and redraw the canvas
      const layer = renderManager.findLayerByCoordinates(point);

      if (layer) {
        layer.setActive(true);
        activeLayer.setActive(false);
        setActiveLayer(layer);
      } else {
        // If no layer is found, that means the point is outside any layer, so we need to set the active layer to null
        activeLayer.setActive(false);
        setLastActiveLayer(activeLayer);
        setActiveLayer(null);
      }

      saveText();
      resetTextEditor();
      renderManager.reDrawOnNextFrame();
    } else {
      // If the active layer is at the point, find all layers that overlap at the same point. There might be multiple layers, like text over a shape with a selection
      const layers = renderManager.findMultipleLayersByCoordinates(point);

      // If there are more than 1, find the next layer that's above the current active layer and redraw the canvas
      if (layers.length > 1) {
        let layersLength = layers.length;
        let activeLayerIndex = 0;

        for (const layer of layers) {
          if (layer.getId() === activeLayer.getId()) {
            activeLayerIndex = layersLength;
          } else if (layersLength > activeLayerIndex || layersLength === activeLayerIndex) {
            layer.setActive(true);
            activeLayer.setActive(false);
            setActiveLayer(layer);
            renderManager.reDrawOnNextFrame();
            break;
          }

          layersLength -= 1;
        }
      }
    }
  };
};
