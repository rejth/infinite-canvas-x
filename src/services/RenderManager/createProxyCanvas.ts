import { COLORS, DEFAULT_CANVAS_SCALE } from '@/shared/constants';
import { RectDimension } from '@/shared/interfaces';

export interface ProxyCanvasRenderingContext2D extends Omit<CanvasRenderingContext2D, 'canvas'> {
  drawBackground: (rect: RectDimension) => void;
}

export function createProxyCanvas(
  canvas: HTMLCanvasElement,
  backgroundCanvas: HTMLCanvasElement,
  contextSettings?: CanvasRenderingContext2DSettings,
): ProxyCanvasRenderingContext2D {
  const mainContext = canvas.getContext('2d', contextSettings);
  const backgroundContext = backgroundCanvas.getContext('2d') as unknown as ProxyCanvasRenderingContext2D;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  canvas.width = Math.floor(window.innerWidth * DEFAULT_CANVAS_SCALE);
  canvas.height = Math.floor(window.innerHeight * DEFAULT_CANVAS_SCALE);

  backgroundCanvas.style.width = `${window.innerWidth}px`;
  backgroundCanvas.style.height = `${window.innerHeight}px`;
  backgroundCanvas.width = Math.floor(window.innerWidth * DEFAULT_CANVAS_SCALE);
  backgroundCanvas.height = Math.floor(window.innerHeight * DEFAULT_CANVAS_SCALE);

  const backgroundCanvasObserver = new MutationObserver(() => {
    backgroundCanvas.width = canvas.width;
    backgroundCanvas.height = canvas.height;
  });

  backgroundCanvasObserver.observe(canvas, { attributeFilter: ['width', 'height'] });

  const drawBackground = (rect: RectDimension) => {
    backgroundContext.clearRect(rect.x, rect.y, rect.width, rect.height);

    const width = 10;
    const height = 10;
    const radius = 0.5;

    const transform = backgroundContext.getTransform();

    const offscreenCanvas = new OffscreenCanvas(width, height);
    offscreenCanvas.width = Math.floor(width * transform.a);
    offscreenCanvas.height = Math.floor(height * transform.a);

    const ctx = offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

    ctx.scale(transform.a, transform.a);
    ctx.beginPath();
    ctx.fillStyle = COLORS.GRID;
    ctx.arc(1, 1, radius, 0, 2 * Math.PI);
    ctx.fill();

    const pattern = backgroundContext.createPattern(offscreenCanvas, 'repeat');
    if (!pattern) return;

    backgroundContext.save();

    backgroundContext.setTransform(
      DEFAULT_CANVAS_SCALE,
      transform.b,
      transform.c,
      DEFAULT_CANVAS_SCALE,
      transform.e,
      transform.f,
    );
    backgroundContext.fillStyle = pattern;
    backgroundContext.fillRect(
      -transform.e / DEFAULT_CANVAS_SCALE,
      -transform.f / DEFAULT_CANVAS_SCALE,
      window.innerWidth,
      window.innerHeight,
    );

    backgroundContext.restore();
  };

  return new Proxy(mainContext as unknown as ProxyCanvasRenderingContext2D, {
    get(target, property: keyof ProxyCanvasRenderingContext2D) {
      if (property === 'drawBackground') return drawBackground;

      const value = target[property];
      if (typeof value !== 'function') return value;

      return (...args: unknown[]) => {
        // Apply transform operations to background canvas for panning/zooming only
        if (['scale', 'translate', 'setTransform'].includes(property)) {
          (backgroundContext[property] as unknown as (...args: unknown[]) => void)(...args);
        }

        return Reflect.apply(value, target, args);
      };
    },

    set(target, property: keyof ProxyCanvasRenderingContext2D, newValue) {
      (<ProxyCanvasRenderingContext2D>target[property]) = newValue;

      return true;
    },
  });
}
