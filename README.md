# AI Theme Guide - Angular + Tailwind + Flowbite

This project demonstrates a semantic theme system for Angular applications using Tailwind CSS and Flowbite, designed for AI-assisted component development.

## 🎨 Features

- **Angular 19.1.6** - Latest Angular framework
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Flowbite 2.5.2** - UI component library
- **Semantic Theme System** - Descriptive color naming for easier development
- **AI-Ready** - Theme guide JSON for AI-assisted component creation

## 🚀 Quick Start

### Development

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/`

### Build

```bash
ng build
```

## 📚 Theme System

This project uses a semantic theme system with descriptive color names:

- `brandcolor-primary` - Main brand color (#008B31)
- `brandcolor-textstrong` - Strong text for headings (#001A31)
- `brandcolor-textweak` - Weak text for body (#5C6166)
- `brandcolor-strokestrong` - Strong borders for inputs, sidebars (#737373)
- `brandcolor-strokeweak` - Weak borders for cards, dividers (#C5C5C5)

See `src/app/theme-guide.json` for complete theme documentation.

## 🤖 AI-Assisted Development

The `theme-guide.json` file provides:
- Color usage rules
- Component guidelines
- Reusable utility classes
- AI instructions for consistent component creation

## 📖 Documentation

- **Theme Guide**: `src/app/theme-guide.json` - Complete theme system documentation
- **Reasoning**: `reasoning.md` - Why semantic naming reduces memory load by ~60%

## 🌐 GitHub Pages Deployment

### Automatic Deployment

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

### Manual Setup

1. Go to your repository settings
2. Navigate to **Pages** section
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically build and deploy your app

### Access Your Site

Once deployed, your site will be available at:
```
https://ajaymanath6.github.io/AI-theme-guide/
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── document-view/     # Example component
│   ├── theme-guide.json       # Theme system documentation
│   └── app.component.*        # Main app component
├── styles.scss                # Global styles with Tailwind
└── index.html                 # Main HTML file

tailwind.config.js             # Tailwind configuration
theme-guide.json               # Theme system guide
```

## 🛠️ Technology Stack

- **Angular**: ^19.1.6
- **Tailwind CSS**: ^3.4.17
- **Flowbite**: ^2.5.2
- **TypeScript**: ~5.7.2

## 📝 License

This project is open source and available for use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
