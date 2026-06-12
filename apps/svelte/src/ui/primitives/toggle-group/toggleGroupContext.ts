import { getContext, setContext } from 'svelte'

import type { ToggleVariants } from './toggleVariants'

const TOGGLE_GROUP_CONTEXT = Symbol('toggleGroupContext')

export type ToggleGroupContext = {
  variant?: ToggleVariants['variant']
  size?: ToggleVariants['size']
}

export function setToggleGroupContext(context: ToggleGroupContext) {
  setContext(TOGGLE_GROUP_CONTEXT, context)
}

export function getToggleGroupContext(): ToggleGroupContext {
  return getContext<ToggleGroupContext>(TOGGLE_GROUP_CONTEXT) ?? {}
}
