import { createContext, Dispatch, SetStateAction } from 'react';

export interface ImageFilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  hue: number;
  blur: number;
  noise: number;
  pixelate: number;
}

interface ImageEditorContextInterface {
  image: CanvasImageSource | null;
  filters: ImageFilterState;
  setImage: Dispatch<SetStateAction<CanvasImageSource | null>>;
  setFilters: (newFilters: Partial<ImageFilterState>) => void;
  resetImageEditor: () => void;
}

export const DEFAULT_FILTERS: ImageFilterState = {
  brightness: 50,
  contrast: 50,
  saturation: 50,
  vibrance: 50,
  hue: 0,
  blur: 0,
  noise: 0,
  pixelate: 0,
};

export const ImageEditorContext = createContext<ImageEditorContextInterface>({
  image: null,
  filters: DEFAULT_FILTERS,
  setImage: () => {},
  setFilters: () => {},
  resetImageEditor: () => {},
});
