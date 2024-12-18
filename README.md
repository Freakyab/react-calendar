Here's a `README.md` file for your project, including the necessary steps and commands to get started with the React + TypeScript + Vite setup:

### `README.md`

```markdown
# React + TypeScript + Vite Project

This is a minimal setup for using React with TypeScript and Vite, with hot module replacement (HMR) and ESLint configuration to help you follow best practices. This setup provides a fast and efficient development environment.

## Prerequisites

Before getting started, ensure you have the following installed on your system:

- **Node.js** (v14 or above)
- **npm** (v6 or above)

## Getting Started

### 1. Clone the Repository

If you haven't already cloned the repository, you can do so with:

```bash
git clone <https://github.com/Freakyab/react-calendar>
cd react-calendar
```

### 2. Install Dependencies

Install the required dependencies by running:

```bash
npm install
```

### 3. Run the Development Server

To start the Vite development server, use the following command:

```bash
npm run dev
```

This will start the server, and you can access your project at `http://localhost:3000` (by default).

### 4. Build for Production

When you're ready to build the production version of your application, run:

```bash
npm run build
```

This will generate a production build in the `dist/` folder.

### 5. Preview the Production Build

To preview the production build locally, use:

```bash
npm run serve
```

This will serve the built project, allowing you to preview it in your browser.

## ESLint Configuration

This project comes with an ESLint configuration that helps you follow best practices for React and TypeScript.

### ESLint Type-Aware Setup

We recommend updating the ESLint configuration for type-aware linting by following these steps:

1. **Update ESLint Config**

   Edit your ESLint configuration file (e.g., `eslint.config.js`) with the following:

   ```js
   import react from 'eslint-plugin-react'
   import { tseslint } from 'tseslint'

   export default tseslint.config({
     languageOptions: {
       parserOptions: {
         project: ['./tsconfig.node.json', './tsconfig.app.json'],
         tsconfigRootDir: import.meta.dirname,
       },
     },
     plugins: {
       react,
     },
     settings: { react: { version: '18.3' } },
     rules: {
       ...react.configs.recommended.rules,
       ...react.configs['jsx-runtime'].rules,
     },
   })
   ```

2. **Install ESLint and Plugins**

   Ensure you have the necessary ESLint dependencies installed by running:

   ```bash
   npm install eslint eslint-plugin-react tseslint --save-dev
   ```

3. **Optional**: Add `eslint-plugin-react` to your ESLint configuration to enable React-specific linting rules.

## TypeScript Configuration

Make sure your `tsconfig.json` files (e.g., `tsconfig.node.json`, `tsconfig.app.json`) are properly configured to support the development environment.

### Example `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Folder Structure

Here's a basic overview of the folder structure:

```
/src
  /components
  /pages
  App.tsx
  index.tsx
/public
  index.html
/package.json
/tsconfig.json
/eslint.config.js
```

## Scripts

- **`npm run dev`**: Starts the Vite development server (HMR enabled).
- **`npm run build`**: Builds the production version of the app.
- **`npm run serve`**: Serves the production build for preview.
