# Ferien Budget - Vacation Budget App

## Tech Stack
- **Expo SDK**: 54.x (New Architecture enabled)
- **React Native**: 0.81.4
- **React**: 19.1.0
- **Navigation**: Expo Router 6.x (file-based routing with typed routes)
- **Database**: SQLite via Expo SQLite + Drizzle ORM
- **UI Libraries**: Lucide React Native icons, Expo Blur, Expo Linear Gradient
- **Animations**: React Native Reanimated 4.x, React Native Gesture Handler
- **i18n**: i18n-js for German/English localization

## Project Structure
```
app/                    # Expo Router file-based routes
  (tabs)/              # Tab navigation layout
  vacation/            # Vacation management screens
  expense/             # Expense tracking screens
  checklist/           # Checklist features
  settings/            # App settings
  template/            # Budget templates
components/            # Reusable UI components
lib/                   # Business logic, database, utilities
hooks/                 # Custom React hooks
constants/             # App constants and theme
contexts/              # React Context providers
types/                 # TypeScript type definitions
```

## Critical UI Development Rules

### 1. SafeAreaView & Layout
- **ALWAYS** use `react-native-safe-area-context` for SafeAreaView
- **NEVER** use React Native's built-in SafeAreaView (deprecated in Expo)
- Edge-to-edge mode is ENABLED on Android - account for system bars

### 2. Expo Router Patterns
- Use file-based routing - create files in `app/` directory
- Use typed routes (enabled via `experiments.typedRoutes`)
- Navigation: `import { router } from 'expo-router'` then `router.push('/path')`
- Layouts: Use `_layout.tsx` files for nested navigation structures
- Modals: Use `modal.tsx` convention for modal presentations

### 3. Component Libraries
- Icons: Use `lucide-react-native` (already installed)
- Avoid adding new UI libraries without discussion
- Build custom components using React Native primitives + Reanimated

### 4. Styling Best Practices
- Use StyleSheet.create() for performance
- Support dark mode via `useColorScheme()` hook
- Primary color: #007AFF
- Platform-specific code: Use `Platform.OS` checks sparingly

### 5. Database Operations
- Use Drizzle ORM for type-safe database queries
- Database schema in `lib/db/schema.ts`
- Run migrations before DB operations
- Use AsyncStorage for simple key-value storage

### 6. Animations
- Use React Native Reanimated for smooth animations
- Avoid Animated API from react-native (use Reanimated instead)
- Worklets for gesture-driven animations

## Common Commands
```bash
npx expo start          # Start dev server
npx expo start -c       # Start with cache cleared
npx expo prebuild       # Generate native directories
npx expo run:ios        # Run on iOS simulator
npx expo run:android    # Run on Android emulator
npm run lint            # Run ESLint
```

## Testing & Deployment
- EAS Build configured (project ID: ebfbcf49-c303-4b8c-bcfb-80a723f96d0e)
- iOS bundle: com.vomschoeni.ferien-budget
- Android package: com.vomschoeni.ferienbudget

## Important Notes
- New Architecture is ENABLED (performance benefits, compatibility considerations)
- React Compiler experiment ENABLED (automatic memoization)
- Deep linking scheme: `vacationassist://`
- Supports iOS tablets
- Portrait orientation only
