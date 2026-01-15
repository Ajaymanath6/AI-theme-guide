# Component Catalog System - Testing Guide

## Implementation Complete ✓ (Refactored to Tooltip)

All phases have been successfully implemented with the clean tooltip approach:

1. ✅ **Phase 1**: Component Catalog Service with localStorage management
2. ✅ **Phase 2**: Copy to clipboard functionality
3. ✅ **Phase 3**: Outline + Bottom Tooltip UI (REFACTORED - cleaner approach)
4. ✅ **Phase 4**: Register/Unregister functionality with full integration

---

## New Design: Outline + Bottom Tooltip

**Why this is better:**
- ✅ No visual clutter on your UI components
- ✅ Component gets blue outline glow on hover
- ✅ Tooltip appears BELOW component (not blocking your design)
- ✅ Clean, professional look like Figma/Framer

---

## Testing Instructions

### Step 1: Start the Development Server

```bash
cd angular-tailwind-flowbite-app
npm start
# or
ng serve
```

Navigate to the components canvas page (usually `http://localhost:4200/components-canvas`)

---

### Step 2: Test Outline + Tooltip Visibility

**Expected Behavior:**
- Hover over any component (card1, card2, card3, sidebar, dropdown)
- Component gets a **blue glowing outline**
- Tooltip appears **BELOW** the component showing:
  - Component ID (e.g., "card1")
  - 📋 Copy button
  - ⊕ Register button (if not registered)
  - ✓ Registered badge + 🗑️ Remove button (if registered)

**Visual Example:**
```
┌─────────────────────────┐
│  Card Title             │  ← Component with blue
│  Card content...        │     outline glow on hover
│  [Button] [Button]      │
└─────────────────────────┘
  ┌───────────────────────┐
  │ card1 [📋] [⊕ Register]│  ← Tooltip appears below
  └───────────────────────┘
```

**Test:**
1. Hover over card1 → Blue outline appears + tooltip slides up from below
2. Move mouse away → Outline disappears + tooltip fades out
3. Repeat for all 5 components
4. **Verify no UI clutter** - your components are clean when not hovering

---

### Step 3: Test Copy Functionality (Phase 2)

**Expected Behavior:**
- Clicking the 📋 button copies the component ID to clipboard
- An alert shows: "✓ Copied 'card1' to clipboard"

**Test:**
1. Hover over card1
2. Click the 📋 button
3. Verify alert appears
4. Paste somewhere (Ctrl+V / Cmd+V) → Should paste "card1"
5. Repeat for other components

---

### Step 4: Test Register Functionality (Phase 4)

**Expected Behavior:**
- Clicking ⊕ Register adds component to catalog (localStorage)
- Badge updates to show "✓ Registered" and 🗑️ button
- Alert shows: "✓ 'Primary Content Card' registered to catalog"

**Test:**
1. Hover over card1
2. Click ⊕ Register button
3. Verify alert appears
4. Badge should now show "✓ Registered" instead of "⊕ Register"
5. Repeat for card2 and sidebar

---

### Step 5: Test localStorage Persistence (Phase 1)

**Expected Behavior:**
- Registered components persist after page refresh
- Data is stored in browser's localStorage

**Test:**
1. Register card1 and card2
2. Refresh the page (F5)
3. Hover over card1 → Should still show "✓ Registered"
4. Hover over card3 → Should show "⊕ Register" (not registered)

**Verify in Browser DevTools:**
1. Open DevTools (F12)
2. Go to Application tab → Storage → Local Storage
3. Find key: `component-catalog`
4. Click to see JSON data with registered components

---

### Step 6: Test Remove Functionality (Phase 4)

**Expected Behavior:**
- Clicking 🗑️ shows confirmation dialog
- Confirming removes component from catalog
- Badge updates to show "⊕ Register" button again

**Test:**
1. Register card1 (if not already)
2. Hover over card1
3. Click 🗑️ button
4. Confirm in dialog
5. Alert shows: "✓ 'Primary Content Card' removed from catalog"
6. Badge now shows "⊕ Register" button

---

### Step 7: Test All 5 Components

**Components to test:**
- ✅ card1 (Primary Content Card)
- ✅ card2 (Action Card)
- ✅ card3 (Compact Card)
- ✅ sidebar (Navigation Sidebar)
- ✅ dropdown (Action Dropdown Menu)

