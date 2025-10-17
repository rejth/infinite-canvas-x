import { useContext } from 'react';

import { CanvasContext } from '@/app/store/CanvasContext/CanvasContext';
import { TextEditorContext } from '@/app/store/TextEditorContext/TextEditorContext';
import { ToolbarContext } from '@/app/store/ToolbarContext/ToolbarContext';
import { ActiveLayerContext } from '@/app/store/ActiveLayerContext/ActiveLayerContext';
import { ImageEditorContext } from '@/app/store/ImageEditorContext/ImageEditorContext';

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
