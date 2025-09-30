import { Tools } from '@/shared/interfaces';

import { useCanvasContext, useImageEditorContext } from '@/context';
import { useToolbarContext } from '@/context';

import { useCreateSticker } from '@/features/useCreateSticker';
import { useCreateCurvedText } from '@/features/useCreateCurvedText';
import { useSelectTool } from '@/features/useSelectTool';
import { useCreateImage } from '@/features/useCreateImage';
// import { useCreateTextArea } from '@/features/useCreateTextArea';

export const useCanvasOnClick = () => {
  const { camera } = useCanvasContext();
  const { tool } = useToolbarContext();
  const { image } = useImageEditorContext();

  const createSticker = useCreateSticker();
  const createCurvedText = useCreateCurvedText();
  const createImage = useCreateImage();
  const selectTool = useSelectTool();
  // const createTextArea = useCreateTextArea();

  return (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!camera) return;

    const currentTransformedPosition = camera.handleClick(e.nativeEvent);

    if (tool === Tools.STICKER) {
      createSticker(e, currentTransformedPosition);
    } else if (tool === Tools.TEXT) {
      createCurvedText(e, currentTransformedPosition);
    } else if (tool === Tools.IMAGE && image instanceof ImageBitmap) {
      createImage(e, currentTransformedPosition, image);
    } else if (tool === Tools.SELECT) {
      selectTool(e, currentTransformedPosition);
    }
  };
};
