import { useCallback, useEffect } from 'react';

import { CustomEvents, Tools } from '@/shared/interfaces';
import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect';
import { CANVAS_STATE_ID, DEFAULT_ZOOM_PERCENTAGE } from '@/shared/constants';

import { useCanvasContext } from '@/context';
import { useToolbarContext } from '@/context';

import { LayerSerializer } from '@/services/LayerSerializer';
import { CanvasStateDB } from '@/services/Storage/interfaces';

import { useKeyboard } from '@/features/useKeyboard';
import { useCanvasOnClick } from '@/features/useCanvasOnClick';
import { useCanvasOnMove } from '@/features/useCanvasOnMove';
import { useCanvasOnWheel } from '@/features/useCanvasOnWheel';
import { useCanvasOnDoubleClick } from '@/features/useCanvasOnDoubleClick';
// import { useAutosave } from '@/features/useAutosave';

type Props = {
  setCanvasRef: (canvas: HTMLCanvasElement) => void;
};

export const Canvas = ({ setCanvasRef }: Props) => {
  const { renderManager, camera } = useCanvasContext();
  const { cursor, setTool, setZoomPercentage } = useToolbarContext();

  const handleClick = useCanvasOnClick();
  const handleWheel = useCanvasOnWheel();
  const handleMove = useCanvasOnMove();
  const handleDoubleClick = useCanvasOnDoubleClick();

  useKeyboard();
  // useAutosave();

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    camera?.handleMouseDown(e.nativeEvent);
    handleClick(e);
  };

  const handleMouseUp = () => {
    camera?.handleMouseUp();
  };

  const handleZoomStopped = useCallback(() => {
    renderManager?.reDraw({ forceRender: true });
  }, [renderManager]);

  const handleTouchMove = () => null;

  useEffect(() => {
    if (!renderManager) return;

    const storage = renderManager.getPouchDBStorage();
    const localDB = storage?.getLocalDB();

    if (!localDB) return;

    localDB
      .get(CANVAS_STATE_ID)
      .then((doc) => {
        const { layers, transformMatrix, tool, zoomPercentage } = doc as CanvasStateDB;

        renderManager.bulkAdd(layers.map((layer) => LayerSerializer.deserialize(layer)!));
        renderManager.setTransformMatrix(transformMatrix);
        renderManager.reDrawSync();

        setTool(tool as Tools);
        setZoomPercentage(zoomPercentage);
      })
      .catch(() => {
        localDB.put({
          _id: CANVAS_STATE_ID,
          layers: [],
          tool: Tools.SELECT,
          zoomPercentage: DEFAULT_ZOOM_PERCENTAGE,
          transformMatrix: renderManager.getTransformMatrix(),
        });
      });
  }, [renderManager, setTool, setZoomPercentage]);

  useEffect(() => {
    document.addEventListener(CustomEvents.ZOOMING_STOPPED, handleZoomStopped);
    return () => document.removeEventListener(CustomEvents.ZOOMING_STOPPED, handleZoomStopped);
  }, [handleZoomStopped]);

  useDidMountEffect(() => {
    window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  });

  return (
    <canvas
      id="canvas"
      style={{ cursor }}
      ref={setCanvasRef}
      onMouseMove={handleMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
    />
  );
};
