# nc-ui App Framework Reference

> **Note:** This is an optional feature. Only use if your project builds panel-based applications with nc-ui.

## Overview

nc-ui includes a framework for building **panel-based applications** that run in a side panel. Apps can have:
- Independent state management
- Isolated i18n translations (app-specific)
- Title bar controls (back button, title, toolbar)
- Lazy loading / code splitting
- Background/foreground state

## When to Use

Use the app framework when:
- Building a desktop/web app with multiple mini-applications
- Need apps to run in a side panel (like a settings panel)
- Want isolated i18n per app
- Need lifecycle management (launch, background, close)
- Want modular, independently deployable components

## Core Concepts

### 1. App Registration

```tsx
import React from 'react'
import { appRegistry } from '@kingsimba/nc-ui'
import { MyAppIcon } from './icons'

// Use React.lazy for code splitting
const LazyMyApp = React.lazy(() =>
  import('./MyApp').then(m => ({ default: m.MyApp }))
)

appRegistry.register({
  id: 'my-app',                    // Unique ID
  title: 'My App',                 // App display title
  icon: MyAppIcon,                 // Icon component
  component: LazyMyApp,            // App component (lazy)
  width: 400,                      // Panel width (default: 400)
  padding: 12,                     // Inner padding (default: 12)
  hideTitleBar: false,             // Hide title bar? (default: false)
})
```

### 2. Launching Apps

```tsx
import { runningAppsStore } from '@kingsimba/nc-ui'

// Launch app (shows in panel)
await runningAppsStore.launchApp('my-app')

// Launch in background (not visible)
await runningAppsStore.launchApp('my-app', { launchInBackground: true })

// Close app
runningAppsStore.closeApp('my-app')

// Check if running
const isRunning = runningAppsStore.isRunning('my-app')

// Get active app ID
const activeId = runningAppsStore.getActiveAppId()
```

### 3. App Component

```tsx
import { useApp } from '@kingsimba/nc-ui'
import { Button } from '@kingsimba/nc-ui'

export function MyApp() {
  const {
    setTitle,            // Update title bar text
    setBackHandler,      // Show back button with handler
    clearBackHandler,    // Hide back button
    setToolbar,          // Add toolbar content (right side)
    clearToolbar,        // Remove toolbar content
    setHideBackButton,   // Temporarily hide back button
    setHideTitleBar,     // Show/hide entire title bar
    close,               // Close the app
  } = useApp()

  return (
    <div>
      <h1>My App</h1>
      <Button onClick={close}>Close</Button>
    </div>
  )
}
```

## Common Patterns

### Dynamic Title

```tsx
export function ProfileScreen({ user }) {
  const { setTitle } = useApp()

  useEffect(() => {
    setTitle(user.name)
  }, [user.name, setTitle])

  return <div>...</div>
}
```

### Back Navigation

```tsx
export function DetailScreen({ onBack }) {
  const { setBackHandler, clearBackHandler } = useApp()

  useEffect(() => {
    setBackHandler(onBack)
    return () => clearBackHandler()
  }, [onBack, setBackHandler, clearBackHandler])

  return <div>...</div>
}
```

### Toolbar Actions

```tsx
export function EditorScreen() {
  const { setToolbar, clearToolbar } = useApp()

  useEffect(() => {
    setToolbar(
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handleShare}>Share</Button>
      </div>
    )
    return () => clearToolbar()
  }, [setToolbar, clearToolbar])

  return <div>...</div>
}
```

### App-Specific i18n

Each app can have isolated translations:

```tsx
// MyApp/i18n.ts
import { createAppI18nFactory } from '@kingsimba/nc-ui'

export const myAppI18n = createAppI18nFactory({
  en: {
    title: 'My App',
    save: 'Save',
    cancel: 'Cancel',
  },
  zh: {
    title: '我的应用',
    save: '保存',
    cancel: '取消',
  },
})

// MyApp/index.tsx
import { I18nextProvider } from 'react-i18next'
import { myAppI18n } from './i18n'

export function MyApp() {
  return (
    <I18nextProvider i18n={myAppI18n}>
      <MyAppContent />
    </I18nextProvider>
  )
}

// MyApp/MyAppContent.tsx
import { useTranslation } from 'react-i18next'

function MyAppContent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('title')}</h1>
      <Button>{t('save')}</Button>
    </div>
  )
}
```

