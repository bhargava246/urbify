d commercial properties with zero brokerage.


Here's a quick top-level summary of what was captured:

Urbify is a privacy-first Indian real estate marketplace (Next.js 16 + NestJS + MongoDB/Prisma). Key highlights:

- Frontend: Feature-based Next.js App Router app. A single UrbifyApp.tsx routing shell drives 80+ pages. API calls go through a typed service layer (src/services/api/). Auth state lives in React Context with tokens in localStorage.
- Backend: Modular NestJS with Prisma ORM on MongoDB. DTOs for all inputs, JwtAuthGuard/RolesGuard for RBAC, AES-256 encrypted addresses revealed only after PhonePe payment unlock.
- Roles: Owner, Broker, Client, Admin — each with dedicated dashboard routes.
- Styling: Tailwind + CSS custom property design tokens with light/dark mode and compact/regular/comfy density switching via HTML data attributes.
- External services: OlaMaps (geocoding/maps), PhonePe (payments), AWS S3 (media), MSG91 (OTP SMS).

✻ Baked for 3m 18s

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  ↑/↓ to select · Enter to view

❯ ● main

Tech Stack:
- Frontend: Next.js 16.2.6, React 19.1.0, TypeScript 5.8.3, Tailwind CSS 3.4.17
- Backend: NestJS 10.3.10, TypeScript 5.5.3, MongoDB via Prisma 5.16.1
- Authentication: JWT (access + refresh tokens), OTP-based login via phone
- Storage: AWS S3 for images and documents
- Payments: PhonePe gateway for contact unlock payments
- Maps: OlaMaps SDK for geocoding, autocomplete, and map visualization
- State Management: React Context (AuthContext), localStorage for tokens
- Styling: Tailwind CSS with custom CSS variables for theming
- Testing: Jest, Playwright (E2E), Supertest (backend)
- Security: Helmet, CORS, rate limiting (ThrottlerModule), bcrypt for passwords
- Logging: Winston logger with file and console transports
- Validation: Zod (frontend), class-validator + class-transformer (backend)

---
2. DIRECTORY STRUCTURE

urbify/
├── backend/                      # NestJS API server
│   ├── src/
│   │   ├── app.module.ts         # Root module with global config
│   │   ├── main.ts               # Bootstrap with Helmet, CORS, Swagger
│   │   ├── common/               # Guards, filters, interceptors, decorators
│   │   ├── config/               # App, JWT, AWS, PhonePe configs
│   │   ├── modules/              # Feature modules (auth, users, properties, etc.)
│   │   ├── prisma/               # Prisma service & module
│   │   └── health/               # Health check controller
│   ├── prisma/                   # Database schema
│   ├── test/                     # E2E tests
│   └── package.json
│
├── urbify/                       # Next.js frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router (pages & API routes)
│   │   ├── components/           # Reusable components (layout, shared, UI, maps)
│   │   ├── contexts/             # React Context (AuthContext)
│   │   ├── features/             # Feature-specific logic (auth, dashboard, urbify)
│   │   ├── hooks/                # Custom hooks (useDebounce, useLocalStorage, etc.)
│   │   ├── lib/                  # Utilities (API client, env validation, OlaMaps)
│   │   ├── services/             # API service layer (auth, properties, payments, etc.)
│   │   ├── store/                # Redux-like state slices (empty, placeholder for future)
│   │   ├── styles/               # Global CSS, design tokens, themes
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Helpers (formatters, validators, cn utility)
│   ├── public/                   # Static assets
│   ├── tests/                    # E2E tests
│   ├── project/                  # Design prototypes (JSX mockups from design tool)
│   └── package.json
│
└── .github/                      # GitHub workflows (CI/CD)

---
3. KEY FILES

Frontend:
- urbify/package.json — C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\package.json
- urbify/next.config.ts — Image rewrites, API routing, security headers
- urbify/tsconfig.json — Path alias @/ → src/
- urbify/tailwind.config.ts — Custom font families, extends default theme
- urbify/src/lib/env.ts — Boot-time environment validation
- urbify/src/lib/api.ts — Core HTTP client with auto-refresh on 401
- urbify/src/app/layout.tsx — Root layout with SiteHeader, ErrorBoundary
- urbify/src/app/page.tsx — Homepage (redirects to UrbifyApp)
- urbify/src/contexts/AuthContext.tsx — Global auth state with OTP/login
- urbify/src/styles/globals.css — Design tokens, dark mode, density toggles

