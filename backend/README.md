# PropEase Backend API

**Zero-Brokerage Real Estate Platform — NestJS + MongoDB + Prisma + AWS**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 (TypeScript strict mode) |
| Database | MongoDB Atlas via Prisma 5 |
| Auth | JWT (access + refresh) + OTP (MSG91) |
| Storage | AWS S3 (photos, invoices) |
| Email | AWS SES |
| Payments | Razorpay |
| Cache | Redis (cache-manager) |
| Validation | class-validator + class-transformer |
| Docs | Swagger / OpenAPI |
| Security | Helmet, CORS, ThrottlerModule, bcrypt |
| Testing | Jest + Supertest |

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma              # MongoDB schema (all models)
├── src/
│   ├── common/
│   │   ├── decorators/            # @CurrentUser, @Roles, @Public, @ApiPaginatedResponse
│   │   ├── dto/                   # PaginationDto + helpers
│   │   ├── enums/                 # Re-exported Prisma enums
│   │   ├── filters/               # HttpExceptionFilter (global)
│   │   ├── guards/                # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/          # ResponseTransformInterceptor, LoggingInterceptor
│   │   └── interfaces/            # IJwtPayload
│   ├── config/
│   │   ├── app.config.ts          # Port, prefix, encryption key, fee config
│   │   ├── jwt.config.ts          # JWT secrets + expiry
│   │   ├── aws.config.ts          # S3 + SES config
│   │   ├── redis.config.ts        # Redis connection
│   │   └── razorpay.config.ts     # Razorpay keys
│   ├── health/
│   │   └── health.controller.ts   # GET /health (terminus)
│   ├── prisma/
│   │   ├── prisma.service.ts      # Global Prisma singleton
│   │   └── prisma.module.ts       # @Global module
│   ├── modules/
│   │   ├── auth/                  # JWT + OTP auth
│   │   │   ├── dto/               # RegisterDto, LoginDto, OtpDto, RefreshDto
│   │   │   ├── strategies/        # JwtStrategy, JwtRefreshStrategy
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   ├── users/                 # Profile management
│   │   │   ├── dto/               # UpdateProfileDto
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.module.ts
│   │   ├── properties/            # Listing CRUD + search + moderation
│   │   │   ├── dto/               # CreateListingDto, UpdateListingDto, SearchListingDto
│   │   │   ├── properties.service.ts
│   │   │   ├── properties.controller.ts
│   │   │   └── properties.module.ts
│   │   ├── payments/              # Razorpay + contact unlock + refunds
│   │   │   ├── dto/               # CreateOrderDto, VerifyPaymentDto, RefundRequestDto
│   │   │   ├── payments.service.ts
│   │   │   ├── payments.controller.ts
│   │   │   └── payments.module.ts
│   │   ├── uploads/               # AWS S3 file upload
│   │   │   ├── uploads.service.ts
│   │   │   ├── uploads.controller.ts
│   │   │   └── uploads.module.ts
│   │   ├── notifications/         # In-app + AWS SES email
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.controller.ts
│   │   │   └── notifications.module.ts
│   │   └── search/                # Saved searches + shortlists
│   │       ├── dto/               # SaveSearchDto
│   │       ├── search.service.ts
│   │       ├── search.controller.ts
│   │       └── search.module.ts
│   ├── app.module.ts              # Root module (global config, guards, filters)
│   └── main.ts                    # Bootstrap: Helmet, CORS, Swagger, ValidationPipe
├── test/
│   ├── auth.e2e-spec.ts
│   └── jest-e2e.json
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## Quick Start

### 1. Prerequisites

- Node.js ≥ 20
- MongoDB Atlas cluster (or local `mongod`)
- Redis instance (local or Upstash)
- AWS account (S3 bucket + SES verified email)
- Razorpay account (test mode keys)

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Environment setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Generate Prisma client

```bash
npm run prisma:generate
npm run prisma:push   # push schema to MongoDB
```

### 5. Run development server

```bash
npm run start:dev
```

API available at: `http://localhost:3001/api/v1`
Swagger docs at: `http://localhost:3001/api/v1/docs`

---

## API Endpoints

### Auth  `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Register OWNER / BROKER / CLIENT |
| POST | `/login` | Public | Login with phone + password |
| POST | `/otp/send` | Public | Send OTP to mobile |
| POST | `/otp/verify` | Public | Verify OTP, receive tokens |
| POST | `/refresh` | refresh-jwt | Rotate access token |
| POST | `/logout` | Bearer | Invalidate refresh token |

