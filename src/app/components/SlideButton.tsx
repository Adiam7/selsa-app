'use client';

import styles from '../home.module.css';

interface SlideButtonProps {
  text: string;
  link: string;
  slideIndex?: number;
}

export default function SlideButton({ text, link, slideIndex = 0 }: SlideButtonProps) {
  const isSlide2 = slideIndex === 1;
  const isSlide3 = slideIndex === 2;
  const buttonColorClass = (isSlide2 || isSlide3) ? styles.slide2And3ButtonColor : '';

  return (
    <a href={link} className={`${styles.slideButtonElement} ${buttonColorClass}`}>
      {text}
    </a>
  );
}
