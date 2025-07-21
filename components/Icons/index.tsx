import React from 'react';
import './DmpIcon.scss';


interface IconProps {
  icon: string;
  classes?: string;
  fill?: string;
}

export function DmpIcon({ 
  icon, 
  classes = '',
  fill = "#5f6368",
 }: IconProps) {
  return (
    <svg
      data-testid="dmpIconSvg"
      className={`dmp-icon icon-${icon} ${classes}`}
      width="24px"
      height="24px"
      fill={fill}
    >
      <use
        href={`/icons/iconset.svg#icon-${icon}`}
        data-testid="dmpIconSvgUse"
      />
    </svg>
  )
}
