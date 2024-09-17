import React from 'react';
import './DmpIcon.scss';


interface IconProps {
  icon: string;
}

export function DmpIcon({ icon }: IconProps) {
  return (
    <svg
      className={`dmp-icon icon-${icon}`}
      width="24px"
      height="24px"
      fill="#5f6368"
    >
      <use href={`/icons/iconset.svg#icon-${icon}`} />
    </svg>
  )
}
