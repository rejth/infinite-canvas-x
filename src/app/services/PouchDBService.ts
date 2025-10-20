import PouchDB from 'pouchdb';

export class PouchDBService {
  private localDB: PouchDB.Database | null = null;

  private static instance: PouchDBService | null = null;

  private constructor() {}

  get database(): PouchDB.Database | null {
    return this.localDB;
  }

  static async create(dbName: string): Promise<PouchDBService> {
    if (PouchDBService.instance) {
      return PouchDBService.instance;
    }

    const instance = new PouchDBService();
    PouchDBService.instance = instance;

    await instance.initialize(dbName);
    return instance;
  }

  static getInstance(): PouchDBService | null {
    return PouchDBService.instance;
  }

  static getDatabase(): PouchDB.Database | null | undefined {
    return PouchDBService.getInstance()?.database;
  }

  private async initialize(dbName: string): Promise<void> {
    this.localDB = new PouchDB(dbName);
  }

  async destroy(): Promise<void> {
    if (this.localDB) {
      await this.localDB.close();
    }
  }
}
