'use client'

import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import styles from './buttonWithImage.module.scss';

interface ButtonWithImageProps {
  url: string;
  imageUrl?: string;
  buttonText: string;
}

const ButtonWithImage: React.FC<ButtonWithImageProps> = ({ url, imageUrl, buttonText }) => {
  return (
    <Link href={url} className={`${styles.imageButton} react-aria-Button`}>
      {imageUrl && (
        <Image src={imageUrl} className={styles.icon} width={20} height={20} alt="" />
      )}
      {buttonText}
    </Link>
  );
};

export default ButtonWithImage;