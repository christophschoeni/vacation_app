# Abo-Setup: App Store Connect + RevenueCat (Schritt für Schritt)

Ziel: 7 Tage gratis, danach Jahres- oder Monatsabo. Die App-Seite ist fertig —
hier geht es nur um die Store-/RevenueCat-Konfiguration.

> **Wichtig — exakte Werte.** Die App erwartet ein RevenueCat-Entitlement namens
> `pro` und ein Offering namens `default`. Die Product-IDs müssen exakt so
> heißen wie unten. Ein Tippfehler = App findet die Abos nicht (leere Paywall).

---

## 0. Vorbereitung (einmalig)

- [ ] RevenueCat: **E-Mail bestätigen** (die gelbe Leiste oben im Dashboard).
- [ ] In `.env.dev` UND `.env.prod` die Variable so benennen (gleicher `appl_…`
      Key in beiden — er gilt für Sandbox und Produktion):
      ```
      EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_…
      ```

---

## 1. App Store Connect — App anlegen (falls noch nicht)

1. https://appstoreconnect.apple.com → **Apps** → **+** → **Neue App**
2. Plattform iOS, Name „Ferien Budget", Sprache Deutsch, Bundle-ID
   **`com.vomschoeni.ferien-budget`**, SKU frei wählbar.
3. Anlegen → die App bekommt eine **Apple-ID (ascAppId)** — die Zahl oben in der
   App-Info. **Notieren** (kommt später in `eas.json`).

## 2. App Store Connect — P8 In-App-Purchase-Key (für RevenueCat)

1. **Users and Access → Integrations → In-App Purchase** (nicht „App Store
   Connect API"!)
2. **+** → Name „RevenueCat" → **Generate**.
3. **`.p8`-Datei herunterladen** (nur EINMAL möglich, sicher aufbewahren, NICHT
   ins Projekt). **Key ID** und **Issuer ID** notieren.

## 3. App Store Connect — Subscription Group + zwei Abos

1. In der App → **Monetization → Subscriptions** (Abonnements).
2. **Subscription Group** erstellen, z. B. Referenzname „Ferien Budget Pro".
3. Darin **zwei** Auto-Renewable Subscriptions anlegen:

   | Plan | Reference Name | **Product ID** (exakt!) | Duration |
   |------|----------------|-------------------------|----------|
   | Jahr | Ferien Budget Pro Yearly | `com.vomschoeni.ferienbudget.pro.yearly` | 1 Year |
   | Monat| Ferien Budget Pro Monthly| `com.vomschoeni.ferienbudget.pro.monthly`| 1 Month |

4. Je Produkt **Preis** setzen (dein Preis, z. B. Jahr günstiger pro Monat).
5. Je Produkt eine **Localization** (Anzeigename + Beschreibung, mind. Deutsch).
6. **7-Tage Free Trial** — an JEDEM Produkt:
   - Tab **Introductory Offers** (oder „Subscription Prices" → Offers) → **+**
   - Typ **Free**, Dauer **1 Week (7 days)**, Zielländer alle.
7. Status: Die Abos müssen mindestens **„Ready to Submit"** sein, damit sie im
   Sandbox erscheinen (vollständige Metadaten + Preis + Localization).

## 4. App Store Connect — Sandbox-Tester

1. **Users and Access → Sandbox → Testers** → **+**
2. Eine **neue, noch nie im App Store verwendete** E-Mail anlegen (kann eine
   `+alias@`-Adresse sein). Passwort merken.
3. Am Test-Gerät/Simulator später mit diesem Sandbox-Account einloggen
   (Einstellungen → Developer → Sandbox Apple Account), NICHT mit deinem echten.

> Sandbox-Trials laufen **beschleunigt** ab (7 Tage ≈ wenige Minuten) — gut zum
> Testen, dass die Paywall nach Ablauf wieder erscheint.

---

## 5. RevenueCat — App verbinden

1. Dashboard → **Apps** (links unten) → deine „FerienBudget (App Store)"-App.
2. **In-app purchase key configuration**: die **`.p8`** hochladen (Dateiname
   `SubscriptionKey_….p8` unverändert), **Key ID** + **Issuer ID** eintragen →
   **Save changes**.
3. Danach zeigt die App-Seite den öffentlichen **`appl_…`-SDK-Key** — das ist
   der, der in `.env` gehört (Schritt 0).

## 6. RevenueCat — Produkte, Entitlement, Offering

1. **Product catalog → Products** → **+ New** → beide App-Store-Produkte
   importieren (`…pro.yearly`, `…pro.monthly`). RevenueCat liest sie über den
   P8-Key aus App Store Connect.
2. **Product catalog → Entitlements** → **+ New** → Identifier **`pro`** →
   beide Produkte anhängen.
3. **Product catalog → Offerings** → das Default-Offering **`default`**:
   - Package **Annual** → `…pro.yearly`
   - Package **Monthly** → `…pro.monthly`
   (Die App liest `offerings.current` und filtert nach ANNUAL/MONTHLY.)

---

## 7. Zurück zu mir (Claude)

Sag mir, wenn:
- [ ] `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in `.env.dev` + `.env.prod` gesetzt ist,
- [ ] die beiden Abos „Ready to Submit" sind + Free Trial dran,
- [ ] RevenueCat Entitlement `pro` + Offering `default` mit beiden Packages steht,
- [ ] ein Sandbox-Tester existiert.

Dann mache ich den **nativen Rebuild** und wir testen den kompletten Flow
(Onboarding → Paywall → Sandbox-Kauf → App öffnet) im Simulator per idb.

## 8. Später: eas.json ergänzen (für `eas submit`)

Sobald die App in ASC existiert, kommt die **ascAppId** in `eas.json` unter
`submit.production.ios.ascAppId` — das mache ich, wenn du mir die Zahl gibst.
