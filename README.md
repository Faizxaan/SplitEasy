# SplitEasy 💸

> **Split expenses, not friendships.**

SplitEasy is a full-stack expense-splitting app for trips, dinners, shared living, and any group spending. It features standard persistent groups for long-term tracking, as well as a new "Quick Split" mode for on-the-fly, account-free splitting with instant share links.

---

## Features

- **Standard Groups** — Create groups for long-term expenses (Trip, Home, Couple), invite via link/QR.
- **Quick Splits (New!)** — Spin up temporary, standalone splits. Perfect for a quick dinner.
  - *Guest Mode*: Completely anonymous, saved to local storage. No sign-up required.
  - *Auth Mode*: Cloud-synced, shareable via link, so anyone can view the split instantly.
- **Smart Settlement** — Debt-simplification algorithm minimises the total number of transactions needed to settle up.
- **Advanced Splitting** — Add expenses with 4 split types: Equal, Exact, Percentage, and Shares.
- **Dashboard** — Live balance overview: what you're owed, what you owe, per-group breakdown.
- **Beautiful UI** — Fluid animations (Framer Motion), full dark mode, mobile-first bottom nav, and modern design.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Spring Boot 3.4, JPA/Hibernate, H2 (dev) / PostgreSQL (prod) |
| Auth | JWT (HS512, 7-day expiry) |
| Frontend | Vite + React 18, React Router v6 |
| Animations | Framer Motion |
| UI | Lucide Icons, react-hot-toast, custom CSS design system |

---

## Local Development

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 20+

### Backend

```bash
cd spliteasy-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Starts on http://localhost:8080
# H2 console: http://localhost:8080/h2-console
# Seed users: faizan@spliteasy.com / password123
```

### Frontend

```bash
cd spliteasy-frontend
npm install
npm run dev
# Starts on http://localhost:5173
```

---

## Environment Variables

### Backend (`application.yml`)

Configure your `prod` profile with:
```properties
DATABASE_URL=jdbc:postgresql://<host>/<db>
DATABASE_USERNAME=<user>
DATABASE_PASSWORD=<password>
JWT_SECRET=<min-32-char-secret>
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

---

## API Summary (Key Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/groups` | List / create groups |
| GET/PUT/DEL | `/api/groups/:id` | Group detail / update / delete |
| POST | `/api/groups/join/:code` | Join via invite code |
| GET/POST | `/api/groups/:id/expenses` | Manage group expenses |
| GET | `/api/groups/:id/balances` | Member net balances |
| GET | `/api/groups/:id/balances/simplified` | Simplified debt suggestions |
| GET/POST | `/api/quick-splits` | List / create Quick Splits (Auth) |
| GET/PUT/DEL | `/api/quick-splits/:id` | Manage Quick Split sessions |
| GET | `/api/quick-splits/share/:token` | View shared Quick Split |

---

## Deployment

### Backend
1. Ensure your database (PostgreSQL) is ready.
2. Build the JAR: `mvn clean package -DskipTests`
3. Run the JAR with prod profile and environment variables injected:
   `java -jar target/spliteasy-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`

### Frontend
1. Build: `npm run build`
2. Ensure `VITE_API_BASE_URL` is set in your build environment.
3. Deploy the `dist` folder to Vercel, Netlify, or your preferred static host. (Ensure SPA routing redirects all requests to `index.html`).

---

## License

MIT © 2026 Faizan Ahmed
