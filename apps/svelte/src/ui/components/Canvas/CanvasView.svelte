<script lang="ts">
import { onDestroy, onMount } from 'svelte'

import { DEFAULT_CURSOR } from '@/shared/constants'

import { useCanvasApp } from '@/adapters/svelte/useCanvasApp.svelte'
import { useToolbar } from '@/store/index.svelte'

type Props = {
  setCanvasRef: (canvas: HTMLCanvasElement) => void
  setBackgroundCanvasRef: (backgroundCanvas: HTMLCanvasElement) => void
}

let { setCanvasRef, setBackgroundCanvasRef }: Props = $props()

const getApp = useCanvasApp()
const getToolbar = useToolbar()

let canvasContainer: HTMLDivElement | undefined = $state()
let mainCanvas = $state<HTMLCanvasElement | null>(null)
let backgroundCanvas = $state<HTMLCanvasElement | null>(null)
let zoomUnsubscribe: (() => void) | null = null

const cursor = $derived(getApp() ? getToolbar().cursor : DEFAULT_CURSOR)

$effect(() => {
  if (mainCanvas) {
    setCanvasRef(mainCanvas)
  }
})

$effect(() => {
  if (backgroundCanvas) {
    setBackgroundCanvasRef(backgroundCanvas)
  }
})

function handleZoomStopped() {
  getApp()?.getRenderManager()?.reDrawOnNextFrame({ forceRender: true })
}

$effect(() => {
  zoomUnsubscribe?.()
  zoomUnsubscribe = null

  const app = getApp()
  if (!app) {
    return
  }

  zoomUnsubscribe = app.events.onZoomingStopped(handleZoomStopped)
})

onDestroy(() => {
  zoomUnsubscribe?.()
})

onMount(() => {
  const container = canvasContainer
  if (!container) {
    return
  }

  const handleWheelPreventDefault = (event: WheelEvent) => event.preventDefault()
  container.addEventListener('wheel', handleWheelPreventDefault, { passive: false })

  return () => {
    container.removeEventListener('wheel', handleWheelPreventDefault)
  }
})
</script>

<div bind:this={canvasContainer}>
  <canvas
    id="main-canvas"
    style:cursor={cursor}
    class="main-canvas"
    bind:this={mainCanvas}
    onmousemove={(event) => getApp()?.handlePointerMove(event)}
    onmousedown={(event) => getApp()?.handlePointerDown(event)}
    onmouseup={() => getApp()?.handlePointerUp()}
    ondblclick={(event) => getApp()?.handleDoubleClick(event)}
    onwheel={(event) => getApp()?.handleWheel(event)}
  ></canvas>
  <canvas
    id="background-canvas"
    class="background-canvas"
    bind:this={backgroundCanvas}
  ></canvas>
</div>

<style>
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
</style>
