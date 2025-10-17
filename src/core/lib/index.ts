export type CreateDecoratorAction<T> = (
  self: T,
  originalMethod: (...args: unknown[]) => unknown,
  ...args: unknown[]
) => Promise<unknown> | void;

export function createDecorator<T>(action: CreateDecoratorAction<T>) {
  return (_target: T, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const _this = this as T;
      await action(_this, originalMethod, ...args);
    };
  };
}

export function setByPath(object: Record<string, unknown>, path: string, value: unknown) {
  path.split('.').forEach((property, i, array) => {
    if (i === array.length - 1) {
      object[property] = value;
    } else {
      if (typeof object[property] !== 'object' || object[property] === null) {
        object[property] = {};
      }
      object = object[property] as Record<string, unknown>;
    }
  });
}

export const getImageBitmap = async (imageUrl: string): Promise<ImageBitmap> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return createImageBitmap(blob);
};

export const createCursorFromImage = async (imageUrl: string): Promise<string> => {
  const size = 32; // browsers limit cursor sizes to 32x32px maximum

  const imageBitmap = await getImageBitmap(imageUrl);
  const imageCanvas = new OffscreenCanvas(size, size);
  const imageCtx = imageCanvas.getContext('2d')!;

  imageCtx.drawImage(imageBitmap, 0, 0, size, size);
  const blob = await imageCanvas.convertToBlob({ type: 'image/png' });

  return URL.createObjectURL(blob);
};
