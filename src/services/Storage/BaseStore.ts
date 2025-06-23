import { setByPath } from '@/lib/utils';
import { StoreName, LogType } from './interfaces';

type TransactionOperation<T> = (stores: { objectStore: IDBObjectStore; logStore: IDBObjectStore }) => Promise<T>;

export abstract class BaseStore {
  constructor(
    protected readonly db: IDBDatabase,
    protected readonly storeName: StoreName,
  ) {}

  protected createReadTransaction(): IDBObjectStore {
    return this.db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
  }

  protected createWriteTransaction(): IDBTransaction {
    return this.db.transaction([this.storeName, StoreName.LOG], 'readwrite');
  }

  protected createWriteObjectStore() {
    const transaction = this.createWriteTransaction();

    return {
      transaction,
      objectStore: transaction.objectStore(this.storeName),
      logStore: transaction.objectStore(StoreName.LOG),
    };
  }

  protected createReadCursorIterator<T>(): AsyncIterableIterator<T> {
    const objectStore = this.createReadTransaction();
    const cursorRequest = objectStore.openCursor();

    return {
      [Symbol.asyncIterator]() {
        return this;
      },

      async next(): Promise<IteratorResult<T>> {
        return new Promise((resolve) => {
          cursorRequest.onsuccess = (event: Event) => {
            const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;

            if (!cursor) {
              resolve({ done: true, value: undefined });
              return;
            }

            resolve({ done: false, value: cursor.value });
            cursor.continue();
          };

          cursorRequest.onerror = () => {
            resolve({ done: true, value: undefined });
          };
        });
      },
    };
  }

  protected async log(result: unknown, logStore: IDBObjectStore, type: LogType) {
    await this.handleRequest(logStore.add({ id: result, type, time: Date.now() }));
  }

  protected async handleRequest<T>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestEvent = 'oncomplete' in request ? 'complete' : 'success';

