import { useContext } from 'react';

import { CanvasContext } from '@/context/CanvasContext/CanvasContext';
import { TextEditorContext } from '@/context/TextEditorContext/TextEditorContext';
import { ToolbarContext } from '@/context/ToolbarContext/ToolbarContext';
import { ActiveLayerContext } from '@/context/ActiveLayerContext/ActiveLayerContext';
import { ImageEditorContext } from '@/context/ImageEditorContext/ImageEditorContext';

export const useCanvasContext = () => {
  return useContext(CanvasContext);
};

export const useTextEditorContext = () => {
  return useContext(TextEditorContext);
};

export const useToolbarContext = () => {
  return useContext(ToolbarContext);
};

export const useActiveLayerContext = () => {
  return useContext(ActiveLayerContext);
};

export const useImageEditorContext = () => {
  return useContext(ImageEditorContext);
};
