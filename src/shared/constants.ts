import { Tools, type Color } from '@/shared/interfaces';

export const CANVAS_STATE_ID = 'canvas-state';

export const DEFAULT_FONT = 'Times New Roman';
export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_FONT_WEIGHT = '400';

export const SMALL_PADDING = 5;
export const LARGE_PADDING = 10;

export const DEFAULT_SCALE = 1;
export const DEFAULT_CANVAS_SCALE = window.devicePixelRatio ?? 2;

export const DEFAULT_RECT_SIZE = 200;

export const DEFAULT_TEXT_AREA_WIDTH = 500;
export const DEFAULT_TEXT_AREA_HEIGHT = 100;

export const DEFAULT_TEXT_BLOCK_WIDTH = 300;
export const DEFAULT_TEXT_BLOCK_HEIGHT = 60;

export const DEFAULT_SELECTION_LINE_WIDTH = 2;
export const DEFAULT_CORNER = 5;

export const DEFAULT_IMAGE_MAX_SIZE = 400;

export const DEFAULT_TOOL = Tools.SELECT;
export const DEFAULT_CURSOR = 'default';

export const DEFAULT_RESIZE_DIRECTION = 'right';
export const DEFAULT_ZOOM_PERCENTAGE = 45;

export const ZOOM_STEP = 10;
export const ZOOM_MIN = 15;
export const ZOOM_MAX = 195;

export const DEFAULT_OPACITY = 100;

export const enum COLORS {
  STICKER_YELLOW = '#ffd670',
  STICKER_ORANGE = '#ff9770',
  STICKER_GREEN = '#e9ff70',
  STICKER_DARK_GREEN = '#6ac5ab',
  STICKER_PURPLE = '#6965db',
  STICKER_DARK_PURPLE = '#5753d0',
  STICKER_BLUE = '#70d6ff',
  STICKER_PINK = '#ff70a6',
  SELECTION = '#3a86ff',
  CURVE = '#3af',
  GRID = '#9ca3af',
  TEXT_AREA = '#f6f2ff',
  WHITE = '#ffffff',
  FONT = '#000000',
  TRANSPARENT = 'transparent',
}

export const COLOR_LIST: Color[] = [
  {
    value: '#70d6ff',
    label: '#70d6ff',
  },
  {
    value: '#f62a5c',
    label: '#f62a5c',
  },
  {
    value: '#ff70a6',
    label: '#ff70a6',
  },
  {
    value: '#e0bdfa',
    label: '#e0bdfa',
  },
  {
    value: '#fdc4e7',
    label: '#fdc4e7',
  },
  {
    value: '#ff9770',
    label: '#ff9770',
  },
  {
    value: '#ffd670',
    label: '#ffd670',
  },
  {
    value: '#e9ff70',
    label: '#e9ff70',
  },
  {
    value: '#6ac5ab',
    label: '#6ac5ab',
  },
];

const handCursor = new Image();

handCursor.src =
  'data:image/png;base64,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';

export const CURSORS = {
  [Tools.HAND]: `-webkit-image-set(url("${handCursor.src}") 2x), auto`,
};
