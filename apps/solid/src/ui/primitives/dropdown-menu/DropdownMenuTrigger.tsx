import { DropdownMenu as DropdownMenuPrimitive } from '@kobalte/core/dropdown-menu'
import { type JSX, splitProps } from 'solid-js'

export type DropdownMenuTriggerProps = {
  as?: 'button' | 'div'
  class?: string
  children?: JSX.Element
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const [local, rest] = splitProps(props, ['as', 'class', 'children'])

  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      as={local.as ?? 'button'}
      class={local.class}
      {...rest}
    >
      {local.children}
    </DropdownMenuPrimitive.Trigger>
  )
}
