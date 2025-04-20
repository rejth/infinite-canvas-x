import { createContext, Dispatch, SetStateAction } from 'react';

import { Tool } from '@/shared/interfaces';
import { DEFAULT_RESIZE_DIRECTION, DEFAULT_CURSOR, DEFAULT_TOOL, DEFAULT_ZOOM_PERCENTAGE } from '@/shared/constants';

interface ToolbarContextInterface {
  cursor: string;
  tool: Tool;
  resizeDirection: string;
  zoomPercentage: number;
  setCursor: Dispatch<SetStateAction<string>>;
  setTool: Dispatch<SetStateAction<Tool>>;
  setResizeDirection: Dispatch<SetStateAction<string>>;
  setZoomPercentage: Dispatch<SetStateAction<number>>;
}

export const ToolbarContext = createContext<ToolbarContextInterface>({
  cursor: DEFAULT_CURSOR,
  tool: DEFAULT_TOOL,
  resizeDirection: DEFAULT_RESIZE_DIRECTION,
  zoomPercentage: DEFAULT_ZOOM_PERCENTAGE,
  setCursor: () => DEFAULT_CURSOR,
  setTool: () => DEFAULT_TOOL,
  setResizeDirection: () => DEFAULT_RESIZE_DIRECTION,
  setZoomPercentage: () => DEFAULT_ZOOM_PERCENTAGE,
});
