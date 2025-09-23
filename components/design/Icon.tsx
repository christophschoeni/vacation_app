import React from 'react';
import { ViewStyle } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  MoreHorizontal,
  Home,
  Plane,
  Compass,
  Settings,
  Menu,
  ArrowLeft as Back,
  UtensilsCrossed,
  Car,
  Building,
  Music,
  ShoppingBag,
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Heart,
  Star,
  DollarSign,
  Wallet,
  Banknote,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Image,
  LucideIcon,
} from 'lucide-react-native';

// Icon mapping to Lucide components
const iconMap: Record<string, LucideIcon> = {
  // Navigation
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,

  // Actions
  'plus': Plus,
  'minus': Minus,
  'close': X,
  'check': Check,
  'edit': Edit,
  'delete': Trash2,
  'refresh': RotateCcw,
  'search': Search,
  'filter': Filter,
  'more': MoreHorizontal,

  // Navigation & UI
  'home': Home,
  'airplane': Plane,
  'compass': Compass,
  'settings': Settings,
  'menu': Menu,
  'back': Back,

  // Categories
  'restaurant': UtensilsCrossed,
  'car': Car,
  'hotel': Building,
  'music': Music,
  'shopping': ShoppingBag,
  'other': Package,

  // Status & Feedback
  'warning': AlertTriangle,
  'error': AlertCircle,
  'success': CheckCircle,
  'info': Info,
  'heart': Heart,
  'heart-filled': Heart,
  'star': Star,
  'star-filled': Star,

  // Currency & Money
  'currency': DollarSign,
  'wallet': Wallet,
  'budget': Banknote,

  // Misc
  'calendar': Calendar,
  'clock': Clock,
  'location': MapPin,
  'camera': Camera,
  'image': Image,
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function Icon({ name, size = 24, color = '#000000', style }: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      style={style}
    />
  );
}