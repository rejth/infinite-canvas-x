import { useCallback } from 'react'
import { LayerSerializer } from '@infinite-canvas-x/canvas-engine'

import { LayerDocument } from '@/app/services/interfaces'
import { PouchDBService } from '@/app/services/PouchDBService'
import { useCanvasContext } from '@/app/store'

export const useRestoreCanvasState = () => {
  const { renderManager } = useCanvasContext()

  return useCallback(async () => {
    if (!renderManager) return

    const pouchdb = PouchDBService.getDatabase()
    if (!pouchdb) return

    pouchdb.allDocs({ include_docs: true }).then((docs) => {
      const { rows, total_rows } = docs

      if (total_rows === 0) {
        renderManager.reDrawOnNextFrame()
        return
      }

      const layers = rows
        .map((row) => LayerSerializer.deserialize(row.doc as LayerDocument))
        .filter((layer) => layer !== null)

      renderManager.bulkAdd([...layers])
      renderManager.reDrawOnNextFrame({ forceRender: true })
    })
  }, [renderManager])
}
