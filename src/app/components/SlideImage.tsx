'use client';

import Image from 'next/image';
import styles from '../home.module.css';

interface SlideImageProps {
  image: string;
  title: string;
  slideIndex?: number;
}

export default function SlideImage({ image, title, slideIndex = 0 }: SlideImageProps) {
  return (
    <div className={styles.slideImageSection}>
      <div className={styles.slideImageCard}>
        <Image
          src={image}
          alt={title}
          width={400}
          height={550}
          priority
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
