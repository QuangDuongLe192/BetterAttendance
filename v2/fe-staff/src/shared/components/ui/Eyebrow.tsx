interface EyebrowProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Eyebrow({ children, style }: EyebrowProps) {
  return <div className="cd-eyebrow" style={style}>{children}</div>;
}
