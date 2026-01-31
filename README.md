# 🛒 Cart & Checkout Service (Take-Home Test)

This repository contains a Node.js backend service that implements **cart and checkout business logic** for a partial e-commerce system.
The focus of this implementation is **correctness, scalability, caching strategy, and clean separation of concerns**, rather than UI or authentication flows.

---

## 📦 Tech Stack

- **Node.js + Express**
- **TypeScript**
- **MongoDB** – Persistent storage for carts and orders
- **Redis** – Session & cache layer
- **Docker / Docker Compose** – Local development
- **Terraform (AWS)** – Infrastructure design (IaC)

---

## 🧠 High-Level Architecture

```
Client
  ↓
Express API
  ├── Redis (Session + Cart Cache)
  └── MongoDB (Source of Truth)
```

### Key Ideas

- Redis is used for **active cart sessions** and **cart caching**
- MongoDB remains the **source of truth**
- Sessions are **cart-centric**, not authentication-centric
- Supports both **guest users and logged-in users**

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       ├── ci.yml
├── infra/
│   └── terraform/          # Infrastructure as Code (AWS)
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── vpc.tf
│       ├── ecs.tf
│       ├── alb.tf
│       └── README.md
│
├── src/
│   ├── controllers/        # HTTP layer
│   ├── middlewares/        # Request validation & guards
│   ├── routes/             # API routing
│   ├── services/           # DB, Redis, Session abstraction
│   ├── usecases/           # Business logic
│   ├── types/              # Domain models
│   ├── utils/              # Calculation helpers
│   ├── validations/        # Request validation
│   └── index.ts            # App entry
│
├── .dockerignore
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── env.d.ts
├── package.json
├── README.md
├── tsconfig.json
└── yarn.lock
```

---

## 🛒 Cart & Session Design

### Session Strategy (Redis)

This service uses **Redis-backed sessions** that store **cart references**, not authentication state.

- A `sessionId` represents an **active cart session**
- Session data is stored with TTL (sliding expiration)
- Session payload is **type-safe & generic**
- Redis is used for:
  - Cart session lookup
  - Cart data caching
  - Reducing MongoDB reads

### Generic Session Service

```ts
createSessionService<T extends Record<string, unknown>>(config)
```

This allows multiple session types (e.g. cart session, cache session) with:

- Custom prefixes
- Custom TTL
- Strong TypeScript inference

---

## 🔁 Cart Lifecycle

| State     | Description                                 |
| --------- | ------------------------------------------- |
| Active    | Cart is referenced by a valid Redis session |
| Abandoned | Cart exists in MongoDB but session expired  |
| Completed | Cart converted into an order                |

No cart data is lost automatically — session expiry only affects **activity**, not persistence.

---

## 🧾 Checkout Strategy

- **Pattern B: One Cart → Many Orders**
- Checkout is **idempotent**
- If an order already exists for a cart:
  - It is returned instead of creating a duplicate

- Cart remains intact until payment is confirmed

---

## 🚀 API Endpoints

### Add item to cart

```
POST /api/cart/:sessionId/items
```

### Get cart

```
GET /api/cart/:sessionId
```

### Remove item from cart

```
DELETE /api/cart/:sessionId/items/:itemId
```

### Checkout

```
POST /api/cart/:sessionId/checkout
```

---

## ⚡ Caching Strategy

1. Try Redis first (cart cache)
2. Fallback to MongoDB
3. Re-populate Redis
4. Invalidate cache on updates

This ensures:

- Fast reads
- Strong consistency
- Minimal Redis complexity

---

## 🧩 Infrastructure (Terraform)

The `infra/terraform` directory demonstrates infrastructure knowledge using **AWS primitives**.

### Designed Components

- **VPC** – Network isolation
- **ALB** – HTTP entry point
- **ECS (Fargate)** – Stateless container runtime
- **ElastiCache (Redis)** – Session & cache layer
- **MongoDB** – Intended for MongoDB Atlas or EC2

> Actual provisioning is not required — the goal is to demonstrate infrastructure concepts and structure.

## CI / Code Quality

This project uses **GitHub Actions** for Continuous Integration to ensure code quality and consistency across all contributions.

### GitHub Actions (`.github/workflows/ci.yml`)

The CI pipeline is triggered on **pushes and pull requests** to key branches and performs the following checks:

- **Formatting check**
  Ensures code formatting consistency using **Prettier**.

- **Linting**
  Enforces coding standards and detects potential issues using **ESLint**.

- **Type safety & build verification**
  Runs the TypeScript build process to catch type errors and ensure the project builds successfully.

These checks help maintain a stable, readable, and type-safe codebase before changes are merged.

> Deployment is intentionally excluded from the CI pipeline to keep it environment-agnostic. This allows the same CI checks to be reused across different infrastructure targets while keeping delivery concerns decoupled from code validation.

---

## 🐳 Local Development

```bash
docker-compose up --build
```

Services:

- App: `http://localhost:3000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

