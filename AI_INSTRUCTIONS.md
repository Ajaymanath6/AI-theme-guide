# AI Instructions for This Project

## MANDATORY: Read These Files Before Generating Any UI Code

1. **tailwind.config.js** - See what theme colors are available
2. **src/app/theme-guide.json** - Read ALL rules and guidelines
3. **src/app/layout-guide.json** - Read if creating layouts/pages

## Critical Rules

- ✅ **ONLY** use theme utility classes: `bg-brandcolor-*`, `text-brandcolor-*`, `border-brandcolor-*`
- ❌ **NEVER** use hex codes: `#008B31`, `#2F55D9`, etc.
- ❌ **NEVER** use inline styles: `style="color: #008B31"`
- ❌ **NEVER** use hardcoded Tailwind colors: `bg-blue-700`, `text-gray-900`

## Before Generating Code

1. Read `tailwind.config.js` - know what colors exist
2. Read `theme-guide.json` completely - know all rules
3. Check `componentGuidelines` for your component type
4. Review `commonMistakes` section to avoid errors
5. Generate code using ONLY theme classes
6. Run `codeValidation` checklist
7. Verify no forbidden patterns exist

## Quick Reference

### Primary Button
```html
<button class="bg-brandcolor-primary text-brandcolor-white hover:bg-brandcolor-primaryhover rounded-md px-4 py-2">
  Button
</button>
```

### Secondary Button
```html
<button class="border-[1.5px] border-brandcolor-strokeweak text-brandcolor-secondary bg-transparent hover:bg-brandcolor-secondaryhover rounded-md px-4 py-2">
  Secondary
</button>
```

### Input Field
```html
<input class="border-brandcolor-strokestrong focus:border-brandcolor-textstrong focus:outline-none focus:ring-0 text-brandcolor-textstrong">
```

### Heading
```html
<h1 class="text-brandcolor-textstrong text-3xl font-bold">Heading</h1>
```

## Super Component Naming Rules

**CRITICAL RULE: ALL super components MUST start with "app-" prefix**

### Examples:
- Buttons: `secondary-button` + `secondary-outline-button` → `app-secondary-button`
- Any UI: `sidebar` + `header` → `app-sidebar` (or based on first component)
- Always format: `app-{component-name}`

### Naming Logic:
1. For buttons: Extract base button name (remove `-outline-` if present)
2. For other components: Use common prefix or first component name
3. **Always ensure the final name starts with "app-"**

## Validation Checklist

Before submitting code, verify:
- [ ] No hex codes (#008B31, etc.)
- [ ] No inline styles (style='...')
- [ ] No hardcoded Tailwind colors (bg-blue-*, text-gray-*)
- [ ] All color classes use 'brandcolor-' prefix
- [ ] Buttons have 'rounded-md' (not rounded-lg/xl)
- [ ] Secondary buttons have 'border-[1.5px]' (not border/border-2)
- [ ] Component follows componentGuidelines
- [ ] All requiredClasses are included
- [ ] Super component names start with "app-" prefix