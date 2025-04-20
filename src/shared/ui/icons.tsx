import { ConnectIcon } from '@/shared/assets/ConnectIcon';
import { PanIcon } from '@/shared/assets/PanIcon';
import { StickerIcon } from '@/shared/assets/StickerIcon';
import { SelectIcon } from '@/shared/assets/SelectIcon';
import { TextAreaIcon } from '@/shared/assets/TextAreaIcon';
import { TextIcon } from '@/shared/assets/TextIcon';
import { TrashIcon } from '@/shared/assets/TrashIcon';

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
