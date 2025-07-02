import { createContext, Dispatch, SetStateAction } from 'react';
import { LayerInterface } from '@/entities/interfaces';

interface ActiveLayerContextInterface {
  activeLayer: LayerInterface | null;
  lastActiveLayer: LayerInterface | null;
  setActiveLayer: Dispatch<SetStateAction<LayerInterface | null>>;
  setLastActiveLayer: Dispatch<SetStateAction<LayerInterface | null>>;
}

export const ActiveLayerContext = createContext<ActiveLayerContextInterface>({
  activeLayer: null,
  lastActiveLayer: null,
  setActiveLayer: () => null,
  setLastActiveLayer: () => null,
});
