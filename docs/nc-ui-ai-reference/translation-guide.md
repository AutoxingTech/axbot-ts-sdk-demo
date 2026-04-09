# Translation Guide

This guide is for apps that use nc-ui as a library.

## Structure Overview

nc-ui apps use a two-tier i18n system:

1. **Global i18n** - Shared translations for the main app and apps that don't need isolation
2. **App-specific i18n** - Isolated translations for apps with their own `I18nextProvider`

## Global i18n

### Files
- **Translation files**: `src/locales/[lang].json` (en, zh, de, es, th)
- **Configuration**: `src/i18n.ts`

### How it works
The global i18n is initialized once at app startup using `i18next-browser-languagedetector` for automatic language detection:

```typescript
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
// ... other imports

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      // ... other languages
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
```

### Using global i18n in components
Components using global i18n don't need `I18nextProvider` - just use `useTranslation()` directly:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

### JSON structure
```json
{
  "common": {
    "ok": "OK",
    "cancel": "Cancel"
  },
  "apps": {
    "start": "Start",
    "calculator": "Calculator",
    "uiComponents": "UI Components"
  },
  "theme": {
    "light": "☀️ Light",
    "dark": "🌙 Dark"
  },
  "welcome": {
    "title": "Welcome to nc-ui"
  },
  "startApp": {
    "apps": "Apps",
    "clickToLaunch": "Click to launch"
  }
}
```

## App-Specific i18n

Apps with complex translations or that need isolation can use their own i18n instance.

### Files
- **Factory**: Use `createAppI18nFactory` from `@kingsimba/nc-ui`
- **App translations**: `src/apps/AppName/i18n.ts` - App-specific resources

### Creating app-specific i18n

```typescript
// src/apps/Game2048/i18n.ts
import { createAppI18nFactory } from '@kingsimba/nc-ui';

const resources = {
  en: {
    newGame: "New Game",
    score: "SCORE",
    // ... app-specific keys
  },
  zh: {
    newGame: "新游戏",
    score: "得分",
  },
  // ... other languages
};

export const game2048I18n = createAppI18nFactory(resources);
```

### Using app-specific i18n
Wrap the app with `I18nextProvider`:

```tsx
// src/apps/Game2048/Game2048.tsx
import { I18nextProvider } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { game2048I18n } from './i18n';

function Game2048Content() {
  const { t } = useTranslation();
  return <button>{t('newGame')}</button>;
}

export function Game2048() {
  return (
    <I18nextProvider i18n={game2048I18n}>
      <Game2048Content />
    </I18nextProvider>
  );
}
```

## Adding a New Language

### For Global i18n

1. **Create locale file**: Copy `src/locales/en.json` to `src/locales/[lang].json`

2. **Register in `src/i18n.ts`**:
```typescript
import fr from './locales/fr.json';

// Add to resources:
i18n.init({
  resources: {
    // ... existing
    fr: { translation: fr },
  },
});
```

3. **Update language selector** in `App.tsx`:
```typescript
const langOptions = [
  // ... existing
  { label: 'Français', value: 'fr' },
];
```

### For App-Specific i18n

Add the language to the app's `i18n.ts` resources object.

## Supported Languages

| Code | Language |
|------|----------|
| en   | English  |
| zh   | Chinese  |
| de   | German   |
| es   | Spanish  |
| th   | Thai     |

## Best Practices

- Keep all JSON keys in English
- Preserve `{{variable}}` placeholders exactly
- All translation files must have identical structure
- `en.json` is the source of truth
- Use flat keys for app-specific translations (no prefix needed)
- App-specific i18n auto-syncs with global language changes

## When to Use Each Approach

| Scenario | Approach |
|----------|----------|
| Main app shell, header, welcome screen | Global i18n |
| Simple apps (Calculator, StartApp) | Global i18n |
| Complex apps with many strings (Game2048) | App-specific i18n |
| Reusable components in src/ | Global i18n or props |
