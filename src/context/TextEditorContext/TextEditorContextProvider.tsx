import { useCallback, useState } from 'react';

import { DEFAULT_FONT_SIZE, DEFAULT_SCALE } from '@/shared/constants';
import { TextAlign } from '@/shared/interfaces';

import { TextEditorContext } from './TextEditorContext';

type Props = {
  children: React.ReactNode;
};

export const TextEditorProvider = ({ children }: Props) => {
  const [isLayerEditable, setIsLayerEditable] = useState(false);

  const [text, setText] = useState('');
  const [textScale, setTextScale] = useState(DEFAULT_SCALE);
  const [textAlign, setTextAlign] = useState<TextAlign>(TextAlign.LEFT);

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  const resetTextEditor = useCallback(() => {
    setText('');
    setTextAlign(TextAlign.LEFT);
    setFontSize(DEFAULT_FONT_SIZE);
    setBold(false);
    setItalic(false);
    setUnderline(false);
    setIsLayerEditable(false);
  }, []);

  const setTextEditor = useCallback((text: string) => {
    setText(text);
    setTextAlign(TextAlign.LEFT);
    setFontSize(DEFAULT_FONT_SIZE);
    setBold(false);
    setItalic(false);
    setUnderline(false);
    setIsLayerEditable(false);
  }, []);

  return (
    <TextEditorContext.Provider
      value={{
        isLayerEditable,
        text,
        textScale,
        textAlign,
        fontSize,
        bold,
        italic,
        underline,
        setIsLayerEditable,
        setText,
        setTextAlign,
        setTextScale,
        setFontSize,
        setBold,
        setItalic,
        setUnderline,
        resetTextEditor,
        setTextEditor,
      }}
    >
      {children}
    </TextEditorContext.Provider>
  );
};
