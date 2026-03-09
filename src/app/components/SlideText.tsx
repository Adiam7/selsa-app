'use client';

import styles from '../home.module.css';

interface SlideTextProps {
  title: string;
  description: string;
  slideIndex?: number;
}

export default function SlideText({ title, description, slideIndex = 0 }: SlideTextProps) {
  const lines = description.split('\n');
  const isSlide2 = slideIndex === 1;
  const isSlide3 = slideIndex === 2;
  const textColorClass = (isSlide2 || isSlide3) ? styles.slide2And3TextColor : '';

  return (
    <div className={styles.slideTextSection}>
      <div className={`${styles.slideTextContent} ${textColorClass}`}>
        <h2 className={`${styles.slideTextTitle} ${textColorClass}`}>{title}</h2>
        <div className={`${styles.slideTextDescription} ${textColorClass}`}>
          {lines.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
