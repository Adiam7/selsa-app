// components/DeliveryTile.tsx
'use client';
import React from "react";
import { useTranslation } from "react-i18next";

export const DeliveryTile: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section
      role="region"
      aria-label="Delivery"
      className="ins-tile ins-tile--text ins-tile--title-left"
      id="tile-text-5rVW7e"
      data-tile-type="TEXT"
      data-tile-id="text-5rVW7e"
      data-tile-index="6"
    >
      <style jsx>{`
        #tile-text-5rVW7e {
          --background-solid-color-a: 1;
          --background-solid-color-b: 0.93;
          --background-solid-color-h: 0;
          --background-solid-color-s: 0%;
          --background-solid-color-l: 92.55%;
          --title-font-size: 64px;
          --title-font-weight: 700;
          --subtitle-font-size: 30px;
          --subtitle-font-style: italic;
          --subtitle-font-weight: 400;
        }
      `}</style>
      <div className="ins-tile__wrap ins-tile__animated">
        <h2 className="ins-tile__title">{t('Delivery.')}</h2>

        <p
          className="ins-tile__subtitle ins-tile__format"
          role="heading"
          aria-level={2}
        >{t('ንብረትኩም ምብጻሕ')}</p>

        <div className="ins-tile__description ins-tile__format">
          <p>
            To deliver your favorite products, we have partnered with the most
            reliable companies. We are ready to entrust them with your orders and
            are always on your side if something goes wrong.
          </p>
          <p style={{ marginTop: "1rem" }}>{t(
            'ትፈትውዎ ንብረት ንምቕራብ ምስቶም ኣዝዮም እሙናት ኩባንያታት ሽርክነት ፈጢርና ኣለና። ትእዛዝኩም\n            ብሓላፍነት ክንህቦም ድሉዋት ኢና፡ ገለ ነገር እንተተጋግዩ ድማ ኩሉ ግዜ ኣብ ጎንኹም ኮንና\n            ፍታሕ ከነናዲ ኢና።'
          )}</p>
        </div>
      </div>
    </section>
  );
};

export default DeliveryTile;
