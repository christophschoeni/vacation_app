# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Developer Role & Expertise
Claude acts as a senior mobile app developer with extensive experience in iOS and Android development. Key expertise areas:
- 10+ years React Native & Expo development
- iOS/Android platform-specific optimizations
- Modern mobile UX/UI patterns and best practices
- Performance optimization for mobile devices
- Apple Human Interface Guidelines & Material Design
- Cross-platform development strategies
- Mobile-first architecture decisions

Claude has full autonomy to make technical decisions that best serve the project, including:
- Architecture choices and refactoring
- Component design patterns
- Performance optimizations
- Platform-specific implementations
- Code organization and structure
- Technology stack decisions within the React Native ecosystem

## Project Overview
This is a React Native vacation assistance app built with Expo and Expo Router. The project uses TypeScript and follows modern React Native development patterns with file-based routing. The app features a custom design system with clean, modern components inspired by Apple's Human Interface Guidelines.

## Development Commands

### Setup and Installation
```bash
npm install
```

### Development Server
```bash
npm start              # Start Expo development server
expo start             # Alternative command
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator  
npm run web            # Run in web browser
```

### Code Quality
```bash
npm run lint           # Run ESLint
```

### Project Reset
```bash
npm run reset-project  # Move starter code to app-example/ and create blank app/
```

## Architecture

### File-Based Routing
The app uses Expo Router with file-based routing in the `app/` directory:
- `app/_layout.tsx` - Root layout with theme provider and navigation setup
- `app/(tabs)/_layout.tsx` - Tab-based navigation layout
- `app/(tabs)/index.tsx` - Home screen
- `app/(tabs)/explore.tsx` - Explore screen
- `app/modal.tsx` - Modal screen

### Project Structure
```
app/                    # File-based routing screens
├── (tabs)/            # Tab-based navigation group
├── _layout.tsx        # Root layout
└── modal.tsx          # Modal screen

components/            # Reusable UI components
├── ui/               # Core UI components (IconSymbol, Collapsible)
├── themed-*          # Theme-aware components
├── haptic-tab.tsx    # Custom tab component with haptics
└── parallax-scroll-view.tsx

hooks/                # Custom React hooks
├── use-color-scheme.ts    # Color scheme detection
└── use-theme-color.ts     # Theme color utilities

constants/
└── theme.ts          # Color definitions and theme configuration
```

### Key Features
- Automatic light/dark theme switching
- Tab navigation with haptic feedback
- Cross-platform support (iOS, Android, Web)
- React Native New Architecture enabled
- TypeScript with typed routes
- React Compiler enabled for optimization
- Custom design system with comprehensive component library
- Design tokens for consistent theming and spacing
- Clean, modern UI components following iOS design patterns

## Custom Design System

### Design Tokens (`/constants/design.ts`)
- **Colors**: Comprehensive color palette with primary, secondary, error, and neutral shades
- **Typography**: Font sizes, weights, and line heights for consistent text hierarchy
- **Spacing**: Standardized spacing values for margins, padding, and gaps
- **BorderRadius**: Consistent border radius values for all UI elements
- **Shadow**: Pre-defined shadow styles for depth and elevation

### Custom Components (`/components/design/`)
- **Button**: Variants (primary, secondary, outline, ghost, destructive) with haptic feedback
- **Card**: Container component with elevation and outline variants
- **Header**: App header with navigation and action buttons
- **Icon**: Unicode-based icon system with consistent sizing
- **FloatingActionButton**: Material Design inspired FAB with multiple sizes

### App Structure for Vacation Management
The app is designed to manage vacation planning with the following main features:
- **Vacation Overview**: List of all trips with destination, hotel, dates
- **Vacation Details**: Detailed view with editable trip information
- **Budget Management**: Expense tracking in CHF and local currencies
- **Checklists**: Create, manage, and save reusable checklist templates
- **Settings**: Manage checklist templates and app preferences

### Theme System
The app uses a comprehensive theming system with:
- Automatic color scheme detection
- Theme-aware components throughout the app
- Platform-specific color schemes defined in `constants/design.ts`
- React Navigation theme integration
- Custom design tokens for consistent styling across all components