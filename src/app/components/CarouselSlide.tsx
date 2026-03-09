'use client';

import styles from '../home.module.css';
import SlideText from './SlideText';
import SlideImage from './SlideImage';
import SlideButton from './SlideButton';

interface CarouselSlideProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  slideIndex: number;
}

export default function CarouselSlide({
  title,
  description,
  buttonText,
  buttonLink,
  image,
  slideIndex,
}: CarouselSlideProps) {
  const isSlide2 = slideIndex === 1;
  const isSlide3 = slideIndex === 2;

  return (
    <>
      {/* Slide 3: Image Container (appears on left) */}
      {isSlide3 && (
        <div className={`${styles.carouselImageContainer} ${styles.slide3ImageLeft}`}>
          <SlideImage image={image} title={title} slideIndex={slideIndex} />
        </div>
      )}

      {/* Slide 1 & 2: Text Container / Slide 3: Text Container (on right) */}
      <div
        className={`${
          isSlide3 ? styles.carouselTextContainer : styles.carouselTextContainer
        } ${isSlide2 ? styles.slide2Background : ''} ${isSlide3 ? styles.slide3Background : ''}`}
      >
        {/* Text Content */}
        <SlideText
          title={title}
          description={description}
          slideIndex={slideIndex}
        />

        {/* Button Wrapper */}
        <div className={styles.slideButtonWrapper}>
          <SlideButton text={buttonText} link={buttonLink} slideIndex={slideIndex} />
        </div>
      </div>

      {/* Slide 1 & 2: Image Container (on right) */}
      {!isSlide3 && (
        <div className={styles.carouselImageContainer}>
          <SlideImage image={image} title={title} slideIndex={slideIndex} />
        </div>
      )}
    </>
  );
}
