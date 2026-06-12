import {
  type CanvasApp,
  canvasSliceKeys,
  createCanvasSliceSubscriptionManager,
} from '@infinite-canvas-x/canvas-app'
import { createEffect, createMemo, createSignal, type JSX, onCleanup } from 'solid-js'

import { CanvasAppContext } from './CanvasAppContext'
import { CanvasSliceManagerContext } from './CanvasSliceManagerContext'
import { CanvasSlicesContext, createCanvasSliceAccessors } from './CanvasSlicesContext'

type Props = {
  app: CanvasApp | null
  children: JSX.Element
}

export function CanvasAppProvider(props: Props) {
  const sliceManager = createCanvasSliceSubscriptionManager()
  const { accessors: sliceAccessors, setSlice } = createCanvasSliceAccessors()
  const [app, setApp] = createSignal<CanvasApp | null>(props.app)

  const sliceUnsubscribes: Array<() => void> = []

  function clearSliceSubscriptions() {
    while (sliceUnsubscribes.length > 0) {
      sliceUnsubscribes.pop()?.()
    }
  }

  function bindSliceRefs() {
    clearSliceSubscriptions()

    for (const key of canvasSliceKeys) {
      setSlice(key, sliceManager.get(key))
      sliceUnsubscribes.push(
        sliceManager.subscribe(key, () => {
          setSlice(key, sliceManager.get(key))
        }),
      )
    }
  }

  function teardownSliceSubscriptions() {
    clearSliceSubscriptions()
    sliceManager.detach()
  }

  createEffect(() => {
    const nextApp = props.app
    setApp(nextApp)
    teardownSliceSubscriptions()

    if (!nextApp) {
      return
    }

    nextApp.attachKeyboardListeners()
    sliceManager.attach(nextApp.state)
    bindSliceRefs()

    onCleanup(() => {
      teardownSliceSubscriptions()
      nextApp.destroy()
    })
  })

  const appAccessor = createMemo(() => app())

  return (
    <CanvasAppContext.Provider value={appAccessor}>
      <CanvasSliceManagerContext.Provider value={sliceManager}>
        <CanvasSlicesContext.Provider value={sliceAccessors}>
          {props.children}
        </CanvasSlicesContext.Provider>
      </CanvasSliceManagerContext.Provider>
    </CanvasAppContext.Provider>
  )
}
