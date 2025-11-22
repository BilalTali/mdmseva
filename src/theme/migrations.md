# Component Migration Guide

This guide provides step-by-step instructions for migrating components from hardcoded Tailwind colors to the theme system using CSS variables.

## Migration Strategy

1. Identify hardcoded colors and `dark:` variants
2. Replace with CSS variable references
3. Test in both light and dark themes
4. Verify accessibility (contrast ratios)

## Pattern Examples

### Pattern 1: Background Colors

#### ❌ Before
```jsx
<div className="bg-white dark:bg-gray-800">
```

#### ✅ After
```jsx
<div className="bg-[var(--surface-00)]">
```

Or create a utility class in `app.css`:
```css
.surface-card {
  background-color: var(--surface-00);
}
```

Then use:
```jsx
<div className="surface-card">
```

---

### Pattern 2: Text Colors

#### ❌ Before
```jsx
<p className="text-gray-900 dark:text-gray-100">
```

#### ✅ After
```jsx
<p className="text-[var(--text-primary)]">
```

---

### Pattern 3: Borders

#### ❌ Before
```jsx
<div className="border border-gray-300 dark:border-gray-700">
```

#### ✅ After
```jsx
<div className="border border-[var(--border-light)]">
```

---

### Pattern 4: Complex Component (Card)

#### ❌ Before
```jsx
<div className="bg-white dark:bg-secondary-800 border border-gray-200 dark:border-gray-700 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
    Title
  </h2>
  <p className="text-sm text-gray-600 dark:text-gray-400">
    Description
  </p>
</div>
```

#### ✅ After
```jsx
<div className="bg-[var(--surface-00)] border border-[var(--border-light)] shadow-[var(--elevation-1)]">
  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
    Title
  </h2>
  <p className="text-sm text-[var(--text-secondary)]">
    Description
  </p>
</div>
```

---

### Pattern 5: Buttons

#### ❌ Before
```jsx
<button className="bg-blue-500 hover:bg-blue-600 text-white">
  Click me
</button>
```

#### ✅ After
```jsx
<button className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white">
  Click me
</button>
```

For semantic buttons:
```jsx
<button className="bg-[var(--color-success)] hover:bg-[var(--color-success-hover)] text-white">
  Success
</button>
```

---

### Pattern 6: Forms & Inputs

#### ❌ Before
```jsx
<input
  className="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
/>
```

#### ✅ After
```jsx
<input
  className="border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)]"
/>
```

Or use the component-specific token:
```css
.input-field {
  background-color: var(--input-bg);
  border-color: var(--input-border);
  color: var(--text-primary);
}

.input-field:focus {
  box-shadow: 0 0 0 3px var(--input-focus-ring);
}

.input-field:disabled {
  background-color: var(--input-disabled-bg);
}
```

---

### Pattern 7: Tables

#### ❌ Before
```jsx
<table>
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr>
      <th className="text-gray-700 dark:text-gray-300">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
      <td className="text-gray-900 dark:text-gray-100">John</td>
    </tr>
  </tbody>
</table>
```

#### ✅ After
```jsx
<table>
  <thead className="bg-[var(--table-header-bg)]">
    <tr>
      <th className="text-[var(--text-secondary)]">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-[var(--table-row-hover)]">
      <td className="text-[var(--text-primary)]">John</td>
    </tr>
  </tbody>
</table>
```

---

### Pattern 8: Modals

#### ❌ Before
```jsx
<div className="fixed inset-0 bg-black bg-opacity-50">
  <div className="bg-white dark:bg-gray-800 p-6">
    Modal content
  </div>
</div>
```

#### ✅ After
```jsx
<div className="fixed inset-0 bg-[var(--modal-backdrop)]">
  <div className="bg-[var(--modal-bg)] p-6">
    Modal content
  </div>
</div>
```

---

### Pattern 9: Alerts/Banners

#### ❌ Before
```jsx
<div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
  <p className="text-red-800 dark:text-red-200">Error message</p>
</div>
```

#### ✅ After
```jsx
<div className="bg-[var(--color-danger-light)] border-l-4 border-[var(--color-danger)]">
  <p className="text-[var(--color-danger)]">Error message</p>
</div>
```

For better theming, define alert-specific tokens:
```css
:root {
  --alert-error-bg: rgba(255, 92, 124, 0.1);
  --alert-error-border: #FF5C7C;
  --alert-error-text: #DC2626;
}

:root[data-theme="dark"] {
  --alert-error-bg: rgba(255, 92, 124, 0.15);
  --alert-error-border: #F87171;
  --alert-error-text: #FCA5A5;
}
```

---

## Component-by-Component Checklist

### Button Components
- [ ] `PrimaryButton.jsx` → Use `--primary-500`, `--primary-600`
- [ ] `SecondaryButton.jsx` → Use `--secondary-100`, `--secondary-200`
- [ ] `DangerButton.jsx` → Use `--color-danger`, `--color-danger-hover`
- [ ] `ui/button.jsx` → Consolidate all button variants