Backend:
- backend/package.json — C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\backend\package.json
- backend/src/main.ts — Bootstrap NestJS app, Helmet, Swagger
- backend/src/app.module.ts — Root module with all feature imports
- backend/prisma/schema.prisma — Complete MongoDB data model
- backend/src/config/*.ts — App, JWT, AWS, PhonePe configuration
- backend/src/modules/auth/auth.service.ts — JWT, OTP, token refresh logic
- backend/src/common/guards/jwt-auth.guard.ts — Authentication guard with @Public support

---
4. FEATURES / PAGES (Frontend Routes)

Public Pages:
- / — Homepage with location search, featured listings, city stats
- /buy, /rent — Property type selection
- /search — Main search page with filters, map view
- /[id] (detail) — Listing detail (address hidden until unlock)
- /city — City/locality browse pages
- /about, /faq, /contact — Information pages
- /blog — Blog listing and post views
- /how-it-works — Platform explanation
- /pricing — Pricing and unlock fee information
- /compare — Property comparison tool
- /terms, /privacy, /refund — Legal documents

Authentication:
- /auth — Login/register modal with OTP flow
- /(auth)/login, /(auth)/register — Dedicated auth pages

**User Dashboards (Role-based):
- Owner: /owner/dashboard, /owner/listings, /owner/inquiries, /owner/new — Manage own listings
- Broker: /broker/dashboard — Manage brokered properties, commissions
- Client: /(dashboard) — Shortlist, saved searches, unlock history, notifications
- Admin: /admin — User management, property moderation, revenue analytics, CMS

Other Pages:
- /settings — User profile settings
- /notifications — Notification center
- /unlock — Payment gateway integration page
- /payment/callback — PhonePe payment verification

---
5. COMPONENTS

Layout Components (src/components/layout/):
- Header.tsx — Navigation and site header stub
- Footer.tsx — Footer stub
- Sidebar.tsx — Sidebar stub

Shared Components (src/components/shared/):
- SiteHeader.tsx — Main header with nav, auth state, dark mode toggle (10KB)
- ErrorBoundary.tsx — Error boundary wrapper
- ErrorFallback.tsx — Error UI fallback
- DataTable/ — Reusable data table component
- SEO/ — SEO meta tags component

UI Components (src/components/ui/):
- button/Button.tsx — Variant-based button (primary, brand, accent, outline, ghost)
- input/Input.tsx — Form input component
- modal/Modal.tsx — Modal dialog component

Map Components (src/components/maps/):
- OlaMap.tsx — OlaMaps integration for displaying property locations

Feature Components (src/features/):
- urbify/components/UrbifyApp.tsx — Thin routing shell that renders pages based on state
- urbify/pages/*.tsx — Individual page components (home, search, detail, owner, admin, etc.)
- urbify/_shared.tsx — Shared utilities, constants, data context
- urbify/_tweaks.tsx — Theming tweaks (palette, density, card style, dark mode)
- auth/ — Auth-specific features (login, register actions, schemas)
- dashboard/ — Dashboard layout and utilities

---
6. DATA LAYER

Authentication & State:
- contexts/AuthContext.tsx — Provides useAuth() hook with user state, sendOtp, verifyOtp, logout
- lib/api.ts — Token store (localStorage: urb_access, urb_refresh, urb_user) + automatic 401 → refresh → retry

API Service Layer (src/services/api/):
- auth.service.ts — register, login, sendOtp, verifyOtp, logout, getCachedUser, isAuthenticated
- properties.service.ts — search, getCities, getPublic, getWithAddress, create, update, delete, uploadPhotos
- payments.service.ts — createOrder, verifyPayment, requestRefund, getRevenue, initiateCheckout
- search.service.ts — saveSearch, getSavedSearches, deleteSavedSearch, addToShortlist, removeFromShortlist
- users.service.ts — getMe, updateMe, getMyUnlocks, listAll (admin), setStatus (admin)
- notifications.service.ts — list, getUnreadCount, markAllRead, markRead

API Endpoints (src/services/api/endpoints.ts):
- All endpoints prefixed with /api/v1 and mapped by resource (auth, users, properties, payments, search, notifications)

Data Types (src/types/index.ts):
- AuthUser — Logged-in user with role, profile, verification status, trust badge
- ListingPublic — Property listing with public info (address encrypted)
- ListingWithAddress — Full listing after unlock payment
- Notification, SavedSearch, ShortlistItem, UnlockRecord — Domain models

External APIs:
- OlaMaps API for autocomplete, reverse geocoding, map rendering
- PhonePe Payment Gateway for contact unlock payments

---
7. STYLING APPROACH

Framework: Tailwind CSS 3.4.17 + custom CSS variables

Design System:
- Design Tokens (src/styles/globals.css):
  - Color palette: brand (teal), accent (amber), neutrals, semantic colors
  - Spacing: padding, gaps, row heights (adjustable by density)
  - Typography: Inter (body), Plus Jakarta Sans (display), JetBrains Mono (code)
  - Shadows: 3 levels + pop shadow
  - Border radius: xs to xl + pill

Theme Support:
- Light mode (default) via :root CSS variables
- Dark mode via [data-dark="true"] selector
- Density variants: regular, compact, comfy via [data-density] attribute
- Card style variants: regular, sharp, soft via [data-card] attribute

Tailwind Configuration (urbify/tailwind.config.ts):
- Content scanning: ./src/**/*.{ts,tsx}
- Font family extensions (Inter, Plus Jakarta Sans, JetBrains Mono)

