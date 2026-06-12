import { createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'

import { DEFAULT_CURSOR } from '@/shared/constants'

import { useCanvasApp } from '@/adapters/solid/useCanvasApp'
import { useToolbar } from '@/store'

type CanvasViewProps = {
  setCanvasRef: (canvas: HTMLCanvasElement) => void
  setBackgroundCanvasRef: (backgroundCanvas: HTMLCanvasElement) => void
}

export function CanvasView(props: CanvasViewProps) {
  const getApp = useCanvasApp()
  const toolbar = useToolbar()

  const [canvasContainer, setCanvasContainer] = createSignal<HTMLDivElement | undefined>()
  const [mainCanvas, setMainCanvas] = createSignal<HTMLCanvasElement | null>(null)
  const [backgroundCanvas, setBackgroundCanvas] = createSignal<HTMLCanvasElement | null>(null)

  const cursor = createMemo(() => (getApp() ? toolbar().cursor : DEFAULT_CURSOR))

  createEffect(() => {
    const canvas = mainCanvas()
    if (canvas) {
      props.setCanvasRef(canvas)
    }
  })

  createEffect(() => {
    const canvas = backgroundCanvas()
    if (canvas) {
      props.setBackgroundCanvasRef(canvas)
    }
  })

  function handleZoomStopped() {
    getApp()?.getRenderManager()?.reDrawOnNextFrame({ forceRender: true })
  }

  createEffect(() => {
    const app = getApp()
    if (!app) {
      return
    }

    const unsubscribe = app.events.onZoomingStopped(handleZoomStopped)
    onCleanup(() => {
      unsubscribe()
    })
  })

  onMount(() => {
    const container = canvasContainer()
    if (!container) {
      return
    }

    const handleWheelPreventDefault = (event: WheelEvent) => event.preventDefault()
    container.addEventListener('wheel', handleWheelPreventDefault, { passive: false })

    onCleanup(() => {
      container.removeEventListener('wheel', handleWheelPreventDefault)
    })
  })

  return (
    <div ref={setCanvasContainer}>
      <canvas
        id="main-canvas"
        style={{ cursor: cursor() }}
        class="main-canvas"
        ref={setMainCanvas}
        onMouseMove={(event) => getApp()?.handlePointerMove(event)}
        onMouseDown={(event) => getApp()?.handlePointerDown(event)}
        onMouseUp={() => getApp()?.handlePointerUp()}
        onDblClick={(event) => getApp()?.handleDoubleClick(event)}
        onWheel={(event) => getApp()?.handleWheel(event)}
      />
      <canvas id="background-canvas" class="background-canvas" ref={setBackgroundCanvas} />
      <style>{`
        .main-canvas {
          position: absolute;
          background-color: transparent;
        }
        .background-canvas {
          position: absolute;
          z-index: -1;
          pointer-events: none;
          touch-action: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}
