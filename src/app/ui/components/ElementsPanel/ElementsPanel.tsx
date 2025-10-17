import { useCallback, useMemo, useState } from 'react';
import { ImageIcon } from 'lucide-react';

import { Button } from '@/app/ui/primitives/button';
import { useActiveLayerContext, useCanvasContext } from '@/app/store';

import { ImageDrawer } from './ImageDrawer';

export function ElementsPanel() {
  const [isImagesOpen, setIsImagesOpen] = useState(false);

  const { activeLayer, setActiveLayer } = useActiveLayerContext();
  const { renderManager } = useCanvasContext();

  const handleOpenDrawer = useCallback(
    (open: boolean) => {
      setIsImagesOpen(open);

      if (activeLayer) {
        activeLayer.setActive(false);
        setActiveLayer(null);
        renderManager?.reDrawOnNextFrame();
      }
    },
    [activeLayer, renderManager, setActiveLayer],
  );

  const sidebarItems = useMemo(
    () => [{ icon: ImageIcon, label: 'Images', onClick: () => handleOpenDrawer(true) }],
    [handleOpenDrawer],
  );

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-14 bg-white border-r border-gray-200 flex flex-col items-center py-3 z-40">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base italic">K</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1">
          {sidebarItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-700 hover:text-black hover:bg-gray-100"
              onClick={item.onClick}
            >
              <item.icon className="w-4 h-4" />
              <span className="sr-only">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <ImageDrawer open={isImagesOpen} onOpenChange={handleOpenDrawer} />
    </>
  );
}
