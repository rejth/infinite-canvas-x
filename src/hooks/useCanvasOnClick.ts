import { Tools } from '@/shared/interfaces'

import { useCreateImage } from '@/hooks/useCreateImage'
import { useCreateSticker } from '@/hooks/useCreateSticker'
import { useCreateTextArea } from '@/hooks/useCreateTextArea'
import { useSelectTool } from '@/hooks/useSelectTool'
import { useCanvasContext, useImageEditorContext, useToolbarContext } from '@/store'

export const useCanvasOnClick = () => {
  const { camera } = useCanvasContext()
  const { tool } = useToolbarContext()
  const { image } = useImageEditorContext()

  const createSticker = useCreateSticker()
  const createImage = useCreateImage()
  const selectTool = useSelectTool()
  const createTextArea = useCreateTextArea()

  return (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!camera) return

    const currentTransformedPosition = camera.handleClick(e.nativeEvent)

    if (tool === Tools.STICKER) {
      createSticker(e, currentTransformedPosition)
    } else if (tool === Tools.TEXT) {
      createTextArea(e, currentTransformedPosition)
    } else if (tool === Tools.IMAGE && image instanceof ImageBitmap) {
      createImage(e, currentTransformedPosition, image)
    } else if (tool === Tools.SELECT) {
      selectTool(e, currentTransformedPosition)
    }
  }
}
