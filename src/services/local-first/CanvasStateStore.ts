import { BaseStore } from 'tiny-idb-store'

import { StoreName } from './interfaces'

export class CanvasStateStore extends BaseStore {
  constructor(db: IDBDatabase, storeName: StoreName) {
    super(db, storeName)
  }
}
