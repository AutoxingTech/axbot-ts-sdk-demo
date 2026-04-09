# nc-ui Components Quick Reference

> **When to use:** Always use nc-ui components instead of native HTML elements

## Import Patterns

```tsx
// Main components
import { Button, Input, ComboBox, Dialog, ... } from '@kingsimba/nc-ui'
import '@kingsimba/nc-ui/styles.css'

// Icons (separate entry point for bundle optimization)
import { CloseIcon, EditIcon, TrashIcon } from '@kingsimba/nc-ui/icons'

// YAML editor (optional)
import { YamlTextArea } from '@kingsimba/nc-ui/yaml'
```

---

## Core Components

### Button
**Replace:** `<button>` → `<Button>`

```tsx
import { Button } from '@kingsimba/nc-ui'

// Basic
<Button onClick={handleClick}>Click me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="danger">Delete</Button>
<Button variant="warning">Warning</Button>
<Button variant="success">Success</Button>
<Button variant="ghost">Subtle</Button>

// Sizes
<Button size="small">Small</Button>
<Button size="default">Default</Button>
<Button size="large">Large</Button>

// States
<Button loading>Saving...</Button>
<Button disabled>Disabled</Button>
<Button block>Full Width</Button>

// All standard button props work
<Button type="submit" form="myForm">Submit</Button>
```

**Props:** `variant`, `size`, `loading`, `disabled`, `block`, `textSelectable`, + all HTMLButtonElement props

---

### Input
**Replace:** `<input>` / `<textarea>` → `<Input>`

```tsx
import { Input } from '@kingsimba/nc-ui'

// Text input
<Input
  value={text}
  onChange={setText}
  placeholder="Enter text..."
  clearable
/>

// With label
<Input
  label="Username"
  value={username}
  onChange={setUsername}
/>

// Password with toggle
<Input
  type="password"
  showPasswordToggle
  value={password}
  onChange={setPassword}
/>

// Multiline (textarea)
<Input
  multiline
  rows={4}
  value={description}
  onChange={setDescription}
/>

// Small size
<Input size="small" value={...} onChange={...} />

// With Enter key handler
<Input
  value={search}
  onChange={setSearch}
  onEnter={handleSearch}
  placeholder="Press Enter to search"
/>

// With validation
<Input
  value={email}
  onChange={setEmail}
  validator={(value) => {
    if (!value) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
      ? null 
      : 'Invalid email address';
  }}
  placeholder="Enter email"
/>

// Validation with only red border (no error text)
<Input
  value={username}
  onChange={setUsername}
  validator={usernameValidator}
  showErrorMessage={false}
/>
```

**Props:** `value`, `onChange`, `onEnter`, `onClear`, `placeholder`, `disabled`, `label`, `clearable`, `type`, `size`, `showPasswordToggle`, `multiline`, `rows`, `validator`, `showErrorMessage`

---

### ComboBox
**Replace:** `<select>` → `<ComboBox>`

```tsx
import { ComboBox } from '@kingsimba/nc-ui'

// Basic
<ComboBox
  value={selected}
  onChange={setSelected}
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Default Option', value: '3', default: true }
  ]}
/>

// With search/filter
<ComboBox
  allowTyping
  options={longOptionsList}
  value={selected}
  onChange={setSelected}
/>

// With label
<ComboBox
  label="Select country"
  options={countries}
  value={country}
  onChange={setCountry}
/>

// Not clearable (always has value)
<ComboBox
  clearable={false}
  options={[...]}
/>

// Small size
<ComboBox size="small" options={[...]} />

// Placement
<ComboBox placement="top" options={[...]} />
```

**Props:** `value`, `onChange`, `options`, `placeholder`, `disabled`, `label`, `clearable`, `allowTyping`, `placement`, `size`

**Option type:** `{ label: string, value: string, default?: boolean }`

---

### MultiSelect
**Replace:** Multi-select `<select multiple>` → `<MultiSelect>`

```tsx
import { MultiSelect } from '@kingsimba/nc-ui'

<MultiSelect
  values={selectedIds}
  onChange={setSelectedIds}
  options={[
    { label: 'Tag 1', value: '1' },
    { label: 'Tag 2', value: '2' },
  ]}
  placeholder="Select tags..."
/>
```

**Props:** `values` (array), `onChange`, `options`, `placeholder`, `disabled`

---

### MonthRangePicker
**Replace:** Custom month range selector → `<MonthRangePicker>`

