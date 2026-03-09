import React from 'react';
import './Header.css';

const Header = () => (
  <header>
    <img src="/images/logo.png" alt="Logo" />
    <nav>
      <ul>
        <li><a href="/home.html">Home</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>
);

export default Header;