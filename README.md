# Bazaarly - Premium E-Commerce Platform

A full-stack e-commerce web application built with Next.js 15, featuring premium men's suits and luxury watches.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js v5 (JWT)
- **Payments:** Stripe, PayPal, COD
- **Forms:** React Hook Form + Zod
- **State:** Zustand
- **Animations:** Framer Motion

## Features

### Customer Features
- User registration, login, logout, password reset
- Product browsing with search, filters, and categories
- Shopping cart and wishlist
- Coupon system
- Multi-payment checkout (Stripe, PayPal, Card, COD)
- Order tracking and history
- Product reviews and ratings
- User dashboard and profile management

### Admin Features
- Product and category management
- Order management with status updates
- Customer management
- Payment tracking
- Sales analytics dashboard

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI and API keys

# Start development server
npm run dev
```

### Seed Database

With the dev server running:

```bash
npm run seed
# Or: curl -X POST http://localhost:3000/api/seed
```

### Demo Accounts

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@bazaarly.com | admin123  |
| User  | demo@bazaarly.com  | demo123   |

### Coupon Codes
- `WELCOME10` - 10% off (min $50)
- `SAVE50` - $50 off (min $200)
- `LUXURY25` - 25% off (min $500)

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── (auth)/           # Login, register, password reset
│   ├── admin/            # Admin dashboard pages
│   ├── api/              # REST API endpoints
│   ├── dashboard/        # User dashboard
│   └── ...               # Shop, cart, checkout, etc.
├── components/
│   ├── layout/           # Header, Footer, Providers
│   ├── product/          # Product cards, filters, reviews
│   └── ui/               # Reusable UI components
├── lib/                  # Database, auth, stripe, utils
├── models/               # Mongoose schemas
├── store/                # Zustand stores (cart, wishlist)
├── types/                # TypeScript type definitions
└── data/                 # Seed data
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/auth/register` | POST | User registration |
| `/api/products` | GET/POST | List/create products |
| `/api/products/[id]` | GET/PUT/DELETE | Product CRUD |
| `/api/categories` | GET/POST | List/create categories |
| `/api/orders` | GET/POST | List/create orders |
| `/api/reviews` | POST | Create review |
| `/api/coupons/validate` | POST | Validate coupon |
| `/api/stripe/create-payment-intent` | POST | Stripe payment |
| `/api/admin/analytics` | GET | Sales analytics |
| `/api/seed` | POST | Seed database |

## Environment Variables

See `.env.local.example` for all required variables.

## License

MIT
