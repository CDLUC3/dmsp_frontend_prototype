import React, { ReactNode } from 'react';

interface ExampleProps {
  children: ReactNode;
}

export function Example({ children }: ExampleProps) {
  return (
    <div className="sg-example">
      {children}
    </div>
  );
}

interface BrandColorProps {
  varname: string;
}

export function BrandColor({ varname }: BrandColorProps) {
  const styleprops: React.CSSProperties = {
    '--_color': `var(${varname})`,
  };

  return (
    <div className="brand-color" style={styleprops}>
      <code>{varname}</code>
    </div>
  );
}
