// app/about/page.tsx
import React from 'react';

export default function AboutPage() {
  return (

    <section
      role="region"
      aria-label="Hey!"
      id="tile-text-H2KtzB"
      className="ins-tile ins-tile--text ins-tile--fullscreen-bottom-right ins-tile--adaptive"
    >
       <style>
        {`
          #tile-text-H2KtzB {
              --background-gradient-color-from-a: 0;
              --background-gradient-color-to-a: 0;
              --background-solid-color-a: 1;
              --background-solid-color-b: 0;
              --background-solid-color-h: 0;
              --background-solid-color-l: 0%;
              --background-solid-color-s: 0%;
              --description-font-size: 20px;
              --description-font-style: normal;
              --description-font-weight: 400;
              --description-text-color-a: 1;
              --description-text-color-b: 0.7778;
              --description-text-color-h: 0;
              --description-text-color-l: 77.78%;
              --description-text-color-s: 0%;
              --subtitle-font-size: 36px;
              --subtitle-font-style: normal;
              --subtitle-font-weight: 400;
              --subtitle-text-color-a: 1;
              --subtitle-text-color-b: 1;
              --subtitle-text-color-h: 6.188562564926859;
              --subtitle-text-color-l: 100%;
              --subtitle-text-color-s: 0%;
              --title-font-size: 64px;
              --title-font-style: normal;
              --title-font-weight: 700;
              --title-text-color-a: 1;
              --title-text-color-b: 0.7933926;
              --title-text-color-h: 172.94117647058832;
              --title-text-color-l: 79.33926%;
              --title-text-color-s: 3.585253964766028%;
          }
        `}
       </style>

      <div className="ins-tile__wrap ins-tile__animated">
        <h2 className="ins-tile__title ins-tile__animated">Hey!</h2>
        <h3
          role="heading"
          aria-level={2}
          className="ins-tile__subtitle ins-tile__format"
        >
          መርሓባ !
        </h3>

        <div className="ins-tile__description ins-tile__format
          ins-tile__description--adaptive ">
          <p>
            Welcome to our online store <strong>Selsa</strong>. If you are a fan of shopping,
            especially t-shirts, come check out our store!
          </p>

          <p>
            Every model in our shop is unique. Our items are well designed, better quality, and
            comfortable to wear—and extra affordable. We try to stay unique and stylish. We’re
            improving our stuff every day.
          </p>

          <p>
            We try to come up with things that satisfy everyone. Items can also be the result of
            collaborations with family, friends, and teams.
          </p>

          <hr className="my-6 border-gray-300" />

          <p>
            ንሕና ድካን ብሰልሳ ስም ዝፍለጥ ኢና። ኣደናቒ ዕዳጋ ትፈትዉ እንተኮንኩም፡ ንዑ ድኳንና ርኣዩ!
          </p>

          <p>
            ኣብ ድኳንና ዘሎ ኩሉ ፍርያት ፍሉይ እዩ። ክዳውንትና ጽቡቕ ዲዛይን ዘለዎም፣ ዝሓሸ ጽሬት ዘለዎም , ከምኡውን
            ንምልባስ ምቹኣትን ተወሳኺ ብተመጣጣኒ ዋጋን እዮም። ፍሉይን ቅዲ-ዘለዎን ሒዝና ክንጸንሕ ንጽዕር።
            መዓልታዊ ድማ ነመሓይሽ ኣለና።
          </p>

          <p>
            ንኹሉ ዘዕግብ ነገራት ከነምጽእ ንፍትን። ክዳውንቲ ምስ ስድራቤት፣ ፈተውትን ጋንታታትን፡ በዓላት ጽምብል
            ናይ-ሓባር እውን ክኾኑ ይኽእሉ እዮም።
          </p>
        </div>
      </div>
    </section>
  );
}

