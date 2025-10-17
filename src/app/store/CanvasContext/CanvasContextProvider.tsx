import { CanvasContext, CanvasContextInterface } from './CanvasContext';

type Props = {
  value: CanvasContextInterface;
  children: React.ReactNode;
};

export const CanvasContextProvider = ({ value, children }: Props) => {
  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};
