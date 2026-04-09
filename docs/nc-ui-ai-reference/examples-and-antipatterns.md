# nc-ui Usage Examples and Anti-Patterns

## Quick Rule: HTML → nc-ui Component

**Never use native HTML form elements. Always use nc-ui components.**

---

## Common Mistakes and Fixes

### ❌ Mistake #1: Using Native HTML Elements

```tsx
// ❌ WRONG - Using native HTML
function MyComponent() {
  return (
    <div>
      <button onClick={handleClick}>Submit</button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select value={option} onChange={(e) => setOption(e.target.value)}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </select>
    </div>
  )
}
```

```tsx
// ✅ CORRECT - Using nc-ui components
import { Button, Input, ComboBox } from '@kingsimba/nc-ui'

function MyComponent() {
  return (
    <div>
      <Button onClick={handleClick}>Submit</Button>
      <Input
        value={text}
        onChange={setText}  // Note: direct value, not event
      />
      <ComboBox
        value={option}
        onChange={setOption}  // Note: direct value, not event
        options={[
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ]}
      />
    </div>
  )
}
```

**Key difference:** nc-ui components use direct value/onChange, not event objects (except Button which keeps standard onClick).

---

### ❌ Mistake #2: Forgetting CSS Prefix

```tsx
// ❌ WRONG - No nc- prefix
<div className="container">
  <div className="button primary">Click</div>
  <div style={{ color: 'var(--text)' }}>Text</div>
</div>
```

```tsx
// ✅ CORRECT - Always use nc- prefix
<div className="nc-container">
  <Button variant="primary">Click</Button>
  <div style={{ color: 'var(--nc-text)' }}>Text</div>
</div>
```

---

### ❌ Mistake #3: Importing Icons from Main Entry

```tsx
// ❌ WRONG - Bloats bundle with all icons
import { Button, CloseIcon, EditIcon } from '@kingsimba/nc-ui'
```

```tsx
// ✅ CORRECT - Separate entry points
import { Button } from '@kingsimba/nc-ui'
import { CloseIcon, EditIcon } from '@kingsimba/nc-ui/icons'
```

**Why:** Icons are in a separate entry point to keep the main bundle small. Only import icons when you actually need them.

---

### ❌ Mistake #4: Hard-coding Colors

```tsx
// ❌ WRONG - Hard-coded colors
<Button style={{ backgroundColor: '#3b82f6', color: 'white' }}>
  Click me
</Button>

<div style={{ color: '#ef4444' }}>Error message</div>
```

```tsx
// ✅ CORRECT - Use variants and CSS variables
<Button variant="primary">
  Click me
</Button>

<div style={{ color: 'var(--nc-danger)' }}>Error message</div>
```

**Available CSS variables:**
- `--nc-primary`, `--nc-danger`, `--nc-warning`, `--nc-success`
- `--nc-text`, `--nc-text-weak`
- `--nc-bg`, `--nc-button-bg`, `--nc-input-bg`

---

### ❌ Mistake #5: Wrong onChange Handler

```tsx
// ❌ WRONG - Treating it like native HTML
<Input
  value={text}
  onChange={(e) => setText(e.target.value)}  // Wrong!
/>

<ComboBox
  value={selected}
  onChange={(e) => setSelected(e.target.value)}  // Wrong!
  options={[...]}
/>
```

```tsx
// ✅ CORRECT - nc-ui passes values directly
<Input
  value={text}
  onChange={setText}  // Receives string directly
/>

<ComboBox
  value={selected}
  onChange={setSelected}  // Receives string directly
  options={[...]}
/>
```

**Exception:** Button's `onClick` still receives the event object (standard React behavior).

---

### ❌ Mistake #6: Not Using Lazy Loading for Apps

```tsx
// ❌ WRONG - No code splitting
import { MyApp } from './MyApp'

appRegistry.register({
  id: 'my-app',
  component: MyApp,  // Bundle includes MyApp immediately
  // ...
})
```

```tsx
// ✅ CORRECT - Lazy loading with code splitting
import React from 'react'

const LazyMyApp = React.lazy(() =>
  import('./MyApp').then(m => ({ default: m.MyApp }))
)

appRegistry.register({
  id: 'my-app',
  component: LazyMyApp,  // Only loads when app is launched
  // ...
})
```

---

## Complete Examples

### Example 1: Login Form

```tsx
import { Button, Input } from '@kingsimba/nc-ui'
import { useState } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await login(email, password)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="nc-col" style={{ gap: 16 }}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        onEnter={handleSubmit}
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        type="password"
        showPasswordToggle
        value={password}
        onChange={setPassword}
        onEnter={handleSubmit}
      />
      <Button
        variant="primary"
        block
        loading={loading}
        onClick={handleSubmit}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </div>
  )
}
```

---

### Example 2: Settings Panel

