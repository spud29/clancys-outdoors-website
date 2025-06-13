#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Initializing Clancy\'s Outdoors Modern Development Environment...\n');

// Function to run shell commands
function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ Failed to ${description.toLowerCase()}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Function to create file if it doesn't exist
function createFileIfNotExists(filePath, content, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`📄 Creating ${description}...`);
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${description} created\n`);
  } else {
    console.log(`⏭️  ${description} already exists, skipping\n`);
  }
}

// Function to check if required tools are installed
function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  const requirements = [
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'npm' },
  ];

  requirements.forEach(({ cmd, name }) => {
    try {
      const version = execSync(cmd, { encoding: 'utf8' }).trim();
      console.log(`✅ ${name}: ${version}`);
    } catch (error) {
      console.error(`❌ ${name} is not installed`);
      process.exit(1);
    }
  });
  
  console.log('');
}

// Create necessary directories
function createDirectories() {
  console.log('📁 Creating project directories...\n');
  
  const directories = [
    'app/api',
    'components/ui',
    'lib',
    'types',
    'prisma/migrations',
    '__tests__/core',
    'public/images',
    'scripts',
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
  
  console.log('');
}

// Create environment file
function createEnvFile() {
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/clancys_outdoors"
DIRECT_URL="postgresql://username:password@localhost:5432/clancys_outdoors"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Clancy's Outdoors"

# Development
NODE_ENV="development"
`;

  createFileIfNotExists('.env.local', envContent, '.env.local file');
}

// Create basic Jest configuration
function createJestConfig() {
  const jestConfig = `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
`;

  createFileIfNotExists('jest.config.js', jestConfig, 'Jest configuration');
}

// Create Jest setup file
function createJestSetup() {
  const jestSetup = `import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock fetch globally
global.fetch = jest.fn()
`;

  createFileIfNotExists('jest.setup.js', jestSetup, 'Jest setup file');
}

// Create TypeScript configuration
function createTSConfig() {
  const tsConfig = `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;

  createFileIfNotExists('tsconfig.json', tsConfig, 'TypeScript configuration');
}

// Create PostCSS configuration
function createPostCSSConfig() {
  const postCSSConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

  createFileIfNotExists('postcss.config.js', postCSSConfig, 'PostCSS configuration');
}

// Create ESLint configuration
function createESLintConfig() {
  const eslintConfig = `{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
`;

  createFileIfNotExists('.eslintrc.json', eslintConfig, 'ESLint configuration');
}

// Create Prettier configuration
function createPrettierConfig() {
  const prettierConfig = `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
`;

  createFileIfNotExists('.prettierrc', prettierConfig, 'Prettier configuration');
}

// Create basic README
function createReadme() {
  const readme = `# Clancy's Outdoors - Modern E-commerce Platform

## 🚀 Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   \`\`\`bash
   cp .env.local .env
   # Edit .env with your actual values
   \`\`\`

3. **Set up database:**
   \`\`\`bash
   npm run db:migrate
   npm run db:generate
   \`\`\`

4. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🛠️ Development Commands

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
- \`npm run lint\` - Run ESLint
- \`npm run type-check\` - Run TypeScript checks

## 🏗️ Architecture

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **State Management:** Zustand
- **Database:** PostgreSQL + Prisma
- **Payments:** Stripe
- **Search:** Algolia
- **Testing:** Jest + Testing Library

## 📚 Documentation

For more detailed documentation, see the \`/docs\` directory.
`;

  createFileIfNotExists('README.md', readme, 'README file');
}

// Main execution
async function main() {
  try {
    checkPrerequisites();
    createDirectories();
    createEnvFile();
    createTSConfig();
    createJestConfig();
    createJestSetup();
    createPostCSSConfig();
    createESLintConfig();
    createPrettierConfig();
    createReadme();

    console.log('🎉 Development environment initialization complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. npm install');
    console.log('   2. Set up your .env.local file with actual values');
    console.log('   3. Set up PostgreSQL database');
    console.log('   4. Run: npm run db:migrate');
    console.log('   5. Run: npm run dev');
    console.log('\n✨ Happy coding!\n');

  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

main(); 