import { useState } from 'react';

import { LayerInterface } from '@/entities/interfaces';

import { ActiveLayerContext } from './ActiveLayerContext';

type Props = {
  children: React.ReactNode;
};

export const ActiveLayerProvider = ({ children }: Props) => {
  const [activeLayer, setActiveLayer] = useState<LayerInterface | null>(null);
  const [lastActiveLayer, setLastActiveLayer] = useState<LayerInterface | null>(null);
  const [opacity, setOpacity] = useState(100);

  return (
    <ActiveLayerContext.Provider
      value={{
        activeLayer,
        lastActiveLayer,
        opacity,
        setActiveLayer,
        setLastActiveLayer,
        setOpacity,
      }}
    >
      {children}
    </ActiveLayerContext.Provider>
  );
};
