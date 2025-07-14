import React from 'react';
import './DmpIcon.scss';


interface IconProps {
  icon: string;
  classes?: string;
  fill?: string;
  width?: string;
  height?: string;
}

export function DmpIcon({ 
  icon, 
  classes = '',
  fill = "#5f6368",
  width="24px",
  height="24px"
 }: IconProps) {
  return (
    <svg
      data-testid="dmpIconSvg"
      className={`dmp-icon icon-${icon} ${classes}`}
      width={width}
      height={height}
      fill={fill}
    >
      <use
        href={`/icons/iconset.svg#icon-${icon}`}
        data-testid="dmpIconSvgUse"
      />
    </svg>
  )
}
