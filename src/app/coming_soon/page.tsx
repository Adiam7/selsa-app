// src/app/Home/coming_soon/page.tsx
import React from "react";
import Link from "next/link";

export const ComingTile: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="coming..."
      className="ins-tile ins-tile--cta ins-tile--banner-left ins-tile--has-image"
      id="tile-call-to-action-K4VQrq"
    >
      <style>
        {`
          #tile-call-to-action-K4VQrq {
            --background-gradient-color-from-a: 0;
            --background-gradient-color-to-a: 0;
            --background-solid-color-a: 1;
            --background-solid-color-b: 1;
            --background-solid-color-h: 14.999999999999787;
            --background-solid-color-l: 100%;
            --background-solid-color-s: 0%;
            --button-color-a: 1;
            --button-color-b: 0.5137254901960784;
            --button-color-h: 9.193548387096776;
            --button-color-l: 51.37254901960784%;
            --button-color-s: 100%;
            --description-font-size: 18px;
            --description-font-style: normal;
            --description-font-weight: 400;
            --description-text-color-a: 1;
            --description-text-color-b: 1;
            --description-text-color-h: 0;
            --description-text-color-l: 100%;
            --description-text-color-s: 0%;
            --image-aspect-ratio: 100%;
            --image-overlay-solid-color-a: 0.3;
            --image-overlay-solid-color-b: 0;
            --image-overlay-solid-color-h: 0;
            --image-overlay-solid-color-l: 0%;
            --image-overlay-solid-color-s: 0%;
            --title-font-size: 48px;
            --title-font-style: normal;
            --title-font-weight: 700;
            --title-text-color-a: 1;
            --title-text-color-b: 1;
            --title-text-color-h: 0;
            --title-text-color-l: 100%;
            --title-text-color-s: 0%;
          }
        `}
      </style>

      <div className="ins-tile__wrap ins-tile__animated ">
        <div className="ins-tile__image">
          <div
            style={{ backgroundColor: "rgba(255, 255, 255, 255)" }}
            className="ins-tile__picture"
          >
            <picture className="ins-picture ins-picture--full ins-picture--contain">
              <source
                srcSet="images/FgRjOsn-2000x2000.webp, images/FgRjOsn-2000x2000.webp 2x"
                media="(min-width: 900px)"
                type="image/webp"
              />
              <source
                srcSet="images/FgRjOsn-1200x1200.webp, images/FgRjOsn-2000x2000.webp 2x"
                media="(min-width: 500px)"
                type="image/webp"
              />
              <source
                srcSet="images/FgRjOsn-500x1000.webp, images/FgRjOsn-1000x2000.webp 2x"
                type="image/webp"
              />
              <source
                srcSet="images/FgRjOsn-2000x2000.jpg, images/FgRjOsn-2000x2000.jpg 2x"
                media="(min-width: 900px)"
              />
              <source
                srcSet="images/FgRjOsn-1200x1200.jpg, images/FgRjOsn-2000x2000.jpg 2x"
                media="(min-width: 500px)"
              />
              <source
                srcSet="images/FgRjOsn-500x1000.jpg, images/FgRjOsn-1000x2000.jpg 2x"
              />
              <img
                src="images/FgRjOsn-200x200.jpg"
                alt=""
                fetchPriority="low"
              />
            </picture>
          </div>
        </div>
        
        <div className="px-4 py-8 ins-tile__body " >
          <div className="ins-tile__body">

            <div className="ins-tile__body-inner ">
              <h2 className="ins-tile__title">Coming...</h2>
              <div
                role="heading"
                aria-level={2}
                className="ins-tile__description ins-tile__format ins-tile-wrap "
              >
                Bright colors and creative design. <br />
                Discover our new collection. <br />
                Meeting new items. <br />
                
                ንዝመጽእ... <br />
                ድሙቕ ሕብርታትን ፈጠራዊ ዲዛይንን። <br />
                ሓድሽ ትሕስቶ ፈትሹ። <br />
                ሓደስቲ ነገራት ንምርኻብ።
              </div>

              <div className="ins-button-wrap ins-tile__button" data-preview-mode="false">
                <Link
                  href="/products"
                  role="button"
                  aria-label="Shop now"
                  className="ins-control ins-control--button ins-control--outline ins-control--medium ins-control--pill"
                >
                  <div className="ins-control__button">
                    <div className="ins-control__wrap">
                      <div className="ins-control__text">Shop now</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
