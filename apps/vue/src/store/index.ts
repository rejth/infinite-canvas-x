import {
  activeLayerSliceConfig,
  imageEditorSliceConfig,
  layerUiSliceConfig,
  textEditorSliceConfig,
  toolbarSliceConfig,
} from '@infinite-canvas-x/canvas-app'
import { computed } from 'vue'

import { createCanvasSliceComposable } from '@/adapters/vue/createCanvasSliceComposable'
import { useCanvasApp } from '@/adapters/vue/useCanvasApp'

export function useCanvas() {
  const appRef = useCanvasApp()

  return computed(() => {
    const app = appRef.value

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
  })
}

export const useTextEditor = createCanvasSliceComposable('textEditor', textEditorSliceConfig)
export const useToolbar = createCanvasSliceComposable('toolbar', toolbarSliceConfig)
export const useActiveLayer = createCanvasSliceComposable('activeLayer', activeLayerSliceConfig)
export const useImageEditor = createCanvasSliceComposable('imageEditor', imageEditorSliceConfig)
export const useLayerUi = createCanvasSliceComposable('layerUi', layerUiSliceConfig)
