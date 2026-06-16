interface IconProps {
  size?: number;
  sw?: number;
  style?: React.CSSProperties;
  className?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
const Icon = ({ children, size = 20, sw = 1.75, style, className }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }} className={className}
  >
    {children}
  </svg>
);

export const Icons = {
  home:     (p: IconProps) => <Icon {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></Icon>,
  calendar: (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Icon>,
  activity: (p: IconProps) => <Icon {...p}><path d="M3 12h4l3-8 4 16 3-8h4"/></Icon>,
  bell:     (p: IconProps) => <Icon {...p}><path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 004 0"/></Icon>,
  user:     (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></Icon>,
  arrowL:   (p: IconProps) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>,
  arrowR:   (p: IconProps) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  chevR:    (p: IconProps) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  close:    (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>,
  check:    (p: IconProps) => <Icon {...p}><path d="M5 12l5 5L20 7"/></Icon>,
  clock:    (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  pin:      (p: IconProps) => <Icon {...p}><path d="M12 22s8-7 8-13a8 8 0 10-16 0c0 6 8 13 8 13z"/><circle cx="12" cy="9" r="3"/></Icon>,
  wifi:     (p: IconProps) => <Icon {...p}><path d="M2 9a14 14 0 0120 0"/><path d="M5 13a10 10 0 0114 0"/><path d="M8.5 16.5a6 6 0 017 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></Icon>,
  wifiOff:  (p: IconProps) => <Icon {...p}><path d="M3 3l18 18"/><path d="M9 17a4 4 0 016 0"/><path d="M5 13a10 10 0 0112-2"/><path d="M2 9a14 14 0 0119-2"/></Icon>,
  swap:     (p: IconProps) => <Icon {...p}><path d="M7 4l-4 4 4 4"/><path d="M3 8h13a4 4 0 010 8H8"/><path d="M17 20l4-4-4-4"/></Icon>,
  alert:    (p: IconProps) => <Icon {...p}><path d="M12 4l10 16H2L12 4z"/><path d="M12 10v4M12 17v.5"/></Icon>,
  logout:   (p: IconProps) => <Icon {...p}><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3"/><path d="M10 16l-4-4 4-4M6 12h12"/></Icon>,
  globe:    (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></Icon>,
  shield:   (p: IconProps) => <Icon {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/></Icon>,
  arrowUp:  (p: IconProps) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>,
  arrowDn:  (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>,
  plus:     (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  more:     (p: IconProps) => <Icon {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></Icon>,
  search:        (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></Icon>,
  clipboardCheck:(p: IconProps) => <Icon {...p}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></Icon>,
  layers:        (p: IconProps) => <Icon {...p}><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></Icon>,
};
