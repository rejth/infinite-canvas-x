import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import { debounce } from '@/app/shared/lib';
import { useCanvasContext, useToolbarContext } from '@/app/store';

import { DEFAULT_ZOOM_PERCENTAGE } from '@/core/constants';
import { CanvasSettingsDocument, StoreName } from '@/core/storage/interfaces';

const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;
const DEBOUNCE_INTERVAL = 2000;

/**
 * Autosave feature
 *
 * - Debounced autosave after changes
 * - Periodic full backup (less frequent)
 *
 * Potential future enhancements:
 * - Compression: Database request may be too large for large canvases, so we could benefit from state compression
 * - Differential saves: Track and save only changed layers
 * - Save history: Keep multiple save states for recovery
 * - Network status: Pause saves when offline
 */
export const useAutosave = () => {
  const [saveIndicator, setSaveIndicator] = useState(false);
  const lastSavedState = useRef<CanvasSettingsDocument | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const { renderManager } = useCanvasContext();
  const { zoomPercentage } = useToolbarContext();

  const currentValues = useRef({
    renderManager,
    zoomPercentage,
  });

  currentValues.current = {
    renderManager,
    zoomPercentage,
  };

  const transformMatrix = renderManager?.getTransformMatrix();

  const stopInterval = useCallback(() => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  }, []);

  const hasStateChanged = useCallback((prev: CanvasSettingsDocument | null, current: CanvasSettingsDocument) => {
    if (!prev) return true;

    if (prev.zoomPercentage !== current.zoomPercentage) {
      return true;
    }

    return JSON.stringify(prev.transformMatrix) !== JSON.stringify(current.transformMatrix);
  }, []);

  const getCurrentState = useCallback(() => {
    const { renderManager, zoomPercentage } = currentValues.current;

    return {
      _id: StoreName.CANVAS_SETTINGS,
      transformMatrix: renderManager?.getTransformMatrix(),
      zoomPercentage,
    };
  }, []);

  const saveCanvasState = useCallback(async () => {
    const { renderManager } = currentValues.current;
    const db = renderManager?.getSyncDBInstance()?.database;
    if (!db) return;

    try {
      const currentState = getCurrentState();

      if (hasStateChanged(lastSavedState.current, currentState as CanvasSettingsDocument)) {
        setSaveIndicator(true);

        const doc = await db.get(currentState._id);
        (currentState as CanvasSettingsDocument)._rev = doc._rev;
        await db.put(currentState);

        lastSavedState.current = currentState as CanvasSettingsDocument;
        setSaveIndicator(false);
      }
    } catch {
      // If canvas settings are not found, create them
      await db.put({
        _id: StoreName.CANVAS_SETTINGS,
        zoomPercentage: DEFAULT_ZOOM_PERCENTAGE,
        transformMatrix: renderManager?.getTransformMatrix(),
      });
      setSaveIndicator(false);
    }
  }, [getCurrentState, hasStateChanged]);

  const debouncedSave = useMemo(() => debounce(saveCanvasState, DEBOUNCE_INTERVAL), [saveCanvasState]);

  // Debounced autosave after changes
  useEffect(() => {
    const currentState = getCurrentState();
    if (!currentState) return;
    debouncedSave();
  }, [zoomPercentage, transformMatrix, getCurrentState, debouncedSave]);

  // Periodic autosave
  useEffect(() => {
    stopInterval();
    interval.current = setInterval(() => saveCanvasState(), AUTO_SAVE_INTERVAL);
    return () => stopInterval();
  }, [saveCanvasState, stopInterval]);

  return {
    saveIndicator,
    saveCanvasState,
    getCurrentState,
  };
};
