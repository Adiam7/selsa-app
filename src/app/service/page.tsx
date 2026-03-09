// components/ServicesTile.tsx
'use client';
import React from "react";
import Link from "next/link";

export const ServicesTile: React.FC = () => {
  return (
    <section
      role="region"
      aria-label="Services"
      className="ins-tile ins-tile--cover ins-tile--fullscreen-center"
      id="tile-cover-uRhHik"
    >
      <style jsx>{`
        #tile-cover-uRhHik {
          --arrow-color-a: 0.4;
          --arrow-color-b: 1;
          --arrow-color-h: 0;
          --arrow-color-l: 100%;
          --arrow-color-s: 0%;
          --background-gradient-color-from-a: 0;
          --background-gradient-color-to-a: 0;
          --background-solid-color-a: 1;
          --background-solid-color-b: 0.17;
          --background-solid-color-h: 203;
          --background-solid-color-l: 17%;
          --background-solid-color-s: 19%;
          --description-font-size: 18px;
          --description-font-style: normal;
          --description-font-weight: 400;
          --description-text-color-a: 1;
          --description-text-color-b: 0.09803921569;
          --description-text-color-h: 0;
          --description-text-color-l: 9.803921569%;
          --description-text-color-s: 0%;
          --headline-font-size: 64px;
          --headline-font-style: normal;
          --headline-font-weight: 700;
          --headline-text-color-a: 1;
          --headline-text-color-b: 0.09803921569;
          --headline-text-color-h: 0;
          --headline-text-color-l: 9.803921569%;
          --headline-text-color-s: 0%;
          --primary-button-color-a: 1;
          --primary-button-color-b: 0.09803921569;
          --primary-button-color-h: 0;
          --primary-button-color-l: 9.803921569%;
          --primary-button-color-s: 0%;
          --secondary-button-color-a: 1;
          --secondary-button-color-b: 0.09803921569;
          --secondary-button-color-h: 0;
          --secondary-button-color-l: 9.803921569%;
          --secondary-button-color-s: 0%;
          --tagline-font-size: 18px;
          --tagline-font-style: normal;
          --tagline-font-weight: 400;
          --tagline-text-color-a: 1;
          --tagline-text-color-b: 0.09803921569;
          --tagline-text-color-h: 0;
          --tagline-text-color-l: 9.803921569%;
          --tagline-text-color-s: 0%;
        }
      `}</style>

      <div className="ins-tile__background ins-tile__background--parallax">
        <div
          className="ins-tile__image"
          style={{ backgroundColor: "rgba(181,198,200,1)" }}
        >
          <picture className="ins-picture ins-picture--full ins-picture--background">
            <source
              srcSet="https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&h=1330&q=50, https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&h=1330&q=50 2x"
              media="(min-width:900px)"
              type="image/webp"
            />
            <source
              srcSet="https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=50, https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=50 2x"
              media="(min-width:500px)"
              type="image/webp"
            />
            <source
              srcSet="https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=50, https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=50 2x"
              type="image/webp"
            />
            <source
              srcSet="https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&h=1330&q=50, https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&h=1330&q=50 2x"
              media="(min-width:900px)"
            />
            <source
              srcSet="https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=50, https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=50 2x"
              media="(min-width:500px)"
            />
            <source
              srcSet="https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=50, https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=50 2x"
            />
            <img
              src="https://images.unsplash.com/photo-1619783547903-33edeced430a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=133&q=50"
              alt=""
              fetchPriority="low"
            />
          </picture>
        </div>
      </div>

      <div className="ins-tile__wrap ins-tile__animated">
        <div role="heading" aria-level={2} className="ins-tile__tagline">
          We also provide:
        </div>
        <h2 className="ins-tile__headline">Services (ንህቦም ኣገልግሎታት)</h2>
        <div className="ins-tile__footer">
          <div className="ins-tile__description ins-tile__format">
            <p>
              <strong>1. Personal Customization (ውልቃዊ)</strong> — At Salsa, we understand that personalization is key to making your products uniquely yours. That's why we offer personalized customization services to cater to your individual preferences and needs. Whether you're looking to add your name, logo, or a special message, our team is here to bring your vision to life.
              <br />
              ኣብ ሰልሳ፡ ፍርያትካ ፍሉይ ናትካ ንምግባር፡ ውልቃዊ ምግባር ኣገዳሲ ምዃኑ ንርዳእ ኢና። ስለዚ ድማ ኢና ንውልቃዊ ምርጫታትኩምን ድሌታትኩምን ንምምላእ ብሕታዊ ናይ ፍሉይ ምግባር ኣገልግሎት ንህብ። ስምኩም፡ ኣርማኹም፡ ወይ ፍሉይ መልእኽቲ ክትውስኹ ትደልዩ ትኹኑ፡ ምስ መሳርሕትና ራእይኩም ህያው ንምግባር ኣብዚ ተዳሊና ኣለና።
            </p>
            <p>
              <strong>2. Bulk Purchase Discounts (ብጅምላ ዝጎድል ዋጋ)</strong> — Save big on large orders for business or events—with competitive pricing and fast shipping.
              <br />
              ትፈትውዎ ፍርያት ብብዝሒ ክትዕድሉ ምስ ትደልዩ፡ ኣብ ሰልሳ፡ ኣብ ዓበይቲ ብዝሒ ትእዛዛት ንምሕጋዝ፡ ብጅምላ ዕድጊ ቅናስ ንህብ። ንንግድኹም፡ ንውድብኩም ወይ ንውራይኩም ትዕድጉ ትኹኑ፡ ብጅምላ ዝገብሮ ቅናስና ብውሑድ ዋጋ ዝያዳ ንምርካብ ቀሊል ንገብሮ። ብተወዳዳሪ ዋጋን ቅልጡፍ ምልኣኽን፡ ጽሬት ከይተሰከፍካ ዓቢ ምግዳል ዋጋ ከተስተማቕር ትኽእል። ተወሳኺ፡ ውፉይ ናይ ዓማዊል ኣገልግሎት ጉጅለና ኣብ ነፍሲ ወከፍ ስጉምቲ ክንሕግዘኩም ኣብዚ ኣሎ። ብጅምላ ዕዳጋ ብምግባር ሎሚ ክሰብ!
            </p>
            <p>
              <strong>3. Suggested Design Variations (ብኣኹም ዝተቀረቡ ዲዛይንናት)</strong> — Explore our curated, innovative design ideas across apparel, home décor, and accessories.
              <br />
              ኣብ ሰልሳ፡ ፈጠራኹም ንምልዕዓል ብቐጻሊ ፍሉይን ፈጠራውን ናይ ዲዛይን ሓሳባት ነመጽእ ኣለና። ክዳውንቲ፡ ዲኮር ገዛ፡ ወይ ኣክሰሰሪታት ትድህስሱ ትኹኑ፡ እቲ ዝሓሰብናዮ ናይ ዲዛይን ፍልልያት ብርግጽ ክምስጠኩም እዩ። እንተ ደልኹም ከማን ብናትኩም ዲዛይናት ክንሰርሓልኩም፡ ኣብ ዝመረጽኩሞ ንብረታት፡ ንኽእል ኢና።ካብ ትራንዲ ፓተርን ክሳብ ግዜ ዘይስዕሮ ክላሲክስ ንኹሉ ዝኸውን ነገር ኣለና። ንዝተዳለዉ እኩባትና ዳህሰሱን ንቅዲኹም ዝሰማማዕ ፍጹም ዲዛይን ርኸቡን። መወዳእታ ዘይብሉ ተኽእሎታት ኣብ ጫፍ ኣጻብዕትኻ ስለዘሎ፡ እቲ እንኮ ደረት ምናኔኻ ጥራይ እዩ።
            </p>
          </div>
          <div className="ins-tile__buttons">
            <div className="ins-button-wrap ins-tile__button ins-tile__button--primary" data-preview-mode="false">
              <Link
                href="/store"
                role="button"
                aria-label="Shop Now"
                className="ins-control ins-control--button ins-control--solid ins-control--medium ins-control--round"
              >
                <div className="ins-control__button">
                  <div className="ins-control__wrap">
                    <div className="ins-control__text">Shop Now</div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="ins-button-wrap ins-tile__button ins-tile__button--secondary" data-preview-mode="false">
              <Link
                href="/contact"
                role="button"
                aria-label="Contact Us"
                className="ins-control ins-control--button ins-control--outline ins-control--medium ins-control--round"
              >
                <div className="ins-control__button">
                  <div className="ins-control__wrap">
                    <div className="ins-control__text">Contact Us</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="ins-tile__spacer"></div>
      </div>
    </section>
  );
};
