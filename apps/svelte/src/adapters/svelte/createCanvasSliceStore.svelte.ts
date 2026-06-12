import type {
  CanvasAppState,
  CanvasSliceConfig,
  CanvasSliceKey,
  NoopActions,
  SliceActions,
  SliceDefinition,
} from '@infinite-canvas-x/canvas-app'

import { getCanvasAppContext } from './context'
import { mergeSlice } from './mergeSlice'

export function createCanvasSliceStore<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(
  sliceKey: TKey,
  definition: SliceDefinition<TSlice>,
  bindActions: (state: CanvasAppState) => TActions,
  noopActions: NoopActions<TActions>,
): () => () => TSlice & TActions

export function createCanvasSliceStore<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(sliceKey: TKey, config: CanvasSliceConfig<TSlice, TActions>): () => () => TSlice & TActions

export function createCanvasSliceStore<
  TKey extends CanvasSliceKey,
  TSlice extends Record<string, unknown>,
  TActions extends SliceActions,
>(
  sliceKey: TKey,
  definitionOrConfig: SliceDefinition<TSlice> | CanvasSliceConfig<TSlice, TActions>,
  bindActions?: (state: CanvasAppState) => TActions,
  noopActions?: NoopActions<TActions>,
): () => () => TSlice & TActions {
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

  return function useSlice() {
    const context = getCanvasAppContext()

    return () => {
      const app = context.getApp()

      if (!app) {
        return mergeSlice(definition.defaults, noop)
      }

      return mergeSlice(context.getSlices()[sliceKey] as unknown as TSlice, bind(app.state))
    }
  }
}
