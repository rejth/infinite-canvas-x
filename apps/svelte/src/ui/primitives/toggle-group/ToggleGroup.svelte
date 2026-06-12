<script lang="ts">
import { ToggleGroup } from 'bits-ui'
import type { Snippet } from 'svelte'

import { cn } from '@/shared/lib/utils'

import { setToggleGroupContext } from './toggleGroupContext'
import type { ToggleVariants } from './toggleVariants'

type Props = {
  type?: 'single' | 'multiple'
  value?: string | string[]
  variant?: ToggleVariants['variant']
  size?: ToggleVariants['size']
  class?: string
  children?: Snippet
}

let {
  type = 'single',
  value = $bindable<string | string[]>(type === 'multiple' ? [] : ''),
  variant = 'default',
  size = 'default',
  class: className,
  children,
}: Props = $props()

$effect(() => {
  setToggleGroupContext({ variant, size })
})
</script>

{#if type === 'multiple'}
  <ToggleGroup.Root
    data-slot="toggle-group"
    type="multiple"
    bind:value={value as string[]}
    data-variant={variant}
    data-size={size}
    class={cn(
      'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
      className,
    )}
  >
    {@render children?.()}
  </ToggleGroup.Root>
{:else}
  <ToggleGroup.Root
    data-slot="toggle-group"
    type="single"
    bind:value={value as string}
    data-variant={variant}
    data-size={size}
    class={cn(
      'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
      className,
    )}
  >
    {@render children?.()}
  </ToggleGroup.Root>
{/if}