```tsx
import { ComboBox, Toggle, Slider, Button } from '@kingsimba/nc-ui'
import { showNotification } from '@kingsimba/nc-ui'
import { useState } from 'react'

function SettingsPanel() {
  const [theme, setTheme] = useState('dark')
  const [notifications, setNotifications] = useState(true)
  const [volume, setVolume] = useState(75)

  const handleSave = () => {
    // Save settings...
    showNotification({
      message: 'Settings saved successfully',
      type: 'success',
      duration: 3000,
    })
  }

  return (
    <div className="nc-col" style={{ gap: 24, padding: 20 }}>
      <ComboBox
        label="Theme"
        value={theme}
        onChange={setTheme}
        options={[
          { label: 'Dark', value: 'dark', default: true },
          { label: 'Light', value: 'light' },
          { label: 'Auto', value: 'auto' },
        ]}
      />

      <Toggle
        label="Enable notifications"
        checked={notifications}
        onChange={setNotifications}
      />

      <Slider
        label="Volume"
        value={volume}
        onChange={setVolume}
        min={0}
        max={100}
      />

      <Button variant="primary" onClick={handleSave}>
        Save Settings
      </Button>
    </div>
  )
}
```

---

### Example 3: Delete Confirmation Dialog

```tsx
import { Dialog, Button } from '@kingsimba/nc-ui'
import { TrashIcon } from '@kingsimba/nc-ui/icons'
import { useState } from 'react'

function DeleteButton({ itemName, onDelete }) {
  const [showDialog, setShowDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await onDelete()
      setShowDialog(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="danger"
        size="small"
        onClick={() => setShowDialog(true)}
      >
        <TrashIcon size={16} />
        Delete
      </Button>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Confirm Delete"
        footer={
          <>
            <Button onClick={() => setShowDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              loading={deleting}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
        <p style={{ color: 'var(--nc-text-weak)' }}>
          This action cannot be undone.
        </p>
      </Dialog>
    </>
  )
}
```

---

### Example 4: Searchable List

```tsx
import { Input, ListGroup, ActivityIndicator } from '@kingsimba/nc-ui'
import { useState, useEffect } from 'react'

function SearchableList({ items, onSelect }) {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [filtered, setFiltered] = useState(items)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const query = search.toLowerCase()
      setFiltered(
        items.filter(item =>
          item.name.toLowerCase().includes(query)
        )
      )
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, items])

  return (
    <div className="nc-col" style={{ gap: 12 }}>
      <Input
        placeholder="Search items..."
        value={search}
        onChange={setSearch}
        clearable
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <ListGroup>
          {filtered.map(item => (
            <div
              key={item.id}
              className="nc-list-group-item"
              onClick={() => onSelect(item)}
            >
              {item.name}
            </div>
          ))}
        </ListGroup>
      )}
    </div>
  )
}
```

---

### Example 5: App Registration with Lazy Loading

```tsx
import React from 'react'
import { appRegistry } from '@kingsimba/nc-ui'
import { CalculatorIcon } from './icons'

// Lazy load app
const LazyCalculator = React.lazy(() =>
  import('./Calculator').then(m => ({ default: m.Calculator }))
)

// Register app
appRegistry.register({
  id: 'calculator',
  title: 'Calculator',  // App display title
  icon: CalculatorIcon,
  component: LazyCalculator,
  width: 360,
  padding: 16,
})

// In Calculator.tsx
import { useApp } from '@kingsimba/nc-ui'
import { Button } from '@kingsimba/nc-ui'

export function Calculator() {
  const { close } = useApp()
  const [result, setResult] = useState('0')

  return (
    <div className="nc-col" style={{ gap: 8 }}>
      <div className="calculator-display">{result}</div>
      {/* Calculator buttons... */}
      <Button onClick={close}>Close</Button>
    </div>
  )
}
```

---

## Best Practices Summary

### ✅ DO:
- Always use nc-ui components instead of native HTML
- Use `variant` and `size` props for styling
- Use CSS variables for colors
- Import icons from `@kingsimba/nc-ui/icons`
- Use lazy loading for app components
- Pass values directly to onChange (not events)
- Use `clearable` prop on inputs when appropriate
- Use `showNotification()` for toast messages
- Use `Dialog` for modals
- Clean up effects in app components

### ❌ DON'T:
- Use native HTML form elements
- Forget the `nc-` prefix on classes and CSS variables
- Import icons from main entry point
- Hard-code colors
- Pass events to onChange handlers (except Button onClick)
- Skip lazy loading for apps
- Create custom modals or toasts
- Use unprefixed CSS classes

---

## Migration Checklist

When integrating nc-ui into a new project:

- [ ] Install: `npm install @kingsimba/nc-ui`
- [ ] Import styles: `import '@kingsimba/nc-ui/styles.css'`
- [ ] Replace all `<button>` with `<Button>`
- [ ] Replace all `<input>` with `<Input>`
- [ ] Replace all `<select>` with `<ComboBox>`
- [ ] Replace all `<textarea>` with `<Input multiline>`
- [ ] Replace all `<input type="number">` with `<NumberInput>`
- [ ] Replace all `<input type="checkbox">` with `<Checkbox>`
- [ ] Update onChange handlers to use direct values
- [ ] Import icons from separate entry point
- [ ] Use CSS variables for colors
- [ ] Replace custom modals with `<Dialog>`
- [ ] Replace custom toasts with `showNotification()`
