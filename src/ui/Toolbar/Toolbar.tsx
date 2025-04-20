import { Tools, Tool } from '@/shared/interfaces';
import { CURSORS, DEFAULT_CURSOR } from '@/shared/constants';
import { Icon } from '@/shared/ui/Icon/Icon';

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
    id: 'area',
    label: 'Area',
    type: Tools.AREA,
    icon: 'text-area',
    hoverText: 'Drag to add a new text area',
    disabled: false,
  },
  {
    id: 'text',
    label: 'Text',
    type: Tools.TEXT,
    icon: 'text',
    hoverText: 'Drag to add a new text',
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
];

export const Toolbar = () => {
  const { renderManager } = useCanvasContext();
  const { setIsLayerEditable, resetTextEditor } = useTextEditorContext();
  const { activeLayer, setActiveLayer } = useActiveLayerContext();
  const { tool, setTool, setCursor } = useToolbarContext();

  const handleClick = (tool: Tool) => {
    setTool(tool);

    if (tool === Tools.HAND) {
      setCursor(CURSORS[tool]);
    } else {
      setCursor(DEFAULT_CURSOR);
    }

    if (activeLayer) {
      setIsLayerEditable(false);
      resetTextEditor();
      setActiveLayer(null);
      activeLayer.setActive(false);
      renderManager?.reDraw();
    }
  };

  const getActiveStyle = (selectedTool: Tool, disabled: boolean) => {
    return selectedTool === tool && !disabled ? styles.active : '';
  };

  return (
    <ul id="toolbar" className={styles.toolbar}>
      {tools.map(({ id, type, label, icon, hoverText, disabled }) => (
        <li key={id}>
          <span id={id} role="button" tabIndex={0} className={styles.tool} onClick={() => handleClick(type)}>
            <span
              className={`${styles.icon} ${getActiveStyle(type, disabled)} ${disabled ? styles.disabled : ''}`}
              title={hoverText}
            >
              <Icon name={icon} />
            </span>
            <span className={styles.text}>{label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};
