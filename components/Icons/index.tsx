import React from 'react';


interface IconProps {
  icon: string;
}

export function DmpIcon({ icon }: IconProps) {
  return (
    <span className="material-symbols-outlined">{icon}</span>
  )
}
