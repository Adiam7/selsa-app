// src/app/intro/page.tsx
import React from 'react';
import Link from 'next/link';

// export const metadata = {
//   title: 'Style | Selsa',
//   description: 'Step into a world of color with our carefully selected pieces',
// };

export default function IntroPage() {
  return (
    <section
      role="region"
      aria-label="style"
      id="tile-cover-gBoQjH"
      className="ins-tile ins-tile--cover ins-tile--fullscreen-bottom-right ins-tile--adaptive "
    >
      <div>{/* Placeholder for injected components or future use */}</div>

      <style>
        {`
          #tile-cover-gBoQjH {
            --background-gradient-color-from-a: 0;
            --background-gradient-color-to-a: 0;
            --background-solid-color-a: 1;
            --background-solid-color-b: 1;
            --background-solid-color-h: 1.553383458646592;
            --background-solid-color-l: 100%;
            --background-solid-color-s: 0%;
            --description-font-size: 20px;
            --description-font-style: normal;
            --description-font-weight: 400;
            --description-text-color-a: 1;
            --description-text-color-b: 0.9470588235294117;
            --description-text-color-h: 20;
            --description-text-color-l: 94.70588235294117%;
            --description-text-color-s: 11.111111111111065%;
            --headline-font-size: 112px;
            --headline-font-style: normal;
            --headline-font-weight: 700;
            --headline-text-color-a: 1;
            --headline-text-color-b: 0.4490196078431372;
            --headline-text-color-h: 142.85714285714286;
            --headline-text-color-l: 44.90196078431372%;
            --headline-text-color-s: 9.170305676855895%;
            --primary-button-color-a: 1;
            --primary-button-color-b: 0.4490196078431372;
            --primary-button-color-h: 142.85714285714286;
            --primary-button-color-l: 44.90196078431372%;
            --primary-button-color-s: 9.170305676855895%;
            --secondary-button-color-a: 1;
            --secondary-button-color-b: 0.5137254901960784;
            --secondary-button-color-h: 9.193548387096776;
            --secondary-button-color-l: 51.37254901960784%;
            --secondary-button-color-s: 100%;
            --tagline-font-size: 20px;
            --tagline-font-style: normal;
            --tagline-font-weight: 400;
            --tagline-text-color-a: 1;
            --tagline-text-color-b: 0.09803921568627451;
            --tagline-text-color-h: 0;
            --tagline-text-color-l: 9.803921568627452%;
            --tagline-text-color-s: 0%;
          }
        `}
      </style>

      <div className="ins-tile__background ">
        <div
          className="ins-tile__image "
          style={{ backgroundColor: 'rgba(129, 122, 117, 1)' }}
        >
          <picture className="ins-picture ins-picture--full ins-picture--cover ">
            <source
              srcSet="images/7jlV13T-2000x2000.webp, images/7jlV13T-2000x2000.webp 2x"
              media="(min-width: 900px)"
              type="image/webp"
            />
            <source
              srcSet="images/7jlV13T-600x600.webp, images/7jlV13T-1200x1200.webp 2x"
              media="(min-width: 500px)"
              type="image/webp"
            />
            <source
              srcSet="images/7jlV13T-1200x1200.webp, images/7jlV13T-1200x1200.webp 2x"
              type="image/webp"
            />
            <source
              srcSet="images/7jlV13T-2000x2000.jpg, images/7jlV13T-2000x2000.jpg 2x"
              media="(min-width: 900px)"
            />
            <source
              srcSet="images/7jlV13T-600x600.jpg, images/7jlV13T-1200x1200.jpg 2x"
              media="(min-width: 500px)"
            />
            <source
              srcSet="images/7jlV13T-1200x1200.jpg, images/7jlV13T-1200x1200.jpg 2x"
            />
            <img
              src="images/7jlV13T-200x200.jpg "
              alt="Fashion background"
              //fetchPriority="high"
              // onLoad={`(e) =>
              //   (e.target.parentNode.nextElementSibling.style.display = 'none')
              // `}
            />
          </picture>
        </div>
      </div>

      <div className="ins-tile__wrap ins-tile__animated ">
        <div role="heading" aria-level="2" className="ins-tile__tagline ">
          We got a ...
        </div>

        <h1 className="ins-tile__headline ">style</h1>

        <div className="ins-tile__footer ">
          <div className="ins-tile__description ins-tile__format ins-body__right">
            Step into a world of color with our carefully selected pieces, each
            designed to make you stand out from the crowd. Whether you're
            looking for a fun statement piece or a versatile staple, we've got
            you covered.
            <br />
            ብጥንቃቐ ዝተመርጹ ዝተፈላለየ ሕብሪ ዘለዎ ክዳውንቲ፣ ነፍሲ ወከፎም ካብቲ ህዝቢ ፍሉይ ንኽኾኑ ዝተዳለዉ እዮም።
            ዘዘናግዕ መግለጺ ወይ ባህ ዝብል ወይ ፍትው ትሕስቶ ብዙሕ ትደልዩ ትኹኑ፡ ሸፊንናልኩም ኣለና።
          </div>

          {/* Optional Buy Button */}
          
          <div className="ins-tile__buttons flex" >
            <div className="ins-button-wrap ins-tile__button ins-tile__button--primary" 
            data-preview-mode="false">
              <Link
                href="/store"
                role="button"
                aria-label="Buy"
                className="ins-control ins-control--button ins-control--solid ins-control--medium ins-control--pill"
              >
                <div className="ins-control__button">
                  <div className="ins-control__wrap">
                    <div className="ins-control__text">Buy</div>
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
}
