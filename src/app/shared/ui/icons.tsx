import { ConnectIcon } from '@/app/ui/components/Toolbar/icons/ConnectIcon';
import { PanIcon } from '@/app/ui/components/Toolbar/icons/PanIcon';
import { StickerIcon } from '@/app/ui/components/Toolbar/icons/StickerIcon';
import { SelectIcon } from '@/app/ui/components/Toolbar/icons/SelectIcon';
import { TextAreaIcon } from '@/app/ui/components/Toolbar/icons/TextAreaIcon';
import { TextIcon } from '@/app/ui/components/Toolbar/icons/TextIcon';
import { TrashIcon } from '@/app/ui/components/Toolbar/icons/TrashIcon';

export const Icons = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
      <symbol id="connect">
        <ConnectIcon />
      </symbol>
      <symbol id="pan">
        <PanIcon />
      </symbol>
      <symbol id="sticker">
        <StickerIcon />
      </symbol>
      <symbol id="select">
        <SelectIcon />
      </symbol>
      <symbol id="text-area">
        <TextAreaIcon />
      </symbol>
      <symbol id="text">
        <TextIcon />
      </symbol>
      <symbol id="trash">
        <TrashIcon />
      </symbol>
    </svg>
  );
};
