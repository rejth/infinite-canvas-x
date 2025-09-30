import { Tools } from '@/shared/interfaces';

import { CanvasEntityType } from '@/entities/interfaces';
import { isCanvasSpline } from '@/entities/lib';

import { useActiveLayerContext, useCanvasContext, useToolbarContext } from '@/context';

export const useCacheControlPoints = () => {
  const { camera } = useCanvasContext();
  const { tool } = useToolbarContext();
  const { activeLayer } = useActiveLayerContext();

  // Start control point caching for splines
  const cacheControlPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === Tools.SELECT && activeLayer && camera) {
      const spline = activeLayer.getChildByType(CanvasEntityType.SPLINE);
      if (spline && isCanvasSpline(spline)) {
        const { x, y } = camera.handleClick(e.nativeEvent);
        spline.startControlPointDrag(x, y);
      }
    }
  };

  // Stop control point caching for splines
  const stopCacheControlPoint = () => {
    if (activeLayer) {
      const spline = activeLayer.getChildByType(CanvasEntityType.SPLINE);
      if (spline && isCanvasSpline(spline)) {
        spline.stopControlPointDrag();
      }
    }
  };

  return { cacheControlPoint, stopCacheControlPoint };
};
