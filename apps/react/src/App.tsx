import { useCallback, useRef, useState } from 'react'
import { CanvasApp } from '@infinite-canvas-x/canvas-app'
import {
  Camera,
  createProxyCanvas,
  Renderer,
  RenderManager,
} from '@infinite-canvas-x/canvas-engine'

import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect'
import { Icons } from '@/shared/ui/icons'

import { CanvasAppProvider } from '@/adapters/react/CanvasAppProvider'

import './App.module.css'

import { BottomControls } from './ui/components/BottomControls/BottomControls'
import { Canvas } from './ui/components/Canvas/Canvas'
import { ElementsPanel } from './ui/components/ElementsPanel/ElementsPanel'
import { PropertiesSidebar } from './ui/components/PropertiesSidebar/PropertiesSidebar'
import { TextEditor } from './ui/components/TextEditor/TextEditor'
import { Toolbar } from './ui/components/Toolbar/Toolbar'

function App() {
  const [, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [, setBackgroundCanvas] = useState<HTMLCanvasElement | null>(null)
  const [app, setApp] = useState<CanvasApp | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const initializeCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    const backgroundCanvas = backgroundCanvasRef.current
    if (!canvas || !backgroundCanvas) return

    const context = createProxyCanvas(canvas, backgroundCanvas)

    const renderer = new Renderer(context)
    renderer.drawBackground()

    const camera = new Camera(renderer)
    const renderManager = await RenderManager.create(renderer)

    setApp(CanvasApp.create(renderer, renderManager, camera))
    setCanvas(canvas)
    setBackgroundCanvas(backgroundCanvas)
  }, [])

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas
  }, [])

  const setBackgroundCanvasRef = useCallback((canvas: HTMLCanvasElement) => {
    backgroundCanvasRef.current = canvas
  }, [])

  useDidMountEffect(() => {
    if (canvasRef.current && backgroundCanvasRef.current) {
      initializeCanvas()
    }
  })

  return (
    <CanvasAppProvider app={app}>
      <Icons />
      <Toolbar />
      <ElementsPanel />
      <PropertiesSidebar />
      <BottomControls />
      <TextEditor />
      <Canvas setCanvasRef={setCanvasRef} setBackgroundCanvasRef={setBackgroundCanvasRef} />
    </CanvasAppProvider>
  )
}

export default App
