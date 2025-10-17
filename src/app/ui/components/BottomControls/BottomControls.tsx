import { useCallback } from 'react';
import { Undo2, Redo2, Minus, Plus } from 'lucide-react';

import { Button } from '@/app/ui/primitives/button';
import { useActiveLayerContext, useCanvasContext, useToolbarContext } from '@/app/store';

import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '@/core/constants';

export function BottomControls() {
  const { renderManager, camera } = useCanvasContext();
  const { activeLayer } = useActiveLayerContext();
  const { zoomPercentage, setZoomPercentage } = useToolbarContext();

  const zoomCanvas = useCallback(
    (step: number, edge: number) => {
      if (!renderManager || !camera) return;

      const { isZoomed, nextZoomPercentage } = camera.zoomCanvasWithStep(zoomPercentage, step, edge, activeLayer);

      if (isZoomed) {
        renderManager.reDrawOnNextFrame({ forceRender: true });
        setZoomPercentage(nextZoomPercentage);
      }
    },
    [renderManager, camera, activeLayer, zoomPercentage, setZoomPercentage],
  );

  const zoomIn = useCallback(() => {
    zoomCanvas(ZOOM_STEP, ZOOM_MAX);
  }, [zoomCanvas]);

  const zoomOut = useCallback(() => {
    zoomCanvas(-ZOOM_STEP, ZOOM_MIN);
  }, [zoomCanvas]);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full px-4 py-2 flex items-center gap-1 shadow-lg border border-gray-200">
        {/* Undo/Redo buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {}}
          className="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {}}
          className="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Zoom controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomOut}
          className="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="px-3 py-1 text-black text-sm font-medium min-w-[3rem] text-center">{zoomPercentage}%</div>

        <Button
          variant="ghost"
          size="sm"
          onClick={zoomIn}
          className="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
