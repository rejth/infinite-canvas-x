import { useCallback, useState } from 'react';

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

let renderer: Renderer | null = null;
let renderManager: RenderManager | null = null;
let camera: Camera | null = null;

function App() {
  const [, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const scale = DEFAULT_CANVAS_SCALE;
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);

    renderer = new Renderer(context, scale);
    renderManager = new RenderManager(renderer);
    camera = new Camera(renderer);

    renderer.drawBackground();
    setCanvas(canvas);
  }, []);

  return (
    <ToolbarProvider>
      <Icons />
      <CanvasContextProvider value={{ renderer, renderManager, camera }}>
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
