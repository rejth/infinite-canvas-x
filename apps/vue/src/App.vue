<script setup lang="ts">
import { CanvasApp } from '@infinite-canvas-x/canvas-app'
import {
  Camera,
  createProxyCanvas,
  Renderer,
  RenderManager,
} from '@infinite-canvas-x/canvas-engine'
import { shallowRef, watch } from 'vue'

import BottomControls from '@/ui/components/BottomControls/BottomControls.vue'
import CanvasView from '@/ui/components/Canvas/CanvasView.vue'
import ElementsPanel from '@/ui/components/ElementsPanel/ElementsPanel.vue'
import PropertiesSidebar from '@/ui/components/PropertiesSidebar/PropertiesSidebar.vue'
import TextEditor from '@/ui/components/TextEditor/TextEditor.vue'
import Toolbar from '@/ui/components/Toolbar/Toolbar.vue'
import Icons from '@/ui/icons/Icons.vue'

import CanvasAppProvider from '@/adapters/vue/CanvasAppProvider.vue'

const app = shallowRef<CanvasApp | null>(null)
const canvasRef = shallowRef<HTMLCanvasElement | null>(null)
const backgroundCanvasRef = shallowRef<HTMLCanvasElement | null>(null)

function setCanvasRef(canvas: HTMLCanvasElement) {
  canvasRef.value = canvas
}

function setBackgroundCanvasRef(canvas: HTMLCanvasElement) {
  backgroundCanvasRef.value = canvas
}

async function initializeCanvas() {
  const canvas = canvasRef.value
  const backgroundCanvas = backgroundCanvasRef.value
  if (!canvas || !backgroundCanvas || app.value) return

  const context = createProxyCanvas(canvas, backgroundCanvas)
  const renderer = new Renderer(context)
  renderer.drawBackground()

  const camera = new Camera(renderer)
  const renderManager = await RenderManager.create(renderer)

  app.value = CanvasApp.create(renderer, renderManager, camera)
}

watch([canvasRef, backgroundCanvasRef], () => {
  initializeCanvas()
})
</script>

<template>
  <CanvasAppProvider :app="app">
    <Icons />
    <Toolbar />
    <ElementsPanel />
    <PropertiesSidebar />
    <BottomControls />
    <TextEditor />
    <CanvasView :set-canvas-ref="setCanvasRef" :set-background-canvas-ref="setBackgroundCanvasRef" />
  </CanvasAppProvider>
</template>
