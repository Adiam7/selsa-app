'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../home.module.css';
import CarouselSlide from './CarouselSlide';

interface Slide {
  id: number;
  image: string;
  titleKey: string;
  descriptionKey: string;
  buttonTextKey: string;
  buttonLink: string;
}

export default function HeroCarousel() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const slides: Slide[] = [
    {
      id: 1,
      image: '/images/FgRjOsn-2000x2000.webp',
      titleKey: "Eri-day T-shirt",
      descriptionKey: 'A symbol of heritage and pride, reimagined in a bold, modern design. Eritrea Independence Day Celebration T-shirt. Bright colors and creative design. Discover our new collection. Meeting new items.',
      buttonTextKey: 'Buy',
      buttonLink: '/shop',
    },
    {
      id: 2,
      image: '/images/SwAbirv-2000x2000.webp',
      titleKey: 'Matching Style with Exclusive Designs',
      descriptionKey: 'Discover unique pieces that elevate your style with timeless elegance. Soft, comfy and stylish: the perfect blend for comfort and fashion.',
      buttonTextKey: 'Shop Now',
      buttonLink: '/shop',
    },
    {
      id: 3,
      image: '/images/sjDK0jw-2000x2000.webp',
      titleKey: 'Clothings',
      descriptionKey: 'Introducing to our latest collection a curated selection of seasonal fashion trends to elevate your style game.',
      buttonTextKey: 'Shop Now',
      buttonLink: '/shop',
    },
  ];

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const slide = slides[currentSlide];

  return (
    <div className={styles.heroCarousel}>
      <div className={styles.carouselContainer}>
        {/* Render Current Slide */}
        <CarouselSlide
          title={t(slide.titleKey)}
          description={t(slide.descriptionKey)}
          buttonText={t(slide.buttonTextKey)}
          buttonLink={slide.buttonLink}
          image={slide.image}
          slideIndex={currentSlide}
        />

        {/* Navigation Arrows */}
        <button
          className={styles.carouselArrow + ' ' + styles.arrowPrev}
          onClick={goToPrev}
          aria-label="Previous slide"
        >←</button>
        <button
          className={styles.carouselArrow + ' ' + styles.arrowNext}
          onClick={goToNext}
          aria-label="Next slide"
        >→</button>
      </div>
      {/* Dot Indicators */}
      <div className={styles.dotsContainer}>
        {slides.map((slide) => (
          <button
            key={slide.id}
            className={`${styles.dot} ${slide.id - 1 === currentSlide ? styles.dotActive : ''}`}
            onClick={() => goToSlide(slide.id - 1)}
            aria-label={`Go to slide ${slide.id}`}
          />
        ))}
      </div>
    </div>
  );
}


