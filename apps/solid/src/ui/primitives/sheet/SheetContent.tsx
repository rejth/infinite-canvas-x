import { Dialog as DialogPrimitive } from '@kobalte/core/dialog'
import X from 'lucide-solid/icons/x'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type SheetContentProps = {
  side?: 'top' | 'right' | 'bottom' | 'left'
  class?: string
  style?: string | JSX.CSSProperties
  children?: JSX.Element
}

export function SheetContent(props: SheetContentProps) {
  const [local] = splitProps(props, ['side', 'class', 'style', 'children'])

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Content
        data-slot="sheet-content"
        class={cn(
          'bg-background data-[expanded]:animate-in data-[closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[closed]:duration-300 data-[expanded]:duration-500',
          local.side === 'right' &&
            'data-[closed]:slide-out-to-right data-[expanded]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          local.side === 'left' &&
            'data-[closed]:slide-out-to-left data-[expanded]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          local.class,
        )}
        style={local.style}
      >
        {local.children}
        <DialogPrimitive.CloseButton class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden">
          <X class="size-4" />
          <span class="sr-only">Close</span>
        </DialogPrimitive.CloseButton>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
