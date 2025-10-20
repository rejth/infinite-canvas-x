import PouchDB from 'pouchdb';

export class PouchDBOnlineService {
  private localDB: PouchDB.Database | null = null;
  private remoteDB: PouchDB.Database | null = null;
  private sync: PouchDB.Replication.Sync<object> | null = null;

  private readonly isDev = import.meta.env.DEV;
  private readonly localUrl = 'http://localhost:5984'; // go to http://localhost:5984/_utils/ for CouchDB UI
  private readonly remoteUrl = 'https://my.cloudant.com/'; // go to https://cloud.ibm.com/ for IBM Cloudant
  private readonly remoteDBUrl: string;

  private static instance: PouchDBOnlineService | null = null;

  private constructor(dbName: string) {
    this.remoteDBUrl = this.isDev ? `${this.localUrl}/${dbName}` : `${this.remoteUrl}/${dbName}`;
    this.startSync = this.startSync.bind(this);
    this.stopSync = this.stopSync.bind(this);
  }

  get database(): PouchDB.Database | null {
    return this.localDB;
  }

  static async create(dbName: string): Promise<PouchDBOnlineService> {
    if (PouchDBOnlineService.instance) {
      return PouchDBOnlineService.instance;
    }

    const instance = new PouchDBOnlineService(dbName);
    PouchDBOnlineService.instance = instance;

    await instance.initialize(dbName);
    return instance;
  }

  static getInstance(): PouchDBOnlineService | null {
    return PouchDBOnlineService.instance;
  }

  static getDatabase(): PouchDB.Database | null | undefined {
    return PouchDBOnlineService.getInstance()?.database;
  }

  private async initialize(dbName: string): Promise<void> {
    this.localDB = new PouchDB(dbName);
    this.remoteDB = new PouchDB(this.remoteDBUrl);

    this.setupNetworkListeners();

    if (navigator.onLine) {
      this.startSync();
    }
  }

  private setupNetworkListeners() {
    this.removeNetworkListeners();
    window.addEventListener('online', this.startSync);
    window.addEventListener('offline', this.stopSync);
  }

  private removeNetworkListeners() {
    window.removeEventListener('online', this.startSync);
    window.removeEventListener('offline', this.stopSync);
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

  async destroy(): Promise<void> {
    this.stopSync();
    this.removeNetworkListeners();

    if (this.localDB) {
      await this.localDB.close();
    }
  }
}