Global Styles (src/styles/globals.css):
- CSS custom properties for all design tokens
- HTML attributes for theme switching
- Base styles for body, typography, form elements

---
8. DEPENDENCIES

Frontend Key Packages:
- next@^16.2.6 — React framework
- react@19.1.0, react-dom@19.1.0 — UI library
- tailwindcss@3.4.17 — CSS framework
- zod@3.24.4 — Schema validation
- olamaps-web-sdk@^1.4.0 — Maps integration
- clsx@2.1.1, tailwind-merge@3.2.0 — CSS utility helpers
- @playwright/test@1.52.0 — E2E testing
- jest@29.7.0, @testing-library/react@16.3.0 — Unit testing
- eslint@9.27.0, prettier@3.5.3 — Code quality

Backend Key Packages:
- @nestjs/common@^10.3.10, @nestjs/core@^10.3.10 — NestJS framework
- @nestjs/config@^3.2.3 — Configuration management
- @nestjs/jwt@^10.2.0, @nestjs/passport@^10.0.3 — Authentication
- @prisma/client@^5.16.1 — ORM for MongoDB
- passport-jwt@^4.0.1 — JWT strategy
- bcrypt@^5.1.1 — Password hashing
- @aws-sdk/client-s3@^3.590.0 — S3 file uploads
- nodemailer@^6.9.14 — Email sending
- winston@^3.13.1, nest-winston@^1.9.7 — Logging
- joi@^17.13.3 — Environment validation
- class-validator@^0.14.1, class-transformer@^0.5.1 — DTO validation
- helmet@^7.1.0 — Security headers
- @nestjs/throttler@^6.2.1 — Rate limiting
- jest@^29.7.0 — Testing

---
9. BUILD / TOOLING

Frontend Build:
- Dev: npm run dev → Next.js dev server on port 3000
- Build: npm run build → Turbopack-powered production build
- Start: npm run start → Production server
- Lint: eslint . — ESLint with Next.js config
- Type check: tsc --noEmit
- Test: jest --passWithNoTests
- E2E: playwright test

Backend Build:
- Dev: npm run start:dev → NestJS with watch mode
- Build: npm run build → TypeScript to dist/
- Start: npm run start or npm run start:prod
- Lint: eslint "{src,apps,libs,test}/**/*.ts" --fix
- Test: jest with ts-jest
- Prisma: prisma generate, prisma db push, prisma studio

Configuration Files:
- Frontend: tsconfig.json, next.config.ts, tailwind.config.ts, jest.config.ts, playwright.config.ts, postcss.config.js
- Backend: tsconfig.json, nest-cli.json, test/jest-e2e.json
- Both: .prettierrc, eslint.config.mjs (frontend) / ESLint plugin (backend)

