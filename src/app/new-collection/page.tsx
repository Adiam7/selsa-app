// components/NewCollectionTile.tsx
'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";

export const NewCollectionTile: React.FC = () => {
  return (
    <section
      role="region"
      aria-label="New Collection"
      className="ins-tile ins-tile--cta ins-tile--story-left ins-tile--has-image ins-tile--same-prev-background"
      id="tile-call-to-action-UjrnSs"
    >
      <style jsx>{`
        #tile-call-to-action-UjrnSs {
          --background-solid-color-a: 1;
          --background-solid-color-b: 1;
          --background-solid-color-h: 22;
          --background-solid-color-s: 0%;
          --background-solid-color-l: 100%;
          --title-font-size: 64px;
          --title-font-weight: 700;
          --title-text-color-h: 0;
          --title-text-color-s: 0%;
          --title-text-color-l: 9.8%;
          --description-font-size: 18px;
          --description-font-weight: 400;
        }
      `}</style>

      <div className="ins-tile__wrap ins-tile__animated">
        <div className="ins-tile__image">
          <div
            className="ins-tile__picture"
            style={{ backgroundColor: "rgba(203, 184, 152, 1)" }}
          >
            <picture className="ins-picture ins-picture--full">
              <source
                srcSet="/images/SwAbirv-1200x1200.webp, /images/SwAbirv-2000x2000.webp 2x"
                media="(min-width: 500px)"
                type="image/webp"
              />
              <source
                srcSet="/images/SwAbirv-600x600.webp, /images/SwAbirv-1200x1200.webp 2x"
                type="image/webp"
              />
              <source
                srcSet="/images/SwAbirv-1200x1200.png, /images/SwAbirv-2000x2000.png 2x"
                media="(min-width: 500px)"
              />
              <source
                srcSet="/images/SwAbirv-600x600.png, /images/SwAbirv-1200x1200.png 2x"
              />
              <img
                src="/images/SwAbirv-200x200.png"
                alt="New collection preview"
                loading="lazy"
              />
            </picture>
          </div>
        </div>

        <div className="ins-tile__body">
          <div className="ins-tile__body-inner">
            <h2 className="ins-tile__title">New Collection</h2>
            <p
              className="ins-tile__description ins-tile__format"
              role="heading"
              aria-level={2}
            >
              "Soft, comfy, and stylish: the perfect blend of comfort and fashion."
              <br />
              <em>
                "ልስሉስ፡ ምቹእን ቅዲ ዘለዎን፡ ምትሕውዋስ ምቾትን ፋሽንን ብሓንሳብ።"
              </em>
            </p>

            <div className="ins-button-wrap ins-tile__button">
              <Link href="/products"  role="button"
                  aria-label="Shop Now"
                  className="ins-control ins-control--button ins-control--outline ins-control--medium ins-control--pill"
                passHref>
                  <div className="ins-control__button">
                    <div className="ins-control__wrap">
                      <div className="ins-control__text">Shop Now</div>
                    </div>
                  </div>
                
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
