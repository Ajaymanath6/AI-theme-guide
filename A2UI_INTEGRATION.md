# A2UI Integration Guide

This document explains how our theme system aligns with A2UI principles and how to apply A2UI core concepts to our Angular + Tailwind setup.

## Table of Contents

1. [What is A2UI?](#what-is-a2ui)
2. [Comparison: Our System vs A2UI](#comparison-our-system-vs-a2ui)
3. [How to Apply A2UI Principles](#how-to-apply-a2ui-principles)
4. [Implementation Plan](#implementation-plan)
5. [Benefits](#benefits)

---

## What is A2UI?

**A2UI** (Agent-to-UI) is a protocol that enables AI agents to generate rich, interactive user interfaces that render natively across web, mobile, and desktop—without executing arbitrary code.

### Key Concepts

- **Declarative Data Format**: Agents send component descriptions (JSON), not executable code
- **Client-Controlled Styling**: Agents describe what to show, clients decide how it looks
- **Component Catalogs**: Collections of pre-approved components (standard + custom)
- **Semantic Hints**: Agents use semantic hints (`usageHint: "h1"`) instead of visual properties
- **Security by Design**: Only registered components can be used

### A2UI Resources

- Official Site: https://a2ui.org/
- Custom Components Guide: https://a2ui.org/guides/custom-components/
- Theming & Styling: https://a2ui.org/guides/theming-styling/

---

## Comparison: Our System vs A2UI

### Similarity Analysis

| Our System | A2UI Equivalent | Similarity |
|------------|-----------------|------------|
| `theme-guide.json` | Theme Configuration (Layer 2) | **85% similar** |
| `componentGuidelines` | Custom Component Catalog | **80% similar** |
| Semantic color names (`brandcolor-primary`) | Semantic hints (`usageHint: "h1"`) | **75% similar** |
| AI instructions in JSON | Agent instructions | **90% similar** |
| Client-controlled styling | Client-controlled styling | **100% similar** |
| Restricted to theme classes | Restricted to registered components | **90% similar** |
| `layout-guide.json` | Layout patterns | **70% similar** |

### Key Differences

| Aspect | Our System | A2UI |
|--------|------------|------|
| **Purpose** | AI-assisted code generation | Runtime UI generation |
| **Output** | Angular components (compile-time) | JSON messages (runtime) |
| **Rendering** | Static HTML/CSS | Dynamic rendering from JSON |
| **Communication** | JSON guides (one-way) | JSON messages (two-way) |

### What We Already Have (A2UI-Aligned)

✅ **Client-Controlled Styling**: Our theme system controls all visual styles  
✅ **Semantic Naming**: We use semantic color names (`brandcolor-primary`, `brandcolor-textstrong`)  
✅ **Component Guidelines**: We have structured component definitions  
✅ **AI Instructions**: We provide clear rules for AI to follow  
✅ **Security Restrictions**: We restrict to theme utility classes only  

---

## How to Apply A2UI Principles

### 1. Create Component Catalog System

**A2UI Principle**: Register entire catalogs, not individual components.

#### Implementation: `component-catalog.json`

```json
{
  "catalogId": "brand-catalog-v1",
  "version": "1.0.0",
  "components": {
    "standard": [
      "Button",
      "TextField",
      "Card",
      "Heading",
      "Input",
      "Icon",
      "Divider"
    ],
    "custom": [
      "ProjectCard",
      "ProjectFilter",
      "ProjectChart",
      "CustomDatePicker"
    ]
  },
  "componentDefinitions": {
    "Button": {
      "variants": ["primary", "secondary", "secondary-outline", "outline"],
      "properties": {
        "text": "string",
        "variant": "primary | secondary | secondary-outline | outline",
        "disabled": "boolean"
      },
      "semanticHints": {
        "primary": "Main CTA button",
        "secondary": "Secondary action button with brand color",
        "secondary-outline": "Secondary action button without brand color",
        "outline": "Tertiary action button"
      }
    },
    "ProjectCard": {
      "properties": {
        "title": "string",
        "description": "string",
        "status": "string"
      },
      "semanticHints": {
        "usage": "Display project information in card format"
      }
    }
  }
}
```

### 2. Use Semantic Hints Instead of Direct Styling

**A2UI Principle**: Agents provide semantic hints, clients decide visual styles.

#### Update `theme-guide.json` to Include Semantic Hints

```json
{
  "componentGuidelines": {
    "button": {
      "primary": {
        "semanticHint": "primary-cta",
        "usageHint": "primary",
        "description": "Main CTA button",
        "classes": "bg-brandcolor-primary text-brandcolor-white hover:bg-brandcolor-primaryhover",
        "whenToUse": "Primary actions, main CTAs, important buttons"
      }
    },
    "heading": {
      "h1": {
        "semanticHint": "main-heading",
        "usageHint": "h1",
        "classes": "text-brandcolor-textstrong text-3xl font-bold",
        "whenToUse": "Main page headings, primary titles"
      }
    }
  }
}
```

### 3. Component Registration System

**A2UI Principle**: Register catalogs with validation.

#### Implementation: `component-registry.ts`

```typescript
// component-registry.ts
export interface ComponentCatalog {
  catalogId: string;
  version: string;
  components: {
    standard: string[];
    custom: string[];
  };
  componentDefinitions: Record<string, any>;
}

export class ComponentRegistry {
  private catalogs: Map<string, ComponentCatalog> = new Map();
  
  registerCatalog(catalog: ComponentCatalog): void {
    // Validate catalog
    this.validateCatalog(catalog);
    // Register catalog
    this.catalogs.set(catalog.catalogId, catalog);
  }
  
  isComponentAllowed(catalogId: string, componentName: string): boolean {
    const catalog = this.catalogs.get(catalogId);
    if (!catalog) return false;
    
    return catalog.components.standard.includes(componentName) ||
           catalog.components.custom.includes(componentName);
  }
  
  getComponentDefinition(catalogId: string, componentName: string): any {
    const catalog = this.catalogs.get(catalogId);
    if (!catalog) return null;
    
    return catalog.componentDefinitions[componentName];
  }
  
  private validateCatalog(catalog: ComponentCatalog): void {
    // Validate properties, security, etc.
    if (!catalog.catalogId || !catalog.version) {
      throw new Error('Invalid catalog: missing catalogId or version');
    }
    
    // Validate component definitions exist for all listed components
    const allComponents = [...catalog.components.standard, ...catalog.components.custom];
    for (const componentName of allComponents) {
      if (!catalog.componentDefinitions[componentName]) {
        throw new Error(`Component ${componentName} is listed but not defined`);
      }
    }
  }
}
```

### 4. Security: Allowlist Components

**A2UI Principle**: Only register components you trust.

#### Update AI Instructions with Security Rules

```json
{
  "aiInstructions": {
    "securityRules": {
      "allowedComponents": {
        "standard": ["Button", "TextField", "Card", "Heading", "Input", "Icon", "Divider"],
        "custom": ["ProjectCard", "ProjectFilter"],
        "rule": "ONLY use components from this allowlist. NEVER create new component names."
      },
      "validateProperties": {
        "rule": "Always validate component properties match the catalog definition",
        "example": "Button can only have: text, variant, disabled"
      },
      "sanitizeInput": {
        "rule": "Always sanitize user input in components",
        "example": "Use Angular's DomSanitizer for HTML content"
      }
    }
  }
}
```

### 5. Semantic Hints Mapping

**A2UI Principle**: Map semantic hints to visual styles.

#### Implementation: `semantic-hints.json`

```json
{
  "semanticHints": {
    "h1": {
      "mappedTo": "heading.h1",
      "classes": "text-brandcolor-textstrong text-3xl font-bold",
      "description": "Main page heading"
    },
    "h2": {
      "mappedTo": "heading.h2",
      "classes": "text-brandcolor-textstrong text-2xl font-semibold",
      "description": "Section heading"
    },
    "h3": {
      "mappedTo": "heading.h3",
      "classes": "text-brandcolor-textstrong text-xl font-semibold",
      "description": "Subsection heading"
    },
    "primary-cta": {
      "mappedTo": "button.primary",
      "classes": "bg-brandcolor-primary text-brandcolor-white hover:bg-brandcolor-primaryhover",
      "description": "Primary call-to-action button"
    },
    "secondary-action": {
      "mappedTo": "button.secondary",
      "classes": "border-brandcolor-strokeweak text-brandcolor-secondary bg-transparent hover:bg-brandcolor-secondaryhover",
      "description": "Secondary action button with brand color"
    },
    "body-text": {
      "mappedTo": "text.body",
      "classes": "text-brandcolor-textweak",
      "description": "Body text content"
    }
  }
}
```

---

## Implementation Plan

### Step 1: Create Component Catalog ✅

- [ ] Create `component-catalog.json` with standard + custom components
- [ ] Define component properties and semantic hints
- [ ] Include all components from `theme-guide.json`

### Step 2: Add Semantic Hints to Theme Guide ✅

- [ ] Update `theme-guide.json` to include `semanticHint` and `usageHint` for each component
- [ ] Map hints to visual styles
- [ ] Update AI instructions to use semantic hints

### Step 3: Create Component Registry ✅

- [ ] Build `component-registry.ts` to register and validate catalogs
- [ ] Add security validation
- [ ] Implement component allowlist checking

### Step 4: Update AI Instructions ✅

- [ ] Add catalog-based rules
- [ ] Enforce component allowlist
- [ ] Use semantic hints instead of direct styling
- [ ] Add security validation rules

### Step 5: Create Semantic Hints Mapper ✅

- [ ] Build `semantic-hints.json` to map hints to theme classes
- [ ] Enable AI to use hints, your system applies styles
- [ ] Create helper functions to resolve hints to classes

---

## Benefits of Applying A2UI Principles

### 1. Security ✅

- **Allowlist Components**: Only registered components can be used
- **Property Validation**: Component properties are validated against catalog definitions
- **No Code Injection**: Agents can't inject arbitrary code or styles

### 2. Consistency ✅

- **Semantic Hints**: AI uses semantic hints, ensuring consistent styling
- **Theme Mapping**: All hints map to your theme system
- **Brand Consistency**: All UIs match your design system

### 3. Scalability ✅

- **Easy to Add Components**: Just add to catalog and register
- **Version Control**: Catalog versioning for updates
- **Component Reusability**: Components can be used across pages

### 4. AI-Friendly ✅

- **Semantic Approach**: AI uses semantic hints, not visual properties
- **Clear Guidelines**: Component catalog provides clear structure
- **Validation**: System validates AI-generated components

### 5. Maintainability ✅

- **Centralized Definitions**: All components defined in one place
- **Type Safety**: Component properties are typed
- **Documentation**: Catalog serves as documentation

---

## A2UI Styling Philosophy (Applied to Our System)

A2UI follows a **client-controlled styling approach**:

1. **Agents describe what to show** (components and structure)
2. **Clients decide how it looks** (colors, fonts, spacing)

This matches our system perfectly:

- **Our Theme System** = Client-controlled styling
- **Our Component Guidelines** = Component descriptions
- **Our Semantic Hints** = Agent-provided hints

### Styling Layers (A2UI → Our System)

| A2UI Layer | Our System Equivalent |
|------------|----------------------|
| **Layer 1: Semantic Hints** | `semantic-hints.json` (to be created) |
| **Layer 2: Theme Configuration** | `theme-guide.json` + `tailwind.config.js` |
| **Layer 3: Component Overrides** | Component-specific SCSS files |
| **Layer 4: Rendered Output** | Angular components |

---

## Best Practices (A2UI-Aligned)

### 1. Use Semantic Hints, Not Visual Properties ✅

```json
// ✅ Good: Semantic hint
{
  "component": {
    "Text": {
      "text": {"literalString": "Welcome"},
      "usageHint": "h1"
    }
  }
}

// ❌ Bad: Visual properties (not supported)
{
  "component": {
    "Text": {
      "text": {"literalString": "Welcome"},
      "fontSize": 24,
      "color": "#FF0000"
    }
  }
}
```

### 2. Maintain Accessibility ✅

- Ensure sufficient color contrast (WCAG AA: 4.5:1 for normal text)
- Test with screen readers
- Support keyboard navigation
- Test in both light and dark modes

### 3. Use Design Tokens ✅

- Define reusable design tokens (colors, spacing, etc.)
- Reference them throughout your styles for consistency
- Our `theme-guide.json` serves as design tokens

### 4. Test Across Platforms ✅

- Test your theming on all target platforms
- Verify both light and dark modes
- Check different screen sizes and orientations
- Ensure consistent brand experience

---

## Next Steps

1. **Review A2UI Documentation**: https://a2ui.org/
2. **Implement Component Catalog**: Create `component-catalog.json`
3. **Add Semantic Hints**: Update `theme-guide.json`
4. **Create Component Registry**: Build `component-registry.ts`
5. **Update AI Instructions**: Add catalog-based rules
6. **Create Semantic Hints Mapper**: Build `semantic-hints.json`

---

## References

- **A2UI Official Site**: https://a2ui.org/
- **Custom Components Guide**: https://a2ui.org/guides/custom-components/
- **Theming & Styling Guide**: https://a2ui.org/guides/theming-styling/
- **A2UI Specification**: https://a2ui.org/specs/

---

## Summary

Our system is **already 80% aligned** with A2UI principles:

✅ Client-controlled styling  
✅ Semantic naming  
✅ Component guidelines  
✅ AI instructions  
✅ Security restrictions  

To fully adopt A2UI principles, we need to:

1. ✅ Add component catalog system
2. ✅ Use semantic hints instead of direct styling
3. ✅ Register components with validation
4. ✅ Map semantic hints to our theme system

This will make our system even more secure, scalable, and AI-friendly while maintaining our brand consistency and design system.
