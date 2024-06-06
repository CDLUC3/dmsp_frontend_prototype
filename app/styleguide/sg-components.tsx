
export function Example({children}) {
  return (
    <div className="sg-example">
      {children}
    </div>
  )
}


export function BrandColor({varname}) {
  let styleprops = {
    '--_color': `var(${varname})`,
  };

  return (
    <div className="brand-color" style={styleprops}>
      <code>{varname}</code>
    </div>
  );
}
