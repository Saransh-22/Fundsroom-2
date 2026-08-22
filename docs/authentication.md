# Authentication & Authorization

This document explains the authentication and role-based access control (RBAC) mechanisms implemented in Fundsroom-2.

## Authentication Flow

1. **Login**: The client sends a `POST` request to `/api/auth/login` with a `username` and `password`.
2. **Verification**: The backend queries the `users` table, verifies the password hash using `bcryptjs`, and retrieves the user's role.
3. **Token Generation**: If successful, the backend generates a JSON Web Token (JWT) using `jsonwebtoken`, signed with the `JWT_SECRET` environment variable. The token payload includes the user's `id`, `username`, and `role`.
4. **Client Storage**: The React frontend receives the token and stores it in memory (or localStorage) via the `AuthProvider` React Context.
5. **Subsequent Requests**: The frontend `api` service (Axios instance) automatically intercepts outgoing requests and appends the token to the `Authorization` header as a Bearer token.

## Authorization (RBAC)

The backend enforces Role-Based Access Control using two distinct middleware functions.

### `authenticate.ts`
- Extracts the Bearer token from the `Authorization` header.
- Verifies the token's signature using `JWT_SECRET`.
- Decodes the payload and attaches the `user` object to the Express `Request` object.
- Returns a `401 Unauthorized` if the token is missing, invalid, or expired.

### `authorize.ts`
- A middleware factory that takes an array of allowed roles (e.g., `['ADMIN', 'OPERATIONS_USER']`).
- Checks if the `req.user.role` (populated by `authenticate`) is included in the allowed list.
- Returns a `403 Forbidden` if the user's role does not grant access to the requested endpoint.

## Role Definitions

The system supports the following roles, enforced strictly by the routing configuration:

| Role | Access Level | Endpoints Allowed |
|------|-------------|-------------------|
| `ADMIN` | Global Access | All `/api/inventory`, `/api/work-orders`, `/api/transfers`, and `/api/customer-orders` routes. |
| `OPERATIONS_USER` | Warehouse / Ops | `/api/inventory`, `/api/work-orders`, `/api/transfers`. Denied access to `/api/customer-orders`. |
| `SALES_USER` | Sales / Orders | `/api/customer-orders` routes. Denied access to inventory and transfer management. |

## Frontend Route Protection

In the frontend, access to the application is guarded by the `ProtectedRoute` component in `AppRoutes.tsx`.
If a user without a valid token attempts to access any route other than `/login`, they are automatically redirected to the login page. The UI also conditionally renders navigation elements based on the authenticated user's role.
