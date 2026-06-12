import { getContext, setContext } from 'svelte'

import { CANVAS_APP_CONTEXT_KEY, type CanvasAppContextValue } from './keys'

export function setCanvasAppContext(value: CanvasAppContextValue): void {
  setContext(CANVAS_APP_CONTEXT_KEY, value)
}

export function getCanvasAppContext(): CanvasAppContextValue {
  const context = getContext<CanvasAppContextValue | undefined>(CANVAS_APP_CONTEXT_KEY)

  if (!context) {
    throw new Error('Canvas app context is missing. Wrap the tree in CanvasAppProvider.')
  }

  return context
}
