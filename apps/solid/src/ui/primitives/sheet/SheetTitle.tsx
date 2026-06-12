import { Dialog as DialogPrimitive } from '@kobalte/core/dialog'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type SheetTitleProps = {
  class?: string
  children?: JSX.Element
}

export function SheetTitle(props: SheetTitleProps) {
  const [local] = splitProps(props, ['class', 'children'])

  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      class={cn('text-foreground font-semibold', local.class)}
    >
      {local.children}
    </DialogPrimitive.Title>
  )
}
