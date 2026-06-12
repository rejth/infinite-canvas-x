<script lang="ts">
import {
  type CanvasApp,
  canvasSliceKeys,
  createCanvasSliceSubscriptionManager,
} from '@infinite-canvas-x/canvas-app'
import type { Snippet } from 'svelte'
import { onDestroy } from 'svelte'

import { setCanvasAppContext } from './context'
import type { CanvasSliceKey, CanvasSliceRefMap } from './keys'
import { createDefaultSliceRefs } from './sliceRefs'

type Props = {
  app?: CanvasApp | null
  children?: Snippet
}

let { app = null, children }: Props = $props()

let appRef = $state<CanvasApp | null>(null)
let slices = $state(createDefaultSliceRefs())
const sliceManager = createCanvasSliceSubscriptionManager()
const sliceUnsubscribes: Array<() => void> = []

function setSliceValue<K extends CanvasSliceKey>(key: K, value: CanvasSliceRefMap[K]) {
  slices[key] = value
}

function clearSliceSubscriptions() {
  while (sliceUnsubscribes.length > 0) {
    sliceUnsubscribes.pop()?.()
  }
}

function bindSliceRefs() {
  clearSliceSubscriptions()

  for (const key of canvasSliceKeys) {
    setSliceValue(key, sliceManager.get(key) as CanvasSliceRefMap[typeof key])
    sliceUnsubscribes.push(
      sliceManager.subscribe(key, () => {
        setSliceValue(key, sliceManager.get(key) as CanvasSliceRefMap[typeof key])
      }),
    )
  }
}

function teardownSliceSubscriptions() {
  clearSliceSubscriptions()
  sliceManager.detach()
  slices = createDefaultSliceRefs()
}

setCanvasAppContext({
  getApp: () => appRef,
  getSlices: () => slices,
  sliceManager,
})

let previousApp: CanvasApp | null = null

$effect(() => {
  const next = app
  if (previousApp === next) {
    return
  }

  previousApp?.destroy()
  teardownSliceSubscriptions()
  appRef = next

  if (next) {
    next.attachKeyboardListeners()
    sliceManager.attach(next.state)
    bindSliceRefs()
  }

  previousApp = next
})

onDestroy(() => {
  teardownSliceSubscriptions()
  app?.destroy()
})
</script>

{@render children?.()}
