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
  description?: string;
}

export function BrandColor({ varname, description }: BrandColorProps) {
  const styleprops: React.CSSProperties & { [key: string]: string } = {
    '--_color': `var(${varname})`,
  };

  return (
    <div className="brand-color" style={styleprops} title={description}>
      <code>{varname}</code>
    </div>
  );
}

export const handleDelete = async () => {
  try {
    console.log('Deleted');
  } catch (error) {
    console.error("An error occurred while deleting the item:", error);
  }
};