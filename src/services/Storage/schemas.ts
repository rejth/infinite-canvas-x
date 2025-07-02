import { StoreName } from './interfaces';

const createSchema = (db: IDBDatabase) => {
  db.createObjectStore(StoreName.CANVAS_STATE, { keyPath: 'id', autoIncrement: true });
};

export const v1 = {
  createSchema,
};
