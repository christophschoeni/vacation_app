import { Vacation } from '@/types';

// Kräftige Gradienten - getrennt in warme und kalte Farbfamilien
const VACATION_GRADIENTS = [
  // WARME FARBEN - Rot, Orange, Gelb, Pink, Magenta
  ['#D32F2F', '#F44336'], // Deep Red to Red
  ['#E91E63', '#AD1457'], // Pink to Deep Pink
  ['#FF5722', '#FF8F00'], // Deep Orange to Amber
  ['#F57C00', '#FF6F00'], // Orange to Dark Orange
  ['#BF360C', '#D84315'], // Dark Orange to Orange
  ['#C2185B', '#E91E63'], // Deep Pink to Pink
  ['#8E24AA', '#9C27B0'], // Purple to Magenta
  ['#7B1FA2', '#AD1457'], // Purple to Pink
  ['#FF8F00', '#F57C00'], // Amber to Orange
  ['#D84315', '#BF360C'], // Orange to Dark Orange
  ['#FF6F00', '#E65100'], // Orange to Deep Orange
  ['#E91E63', '#C2185B'], // Pink to Deep Pink
  ['#6A1B9A', '#8E24AA'], // Deep Purple to Purple
  ['#4A148C', '#7B1FA2'], // Deep Purple to Purple
  ['#AD1457', '#880E4F'], // Deep Pink to Dark Pink

  // KALTE FARBEN - Blau, Grün, Türkis, Teal, Indigo
  ['#1565C0', '#0D47A1'], // Blue to Dark Blue
  ['#0277BD', '#01579B'], // Light Blue to Dark Blue
  ['#0288D1', '#0277BD'], // Light Blue to Blue
  ['#2E7D32', '#1B5E20'], // Green to Dark Green
  ['#388E3C', '#2E7D32'], // Green to Deep Green
  ['#00695C', '#004D40'], // Teal to Dark Teal
  ['#00838F', '#006064'], // Cyan to Dark Cyan
  ['#009688', '#00695C'], // Teal to Dark Teal
  ['#1976D2', '#1565C0'], // Blue to Deep Blue
  ['#303F9F', '#1A237E'], // Indigo to Dark Indigo
  ['#3F51B5', '#303F9F'], // Indigo to Deep Indigo
  ['#512DA8', '#4527A0'], // Deep Purple to Purple
  ['#5D4037', '#3E2723'], // Brown to Dark Brown
  ['#455A64', '#263238'], // Blue Grey to Dark Grey
  ['#00ACC1', '#0097A7'], // Cyan to Dark Cyan
];

/**
 * Erweiterte Hash-Funktion für bessere Verteilung (FNV-1a Algorithm)
 */
function betterHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) % 2147483647;
  }
  return Math.abs(hash);
}

/**
 * Generiert eine deterministische Gradient-Farbe basierend auf Ferien-Daten
 */
export function getVacationGradient(vacation: Vacation): [string, string] {
  // Verwende Vacation ID als primären Hash-Wert für eindeutige Verteilung
  // Fallback auf Destination + Hotel falls ID nicht verfügbar ist
  const hashString = vacation.id || `${vacation.destination}${vacation.hotel}${vacation.startDate}`;

  const hash = betterHash(hashString);
  const gradientIndex = hash % VACATION_GRADIENTS.length;

  return VACATION_GRADIENTS[gradientIndex];
}

/**
 * Generiert eine leichte Overlay-Farbe für bessere Textlesbarkeit
 */
export function getVacationOverlayColor(isDark: boolean = false): string {
  return isDark
    ? 'rgba(0, 0, 0, 0.3)' // Dunkles Overlay für helle Gradienten
    : 'rgba(255, 255, 255, 0.1)'; // Helles Overlay für dunkle Gradienten
}

/**
 * Konvertiert Hex-Farbe zu RGB-Werten
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Berechnet die relative Luminanz einer Farbe (W3C Standard)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Bestimmt die optimale Textfarbe basierend auf dem Gradient
 * Alle Gradienten sind jetzt dunkel, daher immer weißer Text
 */
export function getVacationTextColor(gradient: [string, string]): string {
  return '#FFFFFF';
}

/**
 * Bestimmt die optimale Sekundärfarbe (für weniger wichtige Texte)
 */
export function getVacationSecondaryTextColor(gradient: [string, string]): string {
  return 'rgba(255, 255, 255, 0.8)';
}

/**
 * Bestimmt die optimale Iconfarbe
 */
export function getVacationIconColor(gradient: [string, string]): string {
  return 'rgba(255, 255, 255, 0.9)';
}

/**
 * Erstellt CSS-ähnliche Gradient-Strings für verschiedene Richtungen
 */
export function getGradientDirection(): string {
  // Leicht diagonale Richtung für mehr Dynamik
  return '135deg'; // Top-left to bottom-right
}