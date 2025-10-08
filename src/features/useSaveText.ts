import { TextDecoration } from '@/shared/interfaces';

import { CanvasEntityType } from '@/entities/interfaces';
import { isCanvasText } from '@/entities/lib';

import { useTextEditorContext } from '@/context';
import { useActiveLayerContext } from '@/context';

import { useCreateText } from '@/features/useCreateText';

export const useSaveText = () => {
  const { isLayerEditable, text, textAlign, fontSize, bold, italic, underline } = useTextEditorContext();
  const { activeLayer } = useActiveLayerContext();

  const createText = useCreateText();

  return () => {
    if (!activeLayer || !isLayerEditable) return;

    const textChild = activeLayer.getChildByType(CanvasEntityType.TEXT);
    const options = textChild?.getOptions();

    // If there is a text string but no text on the active layer, create a new text object and add it to the active layer
    if (!textChild && text) {
      createText();
    } else if (textChild && isCanvasText(textChild) && (text || text !== options?.text)) {
      // If there is a text on the active layer and the new text is different from the text on the active layer, update it
      const textDecoration = underline ? TextDecoration.UNDERLINE : TextDecoration.NONE;

      let fontStyle = '';
      if (italic) fontStyle = `${fontStyle} italic`;
      if (bold) fontStyle = `${fontStyle} bold`;

      textChild.setText(text, fontSize, fontStyle, textAlign, textDecoration);
    }
  };
};
