import { useSyncExternalStore } from 'react'
import type {
  CanvasAppState,
  CanvasSliceConfig,
  CanvasSliceKey,
  NoopActions,
  SliceActions,
  SliceDefinition,
} from '@infinite-canvas-x/canvas-app'

import { useCanvasApp } from './useCanvasApp'
import { useCanvasSliceManager } from './useCanvasSliceManager'

function mergeSlice<TSlice extends Record<string, unknown>, TActions extends SliceActions>(
  defaults: TSlice,
  actions: NoopActions<TActions> | TActions,
): TSlice & TActions {
  return { ...defaults, ...actions } as TSlice & TActions
}

export function createCanvasSliceHook<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(
  sliceKey: TKey,
  definition: SliceDefinition<TSlice>,
  bindActions: (state: CanvasAppState) => TActions,
  noopActions: NoopActions<TActions>,
): () => TSlice & TActions

export function createCanvasSliceHook<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(sliceKey: TKey, config: CanvasSliceConfig<TSlice, TActions>): () => TSlice & TActions

export function createCanvasSliceHook<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(
  sliceKey: TKey,
  definitionOrConfig: SliceDefinition<TSlice> | CanvasSliceConfig<TSlice, TActions>,
  bindActions?: (state: CanvasAppState) => TActions,
  noopActions?: NoopActions<TActions>,
): () => TSlice & TActions {
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

  return function useSlice(): TSlice & TActions {
    const app = useCanvasApp()
    const manager = useCanvasSliceManager()

    const slice = useSyncExternalStore(
      (onStoreChange) => manager.subscribe(sliceKey, onStoreChange),
      () => manager.get(sliceKey) as unknown as TSlice,
      () => manager.getServerSnapshot(sliceKey) as unknown as TSlice,
    )

    if (!app) {
      return mergeSlice(definition.defaults, noop)
    }

    return mergeSlice(slice, bind(app.state))
  }
}
