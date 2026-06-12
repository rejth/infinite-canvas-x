import { getCanvasAppContext } from './context'

export function useCanvasApp() {
  const context = getCanvasAppContext()
  return () => context.getApp()
}
