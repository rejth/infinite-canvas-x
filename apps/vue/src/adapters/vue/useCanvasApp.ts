import { inject } from 'vue'

import { CanvasAppKey } from './keys'

export function useCanvasApp() {
  const appRef = inject(CanvasAppKey)

  if (!appRef) {
    throw new Error('useCanvasApp must be used within CanvasAppProvider')
  }

  return appRef
}
