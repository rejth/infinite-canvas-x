import { Menubar as MenubarPrimitive } from '@kobalte/core/menubar'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type MenubarProps = {
  class?: string
  tabIndex?: number
  children?: JSX.Element
}

export function Menubar(props: MenubarProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])

  return (
    <MenubarPrimitive
      data-slot="menubar"
      class={cn(
        'bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </MenubarPrimitive>
  )
}
