import {
  activeLayerSliceConfig,
  imageEditorSliceConfig,
  layerUiSliceConfig,
  textEditorSliceConfig,
  toolbarSliceConfig,
} from '@infinite-canvas-x/canvas-app'

import { createCanvasSliceHook } from '@/adapters/solid/createCanvasSliceHook'
import { useCanvasApp } from '@/adapters/solid/useCanvasApp'

export function useCanvas() {
  const getApp = useCanvasApp()

  return () => {
    const app = getApp()

    if (!app) {
      return {
        renderer: null,
        renderManager: null,
        camera: null,
      }
    }

    return {
      renderer: app.getRenderer(),
      renderManager: app.getRenderManager(),
      camera: app.getCamera(),
    }
  }
}

export const useTextEditor = createCanvasSliceHook('textEditor', textEditorSliceConfig)
export const useToolbar = createCanvasSliceHook('toolbar', toolbarSliceConfig)
export const useActiveLayer = createCanvasSliceHook('activeLayer', activeLayerSliceConfig)
export const useImageEditor = createCanvasSliceHook('imageEditor', imageEditorSliceConfig)
export const useLayerUi = createCanvasSliceHook('layerUi', layerUiSliceConfig)
