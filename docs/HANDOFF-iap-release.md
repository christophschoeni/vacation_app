# Handoff: App-Release + 7-Tage-Trial/Abo (Hard Paywall) — Zwischenstand

Stand: 2026-07-23. Branch: `chore/deps-security-cleanup`. Dieses Dokument fasst
zusammen, was fertig ist und was als Nächstes kommt, damit eine neue Session
nahtlos weitermachen kann.

## Ziel
App „Ferien Budget" veröffentlichen. Monetarisierung: **7 Tage gratis, danach
Hard Paywall** (ganze App gesperrt). Abos **jährlich + monatlich**, je mit
7-Tage-Free-Trial. Lösung: **RevenueCat** (`react-native-purchases` 10.4.4) +
StoreKit Free Trial. Trial wird NICHT im Code getimt — Apple/RevenueCat melden
das Entitlement.

Vollständiger Plan: `~/.claude/plans/app-release-and-iap.md`
Setup-Anleitung (ASC + RevenueCat, Klick für Klick): `docs/subscription-setup.md`

## ✅ FERTIG — App-Code (committet: b5db914 "feat(iap)…", 287bd5e docs)

- **Version 1.0.1 → 1.1.0** (app.json + package.json). `ios.appleTeamId`
  `9RJFL9M743` gesetzt. Kamera/Mikro-Permission-Platzhalter entfernt
  (expo-image-picker: cameraPermission/microphonePermission = false).
- **RevenueCat integriert:**
  - `lib/iap/entitlement.ts` — reine `isProActive(customerInfo)`, Entitlement
    `PRO_ENTITLEMENT = 'pro'`. Unit-getestet (`lib/iap/__tests__/`, 4 Tests).
  - `contexts/EntitlementContext.tsx` — `Purchases.configure` mit Key aus
    `process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY`, exponiert `isPro`, `packages`,
    `purchase()`, `restore()`, `isLoading`, `isConfigured`; CustomerInfo-Listener.
  - `app/_layout.tsx` — Provider eingehängt (neben Currency/Query) + **Hard-
    Paywall-Gate** nach Onboarding-Check: `entitlementLoading` → Spinner;
    `!isPro` → `<Paywall/>`; sonst App.
  - `components/paywall/Paywall.tsx` — lokalisierte Paywall (7 Sprachen),
    Jahres-/Monatsplan (packageType ANNUAL/MONTHLY), Trial-Text, Restore,
    Terms/Privacy-Links. Kauf → Listener flippt isPro → Gate öffnet.
  - `app/(tabs)/settings.tsx` — „Abo verwalten" (`showManageSubscriptions`) +
    „Kauf wiederherstellen" (Apple-Pflicht). Versionsstring liest jetzt
    `Constants.expoConfig.version` (nicht mehr hardcoded 1.0.0).
  - i18n: `paywall.*` + `settings.subscription.*` + `common.info` in allen 7
    Locales, generated-keys aktuell.
- **Gates grün:** typecheck, lint, i18n:check, 27 Tests. Pre-Commit-Hook lief.

## ✅ FERTIG — vom User in App Store Connect erledigt
- App angelegt (Bundle `com.vomschoeni.ferien-budget`). **ascAppId noch nicht an
  Claude gegeben** → muss noch in `eas.json` (`submit.production.ios.ascAppId`).
- P8 In-App-Purchase-Key erstellt, in RevenueCat hochgeladen + Key ID/Issuer ID
  eingetragen und gespeichert (Apple↔RevenueCat-Verbindung steht).
- Paid Applications Agreement akzeptiert (war „outdated", jetzt aktiv).
- **Zwei Abos angelegt, beide mit 7-Tage-Free-Trial:**
  - Jahr — Product ID **muss** `com.vomschoeni.ferienbudget.pro.yearly` sein
  - Monat — Product ID **muss** `com.vomschoeni.ferienbudget.pro.monthly` sein
  - ⚠️ NOCH NICHT von Claude gegengeprüft, ob die IDs zeichengenau stimmen
    (`ferienbudget` ohne Bindestrich, alles klein). Beim Weitermachen zuerst
    bestätigen lassen — falsche ID = leere Paywall, ID nicht änderbar.

## ⏳ OFFEN — als Nächstes (in dieser Reihenfolge)

### 1. User: `.env` Variablenname
`EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_…` in **.env.dev UND .env.prod** (gleicher
`appl_…` iOS-SDK-Key, gilt für Sandbox+Prod). User hatte den Key als
`REVENUECAT_API_KEY` abgelegt — OHNE `EXPO_PUBLIC_`-Präfix ist er zur Laufzeit
unsichtbar. Claude darf `.env` nicht lesen/schreiben — User macht das selbst.

### 2. User: RevenueCat-Dashboard (letzte 3 Schritte)
- Product catalog → **Products**: beide App-Store-Produkte importieren.
- **Entitlements**: Identifier **`pro`**, beide Produkte anhängen.
- **Offerings**: `default` mit Package **Annual** (…pro.yearly) + **Monthly**
  (…pro.monthly). App liest `offerings.current`, filtert ANNUAL/MONTHLY.
- Sandbox-Tester in App Store Connect anlegen (Users and Access → Sandbox).

### 3. Claude: nativer Rebuild + Verifikation
- Sobald Key + Offering + Sandbox stehen:
  `npx expo prebuild -p ios --clean` → `npx expo run:ios` (Device UDID
  `A14E5A1C-0E58-4DA2-ADA6-77D6B0FC763B`, iPhone 17 Pro).
- Verifizieren per **idb-Klick-Loop** (idb ist installiert, `$HOME/.local/bin`
  im PATH; siehe Memory `simulator-verification` + Skill `ai-screen-testing`):
  Onboarding → Paywall erscheint → Sandbox-Kauf → Gate öffnet → App nutzbar.
  Restore testen. Trial-Ablauf im Sandbox (beschleunigt) → Paywall zurück.
- Auch OHNE fertige Produkte kann man den Build machen und prüfen, dass die
  Paywall erscheint statt Crash (Kauf-Button dann leer mangels Offering).

### 4. Claude: eas.json ascAppId ergänzen (wenn User die Zahl gibt)

## Noch offene, bewusst zurückgestellte Themen (separat, nicht Teil des Release)
- Währungs-Feature (Ausgaben in Reisewährung + CHF-Gegenwert überall) — vom User
  gewünscht, noch nicht begonnen.
- Kategorien-Konsolidierung (3 parallele Systeme) — Memory `category-systems-drift`.
- Theme-Konsolidierung — Memory `theme-consolidation-pending`.

## Wichtige Kontextpunkte für die neue Session
- **Nie** den RevenueCat-SDK-Key oder P8 in den Kontext ziehen / ins Repo. Der
  `appl_…`-Key gehört nur in `.env` (EXPO_PUBLIC_) + als EAS-Secret.
- Es gibt vorbestehende, NICHT von Claude stammende uncommittete Änderungen
  waren früher im Working Tree — inzwischen bereinigt/committet. Immer gezielt
  stagen, nie `git add -A`.
- PR #1 (chore/deps-security-cleanup → develop) existiert bereits und enthält
  DX-Infra, Navigation-Fixes, Widget. Der IAP-Commit ist auf demselben Branch.
- Offene Entscheidung, die der User noch abwägt: RevenueCat vs. `expo-iap` ohne
  Drittanbieter. Aktuell bei RevenueCat. Falls Wechsel gewünscht: EntitlementContext
  + Paywall bleiben, nur die SDK-Schicht (configure/getOfferings/purchase/restore)
  wird getauscht; Store-Setup (Produkte, Trial) bleibt identisch.
