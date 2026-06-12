import { type JSX, splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type SheetHeaderProps = {
  class?: string
  children?: JSX.Element
}

export function SheetHeader(props: SheetHeaderProps) {
  const [local] = splitProps(props, ['class', 'children'])

  return (
    <div data-slot="sheet-header" class={cn('flex flex-col gap-1.5 p-4', local.class)}>
      {local.children}
    </div>
  )
}
