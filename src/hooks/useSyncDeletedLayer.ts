import { useCallback } from 'react'
import { LayerInterface } from '@infinite-canvas-x/canvas-engine'

import { PouchDBService } from '@/services/PouchDBService'

export const useSyncDeletedLayer = () => {
  return useCallback(async (layer: LayerInterface) => {
    const pouchdb = PouchDBService.getDatabase()
    if (!pouchdb) return

    const docId = layer.getId()
    if (!docId) return

    pouchdb.get(String(docId)).then((doc) => {
      if (!doc) return
      pouchdb.remove(doc)
    })
  }, [])
}
