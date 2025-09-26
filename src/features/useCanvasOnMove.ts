import { Tools } from '@/shared/interfaces';
import { DEFAULT_CURSOR } from '@/shared/constants';

import { useActiveLayerContext, useCanvasContext, useTextEditorContext, useToolbarContext } from '@/context';

import { CanvasEntityType } from '@/entities/interfaces';
import { isCanvasSelection, isCanvasSpline } from '@/entities/lib';

export function useCanvasOnMove() {
  const { renderManager, camera } = useCanvasContext();
  const { activeLayer } = useActiveLayerContext();
  const { tool, setCursor, setTool, resizeDirection, setResizeDirection } = useToolbarContext();
  const { setIsLayerEditable } = useTextEditorContext();

  return function (e: React.MouseEvent<HTMLCanvasElement>) {
    if (!camera || !renderManager) return;

    if (activeLayer) {
      if (!camera.isDragging) {
        const { x, y } = camera.handleClick(e.nativeEvent);
        const selection = activeLayer.getChildByType(CanvasEntityType.SELECTION);

        if (selection && isCanvasSelection(selection)) {
          const corner = selection.isPointInCorner(x, y);
          const side = selection.isPointInStroke(x, y);

          if (corner) {
            if (['top-left', 'bottom-right'].includes(corner)) {
              setCursor('nwse-resize');
            } else if (['top-right', 'bottom-left'].includes(corner)) {
              setCursor('nesw-resize');
            }
            setResizeDirection(corner);
            setTool(Tools.RESIZER);
          } else if (side) {
            if (['top', 'bottom'].includes(side)) {
              setCursor('ns-resize');
            } else if (['left', 'right'].includes(side)) {
              setCursor('ew-resize');
            }
            setResizeDirection(side);
            setTool(Tools.RESIZER);
          } else {
            setCursor(DEFAULT_CURSOR);
            setTool(Tools.SELECT);
          }
        }
      } else if (tool === Tools.SELECT) {
        setIsLayerEditable(false);

        const spline = activeLayer.getChildByType(CanvasEntityType.SPLINE);

        if (spline && isCanvasSpline(spline)) {
          setCursor('crosshair');

          const { x, y } = camera.handleClick(e.nativeEvent);
          const wasDragged = spline.continueControlPointDrag({
            x: x + e.movementX,
            y: y + e.movementY,
          });

          if (wasDragged) {
            renderManager.setLayerSize(activeLayer, spline.mbr);
          }
        } else {
          renderManager.moveLayer(activeLayer, e.movementX, e.movementY);
        }
      } else if (tool === Tools.RESIZER) {
        setIsLayerEditable(false);
        renderManager.resizeLayer(activeLayer, e.movementX, e.movementY, resizeDirection);
      }
    }

    if (camera.isDragging && tool === Tools.HAND) {
      camera.handleMouseMove(e.nativeEvent);
      renderManager.reDrawOnNextFrame();
    }
  };
}
