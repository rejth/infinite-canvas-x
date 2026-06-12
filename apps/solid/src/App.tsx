import { CanvasApp } from '@infinite-canvas-x/canvas-app'
import {
  Camera,
  createProxyCanvas,
  Renderer,
  RenderManager,
} from '@infinite-canvas-x/canvas-engine'
import { createEffect, createSignal } from 'solid-js'

import { BottomControls } from '@/ui/components/BottomControls/BottomControls'
import { CanvasView } from '@/ui/components/Canvas/CanvasView'
import { ElementsPanel } from '@/ui/components/ElementsPanel/ElementsPanel'
import { PropertiesSidebar } from '@/ui/components/PropertiesSidebar/PropertiesSidebar'
import { TextEditor } from '@/ui/components/TextEditor/TextEditor'
import { Toolbar } from '@/ui/components/Toolbar/Toolbar'
import { Icons } from '@/ui/icons/Icons'

import { CanvasAppProvider } from '@/adapters/solid/CanvasAppProvider'

export default function App() {
  const [app, setApp] = createSignal<CanvasApp | null>(null)
  const [canvasElement, setCanvasElement] = createSignal<HTMLCanvasElement | null>(null)
  const [backgroundCanvasElement, setBackgroundCanvasElement] =
    createSignal<HTMLCanvasElement | null>(null)

  async function initializeCanvas() {
    const canvas = canvasElement()
    const backgroundCanvas = backgroundCanvasElement()
    if (!canvas || !backgroundCanvas || app()) {
      return
    }

    const context = createProxyCanvas(canvas, backgroundCanvas)
    const renderer = new Renderer(context)
    renderer.drawBackground()

    const camera = new Camera(renderer)
    const renderManager = await RenderManager.create(renderer)

    setApp(CanvasApp.create(renderer, renderManager, camera))
  }

  createEffect(() => {
    if (canvasElement() && backgroundCanvasElement()) {
      void initializeCanvas()
    }
  })

  return (
    <CanvasAppProvider app={app()}>
      <Icons />
      <Toolbar />
      <ElementsPanel />
      <PropertiesSidebar />
      <BottomControls />
      <CanvasView
        setCanvasRef={setCanvasElement}
        setBackgroundCanvasRef={setBackgroundCanvasElement}
      />
      <TextEditor />
    </CanvasAppProvider>
  )
}
