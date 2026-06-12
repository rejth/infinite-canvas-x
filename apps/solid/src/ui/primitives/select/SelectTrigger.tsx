import { Select as SelectPrimitive } from '@kobalte/core/select'
import ChevronDown from 'lucide-solid/icons/chevron-down'
import { splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type SelectTriggerProps = {
  class?: string
  value?: string
}

export function SelectTrigger(props: SelectTriggerProps) {
  const [local] = splitProps(props, ['class', 'value'])

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      class={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9",
        local.class,
      )}
    >
      <SelectPrimitive.Value>{local.value}</SelectPrimitive.Value>
      <ChevronDown class="size-4 opacity-50" />
    </SelectPrimitive.Trigger>
  )
}