**Full workflow test:**
1. Register all 5 components
2. Verify all show "✓ Registered"
3. Refresh page → All still registered
4. Remove card2 and dropdown
5. Verify those two show "⊕ Register" again
6. card1, card3, sidebar should still be registered

---

## Catalog Data Structure

When you register components, they're stored in localStorage as JSON:

```json
{
  "catalogId": "design-system-v1",
  "version": "1.0.0",
  "lastUpdated": "2025-01-15T...",
  "registeredComponents": {
    "card1": {
      "id": "card1",
      "displayName": "Primary Content Card",
      "category": "cards",
      "description": "Card with long paragraph content, primary and secondary action buttons",
      "htmlSelector": "[title='card1']",
      "status": "active",
      "registeredAt": "2025-01-15T..."
    },
    "sidebar": {
      "id": "sidebar",
      "displayName": "Navigation Sidebar",
      "category": "navigation",
      "description": "Collapsible navigation sidebar with...",
      "htmlSelector": "[title='sidebar']",
      "status": "active",
      "registeredAt": "2025-01-15T..."
    }
  }
}
```

---

## Component Metadata

Each component has predefined metadata:

| Component ID | Display Name | Category | Description |
|--------------|--------------|----------|-------------|
| card1 | Primary Content Card | cards | Card with long paragraph, primary & secondary buttons |
| card2 | Action Card | cards | Card with two-line content, primary & outline buttons |
| card3 | Compact Card | cards | Single line content, secondary & outline buttons |
| sidebar | Navigation Sidebar | navigation | Collapsible sidebar with logo, dropdown, menu items |
| dropdown | Action Dropdown Menu | menus | Dropdown with header, 5 options, action buttons |

---

## Browser Console Testing

Open browser console (F12) to see detailed logs:

```javascript
// When you copy a component:
// "Copied to clipboard: card1"

// When you register a component:
// "Component registered: { id: 'card1', displayName: '...', ... }"
// "Catalog saved: 1 components"

// When you remove a component:
// "Component unregistered: card1"
// "Catalog saved: 0 components"
```

---

## Troubleshooting

### Badge not appearing on hover
- Check browser console for errors
- Verify SCSS file compiled correctly
- Try hard refresh (Ctrl+Shift+R)

### Copy not working
- Check browser console for clipboard errors
- Some browsers require HTTPS for clipboard API
- Verify you clicked inside the badge area

### Data not persisting
- Check localStorage in DevTools
- Verify no browser extensions blocking localStorage
- Try in incognito/private window

### Register button not working
- Check browser console for errors
- Verify service is properly injected
- Check alert appears (may be blocked by browser)

---

## Next Steps (After Testing)

Once everything works:

1. **Export Catalog for AI**
   - Use browser console: `localStorage.getItem('component-catalog')`
   - Copy JSON and save as `component-catalog.json`
   - Give this file to AI when building new layouts

2. **Usage Example**
   ```
   You: "Create a dashboard page with card1 and sidebar"
   
   AI: (Reads component-catalog.json)
       - Finds card1 at [title='card1']
       - Finds sidebar at [title='sidebar']
       - Copies exact HTML from canvas
       - Generates dashboard layout
   ```

3. **Build New Layouts**
   - Hover over component → Copy ID
   - Tell AI: "Use card1 in the new page"
   - AI references catalog for exact HTML structure

---

## Success Criteria Checklist

- [ ] Badges appear on hover for all 5 components
- [ ] Copy button copies component ID to clipboard
- [ ] Register button adds component to localStorage
- [ ] Registered badge shows checkmark and remove button
- [ ] Remove button unregisters component
- [ ] Data persists across page refreshes
- [ ] No interference with drag functionality
- [ ] No console errors

---

## Files Modified

1. **Created:**
   - `/src/app/services/component-catalog.service.ts`

2. **Modified:**
   - `/src/app/pages/components-canvas/components-canvas.component.ts`
   - `/src/app/pages/components-canvas/components-canvas.component.html`
   - `/src/app/pages/components-canvas/components-canvas.component.scss`

---

Happy Testing! 🚀
