type CreateDecoratorAction<T> = (
  self: T,
  originalMethod: (...args: unknown[]) => unknown,
  ...args: unknown[]
) => Promise<unknown> | void;

function createDecorator<T>(action: CreateDecoratorAction<T>) {
  return (_target: T, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const _this = this as T;
      await action(_this, originalMethod, ...args);
    };
  };
}

export const decorateWithPostAction = <T>(postAction: (data: unknown) => void) =>
  createDecorator<T>(async (self, originalMethod, ...args) => {
    const result = originalMethod.apply(self, args);

    if (result) {
      // Trigger an post-processing action after the original method execution is complete.
      // Use setTimeout to ensure the method execution is complete and non-blocking.
      setTimeout(() => postAction(result), 0);
    }

    return result;
  });
