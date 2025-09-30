import { useCallback, useRef, useState } from 'react';

import { Icons } from '@/shared/ui/icons';
import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect';

import { Renderer } from '@/services/Renderer';
import { Camera } from '@/services/Camera';
import { type BaseRenderManager, RenderManager, createProxyCanvas } from '@/services/RenderManager';

import { CanvasContextProvider } from '@/context/CanvasContext/CanvasContextProvider';
import { ActiveLayerProvider } from '@/context/ActiveLayerContext/ActiveLayerContextProvider';
import { TextEditorProvider } from '@/context/TextEditorContext/TextEditorContextProvider';
import { ToolbarProvider } from '@/context/ToolbarContext/ToolbarContextProvider';
import { ImageEditorProvider } from '@/context/ImageEditorContext/ImageEditorContextProvider';

import { Canvas } from '@/ui/Canvas/Canvas';
import { Toolbar } from '@/ui/Toolbar/Toolbar';
import { TextEditor } from '@/ui/TextEditor/TextEditor';
import { PropertiesSidebar } from '@/ui/PropertiesSidebar/PropertiesSidebar';
import { ElementsPanel } from '@/ui/ElementsPanel/ElementsPanel';
import { BottomControls } from '@/ui/Toolbar/BottomControls';

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
    if (!canvas || !backgroundCanvas) return;

    const context = createProxyCanvas(canvas, backgroundCanvas);

    rendererRef.current = new Renderer(context);
    rendererRef.current.drawBackground();

    cameraRef.current = new Camera(rendererRef.current);
    renderManagerRef.current = await RenderManager.create(rendererRef.current);

    setCanvas(canvas);
    setBackgroundCanvas(backgroundCanvas);
  }, []);

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  const setBackgroundCanvasRef = useCallback((canvas: HTMLCanvasElement) => {
    backgroundCanvasRef.current = canvas;
  }, []);

  useDidMountEffect(() => {
    if (canvasRef.current && backgroundCanvasRef.current) {
      initializeCanvas();
    }
  });

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
                <Canvas setCanvasRef={setCanvasRef} setBackgroundCanvasRef={setBackgroundCanvasRef} />
              </>
            </ImageEditorProvider>
          </TextEditorProvider>
        </ActiveLayerProvider>
      </CanvasContextProvider>
    </ToolbarProvider>
  );
}

export default App;
