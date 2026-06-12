<script lang="ts">
import { CURSORS } from '@/shared/constants'
import type { Tool } from '@/shared/interfaces'
import { Tools } from '@/shared/interfaces'
import { cn } from '@/shared/lib/utils'

import Icon from './Icon.svelte'

import { useCanvasApp } from '@/adapters/svelte/useCanvasApp.svelte'
import { useToolbar } from '@/store/index.svelte'

interface ToolItem {
  id: string
  label: string
  type: Tool
  icon: string
  hoverText: string
  disabled: boolean
}

const tools: ToolItem[] = [
  {
    id: 'note',
    label: 'Note',
    type: Tools.STICKER,
    icon: 'sticker',
    hoverText: 'Drag to add a new sticker',
    disabled: false,
  },
  {
    id: 'text',
    label: 'Text',
    type: Tools.TEXT,
    icon: 'text',
    hoverText: 'Drag to add a new text element',
    disabled: false,
  },
  {
    id: 'pan',
    label: 'Pan',
    type: Tools.HAND,
    icon: 'pan',
    hoverText: 'Panning',
    disabled: false,
  },
  {
    id: 'select',
    label: 'Select',
    type: Tools.SELECT,
    icon: 'select',
    hoverText: 'Selection',
    disabled: false,
  },
  {
    id: 'trash',
    label: 'Delete',
    type: Tools.DELETE,
    icon: 'trash',
    hoverText: 'Delete selected item(s)',
    disabled: false,
  },
]

const getApp = useCanvasApp()
const getToolbar = useToolbar()
const tool = $derived(getToolbar().tool)

function handleClick(selectedTool: Tool) {
  const app = getApp()
  if (!app) return
  const handCursor = selectedTool === Tools.HAND ? CURSORS[Tools.HAND] : undefined
  app.selectToolbarTool(selectedTool, handCursor)
}
</script>

<ul id="toolbar" class="toolbar">
  {#each tools as { id, type, label, icon, hoverText, disabled } (id)}
    <li>
      <button
        {id}
        type="button"
        title={hoverText}
        class={cn('tool', disabled && 'disabled')}
        {disabled}
        onclick={() => handleClick(type)}
      >
        <span class={cn('icon', type === tool && !disabled && 'active')}>
          <Icon name={icon} color={disabled ? 'disabled' : undefined} />
        </span>
        <span class="text">{label}</span>
      </button>
    </li>
  {/each}
</ul>

<style>
  .toolbar {
    position: fixed;
    top: 1rem;
    left: 50%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 1rem;
    padding: 0.5em 0.4em 0.2em;
    box-shadow: 0 2px 6px 0 #00263a0f;
    background-color: #ffffff;
    border: 2px solid #f4f4f6;
    border-radius: 6px;
    transform: translateX(-50%);
    pointer-events: all;
    z-index: 100;
  }

  .tool {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin: 0 0.2em 0.2em;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    font: inherit;
    color: inherit;
  }

  .icon {
    font-size: 1em !important;
    display: inline-block;
    width: 3em;
    min-width: 2em;
    height: 3em;
    padding: 0.5em 0.5rem;
    margin: 0;
    background-size: contain;
    background-repeat: no-repeat;
  }

  .disabled {
    color: #d3d3d3;
    pointer-events: none;
  }

  .active {
    background-color: #f4f4f6;
  }

  .text {
    font-size: 0.8em;
    margin-top: 0.5em;
    text-align: center;
    user-select: none;
  }
</style>