---
10. NOTABLE PATTERNS & ARCHITECTURE DECISIONS

Frontend Architecture:
1. Feature-based organization — Code grouped by feature (auth, dashboard, urbify) with co-located logic
2. UrbifyApp routing shell — Single .jsx file routes between 80+ pages (home, search, detail, dashboards, admin, etc.)
3. Service layer — All API calls abstracted into src/services/api/* with typed endpoints and payloads
4. Context API + localStorage — No Redux; auth state via React Context, tokens persisted to localStorage
5. Next.js App Router — Server/client hybrid; pages in app/ directory with layout nesting
6. API rewrites — Next.js next.config.ts proxies /api/v1/* to backend (dev) or frontend to reverse-proxy (prod)
7. Error boundary — Global error handling with fallback UI
8. Design tokens — CSS custom properties for responsive theming (light/dark, compact/regular/comfy)

Backend Architecture:
1. Modular NestJS — Feature modules (Auth, Users, Properties, Payments, Uploads, Notifications, Search) with clear separation
2. Prisma ORM — MongoDB with typed schema, migrations via Prisma, auto-generated client
3. DTO-first — All input validated via DTOs (class-validator + class-transformer)
4. Guards & decorators — @Public() decorator, JwtAuthGuard, RolesGuard for RBAC
5. Global interceptors — ResponseTransformInterceptor, LoggingInterceptor applied app-wide
6. Swagger/OpenAPI — Auto-generated API docs at /api/v1/docs
7. Encrypted storage — Full addresses encrypted with AES-256 via ENCRYPTION_KEY env var
8. 2dsphere geo-indexing — GeoJSON Point for nearby property search via MongoDB
9. JWT refresh strategy — Separate refresh token stored on client; access token short-lived (15m)
10. Email + SMS — Nodemailer for email, MSG91 for OTP SMS

Data Flow:
1. Frontend calls apiFetch(endpoint, options) with auto-attached Authorization header
2. Token refresh on 401: refresh token → new access token → retry request
3. Backend validates JWT; if valid, decorates request with @CurrentUser()
4. Service layer queries Prisma; returns typed DTOs
5. Global interceptor transforms response; Swagger docs updated

Security:
- Helmet for security headers (CSP, X-Frame-Options, etc.)
- CORS restricted to frontend URL in production
- Rate limiting (ThrottlerModule) on auth endpoints
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens signed with 32+ char secrets
- Full addresses encrypted AES-256; decryption only on successful payment unlock
- User roles (OWNER, BROKER, CLIENT, ADMIN) with role-based guards

Database:
- MongoDB via Prisma
- Indexes on city, locality, status, price, BHK, creation date
- Geo-spatial indexing for nearby property search
- Unique constraints on email, phone (enforced at app level)
- Cascade deletes for related entities (listings, profiles, etc.)
- Contact unlock prevents duplicate purchase per user per listing

---
Key File Paths for Reference

Frontend (Absolute Paths):
- Package: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\package.json
- Config: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\next.config.ts
- Auth Context: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\src\contexts\AuthContext.tsx
- API Client: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\src\lib\api.ts
- Endpoints: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\src\services\api\endpoints.ts
- Types: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\src\types\index.ts
- Styles: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\src\styles\globals.css
- Routing: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\urbify\src\features\urbify\components\UrbifyApp.tsx

Backend (Absolute Paths):
- Package: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\backend\package.json
- Bootstrap: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\backend\src\main.ts
- Root Module: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\backend\src\app.module.ts
- Schema: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\backend\prisma\schema.prisma
- Auth Service: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\backend\src\modules\auth\auth.service.ts
- JWT Guard: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\backend\src\common\guards\jwt-auth.guard.ts
- Modules: C:\Users\himan\OneDrive\Pictures\Documents\GitHub\urbify\backend\src\modules\{auth,users,properties,payments,uploads,notifications,search}

This reference should enable rapid onboarding for future conversations without re-exploring the codebase.

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── Full codebase exploration and summary ──
❯
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  Enter to view · x to clear

  ◯ main
❯ ● Explore  F