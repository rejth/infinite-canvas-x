import { useCallback, useEffect } from 'react';

import { CustomEvents } from '@/shared/interfaces';
import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect';

import { useCanvasContext } from '@/context';
import { useToolbarContext } from '@/context';

import { useKeyboard } from '@/features/useKeyboard';
import { useCanvasOnClick } from '@/features/useCanvasOnClick';
import { useCanvasOnMove } from '@/features/useCanvasOnMove';
import { useCanvasOnWheel } from '@/features/useCanvasOnWheel';
import { useCanvasOnDoubleClick } from '@/features/useCanvasOnDoubleClick';
import { useCacheControlPoints } from '@/features/useCacheControlPoints';

// import { useRestoreCanvasState } from './useRestoreCanvasState';
// import { useAutosave } from './useAutosave';
// import { useSyncLayer } from './useSyncLayer';

import styles from './Canvas.module.css';

type Props = {
  setCanvasRef: (canvas: HTMLCanvasElement) => void;
  setBackgroundCanvasRef: (backgroundCanvas: HTMLCanvasElement) => void;
};

export const Canvas = ({ setCanvasRef, setBackgroundCanvasRef }: Props) => {
  const { renderManager, camera } = useCanvasContext();
  const { cursor } = useToolbarContext();

  const handleClick = useCanvasOnClick();
  const handleWheel = useCanvasOnWheel();
  const handleMove = useCanvasOnMove();
  const handleDoubleClick = useCanvasOnDoubleClick();
  const { cacheControlPoint, stopCacheControlPoint } = useCacheControlPoints();
  // const restoreCanvasState = useRestoreCanvasState();
  // const syncLayerChanges = useSyncLayer();

  useKeyboard();
  // useAutosave();

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    camera?.handleMouseDown(e.nativeEvent);
    cacheControlPoint(e);
    handleClick(e);
  };

  const handleMouseUp = async () => {
    camera?.handleMouseUp();
    stopCacheControlPoint();

    // await syncLayerChanges();
  };

  const handleZoomStopped = useCallback(() => {
    renderManager?.reDrawOnNextFrame({ forceRender: true });
  }, [renderManager]);

  const handleTouchMove = () => null;

  // useEffect(() => {
  //   restoreCanvasState();
  // }, [restoreCanvasState]);

  useEffect(() => {
    document.addEventListener(CustomEvents.ZOOMING_STOPPED, handleZoomStopped);
    return () => document.removeEventListener(CustomEvents.ZOOMING_STOPPED, handleZoomStopped);
  }, [handleZoomStopped]);

  useDidMountEffect(() => {
    window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  });

  return (
    <>
      <canvas
        id="main-canvas"
        style={{ cursor }}
        className={styles.mainCanvas}
        ref={setCanvasRef}
        onMouseMove={handleMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
      />
      <canvas id="background-canvas" className={styles.backgroundCanvas} ref={setBackgroundCanvasRef} />
    </>
  );
};