```tsx
import { MonthRangePicker } from '@kingsimba/nc-ui'

// Basic usage
<MonthRangePicker
  startMonth="2023-01"
  endMonth="2023-12"
  onChange={(start, end) => {
    console.log('Range:', start, end)
  }}
  label="Select Period"
/>

// Flexible format support (YY-M, YY-MM, YYYY-M, YYYY-MM)
// Input: "23-1" → Output: "2023-01"
// Input: "2023-12" → Output: "2023-12"
<MonthRangePicker
  startMonth={startMonth}
  endMonth={endMonth}
  onChange={(start, end) => {
    setStartMonth(start)
    setEndMonth(end)
  }}
/>

// With disabled state
<MonthRangePicker
  startMonth="2024-01"
  endMonth="2024-06"
  onChange={handleChange}
  disabled
/>
```

**Format:** Accepts `YY-M(M)` (e.g., `23-1`, `23-12`) or `YYYY-M(M)` (e.g., `2023-1`, `2023-12`). Always outputs normalized `YYYY-MM` format.

**Validation:** Automatically validates format, month range (1-12), and ensures end month ≥ start month.

**Props:** `startMonth`, `endMonth`, `onChange`, `label`, `disabled`, `className`

---

### NumberInput
**Replace:** `<input type="number">` → `<NumberInput>`

```tsx
import { NumberInput } from '@kingsimba/nc-ui'

<NumberInput
  value={count}
  onChange={setCount}
  min={0}
  max={100}
  step={1}
/>

// With label
<NumberInput
  label="Quantity"
  value={qty}
  onChange={setQty}
/>
```

**Props:** `value`, `onChange`, `min`, `max`, `step`, `label`, `disabled`

---

### Dialog
**Replace:** Custom modals → `<Dialog>`

```tsx
import { Dialog } from '@kingsimba/nc-ui'

<Dialog
  open={isOpen}
  onClose={() => setOpen(false)}
  title="Confirm Delete"
  footer={
    <>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this item?</p>
  <p>This action cannot be undone.</p>
</Dialog>

// Without footer
<Dialog
  open={isOpen}
  onClose={() => setOpen(false)}
  title="Information"
>
  <p>Your data has been saved.</p>
</Dialog>
```

**Props:** `open`, `onClose`, `title`, `footer`, `children`, `style`, `className`, `onOk`, `onSave`, `onDelete`, `onCancel`, `onConnect`, `footerType`, `closeOnOverlay`, `primaryDisabled`, `fullScreen`, `hideTitleBar`, `onContentHeightChange`

---

## App Components

### AppDialog
Renders an app in a fullscreen portal overlay:

```tsx
import { AppDialog } from '@kingsimba/nc-ui'

<AppDialog
  appId="calculator"
  open={isOpen}
  onClose={() => setOpen(false)}
  style={{ maxWidth: 480, maxHeight: 700 }}
/>
```

**Props:** `appId`, `open`, `onClose`, `closeOnBackdrop`, `className`, `style`

---

## Form Controls

### Checkbox

```tsx
import { Checkbox } from '@kingsimba/nc-ui'

<Checkbox
  checked={agreed}
  onChange={setAgreed}
  label="I agree to the terms"
/>

// Indeterminate state
<Checkbox
  checked={someChecked}
  indeterminate={someChecked && !allChecked}
  onChange={toggleAll}
  label="Select all"
/>
```

**Props:** `checked`, `onChange`, `label`, `indeterminate`, `disabled`

---

### Toggle (Switch)

```tsx
import { Toggle } from '@kingsimba/nc-ui'

<Toggle
  checked={enabled}
  onChange={setEnabled}
  label="Enable notifications"
/>

<Toggle
  checked={darkMode}
  onChange={setDarkMode}
  disabled={loading}
/>
```

**Props:** `checked`, `onChange`, `label`, `disabled`

---

### Slider

```tsx
import { Slider } from '@kingsimba/nc-ui'

<Slider
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  label="Volume"
/>
```

**Props:** `value`, `onChange`, `min`, `max`, `label`, `disabled`

---

## Display Components

### Alert

```tsx
import { Alert } from '@kingsimba/nc-ui'

<Alert type="info" onClose={() => setShowInfo(false)}>
  This is an informational message.
</Alert>

<Alert type="success">
  Your changes have been saved!
</Alert>

<Alert type="warning">
  Please review your input.
</Alert>

<Alert type="error">
  An error occurred. Please try again.
</Alert>
```

**Props:** `type` ('info' | 'success' | 'warning' | 'error'), `onClose`, `children`

---

### ActivityIndicator (Spinner)

```tsx
import { ActivityIndicator } from '@kingsimba/nc-ui'

// Inline spinner
<ActivityIndicator />
<ActivityIndicator size="small" />
<ActivityIndicator size="large" />

// Custom color
<ActivityIndicator color="#3b82f6" />

// Full-screen overlay
<ActivityIndicator overlay />
```

**Props:** `size`, `color`, `overlay`, `className`

---

