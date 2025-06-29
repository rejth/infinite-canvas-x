const createSchema = (db: IDBDatabase) => {
  db.createObjectStore('canvas-state', { keyPath: 'id', autoIncrement: true });
};

export const v1 = {
  createSchema,
};
