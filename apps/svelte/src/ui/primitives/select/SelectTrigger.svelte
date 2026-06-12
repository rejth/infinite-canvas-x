<script lang="ts">
import { Select } from 'bits-ui'
import { ChevronDown } from 'lucide-svelte'

import { cn } from '@/shared/lib/utils'

let { class: className, value }: { class?: string; value?: string } = $props()
</script>

<Select.Trigger
  data-slot="select-trigger"
  class={cn(
    "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9",
    className,
  )}
>
  <span>{value}</span>
  <ChevronDown class="size-4 opacity-50" />
</Select.Trigger>