      const onSuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result);
        request.removeEventListener('error', onError);
      };

      const onError = (event: Event) => {
        reject((event.target as IDBRequest).error);
        request.removeEventListener(requestEvent, onSuccess);
      };

      request.addEventListener(requestEvent, onSuccess, { once: true });
      request.addEventListener('error', onError, { once: true });
    });
  }

  protected async withTransaction<T>(operation: TransactionOperation<T>): Promise<T> {
    const { objectStore, logStore, transaction } = this.createWriteObjectStore();

    try {
      const result = await operation({ objectStore, logStore });

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });

      return result;
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  protected async *map<T, R>(iterable: AsyncIterable<T>, mappers: Array<(value: T) => R>): AsyncGenerator<R> {
    for await (const value of iterable) {
      const mapperIterator = mappers[Symbol.iterator]();
      let mapper = mapperIterator.next();

      while (!mapper.done) {
        yield mapper.value(value);
        mapper = mapperIterator.next();
      }
    }
  }

  protected async *filter<T>(iterable: AsyncIterable<T>, onFilter: (value: T) => boolean): AsyncGenerator<T> {
    const iterator = iterable[Symbol.asyncIterator]();

    while (true) {
      const { done, value } = await iterator.next();
      if (done) return;
      if (onFilter(value)) yield value;
    }
  }

  protected async *take<T>(iterable: AsyncIterable<T>, limit: number): AsyncGenerator<T> {
    const iterator = iterable[Symbol.asyncIterator]();
    let cursor = 0;

    while (limit !== cursor++) {
      const { value } = await iterator.next();
      yield value;
    }
  }

  protected async *slice<T>(
    iterable: AsyncIterable<T>,
    start: number,
    stop: number,
    step: number = 1,
  ): AsyncGenerator<T> {
    const iterator = iterable[Symbol.asyncIterator]();
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

  async count(): Promise<number> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.count());
  }

  async get<T>(id: number): Promise<T> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.get(id));
  }

  async getAll<T>(): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAll());
  }

  async getAllFromTo<T>(start: number, end: number): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAll(IDBKeyRange.bound(start, end)));
  }

  async getAllFrom<T>(fromId: number): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAll(IDBKeyRange.lowerBound(fromId, true)));
  }

  async getAllKeysFrom<T>(fromId: number): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAllKeys(IDBKeyRange.lowerBound(fromId, true)));
  }

  async getAllTo<T>(toId: number): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAll(IDBKeyRange.upperBound(toId, true)));
  }

  async getAllKeysTo<T>(toId: number): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAllKeys(IDBKeyRange.upperBound(toId, true)));
  }

  async add<T>(object: T) {
    return this.withTransaction(async ({ objectStore, logStore }) => {
      const result = await this.handleRequest(objectStore.add(object));
      await this.log(result, logStore, LogType.ADD);
      return result;
    });
  }

  async batchAdd<T>(objects: T[]) {
    return this.withTransaction(async ({ objectStore, logStore }) => {
      const requests = objects.map((object) => {
        return this.handleRequest(objectStore.add(object));
      });

      const results = await Promise.all(requests);

      await Promise.all(results.map((result) => this.log(result, logStore, LogType.ADD)));

      return results;
    });
  }

  async put<T>(object: T) {
    return this.withTransaction(async ({ objectStore, logStore }) => {
      const result = await this.handleRequest(objectStore.put(object));
      await this.log(result, logStore, LogType.PUT);
      return result;
    });
  }

  async batchPut<T>(objects: T[]) {
    return this.withTransaction(async ({ objectStore, logStore }) => {
      const requests = objects.map((object) => {
        return this.handleRequest(objectStore.put(object));
      });

      const results = await Promise.all(requests);

      await Promise.all(results.map((result) => this.log(result, logStore, LogType.PUT)));

      return results;
    });
  }

  async delete(id: number) {
    return this.withTransaction(async ({ objectStore, logStore }) => {
      const result = await this.handleRequest(objectStore.delete(id));
      await this.log(result, logStore, LogType.DELETE);
      return result;
    });
  }

  async batchDelete(ids: number[]) {
    return this.withTransaction(async ({ objectStore, logStore }) => {
      const requests = ids.map((id) => {
        return this.handleRequest(objectStore.delete(id));
      });

      const results = await Promise.all(requests);

      await Promise.all(results.map((result) => this.log(result, logStore, LogType.DELETE)));

      return results;
    });
  }

  async clear() {
    return this.withTransaction(async ({ objectStore }) => {
      const result = await this.handleRequest(objectStore.clear());
      return result;
    });
  }

  mapAll<T, R>(mappers: Array<(value: T) => R>): AsyncGenerator<R> {
    return this.map<T, R>(this.createReadCursorIterator<T>(), mappers);
  }

  findAllBy<T>(predicate: (value: T) => boolean): AsyncGenerator<T> {
    return this.filter(this.createReadCursorIterator<T>(), predicate);
  }

  takeByLimit<T>(limit: number): AsyncGenerator<T> {
    return this.take(this.createReadCursorIterator<T>(), limit);
  }

  findAndMapAllBy<T, R>(predicate: (value: T) => boolean, mappers: Array<(value: T) => R>): AsyncGenerator<R> {
    return this.map<T, R>(this.filter(this.createReadCursorIterator<T>(), predicate), mappers);
  }

  sliceBy<T>(start: number, stop: number, step: number = 1): AsyncGenerator<T> {
    return this.slice(this.createReadCursorIterator<T>(), start, stop, step);
  }

  updateAll<T>(newValue: Partial<T>) {
    const { objectStore, transaction } = this.createWriteObjectStore();
    const cursorRequest = objectStore.openCursor();

    cursorRequest.onsuccess = (event: Event) => {
      const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;

      if (!cursor) {
        transaction.abort();
        return;
      }

      cursor.update({ ...cursor.value, ...newValue });
      cursor.continue();
    };

    cursorRequest.onerror = () => {
      transaction.abort();
      throw cursorRequest.error;
    };
  }

  updateAllByPath(path: string, value: unknown) {
    const { objectStore, transaction } = this.createWriteObjectStore();
    const cursorRequest = objectStore.openCursor();

    cursorRequest.onsuccess = (event: Event) => {
      const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;

      if (!cursor) {
        transaction.abort();
        return;
      }

      setByPath(cursor.value, path, value);
      cursor.update(cursor.value);
      cursor.continue();
    };

    cursorRequest.onerror = () => {
      transaction.abort();
      throw cursorRequest.error;
    };
  }
}
