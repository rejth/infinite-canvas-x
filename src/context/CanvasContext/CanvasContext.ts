import { createContext } from 'react';

import { type Camera } from '@/services/Camera';
import { type BaseRenderManager } from '@/services/RenderManager';
import { type Renderer } from '@/services/Renderer';

export interface CanvasContextInterface {
  renderer: Renderer | null;
  renderManager: BaseRenderManager | null;
  camera: Camera | null;
}

export const CanvasContext = createContext<CanvasContextInterface>({
  renderer: null,
  renderManager: null,
  camera: null,
});
