import React from 'react';
import './DmpIcon.scss';


interface IconProps {
  icon: string;
  classes?: string;
}

export function DmpIcon({ icon, classes }: IconProps) {
  return (
    <svg
      data-testid="dmpIconSvg"
      className={`dmp-icon icon-${icon} ${classes}`}
      width="24px"
      height="24px"
      fill="#5f6368"
    >
      <use
        href={`/icons/iconset.svg#icon-${icon}`}
        data-testid="dmpIconSvgUse"
      />
    </svg>
  )
}
