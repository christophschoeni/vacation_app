// 8px Grid System for consistent spacing
export const spacing = {
  xs: 4,   // 0.5 * 8px
  sm: 8,   // 1 * 8px
  md: 16,  // 2 * 8px
  lg: 24,  // 3 * 8px
  xl: 32,  // 4 * 8px
  xxl: 40, // 5 * 8px
  xxxl: 48, // 6 * 8px
} as const;

export type SpacingKey = keyof typeof spacing;

// Helper function to get spacing value
export const getSpacing = (key: SpacingKey): number => spacing[key];

// Common spacing patterns
export const spacingPatterns = {
  cardPadding: spacing.md,
  sectionMargin: spacing.lg,
  itemSpacing: spacing.sm,
  screenPadding: spacing.md,
  buttonPadding: spacing.md,
  headerMargin: spacing.lg,
} as const;