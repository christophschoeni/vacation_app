---
name: i18n
description: Translations in this app - typed keys, the 7 locale files, the drift guard and useTranslation. Use when adding or changing user-facing text, when adding a key or a language, when t() fails to type-check, or when a UI shows a raw key string instead of a translation.
---

# i18n

Seven locales in `lib/i18n/locales/`: **de** (reference), en, fr, it, es, zh, ja.
German is authoritative — every other locale must have exactly its key set.

## Adding or changing a key

1. Edit `lib/i18n/locales/de.json`.
2. Add the same key to **all six** other locales.
3. Run `npm run i18n:write` — regenerates `lib/i18n/generated-keys.ts`.
4. Run `npm run i18n:check` — must pass.

Skipping step 3 makes `t('new.key')` a TypeScript error, because the generated
union is stale.

## Typed keys

`t()` accepts only `TranslationKey`. A typo is a compile error, not a raw string
rendered in the UI — this is how `t('expense.category')` was found, a key that
never existed and showed as literal text in the category picker.

For keys assembled at runtime use `tDynamic()`:

```ts
t('vacation.form.destination')                       // static, checked
tDynamic(`checklist.categories.${category}`)         // dynamic, unchecked
```

Config objects that carry keys must type the field, so an invalid key fails at
the declaration:

```ts
interface SettingsItem {
  titleKey: TranslationKey;   // not string
}
```

## The drift guard

`npm run i18n:check` fails (exit 1) on:
- a key missing in any locale
- a key present in a locale but not in German
- an empty translation
- a key no code references

It is safe to trust for **removal decisions**: it matches string literals,
`t(...)` calls inside template literals, and dynamic prefixes. Two things that
look like keys but are not — a JS property access (`template.title`) and a
substring collision (`errors.invalid_date`) — are correctly ignored.

## useTranslation

```ts
const { t, locale, setLanguage, getSupportedLanguages } = useTranslation();
```

`t` is **memoised per locale** and is a valid hook dependency — include it in
dependency arrays. It used to be re-bound via `.bind()` on every render, which
forced `eslint-disable react-hooks/exhaustive-deps` suppressions; do not
reintroduce that pattern.

**Read the current language from `locale`, never from `getCurrentLanguage()`
during render.** React Compiler is enabled in `app.json` and is free to memoise
that untracked call away — this froze the check mark on the language screen.

## Placeholders

`{{destination}}`, `{{count}}` etc. are code. When translating, keep them
byte-identical; a translated placeholder breaks the string at runtime. When
adding a language, verify per key that the placeholder set matches German.

## Known inconsistencies in the German source

Not yet resolved, flagged by two independent translators — ask before
"fixing" text that looks wrong:
- "Ferien" vs. "Reise" mixed, sometimes in the same block
- "Vorlage" / "Standard-Liste" / "Template" for the same concept
- The app addresses users formally ("Sie"), but the onboarding block and
  `expense.empty.subtitle` use informal "du"
