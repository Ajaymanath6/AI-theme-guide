# Pages Folder Structure

This folder follows a **nested structure** where each page has its own folder with components and layouts subfolders.

## Structure

```
pages/
├── projects/
│   ├── projects.component.ts          # Main Projects page component
│   ├── projects.component.html        # Projects page template
│   ├── projects.component.scss        # Projects page styles
│   ├── components/                    # Projects page specific components
│   │   └── .gitkeep
│   └── layouts/                       # Projects page specific layouts
│       └── .gitkeep
├── dashboard/                          # Future: Dashboard page
│   ├── dashboard.component.ts
│   ├── components/
│   └── layouts/
├── components/                         # Shared page components (if any)
└── layouts/                            # Shared layouts (used by multiple pages)
```

## How It Works

### For Each Page:

1. **Page Component**: The main component file (e.g., `projects.component.ts`) lives directly in the page folder
2. **Page-Specific Components**: Components used only by this page go in `components/` subfolder
   - Example: `projects/components/project-card/`
   - Example: `projects/components/project-filter/`
3. **Page-Specific Layouts**: Layouts used only by this page go in `layouts/` subfolder
   - Example: `projects/layouts/projects-with-sidebar/`
   - Example: `projects/layouts/projects-grid/`

### Shared Resources:

- **Shared Components**: Components used by multiple pages go in `pages/components/`
- **Shared Layouts**: Layouts used by multiple pages go in `pages/layouts/`

## Creating a New Page

1. Create folder: `pages/your-page-name/`
2. Generate component: `ng generate component pages/your-page-name/your-page-name`
3. Move component files to `pages/your-page-name/` (remove nested folder)
4. Create subfolders: `components/` and `layouts/`
5. Add route in `app.routes.ts`

## Example: Projects Page

```
pages/projects/
├── projects.component.ts
├── projects.component.html
├── projects.component.scss
├── components/
│   └── project-card/          # Component only used in projects page
└── layouts/
    └── projects-sidebar/      # Layout only used in projects page
```

## Benefits

- ✅ **Scalable**: Easy to add new pages without cluttering
- ✅ **Organized**: Each page is self-contained
- ✅ **Clear Separation**: Page-specific vs shared components
- ✅ **Maintainable**: Easy to find and modify page-specific code
