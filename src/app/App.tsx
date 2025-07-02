import { useCallback, useRef, useState } from 'react';

import { Icons } from '@/shared/ui/icons';

import { CanvasContextProvider } from '@/context/CanvasContext/CanvasContextProvider';
import { ActiveLayerProvider } from '@/context/ActiveLayerContext/ActiveLayerContextProvider';
import { TextEditorProvider } from '@/context/TextEditorContext/TextEditorContextProvider';
import { ToolbarProvider } from '@/context/ToolbarContext/ToolbarContextProvider';

import { Renderer } from '@/services/Renderer';
import { type BaseRenderManager, RenderManager, createProxyCanvas } from '@/services/RenderManager';
import { Camera } from '@/services/Camera';

import { Zoom } from '@/ui/Toolbar/Zoom';
import { Toolbar } from '@/ui/Toolbar/Toolbar';
import { TextEditor } from '@/ui/TextEditor/TextEditor';
import { Canvas } from '@/ui/Canvas/Canvas';

import './App.module.css';

function App() {
  const [, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [, setBackgroundCanvas] = useState<HTMLCanvasElement | null>(null);

  const rendererRef = useRef<Renderer | null>(null);
  const renderManagerRef = useRef<BaseRenderManager | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const initializeCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;

    if (!canvas || !backgroundCanvas || renderManagerRef.current) return;

    const context = createProxyCanvas(canvas, backgroundCanvas);

    rendererRef.current = new Renderer(context);
    rendererRef.current.drawBackground();

    cameraRef.current = new Camera(rendererRef.current);
    renderManagerRef.current = await RenderManager.create(rendererRef.current);

    setCanvas(canvas);
    setBackgroundCanvas(backgroundCanvas);
  }, []);

  const setCanvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      canvasRef.current = canvas;
      // Only initialize if both canvases are now available
      if (backgroundCanvasRef.current) {
        initializeCanvas();
      }
    },
    [initializeCanvas],
  );

  const setBackgroundCanvasRef = useCallback(
    (backgroundCanvas: HTMLCanvasElement) => {
      backgroundCanvasRef.current = backgroundCanvas;
      // Only initialize if both canvases are now available
      if (canvasRef.current) {
        initializeCanvas();
      }
    },
    [initializeCanvas],
  );

  return (
    <ToolbarProvider>
      <Icons />
      <CanvasContextProvider
        value={{
          renderer: rendererRef.current,
          renderManager: renderManagerRef.current,
          camera: cameraRef.current,
        }}
      >
        <ActiveLayerProvider>
          <TextEditorProvider>
            <>
              <Toolbar />
              <Zoom />
              <TextEditor />
              <Canvas setCanvasRef={setCanvasRef} setBackgroundCanvasRef={setBackgroundCanvasRef} />
            </>
          </TextEditorProvider>
        </ActiveLayerProvider>
      </CanvasContextProvider>
    </ToolbarProvider>
  );
}

export default App;
