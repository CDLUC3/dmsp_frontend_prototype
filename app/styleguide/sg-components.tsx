import React, { ReactNode } from 'react';


interface ExampleProps {
  children: ReactNode;
}

export function Example({ children }: ExampleProps) {
  return (
    <div className="sg-example">
      {children}
    </div>
  )
}


interface BrandColorProps {
  varname: string,
}

export function BrandColor({ varname }: BrandColorProps) {
  const styleprops = {
    '--_color': `var(${varname})`,
  } as React.CSSProperties;

  return (
    <div className="brand-color" style={styleprops}>
      <code>{varname}</code>
    </div>
  );
}
