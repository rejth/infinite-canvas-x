import { useCreateText } from '@/app/hooks/useCreateText';
import { useTextEditorContext, useActiveLayerContext } from '@/app/store';

import { TextDecoration } from '@/core/interfaces';
import { CanvasEntityType } from '@/core/entities/interfaces';
import { isCanvasText } from '@/core/lib';

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
