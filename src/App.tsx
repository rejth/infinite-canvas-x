import { useCallback, useRef, useState } from 'react'

import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect'
import { Icons } from '@/shared/ui/icons'

import { ActiveLayerProvider } from '@/store/ActiveLayerContext/ActiveLayerContextProvider'
import { CanvasContextProvider } from '@/store/CanvasContext/CanvasContextProvider'
import { ImageEditorProvider } from '@/store/ImageEditorContext/ImageEditorContextProvider'
import { TextEditorProvider } from '@/store/TextEditorContext/TextEditorContextProvider'
import { ToolbarProvider } from '@/store/ToolbarContext/ToolbarContextProvider'

// import { PouchDBService } from '@/app/services/PouchDBService';

import {
  type BaseRenderManager,
  Camera,
  createProxyCanvas,
  Renderer,
  RenderManager,
} from '@infinite-canvas-x/canvas-engine'

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

  const rendererRef = useRef<Renderer | null>(null)
  const renderManagerRef = useRef<BaseRenderManager | null>(null)
  const cameraRef = useRef<Camera | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const initializeCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    const backgroundCanvas = backgroundCanvasRef.current
    if (!canvas || !backgroundCanvas) return

    const context = createProxyCanvas(canvas, backgroundCanvas)

    rendererRef.current = new Renderer(context)
    rendererRef.current.drawBackground()

    cameraRef.current = new Camera(rendererRef.current)
    renderManagerRef.current = await RenderManager.create(rendererRef.current)
    // await PouchDBService.create('canvas-db');

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
    <ToolbarProvider>
      <CanvasContextProvider
        value={{
          renderer: rendererRef.current,
          renderManager: renderManagerRef.current,
          camera: cameraRef.current,
        }}
      >
        <ActiveLayerProvider>
          <TextEditorProvider>
            <ImageEditorProvider>
              <>
                <Icons />
                <Toolbar />
                <ElementsPanel />
                <PropertiesSidebar />
                <BottomControls />
                <TextEditor />
                <Canvas
                  setCanvasRef={setCanvasRef}
                  setBackgroundCanvasRef={setBackgroundCanvasRef}
                />
              </>
            </ImageEditorProvider>
          </TextEditorProvider>
        </ActiveLayerProvider>
      </CanvasContextProvider>
    </ToolbarProvider>
  )
}

export default App
