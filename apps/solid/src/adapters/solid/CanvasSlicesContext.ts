import {
  type CanvasSliceKey,
  canvasSliceDefinitions,
  canvasSliceKeys,
} from '@infinite-canvas-x/canvas-app'
import type { Accessor } from 'solid-js'
import { createContext, createSignal } from 'solid-js'

type SliceValueMap = {
  [K in CanvasSliceKey]: ReturnType<(typeof canvasSliceDefinitions)[K]['select']>
}

export type CanvasSliceAccessors = {
  [K in CanvasSliceKey]: Accessor<SliceValueMap[K]>
}

export function createCanvasSliceAccessors(): {
  accessors: CanvasSliceAccessors
  setSlice: <K extends CanvasSliceKey>(key: K, value: SliceValueMap[K]) => void
} {
  const setters: {
    [K in CanvasSliceKey]: (value: SliceValueMap[K]) => void
  } = {} as {
    [K in CanvasSliceKey]: (value: SliceValueMap[K]) => void
  }
  const accessors = {} as CanvasSliceAccessors

  for (const key of canvasSliceKeys) {
    const [accessor, setter] = createSignal(canvasSliceDefinitions[key].defaults)
    setters[key] = setter as (value: SliceValueMap[typeof key]) => void
    ;(accessors as Record<CanvasSliceKey, Accessor<SliceValueMap[CanvasSliceKey]>>)[key] = accessor
  }

  return {
    accessors,
    setSlice: (key, value) => setters[key](value),
  }
}

export const CanvasSlicesContext = createContext<CanvasSliceAccessors>()
