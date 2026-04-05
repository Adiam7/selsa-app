import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  activeLang: 'en' | 'ti';
  hairTypeEn: string;
  hairTypeTi: string;
  setHairTypeEn: (v: string) => void;
  setHairTypeTi: (v: string) => void;
  lengthValue: string;
  setLengthValue: (v: string) => void;
  colorEn: string;
  colorTi: string;
  setColorEn: (v: string) => void;
  setColorTi: (v: string) => void;
  textureEn: string;
  textureTi: string;
  setTextureEn: (v: string) => void;
  setTextureTi: (v: string) => void;
  originEn: string;
  originTi: string;
  setOriginEn: (v: string) => void;
  setOriginTi: (v: string) => void;
  isVirgin: boolean;
  setIsVirgin: (v: boolean) => void;
  isLace: boolean;
  setIsLace: (v: boolean) => void;
};

export function HairProductForm({
  activeLang,
  hairTypeEn,
  hairTypeTi,
  setHairTypeEn,
  setHairTypeTi,
  lengthValue,
  setLengthValue,
  colorEn,
  colorTi,
  setColorEn,
  setColorTi,
  textureEn,
  textureTi,
  setTextureEn,
  setTextureTi,
  originEn,
  originTi,
  setOriginEn,
  setOriginTi,
  isVirgin,
  setIsVirgin,
  isLace,
  setIsLace,
}: Props) {
  const { t } = useTranslation();
  const localT = (k: string, opts?: any): string => String(t(k, { lng: activeLang, ...opts }));

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-x-10" data-testid="hair-form">
      <div className="space-y-2">
        <Label htmlFor={activeLang === 'en' ? 'hairTypeEn' : 'hairTypeTi'}>{localT('Hair type')}</Label>
        {activeLang === 'en' ? (
          <Input id="hairTypeEn" value={hairTypeEn} onChange={(e) => setHairTypeEn(e.target.value)} placeholder={localT('e.g. Human Hair')} />
        ) : (
          <Input id="hairTypeTi" value={hairTypeTi} onChange={(e) => setHairTypeTi(e.target.value)} placeholder={localT('Optional')} />
        )}
      </div>

      <div className="space-y-2">
<Label htmlFor="length">{localT('Length')}</Label>
        <Input id="length" value={lengthValue} onChange={(e) => setLengthValue(e.target.value)} placeholder={localT('e.g. 18 inches')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={activeLang === 'en' ? 'colorEn' : 'colorTi'}>{localT('Color')}</Label>
        {activeLang === 'en' ? (
          <Input id="colorEn" value={colorEn} onChange={(e) => setColorEn(e.target.value)} placeholder={localT('e.g. Natural Black')} />
        ) : (
          <Input id="colorTi" value={colorTi} onChange={(e) => setColorTi(e.target.value)} placeholder={localT('Optional')} />
        )}
      </div>

      <div className="space-y-2 flex items-center gap-3">
        <input id="isVirgin" type="checkbox" checked={isVirgin} onChange={(e) => setIsVirgin(e.target.checked)} className="h-4 w-4 accent-black" />
        <Label htmlFor="isVirgin">{localT('Virgin hair')}</Label>
      </div>

      <div className="space-y-2 flex items-center gap-3">
        <input id="isLace" type="checkbox" checked={isLace} onChange={(e) => setIsLace(e.target.checked)} className="h-4 w-4 accent-black" />
        <Label htmlFor="isLace">{localT('Lace product')}</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor={activeLang === 'en' ? 'textureEn' : 'textureTi'}>{localT('Texture')}</Label>
        {activeLang === 'en' ? (
          <Input id="textureEn" value={textureEn} onChange={(e) => setTextureEn(e.target.value)} placeholder={localT('e.g. Curly')} />
        ) : (
          <Input id="textureTi" value={textureTi} onChange={(e) => setTextureTi(e.target.value)} placeholder={localT('Optional')} />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={activeLang === 'en' ? 'originEn' : 'originTi'}>{localT('Origin')}</Label>
        {activeLang === 'en' ? (
          <Input id="originEn" value={originEn} onChange={(e) => setOriginEn(e.target.value)} placeholder={localT('e.g. Brazil')} />
        ) : (
          <Input id="originTi" value={originTi} onChange={(e) => setOriginTi(e.target.value)} placeholder={localT('Optional')} />
        )}
      </div>
    </div>
  );
}
