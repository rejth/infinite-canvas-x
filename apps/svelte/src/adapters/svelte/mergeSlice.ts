import type { NoopActions, SliceActions } from '@infinite-canvas-x/canvas-app'

export function mergeSlice<TSlice extends Record<string, unknown>, TActions extends SliceActions>(
  defaults: TSlice,
  actions: NoopActions<TActions> | TActions,
): TSlice & TActions {
  return { ...defaults, ...actions } as TSlice & TActions
}
