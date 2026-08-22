# Architecture

This document describes the current architecture of the Fundsroom-2 ERP application based on the repository implementation.

## Overview

The application is built using a modern full-stack architecture:

- **Frontend**: React (v19) application built with Vite and TypeScript, using React Router DOM for routing.
- **Backend**: Node.js REST API using Express and TypeScript.
- **Database**: PostgreSQL database.
- **Communication**: The frontend communicates with the backend via REST API calls using Axios.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend [Frontend (React / Vite)]
        A[React UI Components]
        B[State & Auth Context]
        C[Axios API Client]
        
        A --> B
        A --> C
    end

    subgraph Backend [Backend (Express / Node.js)]
        D[REST API Routes]
        E[Auth Middleware]
        F[Role Authorization]
        G[Controllers & Services]
        
        C -->|HTTP/REST| D
        D --> E
        E --> F
        F --> G
    end

    subgraph Database [Database]
        H[(PostgreSQL)]
        
        G -->|pg driver| H
    end
```

## Frontend Architecture

The frontend is a Single Page Application (SPA).
- **Routing**: Handled by `react-router-dom` with protected routes guarding access to authenticated pages.
- **Authentication State**: Managed via a React Context (`AuthProvider`) which stores the JWT token.
- **API Client**: `axios` is configured with interceptors to automatically attach the JWT token to outgoing requests.
- **Components/Pages**: Separated by feature: Dashboard, Inventory, Work Orders, Transfers, and Customer Orders.

## Backend Architecture

The backend is an Express application structured with clear separation of concerns:
- **Routes**: Define the endpoints (`/api/auth`, `/api/inventory`, etc.) and attach middleware.
- **Middleware**: 
  - `authenticate.ts`: Verifies JWT tokens and attaches the user object to the request.
  - `authorize.ts`: Enforces Role-Based Access Control (RBAC).
- **Controllers**: Handle HTTP requests, parse inputs, and format responses.
- **Services**: Contain the core business logic, coordinate database operations, and manage transactions.
- **Database Layer**: Uses the `pg` package to connect to PostgreSQL. Raw SQL queries with parameterized inputs are used instead of an ORM.

## Database Layer & Transactions

The system relies on a relational database (PostgreSQL) to enforce data integrity.
- **Transactions**: Critical operations (e.g., dispatching/receiving transfers, creating work orders, reserving stock) are wrapped in `BEGIN`, `COMMIT`, and `ROLLBACK` blocks within the service layer.
- **Constraints**: PostgreSQL table definitions (`CHECK`, `UNIQUE`, `REFERENCES`) strictly prevent negative inventory, duplicate batch numbers, and invalid relationships.

## Deployment Architecture

- **Frontend**: Designed to be deployed on **Vercel** (indicated by CORS configuration in the backend allowing `.vercel.app` origins).
- **Backend**: Configured for deployment on platforms like **Railway** or Render (runs a Node.js server via `npm start`).
- **Database**: Connects to a managed PostgreSQL service via the `DATABASE_URL` environment variable.