### Battery

```tsx
import { Battery } from '@kingsimba/nc-ui'

<Battery level={75} />
<Battery level={15} charging />
```

**Props:** `level` (0-100), `charging`

---

### Notification (Toast)

```tsx
import { showNotification } from '@kingsimba/nc-ui'

// Success
showNotification({
  message: 'Item saved successfully',
  type: 'success',
  duration: 3000,
})

// Error
showNotification({
  message: 'Failed to save item',
  type: 'error',
  duration: 5000,
})

// Info
showNotification({
  message: 'Loading your data...',
  type: 'info',
})

// Warning
showNotification({
  message: 'Please review your changes',
  type: 'warning',
})
```

---

## Layout Components

### ButtonGroup

```tsx
import { ButtonGroup } from '@kingsimba/nc-ui'

<ButtonGroup>
  <Button>First</Button>
  <Button>Second</Button>
  <Button>Third</Button>
</ButtonGroup>

// Vertical
<ButtonGroup vertical>
  <Button>Top</Button>
  <Button>Middle</Button>
  <Button>Bottom</Button>
</ButtonGroup>
```

**Props:** `vertical`, `children`

---

### ListGroup

```tsx
import { ListGroup } from '@kingsimba/nc-ui'

<ListGroup>
  <div className="nc-list-group-item">Item 1</div>
  <div className="nc-list-group-item nc-active">Active Item</div>
  <div className="nc-list-group-item">Item 3</div>
</ListGroup>
```

---

### Tabs

Tab navigation header with optional toolbar and closable tabs. Supports plain strings or localized tab objects:

```tsx
import { Tabs } from '@kingsimba/nc-ui'

const [active, setActive] = useState('overview')

// 1. Simple string tabs
<Tabs
  tabs={['Overview', 'Details', 'Settings']}
  active={active}
  onChange={setActive}
/>

// 2. Object tabs (recommended for i18n to keep stable keys)
<Tabs
  tabs={[
    { id: 'overview', label: t('tab.overview') },
    { id: 'details', label: t('tab.details') },
    { id: 'settings', label: t('tab.settings') }
  ]}
  active={active} // holds the stable id: 'overview'
  onChange={setActive}
  orientation="horizontal"  // 'horizontal' | 'verticalLeft' | 'verticalRight'
  toolbar={<Button size="small">Action</Button>}  // optional
  multiline={false}  // wrap tabs to multiple lines
  onClose={(tabId) => handleClose(tabId)}  // optional, shows close button on each tab
  permanentTabs={['overview']}  // optional, these tabs won't have a close button
/>
```

**Props:** `tabs` (`(string | TabItem)[]`), `active`, `onChange`, `onClose`, `permanentTabs`, `orientation`, `toolbar`, `multiline`, `className`, `style`

---

### TabPanels & TabPanel

Content containers for tabs. Use `keepMounted` to preserve state (e.g., form inputs) when switching tabs:

```tsx
import { Tabs, TabPanels, TabPanel } from '@kingsimba/nc-ui'

const [active, setActive] = useState('Tab1')

<Tabs tabs={['Tab1', 'Tab2', 'Tab3']} active={active} onChange={setActive} />

{/* keepMounted=false (default): only active panel is mounted */}
<TabPanels active={active}>
  <TabPanel tab="Tab1">Content 1</TabPanel>
  <TabPanel tab="Tab2">Content 2</TabPanel>
</TabPanels>

{/* keepMounted=true: all panels stay mounted, preserves input state */}
<TabPanels active={active} keepMounted>
  <TabPanel tab="Tab1"><input type="text" /></TabPanel>
  <TabPanel tab="Tab2"><input type="text" /></TabPanel>
</TabPanels>
```

**TabPanels Props:** `active`, `keepMounted`, `className`, `style`  
**TabPanel Props:** `tab` (string matching a tab label), `className`, `style`

---

## Advanced Components

### NavStack
Mobile-style stacked navigation:

```tsx
import { NavStack } from '@kingsimba/nc-ui'

function SettingsApp() {
  return (
    <NavStack
      pages={[
        {
          id: 'home',
          title: 'Settings',
          render: () => <SettingsHome />
        },
        {
          id: 'profile',
          title: 'Profile',
          render: () => <ProfileSettings />
        }
      ]}
    />
  )
}
```

---

### ContextMenu
Floating context menu with icons and variants:

