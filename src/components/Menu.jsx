'use client';

import Image from 'next/image';
import { usestate } from 'react';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="menu-container">
      <button onClick={toggleMenu} className="menu-toggle">
        <Image src="/images/menu-icon.png" alt={t('Menu')} width={30} height={30} />
      </button>
      {isOpen && (
        <nav className="menu absolute bg-black text-white left-0 top-20 w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 text-xl z-10 ">
          <ul>
            <li><a href="/">{t('Home')}</a></li>
            <li><a href="/store">{t('Store')}</a></li>
            <li><a href="/about">{t('About')}</a></li>
            <li><a href="/services">{t('Services')}</a></li>
            <li><a href="/contact">{t('Contact')}</a></li>
            <li><a href="/profile">{t('Account')}</a></li>
            <li><a href="/cart">{t('Cart')}</a></li>
            {/* <li><a href="/search">Search</a></li> */}
          </ul>
        </nav>
      )}
    </div>
  );
}
