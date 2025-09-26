import { COLORS, DEFAULT_FONT, DEFAULT_SCALE, SMALL_PADDING } from '@/shared/constants';
import { Tools } from '@/shared/interfaces';

import { useCanvasContext, useActiveLayerContext, useToolbarContext } from '@/context';

import { Vector, MBR } from '@/services/Geometry';

import { Layer } from '@/entities/Layer';
import { Point } from '@/entities/Point';
import { CanvasSpline } from '@/entities/CanvasSpline';

const points = [
  [325, 376],
  [445, 376],
  [569, 289],
  [653, 300],
  [737, 311],
  [844, 387],
  [945, 346],
];

const bbox = new MBR(...points.map((point) => new Vector(point[0], point[1])));
const width = bbox.size().x;
const height = bbox.size().y;

export const useCreateCurvedText = () => {
  const { renderManager } = useCanvasContext();
  const { setActiveLayer } = useActiveLayerContext();
  const { setTool } = useToolbarContext();

  return function (_: React.MouseEvent<HTMLCanvasElement>, { x, y }: Point) {
    if (!renderManager) return;

    const adjustedPoints = points.map(([px, py]) => [
      px - bbox.min.x + x, // offset from top-left to click position
      py - bbox.min.y + y,
    ]);

    const spline = new CanvasSpline({
      x,
      y,
      width,
      height,
      points: adjustedPoints,
      lineWidth: 2,
      color: COLORS.CURVE,
      scale: DEFAULT_SCALE,
      font: DEFAULT_FONT,
      text: 'Sample Text',
      shift: 0.5,
      spread: 1,
    });

    const layer = new Layer(
      {
        x: x - SMALL_PADDING,
        y: y - SMALL_PADDING,
        width: width + SMALL_PADDING * 2,
        height: height + SMALL_PADDING * 2,
        scale: DEFAULT_SCALE,
      },
      { withSelection: false, minDimension: Number.POSITIVE_INFINITY },
    );

    layer.addChild(spline);
    layer.setActive(true);
    setActiveLayer(layer);
    renderManager.addLayer(layer);

    setTool(Tools.SELECT);
  };
};
