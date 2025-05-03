import React, { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_SCALE, SMALL_PADDING, DEFAULT_FONT_WEIGHT, DEFAULT_RECT_SIZE } from '@/shared/constants';
import { CustomEvents, DoubleClickCustomEvent, FontStyle, TextDecoration } from '@/shared/interfaces';

import { useCanvasContext } from '@/context';
import { useTextEditorContext } from '@/context';
import { useActiveLayerContext } from '@/context';

import { isCanvasRect, isCanvasText } from '@/entities/lib';
import { CanvasEntityType } from '@/entities/interfaces';
import { Point } from '@/entities/Point';

import { TextEditorMenu } from './TextEditorMenu/TextEditorMenu';
import styles from './TextEditor.module.css';

export const TextEditor = () => {
  const { renderer, camera } = useCanvasContext();
  const { activeLayer } = useActiveLayerContext();
  const { isLayerEditable, text, textAlign, fontSize, bold, italic, underline, ...actions } = useTextEditorContext();
  const { setText, setTextAlign, setFontSize, setBold, setItalic, setUnderline } = actions;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [editorPosition, setEditorPosition] = useState<Point>(() => new Point(0, 0));
  const [adaptiveFontSize, setAdaptiveFontSize] = useState(fontSize);

  const calculateFontSize = (currentFontSize: number): number => {
    const ref = textareaRef.current;
    if (!ref || !activeLayer) return currentFontSize;

    const { height, scale } = activeLayer.getOptions();
    const currentValue = ref.value;
    let nextFontSize = currentFontSize;

    if (ref.scrollHeight * scale > height - SMALL_PADDING) {
      nextFontSize = nextFontSize - 2;
    }

    if (currentValue.length < text.length && nextFontSize < adaptiveFontSize) {
      ref.style.fontSize = `${nextFontSize + 2}px`;

      if (ref.scrollHeight * scale <= height - SMALL_PADDING) {
        nextFontSize = nextFontSize + 2;
      } else {
        ref.style.fontSize = `${nextFontSize}px`;
      }
    }

    return nextFontSize;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeLayer) {
      setFontSize(calculateFontSize(fontSize));
      setText(e.target.value);
    }
  };

  const handleFontSizeChange = (fontSize: number) => {
    setAdaptiveFontSize(calculateFontSize(fontSize));
    setFontSize(fontSize);
  };

  const handleDoubleClick = useCallback(
    (e: CustomEvent<DoubleClickCustomEvent>) => {
      const currentActiveLayer = e.detail.layer || activeLayer;
      if (!currentActiveLayer || !camera) return;

      const clickPosition = camera.handleDoubleClick(e, currentActiveLayer);
      setEditorPosition(clickPosition);

      const textChild = currentActiveLayer.getChildByType(CanvasEntityType.TEXT);
      if (!textChild || !isCanvasText(textChild)) return;

      const textOptions = textChild.getOptions();
      textChild.setOptions({ width: textOptions.width, height: textOptions.height });
      setText(textOptions.text);
      setTextAlign(textOptions.textAlign);
      setFontSize(textOptions.fontSize);
      setBold(Boolean(/bold/.test(textOptions.fontStyle)));
      setItalic(Boolean(/italic/.test(textOptions.fontStyle)));
      setUnderline(Boolean(/underline/.test(textOptions.textDecoration)));
    },
    [activeLayer, camera, setBold, setFontSize, setItalic, setText, setTextAlign, setUnderline],
  );

  useEffect(() => {
    if (textareaRef.current && isLayerEditable) {
      textareaRef.current.focus();
    }
  }, [isLayerEditable]);

  useEffect(() => {
    window.addEventListener(CustomEvents.DOUBLE_CLICK, handleDoubleClick as unknown as EventListener);
    return () => window.removeEventListener(CustomEvents.DOUBLE_CLICK, handleDoubleClick as unknown as EventListener);
  }, [activeLayer, handleDoubleClick]);

  if (!activeLayer || !renderer) return null;

  const rect = activeLayer.getChildByType(CanvasEntityType.RECT);
  if (!rect || !isCanvasRect(rect)) return null;

  const { scale } = rect.getOptions();
  const transform = renderer.getTransformMatrix();
  const inverseScale = DEFAULT_SCALE / (transform.scaleX / transform.initialScale);
  const editorScale = scale / inverseScale;
  const isVisible = activeLayer && isLayerEditable;

  return (
    <>
      {isLayerEditable && (
        <TextEditorMenu textareaRef={textareaRef} position={editorPosition} onFontSizeChange={handleFontSizeChange} />
      )}
      <textarea
        id="text-editor"
        ref={textareaRef}
        value={text}
        className={styles.textEditor}
        placeholder="Enter text"
        onChange={handleTextChange}
        style={{
          visibility: isVisible ? 'visible' : 'hidden',
          left: editorPosition.x + SMALL_PADDING * editorScale,
          top: editorPosition.y + SMALL_PADDING * editorScale,
          width: DEFAULT_RECT_SIZE - SMALL_PADDING * 2,
          height: DEFAULT_RECT_SIZE - SMALL_PADDING * 2,
          transform: `scale(${editorScale})`,
          textAlign: textAlign,
          fontSize: `${fontSize}px`,
          fontStyle: italic ? FontStyle.ITALIC : undefined,
          fontWeight: bold ? FontStyle.BOLD : Number(DEFAULT_FONT_WEIGHT),
          textDecoration: underline ? TextDecoration.UNDERLINE : undefined,
        }}
      />
    </>
  );
};
