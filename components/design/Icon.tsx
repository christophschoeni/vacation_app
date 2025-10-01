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
  // Additional category icons
  Coffee,
  Gamepad2,
  Shirt,
  Fuel,
  Bus,
  Train,
  Ship,
  Bike,
  Stethoscope,
  ShoppingCart,
  Gift,
  Book,
  Phone,
  Wifi,
  MapPin as Location2,
  Mountain,
  Trees,
  Sun,
  Moon,
  Cloud,
  Utensils,
  Wine,
  Beer,
  IceCream,
  Pizza,
  ClipboardList,
  BookOpen,
  NotebookText,
  ListChecks,
  Bug,
  RefreshCw,
  ArrowUpDown,
  ArrowLeftRight,
  Calculator,
  Globe,
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
  'swap-horizontal': ArrowLeftRight,
  'swap-vertical': ArrowUpDown,
  'rotate': RefreshCw,

  // Navigation & UI
  'home': Home,
  'airplane': Plane,
  'compass': Compass,
  'settings': Settings,
  'menu': Menu,
  'back': Back,
  'globe': Globe,

  // Categories
  'restaurant': UtensilsCrossed,
  'car': Car,
  'hotel': Building,
  'music': Music,
  'shopping': ShoppingBag,
  'other': Package,

  // Food & Drink
  'coffee': Coffee,
  'utensils': Utensils,
  'wine': Wine,
  'beer': Beer,
  'ice-cream': IceCream,
  'pizza': Pizza,

  // Transportation
  'bus': Bus,
  'train': Train,
  'ship': Ship,
  'bike': Bike,
  'fuel': Fuel,

  // Activities & Entertainment
  'gamepad': Gamepad2,
  'mountain': Mountain,
  'trees': Trees,
  'book': Book,
  'gift': Gift,

  // Shopping & Items
  'shirt': Shirt,
  'cart': ShoppingCart,

  // Services
  'phone': Phone,
  'wifi': Wifi,
  'stethoscope': Stethoscope,

  // Weather & Nature
  'sun': Sun,
  'moon': Moon,
  'cloud': Cloud,

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
  'calculator': Calculator,

  // Misc
  'calendar': Calendar,
  'clock': Clock,
  'location': MapPin,
  'camera': Camera,
  'image': Image,
  'clipboard-list': ClipboardList,
  'book-template': BookOpen,
  'notepad-text': NotebookText,
  'list-checks': ListChecks,
  'check-square': ClipboardList,
  'bug': Bug,
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