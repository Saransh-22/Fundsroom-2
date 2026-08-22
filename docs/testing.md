# Testing Documentation

This document describes the testing strategy and implementation for the Fundsroom-2 ERP application.

## Overview

The application utilizes automated testing on both the backend and frontend to ensure business logic correctness and system stability. 

## Backend Testing

The backend uses **Jest** as the test runner and **Supertest** for HTTP endpoint integration testing. The tests are configured to run natively with Node.js experimental VM modules for ECMAScript Module (ESM) support.

### Running Backend Tests
From the `backend` directory:
```bash
npm test
```
This executes `node --experimental-vm-modules ./node_modules/jest/bin/jest.js`.

### Test Coverage & Mandatory Tests
Based on the case study requirements, backend tests must cover the following critical business logic rules:

1. **Test 1**: Cannot reserve more than available inventory.
   - Assertions ensure that POST requests to `/api/customer-orders/:id/reservations` fail if the requested quantity exceeds the calculated available stock.
2. **Test 2**: Cannot transfer more than available inventory.
   - Assertions ensure that initiating or dispatching a transfer fails if the source location lacks sufficient available stock.
3. **Test 3**: Destination stock increases only after transfer receipt.
   - Integration tests verify that dispatching a transfer reduces the source stock, but the destination stock remains unchanged until the receive endpoint is successfully called.
4. **Test 4**: Same transfer cannot be received twice.
   - Tests assert that attempting to receive an already `Received` transfer results in an error.
5. **Test 5**: Unauthorized user cannot perform restricted operations.
   - Tests verify the RBAC middleware, ensuring `SALES_USER` cannot access inventory routes and `OPERATIONS_USER` cannot access customer order routes.

These are primarily handled through integration testing of the API routes and service layer unit tests. Transactional integrity is validated against the test PostgreSQL database.

## Frontend Testing

The frontend is configured with **Jest** and its associated types, though its primary focus is on rendering and state management.

### Running Frontend Tests
From the `frontend` directory:
```bash
npm test
```

### Static Analysis
The frontend uses **Oxlint** (`npm run lint`) for fast static code analysis to catch common JavaScript and React errors before runtime.

## Manual Verification

In addition to automated tests, manual verification scenarios are mapped out in the [Demo Script](./demo-script.md), which serves as a User Acceptance Testing (UAT) guide for the core application flow.
