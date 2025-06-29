import PouchDB from 'pouchdb';

export class PouchDBService {
  private static instance: PouchDBService | null = null;

  private localDB: PouchDB.Database | null = null;
  private remoteDB: PouchDB.Database | null = null;
  private sync: PouchDB.Replication.Sync<object> | null = null;

  private readonly isDev = import.meta.env.DEV;
  private readonly dbName = 'canvas-db';
  private readonly localUrl = 'http://localhost:5984'; // go to http://localhost:5984/_utils/ for CouchDB UI
  private readonly remoteUrl = 'https://cad87b3c-1469-48af-8e0b-bda83cb4afce-bluemix.cloudantnosqldb.appdomain.cloud/';
  private readonly remoteDBUrl: string;

  private constructor() {
    this.remoteDBUrl = this.isDev ? `${this.localUrl}/${this.dbName}` : `${this.remoteUrl}/${this.dbName}`;
  }

  static async create(): Promise<PouchDBService> {
    if (PouchDBService.instance) {
      return PouchDBService.instance;
    }

    const instance = new PouchDBService();
    await instance.initialize();
    PouchDBService.instance = instance;

    return instance;
  }

  private async initialize(): Promise<void> {
    this.localDB = new PouchDB(this.dbName);
    this.remoteDB = new PouchDB(this.remoteDBUrl);

    this.setupNetworkListeners();

    if (navigator.onLine) {
      this.startSync();
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => this.startSync());
    window.addEventListener('offline', () => this.stopSync());
  }

  private startSync() {
    if (!this.localDB || !this.remoteDB || !navigator.onLine || this.sync) {
      return;
    }

    this.sync = this.localDB
      .sync(this.remoteDB, {
        live: true,
        retry: true,
        batch_size: 50, // TODO: figure out the best batch size
      })
      .on('change', (info) => {
        console.log('Sync change:', info);
      })
      .on('paused', () => {})
      .on('denied', () => {})
      .on('error', () => {
        this.sync = null;
      });
  }

  private stopSync() {
    if (this.sync) {
      this.sync.cancel();
      this.sync = null;
    }
  }

  getLocalDB(): PouchDB.Database | null {
    return this.localDB;
  }

  getRemoteDB(): PouchDB.Database | null {
    return this.remoteDB;
  }

  async destroy(): Promise<void> {
    this.stopSync();

    if (this.localDB) {
      await this.localDB.close();
    }

    PouchDBService.instance = null;
  }
}
