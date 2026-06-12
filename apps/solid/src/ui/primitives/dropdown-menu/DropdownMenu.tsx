import { DropdownMenu as DropdownMenuPrimitive } from '@kobalte/core/dropdown-menu'
import { type JSX, splitProps } from 'solid-js'

export type DropdownMenuProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: JSX.Element
}

export function DropdownMenu(props: DropdownMenuProps) {
  const [local] = splitProps(props, ['open', 'onOpenChange', 'children'])

  return (
    <DropdownMenuPrimitive open={local.open} onOpenChange={local.onOpenChange}>
      {local.children}
    </DropdownMenuPrimitive>
  )
}
