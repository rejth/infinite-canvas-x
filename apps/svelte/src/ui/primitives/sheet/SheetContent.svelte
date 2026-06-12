<script lang="ts">
import { Dialog } from 'bits-ui'
import { X } from 'lucide-svelte'
import type { Snippet } from 'svelte'

import { cn } from '@/shared/lib/utils'

type Props = {
  side?: 'top' | 'right' | 'bottom' | 'left'
  class?: string
  style?: string
  children?: Snippet
}

let { side = 'right', class: className, style, children }: Props = $props()
</script>

<Dialog.Portal>
  <Dialog.Content
    data-slot="sheet-content"
    class={cn(
      'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
      side === 'right' &&
        'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
      side === 'left' &&
        'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
      className,
    )}
    {style}
  >
    {@render children?.()}
    <Dialog.Close
      class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
    >
      <X class="size-4" />
      <span class="sr-only">Close</span>
    </Dialog.Close>
  </Dialog.Content>
</Dialog.Portal>