### Form Components
- [ ] `TextInput.jsx` → Use `--input-*` tokens
- [ ] `Checkbox.jsx` → Use `--primary-500` for checked state
- [ ] `ui/input.jsx` → Standardize input styling
- [ ] `ui/textarea.jsx` → Align with input styling
- [ ] `ui/label.jsx` → Use `--text-secondary`

### Layout Components
- [ ] `Sidebar.jsx` → Use `--sidebar-*` tokens
- [ ] `AuthenticatedLayout.jsx` → Use `--bg-*` and `--surface-*`
- [ ] `GuestLayout.jsx` → Use surface tokens
- [ ] `AdminNavigation.jsx` → Align with sidebar styling

### UI Components
- [ ] `Modal.jsx` → Use `--modal-*` tokens
- [ ] `Dropdown.jsx` → Use `--surface-00`, `--elevation-2`
- [ ] `ui/card.jsx` → Use `--surface-00`, `--border-light`
- [ ] `ui/alert.jsx` → Use semantic color tokens

### Page Components
Each page should replace `dark:` classes with CSS variables:
- [ ] Dashboard pages
- [ ] RiceConfiguration pages (580+ instances)
- [ ] RiceReport pages
- [ ] Profile pages
- [ ] Legal pages

---

## Migration Workflow

### Step 1: Audit
```bash
# Find all files with dark: classes
git grep "dark:" resources/js/
```

### Step 2: Create Utility Classes (Optional)
If a pattern repeats, create a utility class in `app.css`:

```css
@layer components {
  .card-surface {
    background-color: var(--surface-00);
    border: 1px solid var(--border-light);
    box-shadow: var(--elevation-1);
  }
  
  .text-primary {
    color: var(--text-primary);
  }
  
  .text-secondary {
    color: var(--text-secondary);
  }
}
```

### Step 3: Replace in Components
Use find-and-replace with regex (VS Code):

**Find**: `bg-white dark:bg-gray-800`  
**Replace**: `bg-[var(--surface-00)]`

**Find**: `text-gray-900 dark:text-gray-100`  
**Replace**: `text-[var(--text-primary)]`

### Step 4: Test
1. Open the component in browser
2. Toggle theme (click theme toggle button)
3. Verify colors change correctly
4. Check contrast with browser DevTools

### Step 5: Verify Accessibility
```javascript
// Check contrast ratios in DevTools
// Lighthouse → Accessibility → Color contrast
```

---

## Common Pitfalls

### ❌ Pitfall 1: Inline Styles with Hardcoded Colors
```jsx
<div style={{ backgroundColor: '#ffffff' }}>
```

**✅ Solution**: Use CSS variables
```jsx
<div style={{ backgroundColor: 'var(--surface-00)' }}>
```

---

### ❌ Pitfall 2: Conditional Theme Classes
```jsx
<div className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
```

**✅ Solution**: CSS variables handle this automatically
```jsx
<div className="bg-[var(--surface-00)]">
```

---

### ❌ Pitfall 3: Chart Colors Not Updating
```jsx
<Bar dataKey="value" fill="#3B82F6" />
```

**✅ Solution**: Use chart colors from theme
```jsx
import { useChartColors } from '@/../../src/components/charts/ChartWrapper';

function MyChart() {
  const colors = useChartColors();
  return <Bar dataKey="value" fill={colors[0]} />;
}
```

---

## Token Quick Reference

| Use Case | Token | Example |
|----------|-------|---------|
| Card background | `--surface-00` | `bg-[var(--surface-00)]` |
| Page background | `--bg-primary` | `bg-[var(--bg-primary)]` |
| Primary text | `--text-primary` | `text-[var(--text-primary)]` |
| Secondary text | `--text-secondary` | `text-[var(--text-secondary)]` |
| Muted text | `--text-muted` | `text-[var(--text-muted)]` |
| Border | `--border-light` | `border-[var(--border-light)]` |
| Primary button | `--primary-500` | `bg-[var(--primary-500)]` |
| Success color | `--color-success` | `bg-[var(--color-success)]` |
| Danger color | `--color-danger` | `bg-[var(--color-danger)]` |
| Input background | `--input-bg` | `bg-[var(--input-bg)]` |
| Table header | `--table-header-bg` | `bg-[var(--table-header-bg)]` |
| Shadow | `--elevation-1` | `shadow-[var(--elevation-1)]` |

---

## Testing Checklist

After migrating a component:

- [ ] Component renders in light theme
- [ ] Component renders in dark theme
- [ ] Theme toggle works without page refresh
- [ ] No hardcoded colors remain (inspect in DevTools)
- [ ] Text contrast passes WCAG AA (4.5:1 for body text)
- [ ] Focus states are visible
- [ ] Hover states work in both themes
- [ ] All interactive elements are accessible via keyboard

---

## Need Help?

- See `THEMING.md` for detailed API documentation
- Check `implementation_plan.md` for architecture overview
- Look at already-migrated components for patterns
- Test token values in browser DevTools console:
  ```javascript
  getComputedStyle(document.documentElement).getPropertyValue('--primary-500')
  ```
