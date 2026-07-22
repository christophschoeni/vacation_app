---
name: ai-screen-testing
description: How Claude drives and verifies the app's screens on the iOS simulator — deep-linking, the tap/type/screenshot click-loop via ios-simulator-mcp, the route+param reference, and Maestro regression flows. Use when asked to run, click through, screenshot, or confirm a UI change works in the real app (not just tests), or when a change touches navigation/deep links.
---

# Verifying screens on the iOS simulator

Goal: change a screen → **see it working** without asking the user to click.
JS-only edits hot-reload; only new native modules need `npx expo run:ios`.

## The click-loop (preferred — needs the one-time setup below)

1. **Launch:** `npm run ios` (first time / after native changes), or re-launch a
   built app: `xcrun simctl launch booted com.vomschoeni.ferien-budget`.
2. **Deep-link** to the target screen (scheme `vacationassist://`, see reference).
3. **`ui_describe_all`** — returns every element's label + coordinates.
4. **`ui_tap` / `ui_type` / `ui_swipe`** — drive the screen by label/coordinate.
5. **`screenshot`** → Read it. After a hot-reload edit wait ~5 s or you catch the
   old frame.

These `ui_*` tools come from the **ios-simulator-mcp** server. If they are not
available, run the setup once (interactive session only):

```bash
bash scripts/setup-ai-testing.sh
```

(installs `idb-companion` + `fb-idb`, then `claude mcp add ios-simulator …`).
`xcrun simctl` alone can openurl/screenshot/launch but **cannot tap or type** —
that gap is exactly what idb fills.

## Deep-link reference (scheme `vacationassist://`)

Get a real vacation/template/checklist id from the sim DB first:

```bash
xcrun simctl get_app_container booted com.vomschoeni.ferien-budget data
# then:
sqlite3 <container>/Documents/SQLite/vacation_assist_v2.db \
  "SELECT id, destination FROM vacations;"
```

**No param needed:**
- `vacationassist://(tabs)` · `vacationassist://(tabs)/countdown` · `vacationassist://(tabs)/settings`
- `vacationassist://settings/categories` · `.../currency` · `.../currency-add` · `.../exchange-rates` · `.../language` · `.../notifications` · `.../templates`
- `vacationassist://debug` · `vacationassist://onboarding` · `vacationassist://vacation/add`

**Id in path (real id required):**
- `vacationassist://vacation/<id>` · `.../vacation/<id>/report` · `.../vacation/<id>/settings` · `.../vacation/<id>/checklists`
- `vacationassist://template/<id>` · `.../template/<id>/edit`
- `vacationassist://checklist/<id>`

**Query param:**
- `vacationassist://expense/add?vacationId=<id>`
- `vacationassist://expense/edit?expenseId=<id>&vacationId=<id>`
- `vacationassist://vacation-edit?vacationId=<id>`

Command form: `xcrun simctl openurl booted "vacationassist://(tabs)/settings"`.

**Known gap:** some nested `settings/*` pages don't always resolve straight from
a cold URL and fall back to root. Reach them by deep-linking `(tabs)/settings`
first, then `ui_tap` the row — which the click-loop can now do.

## Regression flows (Maestro — reproducible, CI-capable)

For the core journeys (create vacation → add expense → see budget update), write
`.maestro/*.yaml` flows with deep-link entry points and run `maestro test .maestro/`.
Use these for repeatable checks; use the click-loop for exploratory "does this
new screen look right" verification.

## Native rebuild rule

Installing a native module after the app was built crashes at runtime
("Cannot find native module 'Exponent…'"). Re-run `npx expo run:ios` (pod
install + compile) before verifying anything that imports it. JS-only changes
hot-reload.
