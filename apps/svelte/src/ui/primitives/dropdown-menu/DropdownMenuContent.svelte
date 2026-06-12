<script lang="ts">
import { DropdownMenu } from 'bits-ui'
import type { Snippet } from 'svelte'

import { cn } from '@/shared/lib/utils'

let {
  class: className,
  children,
}: {
  class?: string
  children?: Snippet
} = $props()
</script>

<DropdownMenu.Portal>
  <DropdownMenu.Content
    data-slot="dropdown-menu-content"
    sideOffset={4}
    class={cn(
      'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[100] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
      className,
    )}
  >
    {@render children?.()}
  </DropdownMenu.Content>
</DropdownMenu.Portal>
