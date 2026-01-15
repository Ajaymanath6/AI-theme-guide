# Component Helper Service

This helper service enables automatic component generation when you click "Make Shared Component" in the canvas.

## How It Works

```
User clicks "Make Shared Component" button
         ↓
Popover appears with confirmation
         ↓
User clicks "Create Component"
         ↓
Angular app calls Component Helper (localhost:4201)
         ↓
Helper runs: ng generate component components/card5
         ↓
Component files are created automatically
         ↓
Success message shown!
```

## Setup (One-Time)

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Start the Component Helper
Open a **new terminal** and run:
```bash
npm run component-helper
```

You should see:
```
✨ Component Helper Server Running
📍 URL: http://localhost:4201
🎯 Ready to generate Angular components!
```

**Keep this terminal running!**

### 3. Start Angular (In another terminal)
```bash
npm start
```

## Usage

1. Navigate to the Components Canvas page
2. Hover over any component (card1, card2, etc.)
3. Click the **share icon** (🔄)
4. A popover appears showing:
   - Component name
   - Files that will be created
   - CLI command
5. Click **"Create Component"**
6. ✅ Done! Component files are created automatically

## What Gets Created

When you convert "card5" to a shared component, it creates:

```
src/app/components/card5/
├── card5.component.ts
├── card5.component.html
└── card5.component.scss
```

## Troubleshooting

### Error: "Cannot connect to component helper"
**Solution:** Make sure the component helper is running:
```bash
npm run component-helper
```

### Error: "Component already exists"
**Solution:** The component was already created. Use a different name.

### Helper stops working
**Solution:** Restart the helper:
1. Press `Ctrl+C` to stop it
2. Run `npm run component-helper` again

## Component Helper Endpoints

- `GET /health` - Check if helper is running
- `POST /generate` - Generate a new component
  - Body: `{ "componentId": "card5" }`
  - Returns: Success/error and created files

## Development Workflow

```bash
# Terminal 1: Component Helper (keep running)
npm run component-helper

# Terminal 2: Angular App
npm start

# Terminal 3: Any other commands you need
```

## Security Note

The component helper only runs on `localhost:4201` and only accepts component generation commands. It validates component IDs to prevent malicious commands.
