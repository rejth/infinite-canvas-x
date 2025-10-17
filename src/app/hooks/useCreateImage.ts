import { Tools } from '@/app/shared/interfaces';
import { DEFAULT_CURSOR } from '@/app/shared/constants';
import { useActiveLayerContext, useCanvasContext, useImageEditorContext, useToolbarContext } from '@/app/store';

import { Point } from '@/core/interfaces';
import { DEFAULT_IMAGE_MAX_SIZE, DEFAULT_SCALE, SMALL_PADDING } from '@/core/constants';

import { CanvasImage } from '@/core/entities/CanvasImage';
import { Layer } from '@/core/entities/Layer';

export function useCreateImage() {
  const { renderManager } = useCanvasContext();
  const { setActiveLayer } = useActiveLayerContext();
  const { setTool, setCursor } = useToolbarContext();
  const { setImage } = useImageEditorContext();

  return function (_: React.MouseEvent<HTMLCanvasElement>, { x, y }: Point, imageSource: ImageBitmap) {
    if (!renderManager) return;

    const imageWidth = imageSource.width;
    const imageHeight = imageSource.height;
    const aspectRatio = imageWidth / imageHeight;

    let width: number;
    let height: number;

    if (aspectRatio > 1) {
      width = DEFAULT_IMAGE_MAX_SIZE;
      height = DEFAULT_IMAGE_MAX_SIZE / aspectRatio;
    } else {
      width = DEFAULT_IMAGE_MAX_SIZE * aspectRatio;
      height = DEFAULT_IMAGE_MAX_SIZE;
    }

    const image = new CanvasImage({
      x,
      y,
      width,
      height,
      scale: DEFAULT_SCALE,
      image: imageSource,
    });

    const layer = new Layer({
      x: x - SMALL_PADDING,
      y: y - SMALL_PADDING,
      width: width + SMALL_PADDING * 2,
      height: height + SMALL_PADDING * 2,
      scale: DEFAULT_SCALE,
    });

    layer.addChild(image);
    layer.setActive(true);
    renderManager.addLayer(layer);

    setActiveLayer(layer);
    setImage(null);
    setCursor(DEFAULT_CURSOR);
    setTool(Tools.SELECT);
  };
}
