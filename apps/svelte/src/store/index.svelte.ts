import {
  activeLayerSliceConfig,
  imageEditorSliceConfig,
  layerUiSliceConfig,
  textEditorSliceConfig,
  toolbarSliceConfig,
} from '@infinite-canvas-x/canvas-app'

import { createCanvasSliceStore } from '@/adapters/svelte/createCanvasSliceStore.svelte'
import { useCanvasApp } from '@/adapters/svelte/useCanvasApp.svelte'

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

export const useTextEditor = createCanvasSliceStore('textEditor', textEditorSliceConfig)
export const useToolbar = createCanvasSliceStore('toolbar', toolbarSliceConfig)
export const useActiveLayer = createCanvasSliceStore('activeLayer', activeLayerSliceConfig)
export const useImageEditor = createCanvasSliceStore('imageEditor', imageEditorSliceConfig)
export const useLayerUi = createCanvasSliceStore('layerUi', layerUiSliceConfig)
