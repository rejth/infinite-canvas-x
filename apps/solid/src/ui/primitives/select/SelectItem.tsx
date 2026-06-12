import { Select as SelectPrimitive } from '@kobalte/core/select'
import Check from 'lucide-solid/icons/check'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type SelectItemProps = {
  value: string
  class?: string
  children?: JSX.Element
}

/** Optional custom item renderer when not using the `options` prop on Select. */
export function SelectItem(props: SelectItemProps) {
  const [local] = splitProps(props, ['value', 'class', 'children'])

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      item={local.value as unknown as Parameters<typeof SelectPrimitive.Item>[0]['item']}
      class={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        local.class,
      )}
    >
      <SelectPrimitive.ItemLabel>{local.children ?? local.value}</SelectPrimitive.ItemLabel>
      <SelectPrimitive.ItemIndicator class="absolute right-2 flex size-3.5 items-center justify-center">
        <Check class="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
