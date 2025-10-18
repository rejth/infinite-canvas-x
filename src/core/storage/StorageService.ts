import { CanvasStateStore } from './CanvasStateStore';
import { generateMockData } from './tests/testData';
import { v1 } from './schemas';

import { StoreName } from './interfaces';

export class StorageService {
  private static instance: StorageService | null = null;

  private db: IDBDatabase | null = null;
  private canvasStateStore: CanvasStateStore | null = null;
  private readonly name = 'canvas-db';
  private readonly version = 1;

  private constructor() {}

  get database(): IDBDatabase | null {
    return this.db;
  }

  get canvasState(): CanvasStateStore {
    return this.canvasStateStore!;
  }

  static async create(): Promise<StorageService> {
    if (StorageService.instance) {
      return StorageService.instance;
    }

    const instance = new StorageService();
    await instance.initialize();
    StorageService.instance = instance;

    return instance;
  }

  private async initialize(): Promise<void> {
    try {
      this.db = await this.openConnection();
      this.canvasStateStore = new CanvasStateStore(this.db, StoreName.CANVAS_STATE);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private openConnection(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const connection = indexedDB.open(this.name, this.version);

      connection.onupgradeneeded = async (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;

        switch (event.oldVersion) {
          case 0:
            v1.createSchema(db);
            generateMockData(transaction);
            break;
          default:
            break;
        }
      };

      connection.onsuccess = function () {
        const db = connection.result;
        resolve(db);

        db.onclose = function () {
          alert('Database connection closed. Please reload the page.');
        };

        db.onversionchange = function () {
          db.close();
          alert('Database is outdated. Please reload the page.');
        };
      };

      connection.onerror = function () {
        reject(connection.error);
      };

      connection.onblocked = function () {
        alert(
          "Database is outdated. The newer version can't be loaded until you close other tabs. Please reload the page.",
        );
      };
    });
  }
}
