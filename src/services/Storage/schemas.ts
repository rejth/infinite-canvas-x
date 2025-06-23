const createSchema = (db: IDBDatabase) => {
  db.createObjectStore('layers', { keyPath: 'id', autoIncrement: true });
  db.createObjectStore('log', { keyPath: ['id', 'type', 'time'] });
  db.createObjectStore('blobs');
};

const updateSchema = (db: IDBDatabase) => {
  db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
};

export const v1 = {
  createSchema,
};

export const v2 = {
  updateSchema,
};
