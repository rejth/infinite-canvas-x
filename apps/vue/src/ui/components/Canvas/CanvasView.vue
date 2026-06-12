<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useCssModule, watch } from 'vue'

import { DEFAULT_CURSOR } from '@/shared/constants'

const styles = useCssModule()

import { useCanvasApp } from '@/adapters/vue/useCanvasApp'
import { useToolbar } from '@/store'

const props = defineProps<{
  setCanvasRef: (canvas: HTMLCanvasElement) => void
  setBackgroundCanvasRef: (backgroundCanvas: HTMLCanvasElement) => void
}>()

const canvasContainerRef = ref<HTMLDivElement | null>(null)
const appRef = useCanvasApp()
const toolbar = useToolbar()

const cursor = computed(() => toolbar.value.cursor)

function handleZoomStopped() {
  appRef.value?.getRenderManager()?.reDrawOnNextFrame({ forceRender: true })
}

let zoomUnsubscribe: (() => void) | null = null

watch(
  appRef,
  (app) => {
    zoomUnsubscribe?.()
    zoomUnsubscribe = null
    if (!app) return
    zoomUnsubscribe = app.events.onZoomingStopped(handleZoomStopped)
  },
  { immediate: true },
)

onUnmounted(() => zoomUnsubscribe?.())

onMounted(() => {
  const container = canvasContainerRef.value
  if (!container) return

  const handleWheelPreventDefault = (e: WheelEvent) => e.preventDefault()
  container.addEventListener('wheel', handleWheelPreventDefault, { passive: false })

  onUnmounted(() => {
    container.removeEventListener('wheel', handleWheelPreventDefault)
  })
})
</script>

<template>
  <div ref="canvasContainerRef">
    <canvas
      id="main-canvas"
      :style="{ cursor: appRef ? cursor : DEFAULT_CURSOR }"
      :class="styles.mainCanvas"
      :ref="(el) => props.setCanvasRef(el as HTMLCanvasElement)"
      @mousemove="(e) => appRef?.handlePointerMove(e)"
      @mousedown="(e) => appRef?.handlePointerDown(e)"
      @mouseup="() => appRef?.handlePointerUp()"
      @dblclick="(e) => appRef?.handleDoubleClick(e)"
      @wheel="(e) => appRef?.handleWheel(e)"
    />
    <canvas
      id="background-canvas"
      :class="styles.backgroundCanvas"
      :ref="(el) => props.setBackgroundCanvasRef(el as HTMLCanvasElement)"
    />
  </div>
</template>

<style module>
.mainCanvas {
  position: absolute;
  background-color: transparent;
}

.backgroundCanvas {
  position: absolute;
  z-index: -1;
  pointer-events: none;
  touch-action: none;
  user-select: none;
}
</style>
