<script lang="ts">
import { Select } from 'bits-ui'
import { Check } from 'lucide-svelte'
import type { Snippet } from 'svelte'

import { cn } from '@/shared/lib/utils'

let {
  value,
  class: className,
  children: itemLabel,
}: {
  value: string
  class?: string
  children?: Snippet
} = $props()
</script>

<Select.Item
  data-slot="select-item"
  {value}
  label={value}
  class={cn(
    'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    className,
  )}
>
  {#snippet children({ selected })}
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      {#if selected}
        <Check class="size-4" />
      {/if}
    </span>
    {@render itemLabel?.()}
  {/snippet}
</Select.Item>
