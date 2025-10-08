import { createContext, Dispatch, SetStateAction } from 'react';

import { DEFAULT_FONT_SIZE, DEFAULT_SCALE } from '@/shared/constants';
import { TextAlign, type PixelRatio } from '@/shared/interfaces';

interface TextEditorContextInterface {
  isLayerEditable: boolean;
  text: string;
  textScale: PixelRatio;
  textAlign: TextAlign;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  setIsLayerEditable: Dispatch<SetStateAction<boolean>>;
  setText: Dispatch<SetStateAction<string>>;
  setTextScale: Dispatch<SetStateAction<PixelRatio>>;
  setTextAlign: Dispatch<SetStateAction<TextAlign>>;
  setFontSize: Dispatch<SetStateAction<number>>;
  setBold: Dispatch<SetStateAction<boolean>>;
  setItalic: Dispatch<SetStateAction<boolean>>;
  setUnderline: Dispatch<SetStateAction<boolean>>;
  resetTextEditor: () => void;
  setTextEditor: (text: string) => void;
}

export const TextEditorContext = createContext<TextEditorContextInterface>({
  isLayerEditable: false,
  text: '',
  textScale: DEFAULT_SCALE,
  textAlign: TextAlign.LEFT,
  fontSize: DEFAULT_FONT_SIZE,
  bold: false,
  italic: false,
  underline: false,
  setIsLayerEditable: () => false,
  setText: () => '',
  setTextScale: () => DEFAULT_SCALE,
  setTextAlign: () => TextAlign.LEFT,
  setFontSize: () => DEFAULT_FONT_SIZE,
  setBold: () => false,
  setItalic: () => false,
  setUnderline: () => false,
  resetTextEditor: () => null,
  setTextEditor: () => null,
});
