import { useCallback, useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';

import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '@/shared/constants';

import { useActiveLayerContext, useCanvasContext, useToolbarContext } from '@/context';

import styles from './Toolbar.module.css';

export const Zoom = () => {
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

  const tools = useMemo(
    () => [
      {
        id: 'zoom-out',
        hoverText: 'Zoom out',
        disabled: false,
        Component: Minus,
        onClick: zoomOut,
      },
      {
        id: 'zoom-value',
        hoverText: `${zoomPercentage}%`,
        Component: () => <span>{zoomPercentage}%</span>,
        disabled: false,
      },
      {
        id: 'zoom-in',
        hoverText: 'Zoom in',
        disabled: false,
        Component: Plus,
        onClick: zoomIn,
      },
    ],
    [zoomPercentage, zoomOut, zoomIn],
  );

  return (
    <ul id="zoom" className={styles.zoomToolbar}>
      {tools.map(({ id, hoverText, Component, onClick }) => (
        <li key={id}>
          <span id={id} role="button" tabIndex={0} title={hoverText} className={styles.tool} onClick={onClick}>
            <span className={styles.iconZoom}>
              <Component />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};
