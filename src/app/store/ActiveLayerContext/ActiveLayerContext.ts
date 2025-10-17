import { createContext, Dispatch, SetStateAction } from 'react';

import { DEFAULT_OPACITY } from '@/core/constants';
import { LayerInterface } from '@/core/entities/interfaces';

interface ActiveLayerContextInterface {
  activeLayer: LayerInterface | null;
  lastActiveLayer: LayerInterface | null;
  opacity: number;
  setActiveLayer: Dispatch<SetStateAction<LayerInterface | null>>;
  setLastActiveLayer: Dispatch<SetStateAction<LayerInterface | null>>;
  setOpacity: Dispatch<SetStateAction<number>>;
}

export const ActiveLayerContext = createContext<ActiveLayerContextInterface>({
  activeLayer: null,
  lastActiveLayer: null,
  opacity: DEFAULT_OPACITY,
  setActiveLayer: () => null,
  setLastActiveLayer: () => null,
  setOpacity: () => null,
});
