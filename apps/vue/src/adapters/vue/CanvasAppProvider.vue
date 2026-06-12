<script setup lang="ts">
import {
  type CanvasApp,
  canvasSliceDefinitions,
  canvasSliceKeys,
  createCanvasSliceSubscriptionManager,
} from '@infinite-canvas-x/canvas-app'
import { onUnmounted, provide, shallowRef, watch } from 'vue'

import {
  CanvasAppKey,
  CanvasSliceManagerKey,
  type CanvasSliceRefMap,
  CanvasSliceRefsKey,
} from './keys'

const props = defineProps<{
  app: CanvasApp | null
}>()

const appRef = shallowRef<CanvasApp | null>(props.app)
const sliceManager = createCanvasSliceSubscriptionManager()

const sliceRefs = Object.fromEntries(
  canvasSliceKeys.map((key) => [key, shallowRef(canvasSliceDefinitions[key].defaults)]),
) as CanvasSliceRefMap

const sliceUnsubscribes: Array<() => void> = []

function clearSliceSubscriptions() {
  while (sliceUnsubscribes.length > 0) {
    sliceUnsubscribes.pop()?.()
  }
}

function bindSliceRefs() {
  clearSliceSubscriptions()

  for (const key of canvasSliceKeys) {
    sliceRefs[key].value = sliceManager.get(key)
    sliceUnsubscribes.push(
      sliceManager.subscribe(key, () => {
        sliceRefs[key].value = sliceManager.get(key)
      }),
    )
  }
}

function teardownSliceSubscriptions() {
  clearSliceSubscriptions()
  sliceManager.detach()
  for (const key of canvasSliceKeys) {
    sliceRefs[key].value = canvasSliceDefinitions[key].defaults
  }
}

watch(
  () => props.app,
  (next, prev) => {
    prev?.destroy()
    appRef.value = next
    teardownSliceSubscriptions()

    if (next) {
      next.attachKeyboardListeners()
      sliceManager.attach(next.state)
      bindSliceRefs()
    }
  },
  { immediate: true },
)

provide(CanvasAppKey, appRef)
provide(CanvasSliceManagerKey, sliceManager)
provide(CanvasSliceRefsKey, sliceRefs)

onUnmounted(() => {
  teardownSliceSubscriptions()
  props.app?.destroy()
})
</script>

<template>
  <slot />
</template>
