# nc-ui Architecture Guide

## Overview

`@kingsimba/nc-ui` is a lightweight React component library (75KB) with an extensible app framework. It provides 23+ production-ready components with consistent styling and behavior.

## Core Principles

### 1. CSS Naming Convention

#### Component Styles (with `nc-` prefix)
- **All component classes use `nc-` prefix**: `.nc-button`, `.nc-input`, `.nc-combo-dropdown`
- **All CSS variables use `nc-` prefix**: `--nc-primary`, `--nc-text`, `--nc-button-bg`
- **Size modifiers**: `.nc-small`, `.nc-large` (never `small` or `large` alone)
- **Variant modifiers**: `.nc-primary`, `.nc-danger`, `.nc-ghost`, etc.

#### Global Utility Styles (WITHOUT `nc-` prefix)
nc-ui also provides **global utility styles** for common HTML elements:
- **Headings**: `<h1>`, `<h2>`, `<h3>`, `<h4>` or `.h1`, `.h2`, `.h3`, `.h4`
- **Text**: `<p className="weak">`, `<p className="weaker">`
- **Code**: `<code>`, `.code-block`
- **Tags**: `.tag`, `.tag.red`, `.tag.yellow`, `.tag.green`, `.tag.blue`
- **Blocks**: `.block`, `.block.note`, `.block.warning`, `.block.danger`, `.block.icon`
- **Lists**: `<ul>`, `<ol>`, `<ul className="no-dots">`

**See `global-utility-styles.md` for complete documentation.**

### 2. Component Patterns

#### Always Use nc-ui Components
```tsx
// ❌ NEVER do this
<button onClick={...}>Click me</button>
<select><option>...</option></select>
<input type="text" />

// ✅ ALWAYS do this
import { Button, ComboBox, Input } from '@kingsimba/nc-ui'

<Button onClick={...}>Click me</Button>
<ComboBox options={...} onChange={...} />
<Input value={...} onChange={...} />
```

#### Component Import Pattern
```tsx
// Main components
import { Button, ComboBox, Input, Dialog } from '@kingsimba/nc-ui'
import '@kingsimba/nc-ui/styles.css'

// Icons (separate entry point)
import { CloseIcon, EditIcon, TrashIcon } from '@kingsimba/nc-ui/icons'

// YAML editor (optional, separate entry)
import { YamlTextArea } from '@kingsimba/nc-ui/yaml'
```

#### TypeScript Props
```tsx
// All components export their props interface
import { ButtonProps, ComboBoxProps, InputProps } from '@kingsimba/nc-ui'
```

### 3. Styling System

#### Theme Variables
```css
/* Available theme variables (use these, not hard-coded colors) */
--nc-primary          /* Primary brand color */
--nc-danger           /* Error/delete actions */
--nc-warning          /* Warning state */
--nc-success          /* Success state */
--nc-text             /* Primary text color */
--nc-text-weak        /* Secondary/muted text */
--nc-bg               /* Background color */
--nc-button-bg        /* Button background */
--nc-button-border    /* Button border */
--nc-input-bg         /* Input field background */
```

#### Theme Customization
```css
/* Override in your app's CSS */
:root {
  --nc-primary: #your-brand-color;
  --nc-danger: #your-danger-color;
}

/* Light theme variant */
:root.light {
  --nc-primary: #your-light-primary;
}
```

### 4. App Framework

nc-ui includes a framework for building panel-based applications:

```tsx
import { appRegistry, runningAppsStore, useApp } from '@kingsimba/nc-ui'

// 1. Create app component
function MyApp() {
  const { setTitle, setBackHandler, setToolbar, close } = useApp()
  return <div>...</div>
}

// 2. Register with lazy loading
const LazyMyApp = React.lazy(() => import('./MyApp').then(m => ({ default: m.MyApp })))

appRegistry.register({
  id: 'my-app',
  titleKey: 'apps.myApp.name',
  icon: MyAppIcon,
  component: LazyMyApp,
  width: 400,
})

// 3. Launch
await runningAppsStore.launchApp('my-app')
```

## Project Structure

