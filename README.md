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

Great thinking 👏 — seeding sample data for route testing is _exactly_ the kind of DX (developer experience) detail interviewers love to see.

Short answer:
**Don’t run seed logic during build.**
Run it explicitly via a script or environment-gated hook. Here’s why + the clean pattern I’d recommend.

---

## ❌ Don’t seed during `build`

Running DB/Redis writes during build is risky because:

- Build should be **pure** (compile-only, no side effects)
- CI/build environments may not have DB/Redis running
- You don’t want test data accidentally created in production
- Terraform reviewers will _definitely_ side-eye this

So avoid:

```json
"scripts": {
  "build": "tsc && node seed.js" ❌
}
```

---

## ✅ Best Practice: Explicit Seed Command (Dev/Test Only)

Create a **dedicated seed script**:

```bash
npm run seed
```

or

```bash
yarn seed
```

This gives interviewers a one-liner to get test data:

> “Run `npm run seed` to populate Redis + MongoDB with demo data for API testing.”

---

## 🔧 Example Implementation

### 1️⃣ Add script in `package.json`

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "tsx scripts/seed.ts"
  }
}
```

---

### 2️⃣ Create `scripts/seed.ts`

```ts
import { MongoClient } from "mongodb";
import Redis from "ioredis";

const MONGODB_URI = process.env.MONGODB_URI!;
const REDIS_HOST = process.env.REDIS_HOST!;
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

async function seed() {
  const mongo = new MongoClient(MONGODB_URI);
  const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  });

  await mongo.connect();
  const db = mongo.db();

  const sessionId = "demo-session-123";
  const cartId = "demo-cart-001";

  // Redis: active cart session
  await redis.set(
    `cart:session:${sessionId}`,
    JSON.stringify({
      cartId,
      status: "active",
      createdAt: new Date().toISOString(),
    }),
    "EX",
    60 * 60, // 1 hour
  );

  // MongoDB: cart content
  await db.collection("carts").insertOne({
    _id: cartId,
    sessionId,
    status: "active",
    items: [
      {
        sku: "sku-001",
        name: "Demo Product",
        qty: 2,
        price: 49.9,
      },
    ],
    sub_total: 99.8,
    total: 99.8,
    created_at: new Date(),
  });

  console.log("✅ Seed completed");
  console.log("Session ID:", sessionId);

  await redis.quit();
  await mongo.close();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
```

---

## 🧪 How the interviewer tests your route

```bash
npm run seed
curl http://localhost:3000/api/cart/demo-session-123
```

Boom 💥
They get real data instantly.

---

## 🐳 Docker-friendly version (nice touch for interviews)

You can even add:

```bash
docker compose exec app npm run seed
```

Mention this in README and it looks very polished.

---

## 📝 README Snippet (you can paste this)

````md
## API Demo Data (Seeding)

To make it easier to test API routes such as:

POST /api/cart/:sessionId

A seed script is provided to reset & populate Redis and MongoDB with sample data.

```bash
docker compose exec app yarn run seed
```
````

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
