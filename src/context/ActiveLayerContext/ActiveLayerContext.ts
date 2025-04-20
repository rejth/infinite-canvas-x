import { createContext, Dispatch, SetStateAction } from 'react';
import { LayerInterface } from '@/entities/interfaces';

interface ActiveLayerContextInterface {
  activeLayer: LayerInterface | null;
  setActiveLayer: Dispatch<SetStateAction<LayerInterface | null>>;
}

export const ActiveLayerContext = createContext<ActiveLayerContextInterface>({
  activeLayer: null,
  setActiveLayer: () => null,
});
