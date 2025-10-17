import { Tools } from '@/app/shared/interfaces';

import { useCreateSticker } from '@/app/hooks/useCreateSticker';
import { useSelectTool } from '@/app/hooks/useSelectTool';
import { useCreateImage } from '@/app/hooks/useCreateImage';
import { useCreateTextArea } from '@/app/hooks/useCreateTextArea';

import { useCanvasContext, useImageEditorContext, useToolbarContext } from '@/app/store';

export const useCanvasOnClick = () => {
  const { camera } = useCanvasContext();
  const { tool } = useToolbarContext();
  const { image } = useImageEditorContext();

  const createSticker = useCreateSticker();
  const createImage = useCreateImage();
  const selectTool = useSelectTool();
  const createTextArea = useCreateTextArea();

  return (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!camera) return;

    const currentTransformedPosition = camera.handleClick(e.nativeEvent);

    if (tool === Tools.STICKER) {
      createSticker(e, currentTransformedPosition);
    } else if (tool === Tools.TEXT) {
      createTextArea(e, currentTransformedPosition);
    } else if (tool === Tools.IMAGE && image instanceof ImageBitmap) {
      createImage(e, currentTransformedPosition, image);
    } else if (tool === Tools.SELECT) {
      selectTool(e, currentTransformedPosition);
    }
  };
};
