import { createContext } from 'react';

import { type Camera } from '@/core/services/Camera';
import { type Renderer } from '@/core/services/Renderer';
import { type BaseRenderManager } from '@/core/services/RenderManager';

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
