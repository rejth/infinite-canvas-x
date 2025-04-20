import { CustomEvents } from '@/shared/interfaces';
import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect';

import { useCanvasContext } from '@/context';
import { useToolbarContext } from '@/context';

import { useKeyboard } from '@/features/useKeyboard';
import { useCanvasOnClick } from '@/features/useCanvasOnClick';
import { useCanvasOnMove } from '@/features/useCanvasOnMove';
import { useCanvasOnWheel } from '@/features/useCanvasOnWheel';
import { useCanvasOnDoubleClick } from '@/features/useCanvasOnDoubleClick';

type Props = {
  setCanvasRef: (canvas: HTMLCanvasElement) => void;
};

export const Canvas = ({ setCanvasRef }: Props) => {
  const { renderManager, camera } = useCanvasContext();
  const { cursor } = useToolbarContext();

  const handleClick = useCanvasOnClick();
  const handleWheel = useCanvasOnWheel();
  const handleMove = useCanvasOnMove();
  const handleDoubleClick = useCanvasOnDoubleClick();

  useKeyboard();

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    camera?.handleMouseDown(e.nativeEvent);
    handleClick(e);
  };

  const handleMouseUp = () => {
    camera?.handleMouseUp();
  };

  const handleZoomStopped = () => {
    renderManager?.reDraw({ forceRender: true });
  };

  const handleTouchMove = () => null;

  useDidMountEffect(() => {
    window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  });

  useDidMountEffect(() => {
    document.addEventListener(CustomEvents.ZOOMING_STOPPED, handleZoomStopped);
    return () => document.removeEventListener(CustomEvents.ZOOMING_STOPPED, handleZoomStopped);
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
