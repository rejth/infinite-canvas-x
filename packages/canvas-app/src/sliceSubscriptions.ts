import type { CanvasAppState } from './CanvasAppState'
import {
  type ActiveLayerSlice,
  activeLayerSlice,
  type ImageEditorSlice,
  imageEditorSlice,
  type LayerUiSlice,
  layerUiSlice,
  type TextEditorSlice,
  type ToolbarSlice,
  textEditorSlice,
  toolbarSlice,
} from './slices'

export const canvasSliceDefinitions = {
  textEditor: textEditorSlice,
  toolbar: toolbarSlice,
  activeLayer: activeLayerSlice,
  imageEditor: imageEditorSlice,
  layerUi: layerUiSlice,
} as const

export type CanvasSliceKey = keyof typeof canvasSliceDefinitions

export const canvasSliceKeys = Object.keys(canvasSliceDefinitions) as CanvasSliceKey[]

type SliceCacheMap = {
  textEditor: TextEditorSlice
  toolbar: ToolbarSlice
  activeLayer: ActiveLayerSlice
  imageEditor: ImageEditorSlice
  layerUi: LayerUiSlice
}

type SliceIsEqual<K extends CanvasSliceKey> = (
  prev: SliceCacheMap[K],
  next: SliceCacheMap[K],
) => boolean

export function createCanvasSliceSubscriptionManager() {
  const caches: SliceCacheMap = {
    textEditor: textEditorSlice.defaults,
    toolbar: toolbarSlice.defaults,
    activeLayer: activeLayerSlice.defaults,
    imageEditor: imageEditorSlice.defaults,
    layerUi: layerUiSlice.defaults,
  }

  const listeners = new Map<CanvasSliceKey, Set<() => void>>()
  const anyListeners = new Set<() => void>()

  for (const key of canvasSliceKeys) {
    listeners.set(key, new Set())
  }

  let unsubscribe: (() => void) | null = null

  const notifyAny = () => {
    for (const listener of anyListeners) {
      listener()
    }
  }

  const syncSlice = <K extends CanvasSliceKey>(key: K, state: CanvasAppState) => {
    const definition = canvasSliceDefinitions[key]
    const next = definition.select(state) as SliceCacheMap[K]
    const isEqual = definition.isEqual as SliceIsEqual<K>

    if (!isEqual(caches[key], next)) {
      caches[key] = next
      for (const listener of listeners.get(key)!) {
        listener()
      }
      notifyAny()
    }
  }

  const syncAll = (state: CanvasAppState) => {
    for (const key of canvasSliceKeys) {
      syncSlice(key, state)
    }
  }

  const resetCaches = () => {
    caches.textEditor = textEditorSlice.defaults
    caches.toolbar = toolbarSlice.defaults
    caches.activeLayer = activeLayerSlice.defaults
    caches.imageEditor = imageEditorSlice.defaults
    caches.layerUi = layerUiSlice.defaults

    for (const key of canvasSliceKeys) {
      for (const listener of listeners.get(key)!) {
        listener()
      }
    }
    notifyAny()
  }

  const detach = () => {
    unsubscribe?.()
    unsubscribe = null
    resetCaches()
  }

  const attach = (state: CanvasAppState) => {
    detach()
    syncAll(state)
    unsubscribe = state.subscribe(() => syncAll(state))
  }

  return {
    attach,
    detach,
    get<K extends CanvasSliceKey>(key: K): SliceCacheMap[K] {
      return caches[key]
    },
    getServerSnapshot<K extends CanvasSliceKey>(key: K): SliceCacheMap[K] {
      return canvasSliceDefinitions[key].defaults as SliceCacheMap[K]
    },
    subscribe<K extends CanvasSliceKey>(key: K, listener: () => void): () => void {
      const set = listeners.get(key)!
      set.add(listener)
      return () => set.delete(listener)
    },
    subscribeAny(listener: () => void): () => void {
      anyListeners.add(listener)
      return () => anyListeners.delete(listener)
    },
  }
}

export type CanvasSliceSubscriptionManager = ReturnType<typeof createCanvasSliceSubscriptionManager>
