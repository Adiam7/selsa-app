// components/ClothingCTA.tsx
import React from "react";
import Link from "next/link";

export const ClothingCTA: React.FC = () => {
  return (
    
    <section
      role="region"
      aria-label="Clothing"
      id="tile-call-to-action-NrWbGx"
      className="relative flex flex-col md:flex-row items-stretch overflow-hidden bg-white"
    >
      <div className="w-full md:w-1/2 bg-gray-100">
        <picture className="w-full h-full block object-contain">
          <source
            srcSet="/images/sjDK0jw-1200x1200.webp 1x, /images/sjDK0jw-2000x2000.webp 2x"
            media="(min-width: 500px)"
            type="image/webp"
          />
          <source
            srcSet="/images/sjDK0jw-600x600.webp 1x, /images/sjDK0jw-1200x1200.webp 2x"
            type="image/webp"
          />
          <source
            srcSet="/images/sjDK0jw-1200x1200.png 1x, /images/sjDK0jw-2000x2000.png 2x"
            media="(min-width: 500px)"
          />
          <source
            srcSet="/images/sjDK0jw-600x600.png 1x, /images/sjDK0jw-1200x1200.png 2x"
          />
          <img
            src="/images/sjDK0jw-200x200.png"
            alt="Seasonal clothing collection"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </picture>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12 text-left">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Clothing
        </h2>

        <div
          role="heading"
          aria-level={2}
          className="text-lg md:text-xl text-gray-800 mb-6"
        >
          <p className="mb-2">
            Introducing our latest collection: a curated selection of seasonal fashion trends to elevate your style game.
          </p>
          <p>
            ናይ ወቕታዊ ዝመጹ ትሕስቶ ምልላይ፡ ቅዲ ስታይክኩም ልዕል ንምባል ዝተዳለወ ምርጫ ፋሽን ትረንድስ።
          </p>
        </div>

        <div>
          <Link href="/store"  role="button"
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
    </section>
  );
};
