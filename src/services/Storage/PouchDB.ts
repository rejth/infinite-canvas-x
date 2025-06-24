import PouchDB from 'pouchdb';

// Environment-based configuration
const isDev = import.meta.env.DEV;
const dbName = 'canvas-db';
const remoteDBUrl = isDev ? `https://admin:password@localhost:5984/${dbName}` : `https://your-cloudant-url/${dbName}`; // Replace later

// Local database
const localDB = new PouchDB(dbName);

// Remote database
const remoteDB = new PouchDB(remoteDBUrl);

// Set up bidirectional data replication (local <-> remote). Only when online
let sync: PouchDB.Replication.Sync<object> | null = null;

function startSync() {
  if (navigator.onLine && !sync) {
    sync = localDB
      .sync(remoteDB, {
        live: true,
        retry: true,
        batch_size: 50, // Good for canvas data
      })
      .on('change', (info) => {
        console.log('Canvas data synced:', info.change.docs.length, 'items');
      })
      .on('paused', (info) => {
        console.log('Sync paused:', info);
      })
      .on('denied', (info) => {
        console.log('Sync denied:', info);
      })
      .on('error', (e) => {
        console.warn('Sync paused due to the error:', e);
        sync = null;
      });
  }
}

function stopSync() {
  if (sync) {
    sync.cancel();
    sync = null;
  }
}

window.addEventListener('online', startSync);
window.addEventListener('offline', stopSync);

if (navigator.onLine) {
  startSync();
}

localDB.info().then((info) => {
  console.log('Local database info:', info);
});

export { localDB, remoteDB, startSync, stopSync };