### Properties  `/api/v1/properties`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Search listings (full filters, pagination) |
| GET | `/:id` | Public | Public listing detail (address hidden) |
| GET | `/:id/full` | Bearer | Full listing with address (requires unlock) |
| POST | `/` | OWNER/BROKER | Create listing |
| GET | `/my/listings` | OWNER/BROKER | My own listings |
| PATCH | `/:id` | OWNER/BROKER | Update listing |
| DELETE | `/:id` | OWNER/BROKER | Delete listing |
| PATCH | `/:id/status` | OWNER/BROKER | Change status (pause/rented) |
| POST | `/:id/photos` | OWNER/BROKER | Upload photos (multipart) |
| GET | `/admin/all` | ADMIN | All listings with filters |
| PATCH | `/admin/:id/moderate` | ADMIN | Approve / reject listing |

### Payments  `/api/v1/payments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | CLIENT | Create Razorpay order (7.5 days fee) |
| POST | `/verify` | CLIENT | Verify signature, activate unlock |
| POST | `/refunds/:unlockId` | CLIENT | Request refund (within 24h) |
| GET | `/revenue` | ADMIN | Revenue dashboard with date range |

### Uploads  `/api/v1/uploads`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/image` | Bearer | Upload single image → S3 |
| POST | `/images` | Bearer | Upload up to 10 images → S3 |

### Notifications  `/api/v1/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Bearer | My notifications (paginated) |
| GET | `/unread-count` | Bearer | Unread notification count |
| PATCH | `/read-all` | Bearer | Mark all as read |
| PATCH | `/:id/read` | Bearer | Mark one as read |

### Search  `/api/v1/search`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/saved` | Bearer | Save a search for alerts |
| GET | `/saved` | Bearer | My saved searches |
| DELETE | `/saved/:id` | Bearer | Delete saved search |
| POST | `/shortlist/:listingId` | Bearer | Add to shortlist/wishlist |
| DELETE | `/shortlist/:listingId` | Bearer | Remove from shortlist |
| GET | `/shortlist` | Bearer | My shortlisted properties |

### Users  `/api/v1/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | Bearer | Get my profile |
| PATCH | `/me` | Bearer | Update my profile |
| GET | `/me/unlocks` | CLIENT | My unlock history + invoices |
| GET | `/` | ADMIN | List all users |
| PATCH | `/:id/status` | ADMIN | Ban / activate user |

### Health  `/api/v1/health`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Health check (MongoDB ping) |

---

## Security Model

- **Passwords**: bcrypt with 12 salt rounds
- **JWT**: Short-lived access token (15m) + long-lived refresh token (7d), rotated on each refresh
- **Full addresses**: AES-256 encrypted at rest in MongoDB; decrypted only after successful payment unlock
- **Rate limiting**: 100 req/min globally; stricter limits on auth endpoints (3–10 req/min)
- **CORS**: Restricted to `FRONTEND_URL` in production
- **HTTP headers**: Helmet middleware applied globally
- **Input validation**: Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`

---

## Business Logic

### Fee Calculation (7.5 days rent)

```
dailyRent = monthlyRent / 30
platformFee = dailyRent × 7.5
GST = platformFee × 18%
totalCharged = platformFee + GST

Example: ₹25,000/month → fee = ₹6,250 + ₹1,125 GST = ₹7,375
```

### Contact Unlock Flow

1. Client calls `POST /payments/orders` with `listingId`
2. Backend creates Razorpay order, persists `ContactUnlock` with `PENDING` status
3. Client completes payment on frontend using Razorpay checkout
4. Client calls `POST /payments/verify` with Razorpay signature
5. Backend verifies HMAC signature → updates status to `SUCCESS`, generates invoice number
6. Client can now call `GET /properties/:id/full` to see decrypted address + owner contact
7. Refund available within 24 hours if address is invalid

### Listing Privacy

- Public search (`GET /properties`) returns: locality, photos, BHK, price, amenities
- Full address is **never** returned in public endpoints
- Address only decrypted and returned from `GET /properties/:id/full` which requires a valid `SUCCESS` unlock record

---

## Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests (requires running DB)
npm run test:e2e
```

---

## AWS Setup

### S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadListingPhotos",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::propease-media/listings/*"
    }
  ]
}
```

### SES Setup

1. Verify `noreply@propease.in` in AWS SES
2. For production: move out of SES sandbox (request production access)
3. Set `AWS_SES_FROM_EMAIL` in your `.env`

### Required IAM Permissions

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject", "s3:GetObject", "s3:DeleteObject",
    "ses:SendEmail", "ses:SendRawEmail"
  ],
  "Resource": [
    "arn:aws:s3:::propease-media/*",
    "arn:aws:ses:ap-south-1:*:identity/*"
  ]
}
```