**Note:** Requires peer dependencies:
```bash
npm install i18next react-i18next
```

### Exposing App Methods

Apps can expose methods for external control:

```tsx
// Define interface
export interface MyAppRef {
  navigateToTab: (tabId: string) => void
  reset: () => void
}

// In app component
export function MyApp() {
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    runningAppsStore.setAppRef<MyAppRef>('my-app', {
      navigateToTab: (tabId) => setActiveTab(tabId),
      reset: () => setActiveTab('home'),
    })
  }, [])

  // ...
}

// Call externally
const app = await runningAppsStore.launchApp<MyAppRef>('my-app')
app?.ref?.navigateToTab('settings')
```

## AppPanel Component

Render the panel container in your layout:

```tsx
import { AppPanel } from '@kingsimba/nc-ui'

function Layout() {
  return (
    <div className="layout">
      <main>Main content</main>
      <AppPanel />
    </div>
  )
}
```

Features:
- Renders all running apps (only active visible)
- Responsive: inline on desktop, overlay on mobile
- Automatic width from app definition
- Error boundaries for loading failures

## App Lifecycle

```
Registration → Launch → Active → Background → Close
     ↓           ↓        ↓          ↓           ↓
register()   launchApp() visible   hidden   closeApp()
```

### State Persistence

Apps should handle their own persistence:

```tsx
export function MyApp() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('my-app-data')
    return saved ? JSON.parse(saved) : defaultData
  })

  useEffect(() => {
    localStorage.setItem('my-app-data', JSON.stringify(data))
  }, [data])

  return <div>...</div>
}
```

## Best Practices

### ✅ DO:

- Use `React.lazy()` for code splitting
- Clean up effects (back handlers, toolbar)
- Use app-specific i18n for isolated translations
- Persist state when needed
- Use `useApp()` hook for title bar controls

### ❌ DON'T:

- Import apps directly (use lazy loading)
- Forget to clean up back handlers
- Skip error boundaries
- Share state globally without persistence
- Manually manage app lifecycle (use stores)

## Complete Example

```tsx
// App registration
import React from 'react'
import { appRegistry } from '@kingsimba/nc-ui'
import { CalculatorIcon } from './icons'

const LazyCalculator = React.lazy(() =>
  import('./Calculator').then(m => ({ default: m.Calculator }))
)

appRegistry.register({
  id: 'calculator',
  titleKey: 'apps.calculator',
  icon: CalculatorIcon,
  component: LazyCalculator,
  width: 360,
  padding: 16,
})

// Calculator.tsx
import { useApp } from '@kingsimba/nc-ui'
import { Button } from '@kingsimba/nc-ui'
import { useState } from 'react'

export function Calculator() {
  const { setTitle, close } = useApp()
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    setTitle('Calculator')
  }, [setTitle])

  const handleNumber = (num: number) => {
    setDisplay(prev => prev === '0' ? String(num) : prev + num)
  }

  const handleClear = () => setDisplay('0')

  return (
    <div className="nc-col" style={{ gap: 12 }}>
      <div className="calculator-display">{display}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <Button onClick={() => handleNumber(7)}>7</Button>
        <Button onClick={() => handleNumber(8)}>8</Button>
        <Button onClick={() => handleNumber(9)}>9</Button>
        <Button variant="warning" onClick={handleClear}>C</Button>
        {/* ... more buttons */}
      </div>

      <Button variant="ghost" onClick={close}>Close</Button>
    </div>
  )
}

// Launch from anywhere
import { runningAppsStore } from '@kingsimba/nc-ui'

await runningAppsStore.launchApp('calculator')
```

## Responsive Layout

Use `useViewport()` for responsive design:

```tsx
import { useViewport } from '@kingsimba/nc-ui'

export function MyApp() {
  const { isMobile } = useViewport()

  return (
    <div style={{ padding: isMobile ? 8 : 16 }}>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  )
}
```

## Additional Resources

- **Complete example:** See `dev/Game2048/` in nc-ui repo
- **Live demo:** https://kingsimba.github.io/nc-ui/
- **Full docs:** `docs/APP_FRAMEWORK.md` in nc-ui repo

---

**Summary:** The app framework enables building modular panel-based applications with isolated state, i18n, and lifecycle management. Use `appRegistry` to register, `runningAppsStore` to control, and `useApp()` hook inside components.
