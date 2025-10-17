import { useCallback, useRef, useState } from 'react';

import { Icons } from '@/app/shared/ui/icons';
import { useDidMountEffect } from '@/app/shared/hooks/useDidMountEffect';

import { CanvasContextProvider } from '@/app/store/CanvasContext/CanvasContextProvider';
import { ActiveLayerProvider } from '@/app/store/ActiveLayerContext/ActiveLayerContextProvider';
import { TextEditorProvider } from '@/app/store/TextEditorContext/TextEditorContextProvider';
import { ToolbarProvider } from '@/app/store/ToolbarContext/ToolbarContextProvider';
import { ImageEditorProvider } from '@/app/store/ImageEditorContext/ImageEditorContextProvider';

import { Canvas } from '@/app/ui/components/Canvas/Canvas';
import { Toolbar } from '@/app/ui/components/Toolbar/Toolbar';
import { TextEditor } from '@/app/ui/components/TextEditor/TextEditor';
import { ElementsPanel } from '@/app/ui/components/ElementsPanel/ElementsPanel';
import { BottomControls } from '@/app/ui/components/BottomControls/BottomControls';
import { PropertiesSidebar } from '@/app/ui/components/PropertiesSidebar/PropertiesSidebar';

import { Renderer } from '@/core/services/Renderer';
import { Camera } from '@/core/services/Camera';
import { type BaseRenderManager, RenderManager, createProxyCanvas } from '@/core/services/RenderManager';

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
