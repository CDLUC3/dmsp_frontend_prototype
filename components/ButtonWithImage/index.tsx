'use client'

import React from 'react'
import Image from 'next/image';
import { Button } from "react-aria-components";
import styles from './buttonWithImage.module.css';

interface ButtonWithImageProps {
  imageUrl: string;
  buttonText: string;
}
const ButtonWithImage = ({ imageUrl, buttonText }: ButtonWithImageProps) => {
  return (
    <Button className={`${styles.imageButton} react-aria-Button`}>
      <a href=""><Image src={imageUrl} className={styles.icon} width={20} height={20} alt="" /></a>
      {buttonText}
    </Button>
  )

}

export default ButtonWithImage;