```
nc-ui/
├── src/
│   ├── components/           # All UI components
│   │   ├── Button.tsx
│   │   ├── ComboBox.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── components/app/       # App framework components
│   │   ├── AppContext.tsx
│   │   ├── AppPanel.tsx
│   │   └── AppTitleBar.tsx
│   ├── lib/
│   │   ├── appRegistry.ts   # App registration
│   │   ├── runningAppsStore.ts # Running apps state
│   │   └── utils.ts         # Utility functions
│   └── styles/
│       └── theme.css        # All component styles (centralized)
├── nc-ui-ai-reference/      # AI-friendly documentation (portable)
├── docs/                    # Human-readable docs
└── dev/                     # Development/demo apps
```

## Common Component Patterns

### Size Variants
Most components support `size="small"` or `size="default"`:
```tsx
<Button size="small">Small</Button>
<Input size="small" />
<ComboBox size="small" options={...} />
```

### Variant Styles
Buttons and some components support variants:
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="warning">Warning</Button>
<Button variant="success">Success</Button>
```

### Loading States
```tsx
<Button loading>Saving...</Button>
<ActivityIndicator size="large" />
<ActivityIndicator overlay /> {/* Full-screen overlay */}
```

### Form Components
```tsx
<Input
  value={text}
  onChange={setText}
  clearable
  placeholder="Enter text..."
/>

<ComboBox
  value={selected}
  onChange={setSelected}
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Default', value: '2', default: true }
  ]}
  clearable
  allowTyping  // Enables search/filter
/>

<NumberInput
  value={count}
  onChange={setCount}
  min={0}
  max={100}
  step={1}
/>

<Toggle
  checked={enabled}
  onChange={setEnabled}
  label="Enable feature"
/>

<Checkbox
  checked={agreed}
  onChange={setAgreed}
  label="I agree to terms"
/>
```

### Dialogs
```tsx
import { Dialog } from '@kingsimba/nc-ui'

<Dialog
  open={isOpen}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleConfirm}>Delete</Button>
    </>
  }
>
  Are you sure you want to delete this item?
</Dialog>
```

### Notifications
```tsx
import { showNotification } from '@kingsimba/nc-ui'

showNotification({
  message: 'Item saved successfully',
  type: 'success',
  duration: 3000,
})

showNotification({
  message: 'An error occurred',
  type: 'error',
  duration: 5000,
})
```

## Anti-Patterns (DON'T DO THIS)

### ❌ Using Native HTML Elements
```tsx
// ❌ WRONG
<button>Click me</button>
<select><option>Option 1</option></select>
<input type="text" />
<textarea />

// ✅ CORRECT
<Button>Click me</Button>
<ComboBox options={[...]} />
<Input />
<Input multiline rows={3} />
```

### ❌ Not Using CSS Prefix
```tsx
// ❌ WRONG
<div className="button primary"></div>
<div style={{ color: 'var(--primary)' }}></div>

// ✅ CORRECT
<div className="nc-button nc-primary"></div>
<div style={{ color: 'var(--nc-primary)' }}></div>
```

### ❌ Importing Everything Together
```tsx
// ❌ WRONG - icons should be separate
import { Button, CloseIcon } from '@kingsimba/nc-ui'

// ✅ CORRECT - separate entry points
import { Button } from '@kingsimba/nc-ui'
import { CloseIcon } from '@kingsimba/nc-ui/icons'
```

### ❌ Hard-coding Colors
```tsx
// ❌ WRONG
<Button style={{ backgroundColor: '#3b82f6' }}>Click</Button>

// ✅ CORRECT - use variants or CSS variables
<Button variant="primary">Click</Button>
<Button style={{ backgroundColor: 'var(--nc-primary)' }}>Click</Button>
```

### ❌ Not Using Lazy Loading for Apps
```tsx
// ❌ WRONG
import { MyApp } from './MyApp'
appRegistry.register({ component: MyApp, ... })

// ✅ CORRECT - enable code splitting
const LazyMyApp = React.lazy(() => import('./MyApp').then(m => ({ default: m.MyApp })))
appRegistry.register({ component: LazyMyApp, ... })
```

## Quick Reference

See `components/` folder for detailed component API documentation.

For comprehensive examples, visit: https://kingsimba.github.io/nc-ui/
