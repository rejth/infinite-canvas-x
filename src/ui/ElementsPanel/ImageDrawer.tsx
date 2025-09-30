import type React from 'react';
import { useState } from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { Camera, X } from 'lucide-react';

import { createCursorFromImage, getImageBitmap } from '@/services/lib';

import { Sheet, SheetPortal, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Tools } from '@/shared/interfaces';
import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect';

import { useImageEditorContext, useToolbarContext } from '@/context';

interface ImageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Photo {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  width: number;
  height: number;
  user: {
    name: string;
  };
}

function ImageDrawerContent({
  className,
  children,
  side = 'left',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <SheetPortal>
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-30 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          side === 'left' &&
            'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export function ImageDrawer({ open, onOpenChange }: ImageDrawerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const { setCursor, setTool } = useToolbarContext();
  const { setImage } = useImageEditorContext();

  useDidMountEffect(() => {
    fetch('/api/photos')
      .then((response) => {
        if (!response.ok) return [];
        return response.json();
      })
      .then(setPhotos);
  });

  const handleAddImage = async (photo: Photo) => {
    try {
      const [bitmap, url] = await Promise.all([
        getImageBitmap(photo.urls.regular),
        createCursorFromImage(photo.urls.thumb),
      ]);
      setImage(bitmap);
      setTool(Tools.IMAGE);
      setCursor(`url(${url}) 16 16, crosshair`);
      onOpenChange(false);
    } catch {
      setCursor('crosshair');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <ImageDrawerContent
        side="left"
        className="w-[280px] bg-white text-gray-900 border-gray-200 p-0 left-14"
        style={{ left: '56px' }}
      >
        <SheetHeader className="p-2 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs italic">K</span>
              </div>
              <SheetTitle className="text-gray-900 text-base">Images</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* Upload button */}
        <div className="px-2 space-y-2">
          <div className="flex gap-1">
            <Button
              variant={'secondary'}
              className={`flex-1 justify-start gap-1 text-xs h-7 ${'bg-gray-200 text-gray-900'}`}
              onClick={() => {}}
            >
              <Camera className="w-3 h-3" />
              Upload
            </Button>
          </div>
        </div>

        {/* Images */}
        {photos.length > 0 && (
          <div className="px-2 pb-2 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-1 mt-2">
              {photos.map((photo) => (
                <div
                  tabIndex={0}
                  role="button"
                  key={photo.id}
                  className="relative group cursor-pointer overflow-hidden bg-gray-100 aspect-square"
                  onClick={() => handleAddImage(photo)}
                >
                  <img
                    src={photo.urls.small}
                    alt={photo.alt_description}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      className="bg-white/90 text-gray-900 hover:bg-white border border-gray-200 h-5 text-[10px] px-1.5"
                    >
                      Add to canvas
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ImageDrawerContent>
    </Sheet>
  );
}
