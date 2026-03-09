
"use client";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/features/cart/hooks/useCart';
import { useSession, signOut } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';
import { LoginLogo } from "@/components/icons/LoginLogo";
import { useFavorites } from '@/lib/hooks/useFavorites';

export default function Header() {
  const { t } = useTranslation();
  const { cart } = useCart();
  const { data: session } = useSession();
  const { data: favorites } = useFavorites();
  const cartCount = cart?.items?.length || 0;
  const favoriteCount = favorites?.length || 0;


  // Language switcher handler (client-only)
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState('ti');
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.localStorage) {
      setCurrentLang(localStorage.getItem('i18nextLng') || 'en');
    }
  }, []);
  const handleLanguageSwitch = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const current = localStorage.getItem('i18nextLng');
      const newLang = current === 'ti' ? 'en' : 'ti';
      localStorage.setItem('i18nextLng', newLang);
      console.log('Switched language to:', newLang);
      window.location.reload();
    }
  };

  return (
    <header className="ins-tile ins-tile--header ins-tile--left-logo-compact ins-tile--has-opacity ins-tile--full-opacity ins-tile--light-sidebar" role="banner" id="tile-header-fcHJMd">
      
        
        <div className="ins-header">
          <div className="ins-header__wrap">
            <div className="ins-header__inner">
              <div className="ins-header__row">
                <div className="ins-header__left">
                  <div className="ins-header__logo">
                    <Link href="/" className="ins-header__logo-inner">
                      <div className="ins-header__logo-image">
                        <div className="ins-header__logo-image-inner no-background">
                          {/* <Image
                            src="/images/g15.png"
                            alt="Selsa Store"
                            width={40}
                            height={40}
                            priority={false}
                            style={{ objectFit: 'fill' }}
                          /> */}
                          <LoginLogo className="flex justify-center" />
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="ins-header__menu ins-header__menu--few">
                    <nav className="main-navigation">
                      <div className="ins-header__menu ins-header__menu--few">
                        <div className="ins-header__menu-wrap">
                          <nav className="ins-header__menu-inner">
                            <div tabIndex={0} className="ins-header__menu-link">
                              <Link href="/store" className="ins-header__menu-link-title" aria-label={mounted ? t('Store') : 'Store'}>
                                <span>{mounted ? t('Store') : 'Store'}</span>
                              </Link>
                            </div>
                            <div tabIndex={0} className="ins-header__menu-link">
                              <Link href="/service" className="ins-header__menu-link-title" tabIndex={-1} aria-label={mounted ? t('About') : 'About'}>
                                <span>{mounted ? t('Our Services') : 'Our Services'}</span>
                              </Link>
                            </div>
                            <div tabIndex={0} className="ins-header__menu-link">
                              <Link href="/contact" className="ins-header__menu-link-title" tabIndex={-1} aria-label={mounted ? t('Contact Us') : 'Contact Us'}>
                                <span>{mounted ? t('Contact Us') : 'Contact Us'}</span>
                              </Link>
                            </div>
                          </nav>
                          <div className="ins-header__scroller">
                            <div className="ins-header__scroller-marker" style={{ left: '0%', width: '0%' }}></div>
                          </div>
                        </div>
                      </div>
                    </nav>
                  </div>
                </div>
                <style>{`
                    #tile-header-fcHJMd {
                      --background-color-a: 0;
                      --background-color-b: 0;
                      --background-color-h: 0;
                      --background-color-l: 0%;
                      --background-color-s: 0%;
                      --menu-and-icons-font-size: 16px;
                      --menu-and-icons-font-style: normal;
                      --menu-and-icons-font-weight: 400;
                    }
                    .ins-tile {
                      --header-height-desktop: 70;
                      --header-height-mobile: 60;
                    }
                  `}</style>
                <div className="ins-tile__wrap ins-tile__animated ins-header__right">
                    {/* Language Switcher */}
                    {mounted && (
                      <div style={{ position: 'relative', top: 8, right: 16, zIndex: 1000 }}>
                        <button onClick={handleLanguageSwitch} style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontWeight: 600 }}>
                          {currentLang === 'ti' ? 'English' : 'ትግርኛ'}
                        </button>
                      </div>
                    )}
                <div className="ins-header__right">
                  <Link 
                    href="/catalog/search" 
                    className="ins-header__icon ins-header__icon--search" 
                    role="button" 
                    aria-label={mounted ? t('Search the website') : 'Search the website'} 
                    title={mounted ? t('Search the website') : 'Search the website'}
                    name="name"
                    placeholder={mounted ? t('Search') : 'Search'}>

                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.8333 9.83333C16.8333 5.96667 13.7 2.86667 9.86667 2.86667C6 2.86667 2.9 6 2.9 9.83333C2.9 13.7 6.03333 16.8 9.86667 16.8C13.7 16.8333 16.8333 13.7 16.8333 9.83333ZM22 21.4L21.4 22L15.0667 15.6667C13.6667 16.9 11.8667 17.6667 9.83333 17.6667C5.5 17.6667 2 14.1667 2 9.83333C2 5.5 5.5 2 9.83333 2C14.1667 2 17.6667 5.5 17.6667 9.83333C17.6667 11.8333 16.9 13.6667 15.6667 15.0667L22 21.4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                  </Link>
                  {/* ⭐️ NEW Favourite Icon - Only show when authenticated */}
                  {session && (
                    <Link href="/favourites" className="ins-header__icon ins-header__icon--favourite relative" role="button" aria-label={mounted ? t('Go to favourites') : 'Go to favourites'} title={mounted ? t('Go to favourites') : 'Go to favourites'}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path 
                            d="M12.1 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                              2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09 
                              C13.09 3.81 14.76 3 16.5 3 
                              19.58 3 22 5.42 22 8.5 
                              c0 3.78-3.4 6.86-8.55 11.54L12.1 21.35z" 
                            fill="currentColor"
                          />
                        </svg>
                        {favoriteCount > 0 && (
                          <span className="absolute-badge" style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            zIndex: 9999,
                            pointerEvents: 'none'
                          }}>
                            {favoriteCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}
                  {/* ⭐️ Profile Icon - Only show when authenticated */}
                  {session && (
                    <Link href="/profile" className="ins-header__icon ins-header__icon--account" role="button" aria-label={mounted ? t('Go to your account') : 'Go to your account'}>
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23.5 12.0037C23.5012 10.0898 23.0244 8.20585 22.1129 6.52281C21.2014 4.83976 19.884 3.41084 18.2802 2.36565C16.6764 1.32047 14.8369 0.692104 12.9287 0.537549C11.0204 0.382995 9.10378 0.707143 7.35258 1.48059C5.60138 2.25404 4.07105 3.45232 2.9004 4.96672C1.72975 6.48113 0.955821 8.26374 0.64882 10.1529C0.34182 12.042 0.511461 13.9779 1.14235 15.7848C1.77325 17.5918 2.84543 19.2128 4.26165 20.5006C4.28966 20.5338 4.32226 20.5629 4.35848 20.5869C6.46141 22.4631 9.18149 23.5 12.0001 23.5C14.8188 23.5 17.5388 22.463 19.6417 20.5867C19.6778 20.5628 19.7102 20.5338 19.7381 20.5007C20.9235 19.4252 21.8705 18.1135 22.5184 16.6501C23.1663 15.1867 23.5007 13.604 23.5 12.0037ZM1.42 12.0037C1.41878 10.2648 1.84643 8.55248 2.66509 7.01827C3.48375 5.48405 4.66817 4.17528 6.11348 3.20782C7.55879 2.24035 9.22042 1.64404 10.9512 1.47168C12.6821 1.29931 14.4287 1.55621 16.0365 2.21963C17.6444 2.88305 19.0638 3.93252 20.1691 5.27513C21.2744 6.61775 22.0316 8.21209 22.3735 9.91701C22.7155 11.6219 22.6317 13.3848 22.1295 15.0496C21.6274 16.7145 20.7224 18.2298 19.4947 19.4616C18.3528 17.55 16.5208 16.1493 14.3764 15.5482C15.373 15.0182 16.1638 14.1702 16.6228 13.1392C17.0819 12.1081 17.1828 10.9532 16.9096 9.85816C16.6364 8.76314 16.0047 7.79091 15.1151 7.09614C14.2254 6.40136 13.1289 6.02395 12 6.02395C10.8711 6.02395 9.77458 6.40136 8.88494 7.09614C7.9953 7.79091 7.36363 8.76314 7.09042 9.85816C6.8172 10.9532 6.91814 12.1081 7.37717 13.1392C7.8362 14.1702 8.62696 15.0182 9.62364 15.5482C7.4792 16.1493 5.64721 17.55 4.50533 19.4616C3.52633 18.4819 2.74996 17.3191 2.22057 16.0394C1.69119 14.7598 1.41915 13.3884 1.42 12.0037ZM12 15.2226C11.1812 15.2226 10.3808 14.9799 9.69994 14.5252C9.01912 14.0704 8.48848 13.424 8.17514 12.6678C7.86179 11.9115 7.77981 11.0794 7.93955 10.2765C8.09929 9.4737 8.49359 8.73626 9.07258 8.15745C9.65157 7.57864 10.3892 7.18447 11.1923 7.02478C11.9954 6.86509 12.8278 6.94705 13.5843 7.26029C14.3408 7.57354 14.9874 8.10401 15.4423 8.78461C15.8972 9.46522 16.14 10.2654 16.14 11.084C16.1388 12.1812 15.7022 13.2332 14.9261 14.0091C14.1499 14.785 13.0976 15.2214 12 15.2226ZM5.19947 20.0991C5.88217 18.8976 6.87116 17.8985 8.06574 17.2035C9.26032 16.5084 10.6178 16.1422 12 16.1422C13.3822 16.1422 14.7397 16.5084 15.9343 17.2035C17.1288 17.8985 18.1178 18.8976 18.8005 20.0991C16.897 21.7015 14.4885 22.5803 12 22.5803C9.51148 22.5803 7.10295 21.7015 5.19947 20.0991Z" fill="currentColor"></path>
                        </svg>
                    </Link>
                  )}
                  
                  {/* ⭐️ Cart Icon */}
                  <Link href="/cart" role="button" className={`ins-header__icon ins-header__icon--cart${cartCount > 0 ? '' : ' ins-header__icon--cart-empty'}`} aria-label={mounted ? t('Go to your shopping cart') : 'Go to your shopping cart'} title={mounted ? t('Go to your shopping cart') : 'Go to your shopping cart'}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image src="/images/shopping.png" alt={mounted ? t('cart') : 'cart'} width={24} height={24} style={{ objectFit: 'cover' }} />
                        {cartCount > 0 && (
                          <span className="absolute-badge" style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            zIndex: 9999,
                            pointerEvents: 'none'
                          }}>
                            {cartCount}
                          </span>
                        )}
                      </div>
                  </Link>
                  {/* ⭐️ Dashboard Icon - Only show when authenticated */}
                  {session && (
                    <Link href="/dashboard" className="ins-header__icon ins-header__icon--checkout" role="button" aria-label={mounted ? t('Proceed to checkout') : 'Proceed to checkout'} title={mounted ? t('Proceed to checkout') : 'Proceed to checkout'}>
                        <svg width="50px" height="37px" viewBox="0 0 50 37" version="1.1">
                          <g id="surface1">
                            <path  d="M 12.957031 7.433594 C 12.816406 7.46875 12.574219 7.644531 12.417969 7.808594 L 12.125 8.109375 L 12.074219 11.039062 C 11.984375 16.195312 11.992188 24.988281 12.082031 25.488281 C 12.183594 26.027344 12.449219 26.347656 12.949219 26.542969 C 13.25 26.660156 14.625 26.667969 25.167969 26.652344 C 36.25 26.628906 37.058594 26.617188 37.308594 26.484375 C 37.449219 26.398438 37.660156 26.214844 37.765625 26.0625 L 37.957031 25.785156 L 37.957031 8.195312 L 37.785156 7.957031 C 37.683594 7.832031 37.484375 7.644531 37.324219 7.554688 C 37.042969 7.386719 36.875 7.386719 25.125 7.367188 C 18.390625 7.359375 13.101562 7.394531 12.957031 7.433594 Z M 36.910156 8.558594 C 36.976562 8.640625 36.992188 10.523438 36.984375 15.496094 L 36.957031 22.324219 L 25.023438 22.347656 L 13.082031 22.367188 L 13.082031 15.460938 C 13.082031 11.664062 13.109375 8.523438 13.140625 8.5 C 13.167969 8.464844 18.507812 8.441406 25 8.441406 C 34.859375 8.441406 36.824219 8.457031 36.910156 8.558594 Z M 25.441406 23.640625 C 25.867188 23.832031 26.058594 24.566406 25.785156 24.964844 C 25.441406 25.472656 24.757812 25.511719 24.382812 25.058594 C 23.75 24.296875 24.558594 23.226562 25.441406 23.640625 Z M 25.441406 23.640625 "/>
                            <path  d="M 18.082031 11.132812 L 18.082031 12.742188 L 21.082031 12.742188 L 21.082031 12.296875 C 21.082031 11.730469 20.726562 10.945312 20.25 10.464844 C 19.839844 10.050781 19.042969 9.648438 18.476562 9.570312 L 18.082031 9.511719 Z M 18.082031 11.132812 "/>
                            <path  d="M 33.390625 10.007812 C 33.359375 10.042969 33.332031 10.160156 33.332031 10.261719 C 33.332031 10.472656 33.632812 10.617188 33.867188 10.523438 C 33.933594 10.5 34.007812 10.5 34.035156 10.523438 C 34.074219 10.574219 31.023438 13.925781 30.933594 13.925781 C 30.898438 13.925781 30.214844 13.410156 29.417969 12.777344 C 27.5 11.257812 27.632812 11.34375 27.382812 11.527344 C 27.273438 11.621094 26.359375 12.421875 25.339844 13.328125 C 23.492188 14.980469 23.265625 15.25 23.632812 15.394531 C 23.800781 15.460938 23.675781 15.554688 25.660156 13.800781 C 26.542969 13.003906 27.351562 12.296875 27.457031 12.222656 C 27.640625 12.078125 27.660156 12.085938 28.882812 13.054688 C 29.566406 13.597656 30.273438 14.160156 30.464844 14.3125 C 30.660156 14.472656 30.882812 14.601562 30.964844 14.601562 C 31.066406 14.601562 31.726562 13.941406 32.742188 12.828125 C 33.625 11.847656 34.382812 11.054688 34.425781 11.054688 C 34.464844 11.054688 34.5 11.183594 34.5 11.34375 C 34.5 11.636719 34.640625 11.765625 34.875 11.671875 C 34.984375 11.636719 35 11.476562 34.984375 10.8125 L 34.957031 10 L 34.207031 9.976562 C 33.792969 9.96875 33.425781 9.976562 33.390625 10.007812 Z M 33.390625 10.007812 "/>
                            <path  d="M 16.441406 10.382812 C 15.667969 10.660156 15.058594 11.234375 14.691406 12.027344 C 14.484375 12.472656 14.457031 12.632812 14.457031 13.335938 C 14.464844 14.035156 14.492188 14.203125 14.699219 14.660156 C 14.992188 15.308594 15.640625 15.953125 16.308594 16.273438 C 16.726562 16.464844 16.898438 16.5 17.542969 16.5 C 18.191406 16.5 18.367188 16.464844 18.816406 16.253906 C 19.816406 15.789062 20.582031 14.667969 20.582031 13.671875 L 20.582031 13.25 L 17.515625 13.25 L 17.523438 12.71875 C 17.535156 12.433594 17.535156 11.75 17.515625 11.199219 L 17.5 10.210938 L 17.191406 10.210938 C 17.015625 10.21875 16.675781 10.289062 16.441406 10.382812 Z M 16.441406 10.382812 "/>
                            <path  d="M 33.390625 13.488281 C 33.265625 13.628906 33.25 14 33.25 17.117188 C 33.25 21.261719 33.160156 20.929688 34.316406 20.929688 C 34.839844 20.929688 35.101562 20.898438 35.234375 20.796875 L 35.417969 20.667969 L 35.417969 17.132812 C 35.417969 14.035156 35.398438 13.578125 35.285156 13.46875 C 35.183594 13.367188 34.964844 13.335938 34.339844 13.335938 C 33.660156 13.335938 33.5 13.359375 33.390625 13.488281 Z M 33.390625 13.488281 "/>
                            <path  d="M 26.765625 14.144531 L 26.582031 14.273438 L 26.582031 17.4375 C 26.582031 21.210938 26.5 20.929688 27.648438 20.929688 C 28.175781 20.929688 28.433594 20.898438 28.566406 20.796875 L 28.75 20.667969 L 28.75 17.503906 C 28.75 13.730469 28.832031 14.011719 27.683594 14.011719 C 27.160156 14.011719 26.898438 14.042969 26.765625 14.144531 Z M 26.765625 14.144531 "/>
                            <path  d="M 30.082031 16.625 C 29.925781 16.785156 29.917969 16.90625 29.917969 18.695312 C 29.917969 21.03125 29.867188 20.929688 31.023438 20.929688 C 32.140625 20.929688 32.082031 21.058594 32.082031 18.710938 C 32.082031 16.355469 32.132812 16.457031 31 16.457031 C 30.359375 16.457031 30.226562 16.484375 30.082031 16.625 Z M 30.082031 16.625 "/>
                            <path  d="M 23.515625 16.878906 C 23.199219 17.015625 23.160156 17.320312 23.183594 19.015625 C 23.214844 20.972656 23.183594 20.929688 24.339844 20.929688 C 25.449219 20.929688 25.417969 21 25.417969 18.878906 C 25.417969 17.53125 25.390625 17.132812 25.300781 16.996094 C 25.199219 16.863281 25.066406 16.835938 24.441406 16.820312 C 24.042969 16.804688 23.625 16.835938 23.515625 16.878906 Z M 23.515625 16.878906 "/>
                            <path  d="M 14.507812 18.347656 C 14.457031 18.40625 14.433594 18.523438 14.464844 18.601562 C 14.515625 18.726562 14.808594 18.734375 17.566406 18.71875 C 20.484375 18.695312 20.625 18.6875 20.648438 18.535156 C 20.667969 18.449219 20.632812 18.347656 20.566406 18.304688 C 20.507812 18.265625 19.140625 18.230469 17.535156 18.230469 C 15.148438 18.230469 14.582031 18.253906 14.507812 18.347656 Z M 14.507812 18.347656 "/>
                            <path  d="M 14.515625 19.429688 C 14.367188 19.582031 14.390625 19.730469 14.582031 19.832031 C 14.683594 19.890625 15.734375 19.910156 17.632812 19.902344 C 20.226562 19.875 20.535156 19.859375 20.609375 19.730469 C 20.675781 19.632812 20.667969 19.554688 20.589844 19.460938 C 20.492188 19.34375 20.125 19.328125 17.550781 19.328125 C 15.382812 19.328125 14.589844 19.351562 14.515625 19.429688 Z M 14.515625 19.429688 "/>
                            <path  d="M 14.535156 20.542969 C 14.410156 20.644531 14.390625 20.695312 14.464844 20.820312 C 14.550781 20.957031 14.726562 20.972656 16.214844 21 C 18.066406 21.023438 18.25 21 18.25 20.761719 C 18.25 20.476562 17.984375 20.425781 16.316406 20.425781 C 15.035156 20.425781 14.667969 20.449219 14.535156 20.542969 Z M 14.535156 20.542969 "/>
                            <path  d="M 24.75 24.304688 C 24.625 24.542969 24.785156 24.8125 25.042969 24.8125 C 25.292969 24.8125 25.425781 24.585938 25.324219 24.324219 C 25.234375 24.085938 24.875 24.070312 24.75 24.304688 Z M 24.75 24.304688 "/>
                            <path  d="M 21.832031 27.757812 L 21.832031 28.339844 L 20.882812 28.375 C 19.824219 28.398438 19.640625 28.476562 19.273438 29.03125 C 19.023438 29.394531 19.035156 29.75 19.292969 30.003906 L 19.492188 30.214844 L 25.023438 30.214844 C 30.457031 30.214844 30.558594 30.214844 30.734375 30.046875 C 31.160156 29.648438 30.984375 29.007812 30.339844 28.601562 C 29.992188 28.375 29.910156 28.359375 29.109375 28.359375 L 28.257812 28.359375 L 28.234375 27.785156 L 28.207031 27.21875 L 25.023438 27.191406 L 21.832031 27.175781 Z M 21.832031 27.757812 "/>
                          </g>
                        </svg>
                    </Link>
                  )}
                  {/* ⭐️ Sign In Button - Show when not authenticated */}
                  {!session && (
                    <Link className="ins-header__icon ins-header__icon--sign-in" href="/auth/login" title={mounted ? t('Sign In') : 'Sign In'}>
                      <LogIn size={24} />
                    </Link>
                  )}
                  {/* ⭐️ Sign Out Icon - Only show when authenticated */}
                  {session && (
                    <Link 
                      href="/" 
                      onClick={(e) => {
                        e.preventDefault();
                        signOut({ redirect: true, callbackUrl: '/' });
                      }}
                      className="ins-header__icon ins-header__icon--sign-out" 
                      aria-label={mounted ? t('Sign out') : 'Sign out'} 
                      title={mounted ? t('Sign out') : 'Sign out'}
                    >
                      <LogOut size={24} />
                    </Link>
                  )}
                  {/* ⭐️ Burger Menu Icon */}
                  <Link className="ins-header__icon ins-header__icon--burger" href="#menu" role="button" aria-label={mounted ? t('Website menu') : 'Website menu'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.5 8.5H0.5C0.2 8.5 0 8.3 0 8C0 7.7 0.2 7.5 0.5 7.5H23.5C23.8 7.5 24 7.7 24 8C24 8.3 23.8 8.5 23.5 8.5Z" fill="currentColor"></path>
                      <path d="M14.5 16.5H0.5C0.2 16.5 0 16.3 0 16C0 15.7 0.2 15.5 0.5 15.5H14.5C14.8 15.5 15 15.7 15 16C15 16.3 14.8 16.5 14.5 16.5Z" fill="currentColor"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
