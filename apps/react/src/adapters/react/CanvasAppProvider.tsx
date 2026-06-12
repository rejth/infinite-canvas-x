import { type ReactNode, useEffect, useMemo } from 'react'
import { type CanvasApp, createCanvasSliceSubscriptionManager } from '@infinite-canvas-x/canvas-app'

import { CanvasAppContext } from './CanvasAppContext'
import { CanvasSliceManagerContext } from './CanvasSliceManagerContext'

type Props = {
  app: CanvasApp | null
  children: ReactNode
}

export function CanvasAppProvider({ app, children }: Props) {
  const sliceManager = useMemo(() => createCanvasSliceSubscriptionManager(), [])

  useEffect(() => {
    if (!app) {
      sliceManager.detach()
      return
    }

    app.attachKeyboardListeners()
    sliceManager.attach(app.state)

    return () => {
      sliceManager.detach()
      app.destroy()
    }
  }, [app, sliceManager])

  return (
    <CanvasAppContext.Provider value={app}>
      <CanvasSliceManagerContext.Provider value={sliceManager}>
        {children}
      </CanvasSliceManagerContext.Provider>
    </CanvasAppContext.Provider>
  )
}
