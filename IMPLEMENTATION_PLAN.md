# Vacation Assist App - Implementierungsplan

## Überblick
Eine React Native Ferien-Verwaltungs-App mit Apple's Liquid Glass Design System, die eine umfassende Reiseplanung und -verwaltung ermöglicht.

## Tech Stack
- **Framework**: React Native mit Expo
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS) + React Native Paper
- **Design**: Glassmorphism mit Apple's Liquid Glass Aesthetic
- **Datenspeicherung**: AsyncStorage für lokale Persistierung
- **State Management**: React Context + useReducer
- **Effekte**: @react-native-community/blur für Glasmorphism

## App Struktur

### Tab Navigation
1. **Ferien** - Übersicht aller Reisen
2. **Budget** - Ausgabenverwaltung
3. **Checklisten** - Reise-Checklisten
4. **Einstellungen** - App-Konfiguration und Templates

## Phase 1: Grundstruktur & Design System

### 1.1 App Layout überarbeiten
```
app/
├── (tabs)/
│   ├── vacations.tsx      # Ferien-Übersicht
│   ├── budget.tsx         # Budget-Management
│   ├── checklists.tsx     # Checklisten
│   └── settings.tsx       # Einstellungen
├── vacation/
│   ├── [id].tsx          # Ferien-Detail
│   └── add.tsx           # Neue Ferien hinzufügen
└── checklist/
    └── [id].tsx          # Checklist-Detail
```

### 1.2 Glassmorphism Komponenten
- **GlassContainer**: Basis-Container mit Blur-Effekt
- **GlassCard**: Karten-Component für Listen
- **GlassModal**: Modal mit Glass-Effekt
- **GlassButton**: Buttons mit transparentem Design

### 1.3 Datenmodelle (TypeScript)
```typescript
interface Vacation {
  id: string;
  destination: string;
  country: string;
  hotel: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  currency: string;
  expenses: Expense[];
  checklists: string[]; // IDs der zugewiesenen Checklisten
}

interface Expense {
  id: string;
  vacationId: string;
  amount: number;
  currency: string;
  amountCHF: number; // Automatisch umgerechnet
  category: string;
  description: string;
  date: Date;
}

interface Checklist {
  id: string;
  title: string;
  isTemplate: boolean;
  items: ChecklistItem[];
  createdAt: Date;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}
```

## Phase 2: Ferien-Management

### 2.1 Ferien-Übersicht (Hauptscreen)
- **Layout**: Glassmorphism Cards in ScrollView
- **Anzeige**: Land-Flag, Destination, Hotel, Datum
- **Aktionen**: Hinzufügen, Bearbeiten, Löschen
- **Suche/Filter**: Nach Datum, Land, Status

### 2.2 Ferien-Detail Screen
- **Header**: Glassmorphism mit Destination-Bild
- **Bereiche**: 
  - Grundinfo (bearbeitbar)
  - Budget-Übersicht
  - Checklisten-Status
  - Galerie (optional)

### 2.3 Ferien hinzufügen/bearbeiten
- **Modal**: Glassmorphism Overlay
- **Felder**: Destination, Land, Hotel, Datum, Budget
- **Validierung**: Pflichtfelder, Datum-Logik
- **Speichern**: AsyncStorage Persistierung

## Phase 3: Budget-Verwaltung

### 3.1 Budget-Übersicht
- **Per Reise**: Ausgaben vs. Budget
- **Gesamt**: Alle Reisen zusammengefasst
- **Charts**: Ring-Diagramme für Kategorien
- **Währung**: CHF als Hauptwährung

### 3.2 Ausgaben hinzufügen
- **Quick-Add**: Häufige Kategorien als Buttons
- **Felder**: Betrag, Währung, Kategorie, Beschreibung
- **Umrechnung**: Automatisch in CHF
- **Foto**: Optional für Belege

### 3.3 Währungsumrechnung
- **Basis**: CHF als Hauptwährung
- **Raten**: Hardcoded Exchange Rates (erweiterbar zu API)
- **Kategorien**: Transport, Unterkunft, Essen, Aktivitäten, Shopping

## Phase 4: Checklisten-System

### 4.1 Checklisten pro Reise
- **Zuweisung**: Templates zu Reisen hinzufügen
- **Status**: Fortschritt in %
- **Kategorien**: Vor Reise, Packen, Vor Ort, Nach Reise

### 4.2 Template-Management
- **Standard-Templates**: Allgemeine Reise-Checklisten
- **Custom**: Benutzer-definierte Listen
- **Sharing**: Templates zwischen Reisen kopieren
- **Kategorisierung**: Nach Reisetyp (Strand, Stadt, Wandern)

### 4.3 Checklist Interface
- **Design**: Glassmorphism Checkbox-Design
- **Gestures**: Swipe to complete
- **Sortierung**: Nach Kategorie, Priorität
- **Notes**: Zusätzliche Notizen pro Item

## Phase 5: Einstellungen & Features

### 5.1 App-Einstellungen
- **Währung**: Standard-Währung setzen
- **Sprache**: Deutsch/Englisch
- **Notifications**: Reise-Erinnerungen
- **Theme**: Light/Dark Mode (automatisch)

### 5.2 Daten-Management
- **Export**: JSON-Export aller Daten
- **Import**: Backup wiederherstellen
- **Reset**: App-Daten löschen
- **Sync**: Für Zukunft (Cloud-Sync)

### 5.3 Template-Bibliothek
- **Verwaltung**: Templates bearbeiten/löschen
- **Import**: Vorgefertigte Templates
- **Kategorien**: Nach Reisetyp organisiert

## Phase 6: UI/UX Polish

### 6.1 Animationen
- **Transitions**: Smooth Screen-Übergänge
- **Micro-interactions**: Button-Feedback
- **Loading**: Skeleton-Loading mit Glass-Effekt

### 6.2 Accessibility
- **Screen Reader**: Vollständige Unterstützung
- **Kontrast**: Glassmorphism Accessibility-konform
- **Gestures**: Alternative zu Swipe-Aktionen

### 6.3 Performance
- **Images**: Optimierte Länderflaggen
- **Storage**: Effiziente Datenstrukturen
- **Memory**: React.memo für Components

## Glassmorphism Design Guidelines

### Farben
- **Light Mode**: `rgba(255, 255, 255, 0.25)` mit Border `rgba(255, 255, 255, 0.18)`
- **Dark Mode**: `rgba(0, 0, 0, 0.25)` mit entsprechenden Borders
- **Backdrop**: 20px Blur für Hauptelemente

### Komponenten-Hierarchie
- **Level 1**: Hauptcontainer (10px blur)
- **Level 2**: Cards und Modals (20px blur)
- **Level 3**: Buttons und kleine Elemente (5px blur)

### Accessibility
- **Kontrast**: Mindestens 4.5:1 für Text
- **Alternative**: Solid Backgrounds für Accessibility-Modi
- **Testing**: Mit iOS VoiceOver validieren

## Entwicklungs-Reihenfolge
1. Glassmorphism Komponenten-Bibliothek
2. Navigation und Grundstruktur
3. Ferien-Management (CRUD)
4. Budget-System
5. Checklisten-Features
6. Einstellungen und Polish