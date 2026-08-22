# Fundsroom ERP

## Overview

Fundsroom ERP is a lightweight, full-stack Operations ERP application. It allows businesses to manage inventory across multiple locations, create and track work orders, manage internal stock transfers between locations, and allow sales users to reserve stock for customer orders. 

## Business Flow

1. **Inventory**: Track items across locations, categorized by batches, keeping track of physical and reserved quantities.
2. **Work Order**: Admins assign work orders that require items at specific locations.
3. **Stock Check & Shortage**: The system identifies if a location has enough available stock to fulfill a work order.
4. **Internal Transfer**: If a location has a shortage, material can be transferred from another location. The source inventory decreases on dispatch, and destination inventory increases only upon receipt.
5. **Customer Reservation**: Sales users can create customer orders that reserve available stock, guaranteeing no over-booking occurs concurrently.

## Features

- **Authentication**: JWT-based secure login.
- **Role-based authorization**: Endpoint and UI protection based on assigned user roles.
- **Inventory management**: Track physical, reserved, and available quantities by batch and location.
- **Work Orders**: Create and manage assigned work orders.
- **Internal Transfers**: Multi-step stock transfers (Requested → Dispatched → Received) with transactional safety.
- **Customer Orders & Reservations**: Create sales orders and reserve inventory safely.
- **Validation**: Strict backend validation for input payloads and business logic.
- **Transaction handling**: Database transactions ensure atomicity during stock movements.
- **Error handling**: Unified error responses from the backend.

## User Roles

Based on the actual implementation, the system supports three roles:

- **ADMIN**: Can create Work Orders, manage Inventory, Transfers, and Customer Orders. Has global access.
- **OPERATIONS_USER**: Can view and manage Inventory, Work Orders, and Internal Transfers. Cannot access Customer Orders.
- **SALES_USER**: Can view and manage Customer Orders and reservations. Cannot access operations modules.

## Tech Stack

- **Frontend**: React (v19), Vite, TypeScript, React Router DOM, Axios, Tailwind CSS (via Lucide React/custom CSS).
- **Backend**: Node.js, Express (v5), TypeScript.
- **Database**: PostgreSQL (connected via `pg` driver).
- **Authentication**: JWT (`jsonwebtoken`) and `bcryptjs`.
- **Validation**: Zod (backend schema validation).
- **Deployment**: Vercel (Frontend) and Railway/Render (Backend).
- **Testing**: Jest and Supertest.

## Project Structure

```
Fundsroom-2/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Request handling
│   │   ├── database/      # Setup, migrations, seeding
│   │   ├── middleware/    # Auth and RBAC
│   │   ├── routes/        # API route definitions
│   │   └── services/      # Business logic & transactions
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── auth/          # Context API for auth state
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # React application pages
│   │   ├── routes/        # App routing
│   │   └── services/      # API client wrappers
│   ├── package.json
│   └── vite.config.ts
└── docs/                  # Project documentation
```

## Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL server running locally

### Database Setup
Create a PostgreSQL database (e.g., `fundsroom`) and note the connection URL.

### Backend Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in:
   ```env
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/fundsroom
   JWT_SECRET=your_jwt_secret
   ```
4. Setup database schema and seed data:
   ```bash
   npm run setup
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and update if needed:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (`backend/.env`)
- `PORT`: The port the Express server runs on (default 3000).
- `DATABASE_URL`: Connection string for PostgreSQL. Used by `pg` pool.
- `JWT_SECRET`: Secret key used for signing JSON Web Tokens.

### Frontend (`frontend/.env`)
- `VITE_API_URL`: The base URL for backend API requests (e.g., `http://localhost:3000/api`).

## API Overview

The backend provides a RESTful API covering Authentication, Inventory, Work Orders, Transfers, and Customer Orders.
For detailed documentation, see [API Documentation](./docs/api.md).

## Database

The database uses PostgreSQL with strict referential integrity and check constraints to guarantee accurate inventory.
For the ER diagram and schema details, see [Database Documentation](./docs/database.md).

## Authentication

Authentication is handled via JWT. The `/api/auth/login` endpoint issues a token, which the frontend includes as a Bearer token in the `Authorization` header of subsequent requests.
For details, see [Authentication Documentation](./docs/authentication.md).

## Testing

The backend includes automated tests using Jest and Supertest to verify business logic and API endpoints.

To run automated tests:
```bash
cd backend
npm test
```

## Deployment

The current project configuration supports the following deployment architecture:
- **Frontend**: Deployed to Vercel (evidenced by CORS settings targeting `.vercel.app`).
- **Backend**: Deployed to a Node.js host like Railway.
- **Database**: A managed PostgreSQL service.

For details, see [Deployment Documentation](./docs/deployment.md).

## Demo Flow

A complete functional demo covers: Login → Inventory → Work Order → Transfer → Order Reservation.
See the [Demo Script](./docs/demo-script.md) for step-by-step instructions.

## Case Study Compliance

| Requirement | Implementation Status | Location |
|-------------|-----------------------|----------|
| Authentication & Roles | ✅ Implemented | `backend/src/middleware/authorize.ts` |
| Inventory Management | ✅ Implemented | `backend/src/services/operationsService.ts` |
| Negative inventory prevention | ✅ Implemented | DB `CHECK` constraints & Service logic |
| Work Orders | ✅ Implemented | `backend/src/routes/operationsRoutes.ts` |
| Internal Transfers | ✅ Implemented | `backend/src/services/operationsService.ts` |
| Dispatch/Receive rules | ✅ Implemented | Handled transactionally in service layer |
| Customer Reservations | ✅ Implemented | `backend/src/services/customerOrderService.ts` |
| Database Transactions | ✅ Implemented | Used heavily in Transfer & Reservation services |
| Portable config | ✅ Implemented | `.env` files for both frontend and backend |

## Known Limitations

- The system currently only handles single-item reservations and transfers per request (based on the implemented endpoints).
- The `SALES_USER` role cannot view inventory levels globally through the operations endpoints; they only interact via customer orders.
