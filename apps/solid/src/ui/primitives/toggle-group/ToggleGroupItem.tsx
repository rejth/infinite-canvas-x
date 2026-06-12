import { ToggleGroup as ToggleGroupPrimitive } from '@kobalte/core/toggle-group'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

import { useToggleGroupContext } from './toggleGroupContext'
import { toggleItemClasses } from './toggleVariants'

export type ToggleGroupItemProps = {
  value: string
  class?: string
  children?: JSX.Element
  'aria-label'?: string
  onClick?: (event: MouseEvent) => void
}

export function ToggleGroupItem(props: ToggleGroupItemProps) {
  const [local, rest] = splitProps(props, ['value', 'class', 'children', 'aria-label', 'onClick'])
  const context = useToggleGroupContext()

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      value={local.value}
      class={toggleItemClasses(context.variant, context.size, cn('cursor-pointer', local.class))}
      aria-label={local['aria-label']}
      onClick={local.onClick}
      {...rest}
    >
      {local.children}
    </ToggleGroupPrimitive.Item>
  )
}
