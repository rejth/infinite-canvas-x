import { useCallback, useState } from 'react';

import { DEFAULT_FILTERS, ImageEditorContext, ImageFilterState } from './ImageEditorContext';

type Props = {
  children: React.ReactNode;
};

export const ImageEditorProvider = ({ children }: Props) => {
  const [image, setImage] = useState<CanvasImageSource | null>(null);
  const [filters, setFilters] = useState<ImageFilterState>(DEFAULT_FILTERS);

  const handleSetFilters = useCallback((newFilters: Partial<ImageFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetImageEditor = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <ImageEditorContext.Provider
      value={{
        image,
        filters,
        setImage,
        setFilters: handleSetFilters,
        resetImageEditor,
      }}
    >
      {children}
    </ImageEditorContext.Provider>
  );
};
