import { Select as SelectPrimitive } from '@kobalte/core/select'
import { splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type SelectContentProps = {
  class?: string
}

export function SelectContent(props: SelectContentProps) {
  const [local] = splitProps(props, ['class'])

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        class={cn(
          'bg-popover text-popover-foreground data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md',
          local.class,
        )}
      >
        <SelectPrimitive.Listbox class="p-1" />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}
