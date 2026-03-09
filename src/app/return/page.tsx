// components/ReturnsTile.tsx
'use client';
import React from "react";
import { useTranslation } from "react-i18next";

export const ReturnsTile: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section
      role="region"
      aria-label="Returns"
      id="tile-text-jHU68d"
      className="ins-tile ins-tile--text ins-tile--title-left ins-tile--same-prev-background"
      data-tile-type="TEXT"
      data-tile-id="text-jHU68d"
      data-tile-index="7"
    >
      <style jsx>{`
        #tile-text-jHU68d {
          --background-solid-color-a: 1;
          --background-solid-color-b: 0.93;
          --background-solid-color-h: 0;
          --background-solid-color-s: 0%;
          --background-solid-color-l: 92.55%;
          --title-font-size: 64px;
          --title-font-weight: 700;
          --subtitle-font-size: 18px;
          --subtitle-font-style: italic;
          --subtitle-font-weight: 400;
        }
      `}</style>
      <div className="ins-tile__wrap ins-tile__animated">
        <h2 className="ins-tile__title">{t('Returns')}</h2>

        <p
          className="ins-tile__subtitle ins-tile__format"
          role="heading"
          aria-level={2}
        >{t('ምምላስ')}</p>

        <div className="ins-tile__description ins-tile__format">
          <p>
            We are happy to assist you with eligible returns, provide clear
            instructions, and share the correct return address. Refunds are only
            available for items that are damaged or incorrectly shipped. Please
            contact us via email so we can coordinate a proper replacement.
          </p>

          <p style={{ marginTop: "1rem" }}>{t(
            'ንዝተበላሸወ ወይ ብጌጋ ዝተሰደደ ንብረት ጥራይ እዩ ምምላስ ገንዘብ ዝህብ፣ መጀመርታ ነቲ\n            ዝደለኹሞ ንብረት ክትዕድጉዎ ከለኹም ብጥንቓቐ ኣስተብሂልኩም ክትዕድግዎ ይምሕጸን። ብዝተኸኣለ\n            መጠን ንዓማዊል ዝከኣል ምትሕብባር ክንገብር ክንፍትን ኢና።'
          )}</p>
        </div>
      </div>
    </section>
  );
};

export default ReturnsTile;
