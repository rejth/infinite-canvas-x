function validateIterable<T>(asyncIterable: AsyncIterable<T>): void {
  if (typeof asyncIterable[Symbol.asyncIterator] !== 'function') {
    throw new Error('The object does not have asynchronous iterator and cannot be iterable');
  }
}

export async function* watch<T>(executor: () => AsyncIterable<T>): AsyncGenerator<T> {
  while (true) {
    for await (const value of executor()) {
      yield value;
    }
  }
}

export async function* sequence<T>(...asyncIterables: AsyncIterable<T>[]): AsyncGenerator<T> {
  for (const iterable of asyncIterables) {
    validateIterable(iterable);

    for await (const item of iterable) {
      yield item;
    }
  }
}

export async function* map<T, R>(asyncIterable: AsyncIterable<T>, mappers: Array<(value: T) => R>): AsyncGenerator<R> {
  for await (const value of asyncIterable) {
    const mapperIterator = mappers[Symbol.iterator]();
    let mapper = mapperIterator.next();

    while (!mapper.done && value !== undefined) {
      yield mapper.value(value);
      mapper = mapperIterator.next();
    }
  }
}

export async function* filter<T>(asyncIterable: AsyncIterable<T>, onFilter: (value: T) => boolean): AsyncGenerator<T> {
  validateIterable(asyncIterable);
  const iterator = asyncIterable[Symbol.asyncIterator]();

  while (true) {
    const { done, value } = await iterator.next();
    if (done) return;
    if (onFilter(value)) yield value;
  }
}

export async function* every<T>(asyncIterable: AsyncIterable<T>, predicate: (value: T) => boolean): AsyncGenerator<T> {
  validateIterable(asyncIterable);

  for await (const value of asyncIterable) {
    if (!predicate(value)) break;
    yield value;
  }
}

export async function* any<T>(...asyncIterables: AsyncIterable<T>[]): AsyncGenerator<T> {
  const iterators = asyncIterables.map((iterable) => iterable[Symbol.asyncIterator]());

  while (true) {
    yield (await Promise.race(iterators.map((item) => item.next()))).value;
  }
}

export async function* take<T>(asyncIterable: AsyncIterable<T>, limit: number): AsyncGenerator<T> {
  validateIterable(asyncIterable);
  const iterator = asyncIterable[Symbol.asyncIterator]();
  let cursor = 0;

  while (limit !== cursor++) {
    const { value } = await iterator.next();
    yield value;
  }
}

export async function* slice<T>(
  asyncIterable: AsyncIterable<T>,
  start: number,
  stop: number,
  step: number = 1,
): AsyncGenerator<T> {
  const iterator = asyncIterable[Symbol.asyncIterator]();
  let index = 0;

  while (index < start) {
    const { done } = await iterator.next();
    if (done) return;
    index++;
  }

  while (index < stop) {
    const { done, value } = await iterator.next();
    if (done) return;

    if ((index - start) % step === 0) {
      yield value;
    }

    index++;
  }
}

export async function* enumerate<T>(
  asyncIterable: AsyncIterable<T> | AsyncIterableIterator<T>,
): AsyncGenerator<[number, T]> {
  const iterator = asyncIterable[Symbol.asyncIterator]();
  let cursor = 0;

  while (true) {
    const current = await iterator.next();
    if (current.done) return;

    yield [cursor++, current.value];
  }
}

export async function* zip(...asyncIterables: AsyncIterable<unknown>[]): AsyncGenerator<unknown[]> {
  const iterators = asyncIterables.map((iterable) => iterable[Symbol.asyncIterator]());

  while (true) {
    const results = await Promise.all(iterators.map((iterator) => iterator.next()));

    if (results.some((result) => result.done)) {
      return;
    }

    yield results.map((result) => result.value);
  }
}