```tsx
import { ContextMenu } from '@kingsimba/nc-ui'
import { EditIcon, TrashIcon } from '@kingsimba/nc-ui/icons'

<ContextMenu
  open={isOpen}
  onClose={() => setOpen(false)}
  anchor={anchorElement}
  options={[
    { id: 'view', label: 'View', onClick: handleView },
    { id: 'edit', label: 'Edit', icon: <EditIcon />, variant: 'primary', onClick: handleEdit },
    { id: 'sep1', type: 'separator' },
    { id: 'warn', label: 'Reset', variant: 'warning', onClick: handleReset },
    { id: 'ok', label: 'Confirm', variant: 'success', onClick: handleConfirm },
    { id: 'del', label: 'Delete', icon: <TrashIcon />, variant: 'danger', onClick: handleDelete },
  ]}
/>
```

**Props:** `open`, `onClose`, `options`, `anchor`, `anchorRef`, `preferredDirection`

**Option Props:** `id`, `label`, `icon`, `onClick`, `variant`, `disabled`

**Option variants:** `default`, `primary`, `warning`, `success`, `danger`

---

### YamlTextArea
YAML editor with syntax highlighting:

```tsx
import { YamlTextArea } from '@kingsimba/nc-ui/yaml'

<YamlTextArea
  value={yamlString}
  onChange={setYamlString}
  onValidationChange={(isValid, error) => console.log(isValid, error)}
  style={{ minHeight: 400 }}
/>
```

**Props:** `value`, `onChange`, `onValidationChange`, `readOnly`, `debounceMs`, `className`, `style`

---

### CsvTextArea
Tab-separated text editor with per-column color highlighting, optional line numbers, and cursor tracking:

```tsx
import { CsvTextArea } from '@kingsimba/nc-ui'
import type { CsvTextAreaHandle, CsvCursorPosition } from '@kingsimba/nc-ui'

const csvRef = useRef<CsvTextAreaHandle>(null)

<CsvTextArea
  ref={csvRef}
  value={csvString}
  onChange={setCsvString}
  showLineNumbers              // optional line-number gutter
  highlightLine={3}            // highlight & scroll-into-view (1-based)
  onCursorChange={(pos) => {}} // { line, column, character, offset } – line/col/char are 1-based
  placeholder="Paste tab-separated data here…"
  style={{ height: 260 }}
/>

// Jump to line 5 programmatically
csvRef.current?.goToLine(5)

// Jump to specific line, column, and character (all 1-based)
csvRef.current?.goToPosition(2, 3, 1)
```

**Props:** `value`, `onChange`, `placeholder`, `className`, `style`, `showLineNumbers`, `highlightLine`, `onCursorChange`

**Ref methods:** `goToLine(line: number)`, `goToPosition(line: number, column: number, character: number)`

---

## Pre-configured Components

### CommonButtons
Ready-to-use icon buttons:

```tsx
import { CloseButton, EditButton, RefreshButton, TrashButton } from '@kingsimba/nc-ui'

<CloseButton onClick={handleClose} />
<EditButton onClick={handleEdit} />
<RefreshButton onClick={handleRefresh} loading={isRefreshing} />
<TrashButton onClick={handleDelete} />
```

---

## Icons

```tsx
import {
  CloseIcon,
  EditIcon,
  TrashIcon,
  ViewIcon,
  EyeHiddenIcon,
  SettingsIcon,
  // ... 50+ more icons
} from '@kingsimba/nc-ui/icons'

<CloseIcon />
<CloseIcon size={24} />
<CloseIcon color="#3b82f6" />
<CloseIcon className="custom-class" />
```

**Common icons:** Close, Edit, Trash, View, EyeHidden, Settings, Plus, Minus, Check, Arrow (Up/Down/Left/Right), Menu, Search, Download, Upload, etc.

---

## Migration Quick Reference

| HTML Element | nc-ui Component |
|--------------|----------------|
| `<button>` | `<Button>` |
| `<input type="text">` | `<Input>` |
| `<input type="password">` | `<Input type="password">` |
| `<input type="number">` | `<NumberInput>` |
| `<textarea>` | `<Input multiline>` |
| `<select>` | `<ComboBox>` |
| `<select multiple>` | `<MultiSelect>` |
| `<input type="checkbox">` | `<Checkbox>` |
| `<input type="range">` | `<Slider>` |
| Custom modal | `<Dialog>` |
| Custom toast | `showNotification()` |

---

## TypeScript Support

All components export their props interfaces:

```tsx
import type {
  ButtonProps,
  InputProps,
  ComboBoxProps,
  DialogProps,
  // ... etc
} from '@kingsimba/nc-ui'

// Extend or reuse in your components
interface MyCustomButtonProps extends ButtonProps {
  customProp: string
}
```

---

## Styling

All components use `nc-` prefixed classes and CSS variables. See `architecture.md` for theming details.

```css
/* Override theme */
:root {
  --nc-primary: #your-color;
  --nc-danger: #your-danger-color;
}

/* Custom component styles */
.nc-button.my-custom-button {
  /* your overrides */
}
```
