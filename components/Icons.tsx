import React from 'react';


interface IconProps {
  name: string;
  classList: string;
}

export function DmpIcon({ icon, classes }: IconProps) {
  return (
    <span className="material-symbols-outlined {classList}">{icon}</span>
  )
}
