import { useCallback, useRef, useState } from 'react';

import { DEFAULT_CANVAS_SCALE } from '@/shared/constants';
import { Icons } from '@/shared/ui/icons';

import { CanvasContextProvider } from '@/context/CanvasContext/CanvasContextProvider';
import { ActiveLayerProvider } from '@/context/ActiveLayerContext/ActiveLayerContextProvider';
import { TextEditorProvider } from '@/context/TextEditorContext/TextEditorContextProvider';
import { ToolbarProvider } from '@/context/ToolbarContext/ToolbarContextProvider';

import { Renderer } from '@/services/Renderer';
import { RenderManager } from '@/services/RenderManager';
import { Camera } from '@/services/Camera';

import { Zoom } from '@/ui/Toolbar/Zoom';
import { Toolbar } from '@/ui/Toolbar/Toolbar';
import { TextEditor } from '@/ui/TextEditor/TextEditor';
import { Canvas } from '@/ui/Canvas';

import './App.module.css';

function App() {
  const [, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const renderManagerRef = useRef<RenderManager | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const setCanvasRef = useCallback(async (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    canvas.width = Math.floor(window.innerWidth * DEFAULT_CANVAS_SCALE);
    canvas.height = Math.floor(window.innerHeight * DEFAULT_CANVAS_SCALE);

    rendererRef.current = new Renderer(context);
    rendererRef.current.drawBackground();

    cameraRef.current = new Camera(rendererRef.current);
    renderManagerRef.current = await RenderManager.create(rendererRef.current);

    setCanvas(canvas);
  }, []);

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
              <Canvas setCanvasRef={setCanvasRef} />
            </>
          </TextEditorProvider>
        </ActiveLayerProvider>
      </CanvasContextProvider>
    </ToolbarProvider>
  );
}

export default App;