---

## API Demo Data (Seeding)

To make it easier to test API routes such as:

POST /api/cart/:sessionId

A seed script is provided to reset & populate Redis and MongoDB with sample data.

```bash
docker compose exec app yarn run seed
```

This will create:

- An active cart session in Redis
- A cart document in MongoDB

## 🔒 Design Considerations

- Stateless application layer
- Cache-aside strategy
- Explicit cache invalidation
- Idempotent checkout
- Type-safe domain models
- Clear separation between:
  - Controllers
  - Use cases
  - Infrastructure services

---

## 🧪 Notes & Trade-offs

- Authentication is intentionally simplified
- Payment flow is out of scope
- TTL-based cart expiration avoids aggressive cleanup jobs
- Redis is treated as **ephemeral**, MongoDB as **authoritative**

---

## ✅ Summary

This implementation focuses on:

- Real-world cart behavior
- Production-grade caching
- Clear domain boundaries
- Infrastructure awareness

The system is designed to be **scalable, observable, and easy to evolve**.

---

## 🧠 Engineering Decisions & Trade-offs

### 1️⃣ Design Decisions Made

- **Cart-centric sessions (not auth sessions)**
  Sessions are designed to represent _active carts_, not login state.
  This supports both guest and authenticated users uniformly and avoids coupling cart behavior to authentication.

- **Cache-aside strategy with Redis**
  Redis is used for:
  - Active cart session references
  - Cart data caching
    MongoDB remains the **source of truth**, ensuring durability and correctness.

- **Pattern B: One Cart → Many Orders**
  Checkout is designed to be **idempotent**:
  - A cart can generate multiple orders (e.g. retries, partial payments)
  - The latest valid order is reused if it already exists
    This avoids duplicate orders while keeping the system resilient to retries and network failures.

- **Generic, type-safe session service**
  The session service is designed to be reusable beyond carts by supporting:
  - Custom prefixes
  - Custom TTLs
  - Strong TypeScript inference
    This improves maintainability and avoids Redis logic being scattered across the codebase.

---

### 2️⃣ Infrastructure Choices & Security Measures

- **Stateless API on ECS (Fargate)**
  Containers are stateless and horizontally scalable.
  Session state lives in Redis, persistence in MongoDB.

- **VPC + ALB**
  - Private subnets for compute
  - Public ALB as controlled ingress
  - Clear separation between public-facing and internal services

- **Security Measures (Design-level)**
  - Secrets injected via environment variables (intended for AWS Secrets Manager in production)
  - Redis protected via authentication
  - No direct public access to MongoDB / Redis
  - Principle of least privilege for IAM roles (demonstrated in Terraform structure)

> Actual provisioning is not required, but the Terraform layout reflects real-world production architecture.

---

### 3️⃣ Continuous Deployment (CD) Flow

The GitHub Actions pipeline currently performs:

- Formatting (Prettier)
- Linting (ESLint)
- Type checking & build verification
- Docker image build (no push)

**In a real production setup**, CD would extend this by:

1. Building and tagging a Docker image
2. Pushing the image to a container registry (e.g. ECR)
3. Triggering an ECS service update
4. Performing rolling deployments behind ALB
5. Optionally running health checks / smoke tests

Deployment is intentionally excluded from CI to keep the repository environment-agnostic.

---

### 4️⃣ Challenges Faced & Trade-offs

- **Session expiration vs user experience**
  Redis TTL is used to detect _activity_, not to delete carts.
  This avoids bad UX where users lose carts, at the cost of having abandoned carts in MongoDB.

- **Redis as ephemeral storage**
  Redis is treated as a performance layer only.
  This increases reliability but requires explicit cache invalidation logic.

- **No background cleanup job**
  Abandoned carts are identified by session expiry instead of scheduled cleanup jobs.
  This simplifies infrastructure but means historical carts accumulate over time (acceptable for this scope).

- **Simplified authentication model**
  Auth is out of scope to keep focus on cart business logic and system design clarity.

---

### 5️⃣ What I Would Improve With More Time

- Add distributed locking for checkout idempotency (e.g. Redis lock)
- Add observability (metrics + tracing)
- Add rate limiting and request-level idempotency keys
- Add background workers for abandoned cart analysis
- Add API schema (OpenAPI / Swagger)

---

## 🎯 Why This Design

The system is intentionally designed to:

- Be **stateless and horizontally scalable**
- Be **resilient to retries**
- Favor **correctness over premature optimization**
- Reflect **real production trade-offs**
- Be easy to evolve into a full checkout platform
