import { Tools, Tool } from '@/shared/interfaces';
import { CURSORS, DEFAULT_CURSOR } from '@/shared/constants';
import { Icon } from '@/shared/ui/Icon/Icon';

import { cn } from '@/lib/utils';

import { useActiveLayerContext, useCanvasContext, useTextEditorContext, useToolbarContext } from '@/context';

import styles from './Toolbar.module.css';

interface ToolItem {
  id: string;
  label: string;
  type: Tool;
  icon: string;
  hoverText: string;
  disabled: boolean;
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
    id: 'connect',
    label: 'Connect',
    type: Tools.CONNECT,
    icon: 'connect',
    hoverText: 'Connect tool',
    disabled: true,
  },
  {
    id: 'trash',
    label: 'Delete',
    type: Tools.DELETE,
    icon: 'trash',
    hoverText: 'Delete selected item(s)',
    disabled: false,
  },
];

export const Toolbar = () => {
  const { renderManager } = useCanvasContext();
  const { setIsLayerEditable, resetTextEditor } = useTextEditorContext();
  const { activeLayer, setActiveLayer, setLastActiveLayer } = useActiveLayerContext();
  const { tool, setTool, setCursor } = useToolbarContext();

  const resetActiveLayer = () => {
    setIsLayerEditable(false);
    resetTextEditor();
    setLastActiveLayer(activeLayer);
    setActiveLayer(null);
    activeLayer?.setActive(false);
  };

  const handleClick = (tool: Tool) => {
    setTool(tool);

    if (tool === Tools.DELETE && activeLayer) {
      renderManager?.removeLayer(activeLayer);
      resetActiveLayer();
    } else if (activeLayer) {
      resetActiveLayer();
      renderManager?.reDrawOnNextFrame();
    }

    if (tool === Tools.HAND) {
      setCursor(CURSORS[tool]);
    } else {
      setCursor(DEFAULT_CURSOR);
    }
  };

  const getActiveStyle = (selectedTool: Tool, disabled: boolean) => {
    return selectedTool === tool && !disabled ? styles.active : '';
  };

  const getDisabledStyle = (disabled: boolean) => {
    return disabled ? styles.disabled : '';
  };

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
  );
};
