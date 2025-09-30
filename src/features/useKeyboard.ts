import { useCallback, useEffect, useState } from 'react';

import { LayerInterface } from '@/entities/interfaces';
import { LayerSerializer } from '@/entities/LayerSerializer';

import { useTextEditorContext, useActiveLayerContext, useCanvasContext } from '@/context';

export function useKeyboard() {
  const { renderManager } = useCanvasContext();
  const { activeLayer, setActiveLayer, setLastActiveLayer } = useActiveLayerContext();
  const { isLayerEditable } = useTextEditorContext();
  const { setIsLayerEditable } = useTextEditorContext();

  const [commandPressed, setCommandPressed] = useState(false);
  const [clipboard, setClipboard] = useState<LayerInterface | null>(null);

  const handleRemoveLayer = useCallback(() => {
    if (activeLayer && !isLayerEditable) {
      renderManager?.removeLayer(activeLayer);
      setLastActiveLayer(activeLayer);
      setActiveLayer(null);
    }
  }, [isLayerEditable, activeLayer, renderManager, setActiveLayer, setLastActiveLayer]);

  const handleKeyUp = useCallback(() => {
    setCommandPressed(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeLayer) {
          activeLayer.setActive(false);
          setLastActiveLayer(activeLayer);
          setActiveLayer(null);
          setIsLayerEditable(false);
          renderManager?.reDrawOnNextFrame();
        }
        return;
      }

      if (e.key === 'Meta') {
        setCommandPressed(true);
        return;
      }

      if (e.key === 'Backspace') {
        handleRemoveLayer();
        return;
      }

      if (e.key === 'c') {
        if ((commandPressed || e.ctrlKey) && activeLayer && !isLayerEditable) {
          setClipboard(activeLayer);
        }
        return;
      }

      if (e.key === 'v') {
        if ((commandPressed || e.ctrlKey) && clipboard) {
          if (activeLayer) {
            activeLayer.setActive(false);
          }

          const data = LayerSerializer.serialize(clipboard);
          let layerCopy: LayerInterface | null = null;

          if (data) {
            layerCopy = LayerSerializer.deserialize(data);
            if (layerCopy) {
              layerCopy.move(100, 100);
              layerCopy.setActive(true);
              renderManager?.addLayer(layerCopy);
              setActiveLayer(layerCopy);
              renderManager?.reDrawOnNextFrame();
            }
          }
        }
      }
    },
    [
      activeLayer,
      isLayerEditable,
      clipboard,
      commandPressed,
      renderManager,
      handleRemoveLayer,
      setActiveLayer,
      setIsLayerEditable,
      setLastActiveLayer,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}
