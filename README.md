# Clancy's Outdoors - Modern E-commerce Platform

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local .env
   # Edit .env with your actual values
   ```

3. **Set up database:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🛠️ Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🏗️ Architecture

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **State Management:** Zustand
- **Database:** PostgreSQL + Prisma
- **Payments:** Stripe
- **Search:** Algolia
- **Testing:** Jest + Testing Library

## 📚 Documentation

For more detailed documentation, see the `/docs` directory.
