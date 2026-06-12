<script lang="ts">
import { CanvasApp } from '@infinite-canvas-x/canvas-app'
import {
  Camera,
  createProxyCanvas,
  Renderer,
  RenderManager,
} from '@infinite-canvas-x/canvas-engine'

import BottomControls from '@/ui/components/BottomControls/BottomControls.svelte'
import CanvasView from '@/ui/components/Canvas/CanvasView.svelte'
import ElementsPanel from '@/ui/components/ElementsPanel/ElementsPanel.svelte'
import PropertiesSidebar from '@/ui/components/PropertiesSidebar/PropertiesSidebar.svelte'
import TextEditor from '@/ui/components/TextEditor/TextEditor.svelte'
import Toolbar from '@/ui/components/Toolbar/Toolbar.svelte'
import Icons from '@/ui/icons/Icons.svelte'

import CanvasAppProvider from '@/adapters/svelte/CanvasAppProvider.svelte'

let app = $state<CanvasApp | null>(null)
let canvasElement = $state<HTMLCanvasElement | null>(null)
let backgroundCanvasElement = $state<HTMLCanvasElement | null>(null)

function setCanvasRef(canvas: HTMLCanvasElement) {
  canvasElement = canvas
}

function setBackgroundCanvasRef(canvas: HTMLCanvasElement) {
  backgroundCanvasElement = canvas
}

async function initializeCanvas() {
  const canvas = canvasElement
  const backgroundCanvas = backgroundCanvasElement
  if (!canvas || !backgroundCanvas || app) {
    return
  }

  const context = createProxyCanvas(canvas, backgroundCanvas)
  const renderer = new Renderer(context)
  renderer.drawBackground()

  const camera = new Camera(renderer)
  const renderManager = await RenderManager.create(renderer)

  app = CanvasApp.create(renderer, renderManager, camera)
}

$effect(() => {
  if (canvasElement && backgroundCanvasElement) {
    void initializeCanvas()
  }
})
</script>

<CanvasAppProvider {app}>
  <Icons />
  <Toolbar />
  <ElementsPanel />
  <PropertiesSidebar />
  <BottomControls />
  <TextEditor />
  <CanvasView {setCanvasRef} {setBackgroundCanvasRef} />
</CanvasAppProvider>
