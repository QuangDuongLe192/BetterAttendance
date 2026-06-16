import type { CSSProperties } from 'react';
import {
  LayoutGrid, MapPin, Users, Briefcase, Calendar, Coins, Shield, ScrollText,
  Plus, Check, X, ChevronRight, ChevronDown, ArrowRight, Wifi,
  Search, Bell, Settings, SquarePen, Trash2, Dot,
  Filter, Download, Star, Clock, Target, Lock, Unlock,
  BarChart2, Link, Send, RefreshCw, AlertTriangle, TrendingUp,
  type LucideIcon,
  User,
} from 'lucide-react';

interface IconProps {
  size?:   number;
  stroke?: string;
  sw?:     number;
  style?:  CSSProperties;
}

function w(LIcon: LucideIcon) {
  return ({ size = 18, stroke = 'currentColor', sw = 1.75, style }: IconProps) => (
    <LIcon
      size={size}
      color={stroke}
      strokeWidth={sw}
      style={{ flexShrink: 0, display: 'block', ...style }}
    />
  );
}

export const Icons = {
  grid:     w(LayoutGrid),
  pin:      w(MapPin),
  users:    w(Users),
  briefcase:w(Briefcase),
  calendar: w(Calendar),
  coins:    w(Coins),
  shield:   w(Shield),
  scroll:   w(ScrollText),
  plus:     w(Plus),
  check:    w(Check),
  x:        w(X),
  chevR:    w(ChevronRight),
  chevD:    w(ChevronDown),
  arrow:    w(ArrowRight),
  arrowR:   w(ArrowRight),
  wifi:     w(Wifi),
  search:   w(Search),
  bell:     w(Bell),
  settings: w(Settings),
  edit:     w(SquarePen),
  trash:    w(Trash2),
  dot:      w(Dot),
  filter:   w(Filter),
  download: w(Download),
  star:     w(Star),
  clock:    w(Clock),
  target:   w(Target),
  lock:     w(Lock),
  unlock:   w(Unlock),
  signal:   w(BarChart2),
  link:     w(Link),
  send:     w(Send),
  refresh:  w(RefreshCw),
  alert:    w(AlertTriangle),
  trendUp:  w(TrendingUp),
  user:     w(User),
};

export type IconName = keyof typeof Icons;
