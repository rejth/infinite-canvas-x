import type {
  CanvasAppState,
  CanvasSliceConfig,
  CanvasSliceKey,
  NoopActions,
  SliceActions,
  SliceDefinition,
} from '@infinite-canvas-x/canvas-app'
import { type ComputedRef, computed, inject } from 'vue'

import { CanvasSliceRefsKey } from './keys'
import { useCanvasApp } from './useCanvasApp'

function mergeSlice<TSlice extends Record<string, unknown>, TActions extends SliceActions>(
  defaults: TSlice,
  actions: NoopActions<TActions> | TActions,
): TSlice & TActions {
  return { ...defaults, ...actions } as TSlice & TActions
}

export function createCanvasSliceComposable<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(
  sliceKey: TKey,
  definition: SliceDefinition<TSlice>,
  bindActions: (state: CanvasAppState) => TActions,
  noopActions: NoopActions<TActions>,
): () => ComputedRef<TSlice & TActions>

export function createCanvasSliceComposable<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(sliceKey: TKey, config: CanvasSliceConfig<TSlice, TActions>): () => ComputedRef<TSlice & TActions>

export function createCanvasSliceComposable<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(
  sliceKey: TKey,
  definitionOrConfig: SliceDefinition<TSlice> | CanvasSliceConfig<TSlice, TActions>,
  bindActions?: (state: CanvasAppState) => TActions,
  noopActions?: NoopActions<TActions>,
): () => ComputedRef<TSlice & TActions> {
  const {
    definition,
    bindActions: bind,
    noopActions: noop,
  } = bindActions !== undefined
    ? {
        definition: definitionOrConfig as SliceDefinition<TSlice>,
        bindActions,
        noopActions: noopActions!,
      }
    : (definitionOrConfig as CanvasSliceConfig<TSlice, TActions>)

  return function useSlice(): ComputedRef<TSlice & TActions> {
    const appRef = useCanvasApp()
    const sliceRefs = inject(CanvasSliceRefsKey)

    if (!sliceRefs) {
      throw new Error('useSlice must be used within CanvasAppProvider')
    }

    const sliceRef = sliceRefs[sliceKey]

    return computed(() => {
      const app = appRef.value

      if (!app) {
        return mergeSlice(definition.defaults, noop)
      }

      return mergeSlice(sliceRef.value as unknown as TSlice, bind(app.state))
    })
  }
}
