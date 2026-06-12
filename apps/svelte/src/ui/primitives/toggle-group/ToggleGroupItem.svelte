<script lang="ts">
import { ToggleGroup } from 'bits-ui'
import type { Snippet } from 'svelte'

import { cn } from '@/shared/lib/utils'

import { getToggleGroupContext } from './toggleGroupContext'
import { toggleItemClasses } from './toggleVariants'

let {
  value,
  class: className,
  children,
  onclick,
  ...restProps
}: {
  value: string
  class?: string
  children?: Snippet
  onclick?: (event: MouseEvent) => void
  [key: string]: unknown
} = $props()

const context = getToggleGroupContext()
</script>

<ToggleGroup.Item
  data-slot="toggle-group-item"
  {value}
  class={toggleItemClasses(context.variant, context.size, cn('cursor-pointer', className))}
  {onclick}
  {...restProps}
>
  {@render children?.()}
</ToggleGroup.Item>
