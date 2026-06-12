<script lang="ts">
import { Select } from 'bits-ui'
import type { Snippet } from 'svelte'

import { cn } from '@/shared/lib/utils'

let { class: className, children }: { class?: string; children?: Snippet } = $props()
</script>

<Select.Portal>
  <Select.Content
    data-slot="select-content"
    class={cn(
      'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md',
      className,
    )}
  >
    <div class="p-1">
      {@render children?.()}
    </div>
  </Select.Content>
</Select.Portal>
