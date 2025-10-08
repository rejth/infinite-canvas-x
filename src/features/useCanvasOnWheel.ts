import { useState } from 'react';

import { CustomEvents } from '@/shared/interfaces';

import { useCanvasContext, useTextEditorContext, useToolbarContext } from '@/context';

export function useCanvasOnWheel() {
  const { renderManager, camera } = useCanvasContext();
  const { isLayerEditable } = useTextEditorContext();
  const { setZoomPercentage } = useToolbarContext();

  const [timerId, setTimerId] = useState(0);

  return (e: React.WheelEvent) => {
    if (isLayerEditable) return;

    camera.handleWheelChange(e.nativeEvent);
    clearTimeout(timerId);
    setTimerId(0);

    if (e.ctrlKey) {
      const { isZoomed, nextZoomPercentage } = camera.zoomCanvas(e.nativeEvent);

      if (isZoomed) {
        setZoomPercentage(nextZoomPercentage);
        renderManager.reDrawSync();
      }
    } else {
      const isMoved = camera.moveCanvas(e.nativeEvent);

      if (isMoved) {
        renderManager.reDrawOnNextFrame();
      }
    }

    setTimerId(
      setTimeout(() => {
        camera.handleDragStopped();
        document.dispatchEvent(new CustomEvent(CustomEvents.ZOOMING_STOPPED));
      }, 250) as unknown as number,
    );
  };
}
