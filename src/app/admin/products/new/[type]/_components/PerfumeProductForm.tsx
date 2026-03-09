import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  activeLang: 'en' | 'ti';
  volumeMl: string;
  setVolumeMl: (v: string) => void;
  concentration: string;
  setConcentration: (v: string) => void;
  fragranceFamily: string;
  setFragranceFamily: (v: string) => void;
  scentNotesEn: string;
  scentNotesTi: string;
  setScentNotesEn: (v: string) => void;
  setScentNotesTi: (v: string) => void;
};

export function PerfumeProductForm({
  activeLang,
  volumeMl,
  setVolumeMl,
  concentration,
  setConcentration,
  fragranceFamily,
  setFragranceFamily,
  scentNotesEn,
  scentNotesTi,
  setScentNotesEn,
  setScentNotesTi,
}: Props) {
  const { t } = useTranslation();
  const localT = (k: string, opts?: any) => t(k, { lng: activeLang, ...opts });

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-x-10" data-testid="perfume-form">
      <div className="space-y-2">
        <Label htmlFor="volume">{localT('Volume (ml)')}</Label>
        <Input id="volume" value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} placeholder={localT('e.g. 50')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="concentration">{localT('Concentration')}</Label>
        <Input id="concentration" value={concentration} onChange={(e) => setConcentration(e.target.value)} placeholder={localT('e.g. Eau de Parfum')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="family">{localT('Fragrance family')}</Label>
        <Input id="family" value={fragranceFamily} onChange={(e) => setFragranceFamily(e.target.value)} placeholder={localT('e.g. Floral')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={activeLang === 'en' ? 'scentEn' : 'scentTi'}>{localT('Scent notes')}</Label>
        {activeLang === 'en' ? (
          <Input id="scentEn" value={scentNotesEn} onChange={(e) => setScentNotesEn(e.target.value)} placeholder={localT('e.g. jasmine, sandalwood')} />
        ) : (
          <Input id="scentTi" value={scentNotesTi} onChange={(e) => setScentNotesTi(e.target.value)} placeholder={localT('Optional')} />
        )}
      </div>
    </div>
  );
}
