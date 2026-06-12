import { DropdownMenu as DropdownMenuPrimitive } from '@kobalte/core/dropdown-menu'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type DropdownMenuContentProps = {
  class?: string
  children?: JSX.Element
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const [local] = splitProps(props, ['class', 'children'])

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        class={cn(
          'bg-popover text-popover-foreground data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 z-[100] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
          local.class,
        )}
      >
        {local.children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}
