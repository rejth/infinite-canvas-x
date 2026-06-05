import { CURSORS, DEFAULT_CURSOR } from '@/shared/constants'
import { Tool, Tools } from '@/shared/interfaces'
import { cn } from '@/shared/lib/utils'
import { Icon } from '@/shared/ui/Icon/Icon'

import styles from './Toolbar.module.css'
import { useSyncDeletedLayer } from '@/hooks/useSyncDeletedLayer'
import {
  useActiveLayerContext,
  useCanvasContext,
  useTextEditorContext,
  useToolbarContext,
} from '@/store'

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

export const Toolbar = () => {
  const { renderManager } = useCanvasContext()
  const { setIsLayerEditable, resetTextEditor } = useTextEditorContext()
  const { activeLayer, setActiveLayer, setLastActiveLayer } = useActiveLayerContext()
  const { tool, setTool, setCursor } = useToolbarContext()
  const syncDeletedLayer = useSyncDeletedLayer()

  const resetActiveLayer = () => {
    setIsLayerEditable(false)
    resetTextEditor()
    setLastActiveLayer(activeLayer)
    setActiveLayer(null)
    activeLayer?.setActive(false)
  }

  const handleClick = async (tool: Tool) => {
    setTool(tool)

    if (tool === Tools.DELETE && activeLayer) {
      renderManager?.removeLayer(activeLayer)
      resetActiveLayer()
      setTool(Tools.SELECT)
      syncDeletedLayer(activeLayer)
    } else if (activeLayer) {
      resetActiveLayer()
      renderManager?.reDrawOnNextFrame()
    }

    if (tool === Tools.HAND) {
      setCursor(CURSORS[tool])
    } else {
      setCursor(DEFAULT_CURSOR)
    }
  }

  const getActiveStyle = (selectedTool: Tool, disabled: boolean) => {
    return selectedTool === tool && !disabled ? styles.active : ''
  }

  const getDisabledStyle = (disabled: boolean) => {
    return disabled ? styles.disabled : ''
  }

  return (
    <ul id="toolbar" className={styles.toolbar}>
      {tools.map(({ id, type, label, icon, hoverText, disabled }) => (
        <li key={id}>
          <span
            id={id}
            role="button"
            tabIndex={0}
            title={hoverText}
            className={cn(styles.tool, getDisabledStyle(disabled))}
            onClick={() => handleClick(type)}
          >
            <span className={cn(styles.icon, getActiveStyle(type, disabled))}>
              <Icon name={icon} color={getDisabledStyle(disabled)} />
            </span>
            <span className={styles.text}>{label}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
