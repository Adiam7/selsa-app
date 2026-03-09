import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  activeLang: 'en' | 'ti';
  scrubWeight: string;
  setScrubWeight: (v: string) => void;
  ingredientsEn: string;
  ingredientsTi: string;
  setIngredientsEn: (v: string) => void;
  setIngredientsTi: (v: string) => void;
  skinType: string;
  setSkinType: (v: string) => void;
  isOrganic: boolean;
  setIsOrganic: (v: boolean) => void;
};

export function BodyScrubProductForm({
  activeLang,
  scrubWeight,
  setScrubWeight,
  ingredientsEn,
  ingredientsTi,
  setIngredientsEn,
  setIngredientsTi,
  skinType,
  setSkinType,
  isOrganic,
  setIsOrganic,
}: Props) {
  const { t } = useTranslation();
  const localT = (k: string, opts?: any) => t(k, { lng: activeLang, ...opts });

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-x-10" data-testid="bodyscrub-form">
      <div className="space-y-2">
        <Label htmlFor="scrubWeight">{localT('Weight (kg)')}</Label>
        <Input id="scrubWeight" value={scrubWeight} onChange={(e) => setScrubWeight(e.target.value)} placeholder={localT('e.g. 0.25')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skinType">{localT('Skin type')}</Label>
        <Input id="skinType" value={skinType} onChange={(e) => setSkinType(e.target.value)} placeholder={localT('e.g. All skin types')} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={activeLang === 'en' ? 'ingredientsEn' : 'ingredientsTi'}>{localT('Ingredients')}</Label>
        {activeLang === 'en' ? (
          <Textarea id="ingredientsEn" value={ingredientsEn} onChange={(e) => setIngredientsEn(e.target.value)} rows={3} />
        ) : (
          <Textarea id="ingredientsTi" value={ingredientsTi} onChange={(e) => setIngredientsTi(e.target.value)} rows={3} />
        )}
      </div>

      <div className="space-y-2 flex items-center gap-3">
        <input id="isOrganic" type="checkbox" checked={isOrganic} onChange={(e) => setIsOrganic(e.target.checked)} className="h-4 w-4 accent-black" />
        <Label htmlFor="isOrganic">{localT('Organic')}</Label>
      </div>
    </div>
  );
}
