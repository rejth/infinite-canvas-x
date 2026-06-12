import type {
  CanvasAppState,
  CanvasSliceConfig,
  CanvasSliceKey,
  NoopActions,
  SliceActions,
  SliceDefinition,
} from '@infinite-canvas-x/canvas-app'
import type { Accessor } from 'solid-js'
import { createMemo, useContext } from 'solid-js'

import { CanvasSlicesContext } from './CanvasSlicesContext'
import { useCanvasApp } from './useCanvasApp'

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
): () => Accessor<TSlice & TActions>

export function createCanvasSliceHook<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(sliceKey: TKey, config: CanvasSliceConfig<TSlice, TActions>): () => Accessor<TSlice & TActions>

export function createCanvasSliceHook<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(
  sliceKey: TKey,
  definitionOrConfig: SliceDefinition<TSlice> | CanvasSliceConfig<TSlice, TActions>,
  bindActions?: (state: CanvasAppState) => TActions,
  noopActions?: NoopActions<TActions>,
): () => Accessor<TSlice & TActions> {
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

  return function useSlice(): Accessor<TSlice & TActions> {
    const app = useCanvasApp()
    const sliceAccessors = useContext(CanvasSlicesContext)

    if (!sliceAccessors) {
      throw new Error('useSlice must be used within CanvasAppProvider')
    }

    const sliceAccessor = sliceAccessors[sliceKey] as Accessor<TSlice>

    return createMemo(() => {
      const currentApp = app()
      const slice = sliceAccessor()

      if (!currentApp) {
        return mergeSlice(definition.defaults, noop)
      }

      return mergeSlice(slice, bind(currentApp.state))
    })
  }
}
