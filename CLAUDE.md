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
This is a React Native vacation assistance app built with Expo and Expo Router. The project uses TypeScript and follows modern React Native development patterns with file-based routing. The app features a glassmorphism design system inspired by Apple's Liquid Glass guidelines and uses NativeWind + React Native Paper for UI components.

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
- Glassmorphism design with Apple's Liquid Glass aesthetic
- NativeWind (Tailwind CSS) for styling
- React Native Paper for Material Design components

## UI Libraries & Design System

### NativeWind (Tailwind CSS for React Native)
- Configured with custom glassmorphism colors in `tailwind.config.js`
- Metro bundler setup in `metro.config.js` with NativeWind integration
- Global CSS file: `global.css`

### React Native Paper
- Material Design components library
- Integrates well with custom glassmorphism styling
- Provides accessible, high-quality UI components

### Glassmorphism Effects
- Uses `@react-native-community/blur` for backdrop blur effects
- Custom glass colors defined in Tailwind config:
  - `glass-light`: rgba(255, 255, 255, 0.25)
  - `glass-dark`: rgba(0, 0, 0, 0.25)
  - `glass-border`: rgba(255, 255, 255, 0.18)

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
- Theme-aware components (ThemedText, ThemedView)
- Platform-specific color schemes defined in `constants/theme.ts`
- React Navigation theme integration
- Glassmorphism overlay effects for modern iOS-style design