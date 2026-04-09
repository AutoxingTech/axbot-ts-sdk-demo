# nc-ui Integration Findings

This file records verified mismatches found while integrating `@kingsimba/nc-ui@0.1.18` into the axbot SDK demo.

## Verified mismatches

### Alert docs vs package API

- Documentation and workspace instructions show `Alert` as a children-based component with examples like `<Alert type="info">...</Alert>`.
- Installed package types expose:

```ts
Alert({ code, text, type, button, onAction })
type AlertType = 'warning' | 'error'
```

- Result: `info`, `success`, and `danger` are documented but not available in the package type surface, and children-based examples do not typecheck.

### Notification docs vs package API

- Documentation shows `showNotification({...})` imported from `@kingsimba/nc-ui`.
- Installed package exports `notificationManager.show({...})` instead.

### ButtonGroup docs vs package API

- Documentation shows `ButtonGroup` as a layout wrapper around `Button` children.
- Installed package types expose a segmented-control style API:

```ts
ButtonGroup<T>({ value, onChange, options, disabled, labels, size })
```

- Result: child-button examples do not typecheck.

### ListGroup docs vs package API

- Documentation shows `ListGroup` with `items`, `onItemClick`, and `selectedId` props.
- Installed package exports `ListGroup` plus `ListGroupItem`, and `ListGroup` takes `title`, `titleTools`, `children`, and `style`.

### Tabs docs vs workspace instruction mismatch

- The checked-in quick reference matches the package API: `Tabs` uses `active` and `onChange`.
- The workspace instruction file still mentions `activeTab` and `onTabChange`.

## Requests

### Add non-error alert variants

The current package only supports `warning` and `error` alert types. An `info` alert would be useful for non-failure guidance, and `success` would also be consistent with the existing docs.

### Export a simple notification helper alias

The current `notificationManager.show(...)` API works, but a root-level `showNotification(...)` alias would match the docs and reduce friction.

### Keep docs and package types in sync

The integration friction came from examples that no longer matched the actual exported types. A generated API reference or a type-driven docs check would prevent this drift.