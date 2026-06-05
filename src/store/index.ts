import { useContext } from 'react'

import { ActiveLayerContext } from '@/store/ActiveLayerContext/ActiveLayerContext'
import { CanvasContext } from '@/store/CanvasContext/CanvasContext'
import { ImageEditorContext } from '@/store/ImageEditorContext/ImageEditorContext'
import { TextEditorContext } from '@/store/TextEditorContext/TextEditorContext'
import { ToolbarContext } from '@/store/ToolbarContext/ToolbarContext'

export const useCanvasContext = () => {
  return useContext(CanvasContext)
}

export const useTextEditorContext = () => {
  return useContext(TextEditorContext)
}

export const useToolbarContext = () => {
  return useContext(ToolbarContext)
}

export const useActiveLayerContext = () => {
  return useContext(ActiveLayerContext)
}

export const useImageEditorContext = () => {
  return useContext(ImageEditorContext)
}
