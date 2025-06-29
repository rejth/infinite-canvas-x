import { CanvasEntityType } from '@/entities/interfaces';
import { TextAlign, TextDecoration } from '@/shared/interfaces';
import { CanvasStateDB, StoreName } from './interfaces';
import { CANVAS_STATE_ID, DEFAULT_TOOL, DEFAULT_ZOOM_PERCENTAGE } from '@/shared/constants';

const layer1 = {
  id: 1,
  type: CanvasEntityType.LAYER,
  options: {
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    scale: 1,
    initialWidth: 300,
    initialHeight: 200,
  },
  children: [
    {
      type: CanvasEntityType.RECT,
      options: {
        x: 100,
        y: 100,
        width: 300,
        height: 200,
        color: '#4CAF50',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffsetY: 5,
        shadowOffsetX: 2,
        shadowBlur: 4,
        scale: 1,
        initialWidth: 300,
        initialHeight: 200,
      },
      minDimension: 200,
    },
    {
      type: CanvasEntityType.TEXT,
      options: {
        x: 100,
        y: 100,
        width: 300,
        height: 200,
        text: 'Welcome!',
        textAlign: TextAlign.CENTER,
        textDecoration: TextDecoration.NONE,
        fontSize: 24,
        fontStyle: 'bold',
        scale: 1,
        canvasScale: 2,
        initialWidth: 300,
        initialHeight: 200,
      },
      minDimension: 200,
    },
  ],
};

const layer2 = {
  id: 2,
  type: CanvasEntityType.LAYER,
  options: {
    x: 450,
    y: 150,
    width: 250,
    height: 250,
    scale: 1,
    initialWidth: 250,
    initialHeight: 250,
  },
  children: [
    {
      type: CanvasEntityType.RECT,
      options: {
        x: 450,
        y: 150,
        width: 250,
        height: 250,
        color: '#2196F3',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetY: 8,
        shadowOffsetX: 4,
        shadowBlur: 6,
        scale: 1,
        initialWidth: 250,
        initialHeight: 250,
      },
      minDimension: 200,
    },
    {
      type: CanvasEntityType.TEXT,
      options: {
        x: 450,
        y: 150,
        width: 250,
        height: 250,
        text: 'Features',
        textAlign: TextAlign.CENTER,
        textDecoration: TextDecoration.UNDERLINE,
        fontSize: 20,
        fontStyle: 'italic',
        scale: 1,
        canvasScale: 2,
        initialWidth: 250,
        initialHeight: 250,
      },
      minDimension: 200,
    },
  ],
};

const layer3 = {
  id: 3,
  type: CanvasEntityType.LAYER,
  options: {
    x: 200,
    y: 400,
    width: 280,
    height: 180,
    scale: 1,
    initialWidth: 280,
    initialHeight: 180,
  },
  children: [
    {
      type: CanvasEntityType.RECT,
      options: {
        x: 200,
        y: 400,
        width: 280,
        height: 180,
        color: '#FF9800',
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffsetY: 6,
        shadowOffsetX: 3,
        shadowBlur: 5,
        scale: 1,
        initialWidth: 280,
        initialHeight: 180,
      },
      minDimension: 180,
    },
    {
      type: CanvasEntityType.TEXT,
      options: {
        x: 200,
        y: 400,
        width: 280,
        height: 180,
        text: 'Get Started',
        textAlign: TextAlign.CENTER,
        textDecoration: TextDecoration.NONE,
        fontSize: 22,
        fontStyle: 'bold',
        scale: 1,
        canvasScale: 2,
        initialWidth: 280,
        initialHeight: 180,
      },
      minDimension: 180,
    },
  ],
};

const layer4 = {
  id: 4,
  type: CanvasEntityType.LAYER,
  options: {
    x: 550,
    y: 450,
    width: 220,
    height: 220,
    scale: 1,
    initialWidth: 220,
    initialHeight: 220,
  },
  children: [
    {
      type: CanvasEntityType.RECT,
      options: {
        x: 550,
        y: 450,
        width: 220,
        height: 220,
        color: '#9C27B0',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffsetY: 4,
        shadowOffsetX: 2,
        shadowBlur: 4,
        scale: 1,
        initialWidth: 220,
        initialHeight: 220,
      },
      minDimension: 200,
    },
    {
      type: CanvasEntityType.TEXT,
      options: {
        x: 550,
        y: 450,
        width: 220,
        height: 220,
        text: 'Learn More',
        textAlign: TextAlign.CENTER,
        textDecoration: TextDecoration.NONE,
        fontSize: 18,
        fontStyle: 'normal',
        scale: 1,
        canvasScale: 2,
        initialWidth: 220,
        initialHeight: 220,
      },
      minDimension: 200,
    },
  ],
};

const layer5 = {
  id: 5,
  type: CanvasEntityType.LAYER,
  options: {
    x: 300,
    y: 650,
    width: 260,
    height: 160,
    scale: 1,
    initialWidth: 260,
    initialHeight: 160,
  },
  children: [
    {
      type: CanvasEntityType.RECT,
      options: {
        x: 300,
        y: 650,
        width: 260,
        height: 160,
        color: '#E91E63',
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffsetY: 3,
        shadowOffsetX: 2,
        shadowBlur: 3,
        scale: 1,
        initialWidth: 260,
        initialHeight: 160,
      },
      minDimension: 160,
    },
    {
      type: CanvasEntityType.TEXT,
      options: {
        x: 300,
        y: 650,
        width: 260,
        height: 160,
        text: 'Contact Us',
        textAlign: TextAlign.CENTER,
        textDecoration: TextDecoration.NONE,
        fontSize: 20,
        fontStyle: 'bold',
        scale: 1,
        canvasScale: 2,
        initialWidth: 260,
        initialHeight: 160,
      },
      minDimension: 160,
    },
  ],
};

const mockData: CanvasStateDB = {
  _id: CANVAS_STATE_ID,
  layers: [layer1, layer2, layer3, layer4, layer5],
  transformMatrix: {
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    translationX: 0,
    translationY: 0,
    initialScale: 1,
  },
  tool: DEFAULT_TOOL,
  zoomPercentage: DEFAULT_ZOOM_PERCENTAGE,
};

export const generateMockData = (transaction: IDBTransaction | null) => {
  if (!transaction) return;

  transaction.objectStore(StoreName.CANVAS_STATE).add(mockData);
};
