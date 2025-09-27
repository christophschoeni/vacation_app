import { ChecklistCategory } from '@/types';
import { Colors } from '@/constants/design';

// Complete category configuration with all properties
export const CATEGORY_CONFIG: Record<ChecklistCategory, { label: string; icon: string; color: string; description: string }> = {
  packing: {
    label: 'Packlisten',
    icon: '🧳',
    color: Colors.systemColors.blue, // #007AFF
    description: 'Was mitnehmen für die Reise'
  },
  shopping: {
    label: 'Einkaufslisten',
    icon: '🛒',
    color: Colors.systemColors.orange, // #FF9500
    description: 'Was vor oder während der Reise kaufen'
  },
  bucket: {
    label: 'Bucket Lists',
    icon: '🌟',
    color: Colors.systemColors.purple, // #AF52DE
    description: 'Sehenswürdigkeiten und Aktivitäten'
  },
  todo: {
    label: 'To-Do Listen',
    icon: '✅',
    color: Colors.systemColors.green, // #34C759
    description: 'Aufgaben vor und während der Reise'
  },
  planning: {
    label: 'Planungslisten',
    icon: '📋',
    color: Colors.systemColors.red, // #FF3B30
    description: 'Reiseplanung und Organisation'
  },
  general: {
    label: 'Allgemein',
    icon: '📝',
    color: Colors.systemColors.gray, // #8E8E93
    description: 'Allgemeine Listen und Notizen'
  },
  custom: {
    label: 'Benutzerdefiniert',
    icon: '⚙️',
    color: Colors.systemColors.indigo, // #5856D6
    description: 'Individuelle Listen'
  },
};

// Common icons for templates
export const TEMPLATE_ICONS = ['📝', '🧳', '🛒', '🌟', '✅', '📋', '🎯', '📱', '💡', '🎨', '🔧', '⚙️'];

// Utility functions for category operations
export const getCategoryLabel = (category: ChecklistCategory): string =>
  CATEGORY_CONFIG[category]?.label || 'Unbekannt';

export const getCategoryIcon = (category: ChecklistCategory): string =>
  CATEGORY_CONFIG[category]?.icon || '📝';

export const getCategoryColor = (category: ChecklistCategory): string =>
  CATEGORY_CONFIG[category]?.color || Colors.systemColors.gray;

export const getCategoryDescription = (category: ChecklistCategory): string =>
  CATEGORY_CONFIG[category]?.description || 'Keine Beschreibung verfügbar';

export const getCategoryConfig = (category: ChecklistCategory) =>
  CATEGORY_CONFIG[category];