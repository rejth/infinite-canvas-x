import { ToggleGroup as ToggleGroupPrimitive } from '@kobalte/core/toggle-group'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

import { ToggleGroupProvider } from './toggleGroupContext'
import type { ToggleVariants } from './toggleVariants'

export type ToggleGroupProps = {
  type?: 'single' | 'multiple'
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  variant?: ToggleVariants['variant']
  size?: ToggleVariants['size']
  class?: string
  children?: JSX.Element
}

export function ToggleGroup(props: ToggleGroupProps) {
  const [local] = splitProps(props, [
    'type',
    'value',
    'onChange',
    'variant',
    'size',
    'class',
    'children',
  ])

  const groupClass = cn(
    'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
    local.class,
  )

  return (
    <ToggleGroupProvider variant={local.variant} size={local.size}>
      {local.type === 'multiple' ? (
        <ToggleGroupPrimitive
          data-slot="toggle-group"
          multiple
          value={(local.value as string[]) ?? []}
          onChange={local.onChange as (value: string[]) => void}
          data-variant={local.variant ?? 'default'}
          data-size={local.size ?? 'default'}
          class={groupClass}
        >
          {local.children}
        </ToggleGroupPrimitive>
      ) : (
        <ToggleGroupPrimitive
          data-slot="toggle-group"
          value={(local.value as string) ?? ''}
          onChange={(value) => local.onChange?.(value ?? '')}
          data-variant={local.variant ?? 'default'}
          data-size={local.size ?? 'default'}
          class={groupClass}
        >
          {local.children}
        </ToggleGroupPrimitive>
      )}
    </ToggleGroupProvider>
  )
}
