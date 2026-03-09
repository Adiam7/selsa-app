// Navi.jsx

import React from "react";

export default function Navi() {
  return (
    <div id="sel-instantsite-website">
      <div
        id="sel-instantsite"
        className="ins-tiles ins-tiles--300 ins-tiles--400 ins-tiles--500 ins-tiles--600 ins-tiles--700 ins-tiles--900 ins-tiles--1100"
      >
        {/* Global Font Import & Theme Variables */}
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');

            :root {
              --global-background-color-a: 1;
              --global-background-color-b: 0.9764705882352941;
              --global-background-color-h: 0;
              --global-background-color-l: 97.6470588235294%;
              --global-background-color-s: 0%;

              --global-body-color-a: 1;
              --global-body-color-b: 0.09803921569;
              --global-body-color-h: 0;
              --global-body-color-l: 9.803921569%;
              --global-body-color-s: 0%;

              --global-body-font-family: 'Questrial', sans-serif;
              --global-body-font-size: 18px;

              --global-button-color-a: 1;
              --global-button-color-b: 0.09803921569;
              --global-button-color-h: 0;
              --global-button-color-l: 9.803921569%;
              --global-button-color-s: 0%;

              --global-button-size-large: 20px;
              --global-button-size-medium: 16px;
              --global-button-size-small: 14px;

              --global-link-color-a: 1;
              --global-link-color-b: 0.43529411765;
              --global-link-color-h: 206;
              --global-link-color-l: 43.529411765%;
              --global-link-color-s: 76.576576577%;

              --global-subtitle-font-size: 24px;
              --global-title-font-family: 'Questrial', sans-serif;
              --global-title-font-size: 48px;
              --global-title-color-a: 1;
              --global-title-color-b: 0.09803921569;
              --global-title-color-h: 0;
              --global-title-color-l: 9.803921569%;
              --global-title-color-s: 0%;

              --global-tile-margin: 100;
              --global-tile-max-width: 1120;
              --scrollbarWidth: 0px;
            }

            body {
              font-family: var(--global-body-font-family);
              font-size: var(--global-body-font-size);
            }
          `}
        </style>

        {/* Accessibility: Skip to Main Content */}
        <div className="ins-hidden-skip-link">
          <div className="ins-hidden-skip-link__wrap">
            <a
              href="#tile-cover-gBoQjH"
              tabIndex={0}
              role="button"
              aria-label={t('Skip to main content')}
              className="ins-control ins-control--button ins-control--outline"
            >
              <div className="ins-control__button">
                <div className="ins-control__wrap">
                  <span className="ins-control__text">{t('Skip to main content')}</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Notification Area Placeholder */}
        <div className="ins-notices ins-notices--fixed ins-notices--top ins-notices--right ins-notices--order-direct">
          <div className="ins-notices__wrap">
            {/* Notifications will be rendered here */}
          </div>
        </div>
      </div>
    </div>
  );
}
