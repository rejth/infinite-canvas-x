import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import { CANVAS_STATE_ID } from '@/shared/constants';

import { debounce } from '@/lib/utils';

import { useCanvasContext, useToolbarContext } from '@/context';

import { LayerSerializer } from '@/services/LayerSerializer';
import { CanvasStateDB } from '@/services/Storage/interfaces';

const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;
const DEBOUNCE_INTERVAL = 3000;

/**
 * Autosave feature
 *
 * - Debounced autosave after changes
 * - Periodic full backup (less frequent)
 * - Save before user leaves
 *
 * Potential future enhancements:
 * - Compression: Database request may be too large for large canvases, so we could benefit from state compression
 * - Differential saves: Track and save only changed layers
 * - Save history: Keep multiple save states for recovery
 * - Network status: Pause saves when offline
 * - Handle the problem with beforeunload and localStorage (localStorage is impossible with large canvases)
 */
export const useAutosave = () => {
  const [saveIndicator, setSaveIndicator] = useState(false);
  const lastSavedState = useRef<CanvasStateDB | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const { renderManager } = useCanvasContext();
  const { tool, zoomPercentage } = useToolbarContext();

  const currentValues = useRef({
    renderManager,
    tool,
    zoomPercentage,
  });

  currentValues.current = {
    renderManager,
    tool,
    zoomPercentage,
  };

  const transformMatrix = renderManager?.getTransformMatrix();

  const stopInterval = useCallback(() => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  }, []);

  const hasStateChanged = useCallback((prev: CanvasStateDB | null, current: CanvasStateDB) => {
    if (!prev) return true;

    if (prev.tool !== current.tool || prev.zoomPercentage !== current.zoomPercentage) {
      return true;
    }

    return (
      JSON.stringify(prev.transformMatrix) !== JSON.stringify(current.transformMatrix) ||
      JSON.stringify(prev.layers) !== JSON.stringify(current.layers)
    );
  }, []);

  const restoreFromBackup = useCallback(() => {
    const backup = localStorage.getItem('canvas_backup');

    if (backup) {
      localStorage.removeItem('canvas_backup');
      return JSON.parse(backup);
    }

    return null;
  }, []);

  const getCurrentState = useCallback(() => {
    const { renderManager, tool, zoomPercentage } = currentValues.current;
    const layers = renderManager?.getLayers() || [];

    return {
      _id: CANVAS_STATE_ID,
      layers: layers.map((layer) => LayerSerializer.serialize(layer)),
      transformMatrix: renderManager?.getTransformMatrix(),
      tool,
      zoomPercentage,
    };
  }, []);

  const saveCanvasState = useCallback(async () => {
    try {
      const { renderManager } = currentValues.current;
      const storage = renderManager?.getPouchDBStorage();
      const localDB = storage?.getLocalDB();

      if (!localDB) return;

      const currentState = getCurrentState();
      if (!currentState) return;

      if (hasStateChanged(lastSavedState.current, currentState as CanvasStateDB)) {
        setSaveIndicator(true);

        const doc = await localDB.get(currentState._id);
        (currentState as CanvasStateDB)._rev = doc._rev;
        await localDB.put(currentState);

        lastSavedState.current = currentState as CanvasStateDB;
        setSaveIndicator(false);
      }
    } catch {
      setSaveIndicator(false);
    }
  }, [getCurrentState, hasStateChanged]);

  const debouncedSave = useMemo(() => debounce(saveCanvasState, DEBOUNCE_INTERVAL), [saveCanvasState]);

  // Debounced autosave after changes
  useEffect(() => {
    const currentState = getCurrentState();
    if (!currentState) return;
    debouncedSave();
  }, [tool, zoomPercentage, transformMatrix, getCurrentState, debouncedSave]);

  // Periodic autosave
  useEffect(() => {
    stopInterval();
    interval.current = setInterval(() => saveCanvasState(), AUTO_SAVE_INTERVAL);
    return () => stopInterval();
  }, [saveCanvasState, stopInterval]);

  // Save before user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentState = getCurrentState();
      if (currentState) {
        try {
          localStorage.setItem('canvas_backup', JSON.stringify(currentState));
        } catch (e) {
          console.warn('Failed to save backup to localStorage', e);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveCanvasState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveCanvasState, getCurrentState]);

  return {
    saveIndicator,
    saveCanvasState,
    restoreFromBackup,
    getCurrentState,
  };
};
