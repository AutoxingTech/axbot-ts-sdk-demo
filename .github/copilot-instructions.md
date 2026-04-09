# nc-ui Project Guidelines

This project uses [@kingsimba/nc-ui](https://www.npmjs.com/package/@kingsimba/nc-ui) - a lightweight React UI component library.

## Critical Rules

### 1. Component Usage

**ALWAYS use nc-ui components instead of native HTML elements:**

- `<button>` → `<Button>` from `@kingsimba/nc-ui`
- `<input>` → `<Input>` from `@kingsimba/nc-ui`
- `<select>` → `<ComboBox>` from `@kingsimba/nc-ui`
- `<textarea>` → `<Input multiline>` from `@kingsimba/nc-ui`
- `<input type="number">` → `<NumberInput>` from `@kingsimba/nc-ui`
- `<input type="checkbox">` → `<Checkbox>` from `@kingsimba/nc-ui`

### 2. CSS Convention

All **component** classes and variables use `nc-` prefix:

- Classes: `.nc-button`, `.nc-input`, `.nc-primary`
- Variables: `--nc-primary`, `--nc-text`, `--nc-danger`

**Global utility styles** (WITHOUT `nc-` prefix):

- Headings: `<h1>`, `.h1`, `.h2`, `.h3`, `.h4`
- Text: `<p className="weak">`, `<p className="weaker">`
- Code: `<code>`, `.code-block`
- Tags: `.tag`, `.tag.red`, `.tag.green`, `.tag.yellow`, `.tag.blue`
- Blocks: `.block`, `.block.note`, `.block.warning`, `.block.danger`, `.block.icon`
- Lists: `<ul>`, `<ol>`, `<ul className="no-dots">`

### 3. Import Pattern

```tsx
// Components
import { Button, Input, ComboBox, Dialog } from '@kingsimba/nc-ui';
import '@kingsimba/nc-ui/styles.css';

// Icons (separate entry point)
import { CloseIcon, EditIcon } from '@kingsimba/nc-ui/icons';
```

### 4. onChange Handlers

nc-ui components pass values directly (not event objects):

```tsx
// ✅ Correct
<Input value={text} onChange={setText} />
<ComboBox value={id} onChange={setId} options={...} />

// ❌ Wrong
<Input onChange={(e) => setText(e.target.value)} />
```

## Quick Reference

### Common Components

**Button**

- Props: `variant` (primary|danger|warning|success|ghost), `size` (small|default|large), `loading`, `block`, `disabled`, `textSelectable`
- Usage: `<Button variant="primary" size="large" loading={isLoading}>Save</Button>`

**Input**

- Props: `value`, `onChange`, `placeholder`, `label`, `type`, `multiline`, `rows`, `showPasswordToggle`, `size` (small|default), `disabled`, `clearable`, `onEnter`
- Usage: `<Input value={text} onChange={setText} label="Name" showPasswordToggle />`

**ComboBox**

- Props: `value`, `onChange`, `options`, `label`, `placeholder`, `allowTyping`, `clearable`, `size` (small|default), `disabled`
- Usage: `<ComboBox value={id} onChange={setId} options={opts} allowTyping clearable />`

**MultiSelect**

- Props: `values`, `onChange`, `options`, `label`, `placeholder`, `disabled`
- Usage: `<MultiSelect values={selected} onChange={setSelected} options={opts} />`

**Dialog**

- Props: `open`, `onClose`, `title`, `footerType` (ok-cancel|save-cancel|close|delete|custom), `onOk`, `onSave`, `onDelete`, `width`, `fullScreen`
- Usage: `<Dialog open={isOpen} onClose={close} title="Confirm" footerType="ok-cancel" />`

**ActivityIndicator**

- Props: `size` (small|default|large), `overlay`, `color`
- Usage: `<ActivityIndicator size="large" overlay />`

**Checkbox**

- Props: `checked`, `onChange`, `label`, `size` (small|default), `disabled`
- Usage: `<Checkbox checked={isChecked} onChange={setChecked} label="Agree" />`

**Toggle**

- Props: `checked`, `onChange`, `label`, `disabled`
- Usage: `<Toggle checked={enabled} onChange={setEnabled} label="Enable" />`

**NumberInput**

- Props: `value`, `onChange`, `min`, `max`, `step`, `label`, `size` (small|default), `disabled`
- Usage: `<NumberInput value={num} onChange={setNum} min={0} max={100} step={5} />`

**Alert**

- Props: `type` (info|success|warning|danger), `onClose`, `dismissible`
- Usage: `<Alert type="warning" onClose={handleClose}>Warning message</Alert>`

**Notification** (via notificationManager)

- API: `notificationManager.show({ type, message, title, lastingTime, dismissible })`
- Types: `success`, `danger`, `warning`, `info` (default)
- Usage: `notificationManager.show({ type: 'success', message: 'Saved!' })`

**ButtonGroup**

- Props: `children` (Button components)
- Usage: `<ButtonGroup><Button>Left</Button><Button>Right</Button></ButtonGroup>`

**Tabs**

- Props: `activeTab`, `onTabChange`, `tabs` (array of { id, label })
- Usage: `<Tabs activeTab={tab} onTabChange={setTab} tabs={[{id:'1',label:'Tab 1'}]} />`

**Slider**

- Props: `value`, `onChange`, `min`, `max`, `step`, `label`, `disabled`
- Usage: `<Slider value={val} onChange={setVal} min={0} max={100} />`

**ListGroup**

- Props: `items`, `onItemClick`, `selectedId`
- Usage: `<ListGroup items={items} onItemClick={handleClick} selectedId={id} />`

**ContextMenu**

- Props: `items`, `trigger` (JSX.Element), position options
- Usage: `<ContextMenu items={menuItems} trigger={<Button>Menu</Button>} />`

**YamlTextArea**

- Props: `value`, `onChange`, `placeholder`, `rows`, `disabled`
- Usage: `<YamlTextArea value={yaml} onChange={setYaml} rows={10} />`

**Battery**

- Props: `level` (0-100), `size` (small|default|large), `charging`
- Usage: `<Battery level={75} charging />`

**Hyperlink** (alias: `Link`)

- Props: `href`, `external`, `onClick`, `children`
- Usage: `<Hyperlink href="https://..." external>Visit</Hyperlink>`

**NavStack**

- Complex navigation component - see NavStack section in demo
- Props: `pages`, `onNavigate`, `title`, `toolbar`

**AppDialog**

- Props: `open`, `onClose`, `appId`, `width`
- Usage: `<AppDialog open={isOpen} onClose={close} appId="my-app" />`

**Icons** (50+ available, imported from `@kingsimba/nc-ui/icons`)

- Common: `CloseIcon`, `EditIcon`, `TrashIcon`, `SaveIcon`, `RefreshIcon`, `SearchIcon`, `MenuIcon`
- Usage: `<CloseIcon size={24} color="#3b82f6" />`

**CommonButtons** (pre-configured icon buttons)

- Components: `CloseButton`, `EditButton`, `RefreshButton`, `TrashButton`
- Usage: `<CloseButton onClick={handleClose} />`

### CSS Variables

- `--nc-primary`, `--nc-danger`, `--nc-warning`, `--nc-success`
- `--nc-text`, `--nc-text-weak`
- `--nc-bg`, `--nc-button-bg`, `--nc-input-bg`

## Documentation

For complete documentation, see files in the `docs/nc-ui-ai-reference` directory:

- `architecture.md` - Architecture and patterns
- `components-quick-reference.md` - All components with examples
- `global-utility-styles.md` - Global styles (h1, p.weak, .tag, .block, etc.)
- `examples-and-antipatterns.md` - Usage examples and common mistakes
- `app-framework.md` - App framework guide (if using apps)

---

**Remember:** Always use nc-ui components, never native HTML form elements!
