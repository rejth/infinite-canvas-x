import { setByPath } from '@/core/lib';
import { filter, map, slice, take } from '@/core/lib/async-generators';

import { StoreName } from '../interfaces';

type TransactionOperation<T> = (stores: { objectStore: IDBObjectStore }) => Promise<T>;

export abstract class BaseStore {
  constructor(
    protected readonly db: IDBDatabase,
    protected readonly storeName: StoreName,
  ) {}

  protected createReadTransaction(): IDBObjectStore {
    return this.db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
  }

  protected createWriteTransaction(): IDBTransaction {
    return this.db.transaction(this.storeName, 'readwrite');
  }

  protected createWriteObjectStore() {
    const transaction = this.createWriteTransaction();

    return {
      transaction,
      objectStore: transaction.objectStore(this.storeName),
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
    const { objectStore, transaction } = this.createWriteObjectStore();

    try {
      const result = await operation({ objectStore });

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

  async count(): Promise<number> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.count());
  }

  async get<T>(id: IDBValidKey): Promise<T> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.get(id));
  }

  async getAll<T>(): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAll());
  }

  async getAllFromTo<T>(fromId: IDBValidKey, toId: IDBValidKey): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAll(IDBKeyRange.bound(fromId, toId)));
  }

  async getAllFrom<T>(fromId: IDBValidKey): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAll(IDBKeyRange.lowerBound(fromId, true)));
  }

  async getAllKeysFrom(fromId: IDBValidKey): Promise<IDBValidKey[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAllKeys(IDBKeyRange.lowerBound(fromId, true)));
  }

  async getAllTo<T>(toId: IDBValidKey): Promise<T[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAll(IDBKeyRange.upperBound(toId, true)));
  }

  async getAllKeysTo(toId: IDBValidKey): Promise<IDBValidKey[]> {
    const objectStore = this.createReadTransaction();
    return this.handleRequest(objectStore.getAllKeys(IDBKeyRange.upperBound(toId, true)));
  }

  async add<T>(object: T): Promise<IDBValidKey> {
    return this.withTransaction<IDBValidKey>(async ({ objectStore }) => {
      const result = await this.handleRequest<IDBValidKey>(objectStore.add(object));
      return result;
    });
  }

  async bulkAdd<T>(objects: T[]): Promise<IDBValidKey[]> {
    return this.withTransaction<IDBValidKey[]>(async ({ objectStore }) => {
      const requests = objects.map((object) => {
        return this.handleRequest<IDBValidKey>(objectStore.add(object));
      });

      const results = await Promise.all(requests);

      return results;
    });
  }

  async put<T>(object: T): Promise<IDBValidKey> {
    return this.withTransaction<IDBValidKey>(async ({ objectStore }) => {
      const result = await this.handleRequest<IDBValidKey>(objectStore.put(object));
      return result;
    });
  }

  async bulkPut<T>(objects: T[]): Promise<IDBValidKey[]> {
    return this.withTransaction<IDBValidKey[]>(async ({ objectStore }) => {
      const requests = objects.map((object) => {
        return this.handleRequest<IDBValidKey>(objectStore.put(object));
      });

      const results = await Promise.all(requests);

      return results;
    });
  }

  async delete(id: IDBValidKey): Promise<void> {
    return this.withTransaction<void>(async ({ objectStore }) => {
      const result = await this.handleRequest<void>(objectStore.delete(id));
      return result;
    });
  }

  async bulkDelete(ids: IDBValidKey[]): Promise<void[]> {
    return this.withTransaction<void[]>(async ({ objectStore }) => {
      const requests = ids.map((id) => {
        return this.handleRequest<void>(objectStore.delete(id));
      });

      const results = await Promise.all(requests);

      return results;
    });
  }

  async clear(): Promise<void> {
    return this.withTransaction<void>(async ({ objectStore }) => {
      const result = await this.handleRequest<void>(objectStore.clear());
      return result;
    });
  }

  mapAll<T, R>(mappers: Array<(value: T) => R>): AsyncGenerator<R> {
    return map<T, R>(this.createReadCursorIterator<T>(), mappers);
  }

  findAllBy<T>(predicate: (value: T) => boolean): AsyncGenerator<T> {
    return filter(this.createReadCursorIterator<T>(), predicate);
  }

  takeByLimit<T>(limit: number): AsyncGenerator<T> {
    return take(this.createReadCursorIterator<T>(), limit);
  }

  reduce<T, R>(predicate: (value: T) => boolean, mappers: Array<(value: T) => R>): AsyncGenerator<R> {
    return map<T, R>(filter(this.createReadCursorIterator<T>(), predicate), mappers);
  }

  sliceBy<T>(start: number, stop: number, step: number = 1): AsyncGenerator<T> {
    return slice(this.createReadCursorIterator<T>(), start, stop, step);
  }

  update<T>(id: IDBValidKey, newValue: Partial<T>) {
    const { objectStore, transaction } = this.createWriteObjectStore();
    const cursorRequest = objectStore.openCursor();

    cursorRequest.onsuccess = (event: Event) => {
      const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;

      if (!cursor) {
        transaction.abort();
        return;
      }
      if (cursor.value.id === id) {
        cursor.update({ ...cursor.value, ...newValue });
        return;
      }

      cursor.continue();
    };

    cursorRequest.onerror = () => {
      transaction.abort();
      throw cursorRequest.error;
    };
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

  updateByPath(id: IDBValidKey, path: string, value: unknown) {
    const { objectStore, transaction } = this.createWriteObjectStore();
    const cursorRequest = objectStore.openCursor();

    cursorRequest.onsuccess = (event: Event) => {
      const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;

      if (!cursor) {
        transaction.abort();
        return;
      }
      if (cursor.value.id === id) {
        setByPath(cursor.value, path, value);
        cursor.update(cursor.value);
        return;
      }

      cursor.continue();
    };

    cursorRequest.onerror = () => {
      transaction.abort();
      throw cursorRequest.error;
    };
  }
}
