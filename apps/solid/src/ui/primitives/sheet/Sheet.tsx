import { Dialog as DialogPrimitive } from '@kobalte/core/dialog'
import { type JSX, splitProps } from 'solid-js'

export type SheetProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: JSX.Element
}

export function Sheet(props: SheetProps) {
  const [local] = splitProps(props, ['open', 'onOpenChange', 'children'])

  return (
    <DialogPrimitive open={local.open} onOpenChange={local.onOpenChange}>
      {local.children}
    </DialogPrimitive>
  )
}
