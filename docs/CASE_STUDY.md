# Mini Operations ERP - Requirements

## PROJECT GOAL
Build a Mini Operations ERP around the core business flow:
Inventory → Work Order → Material Stock Check → Internal Transfer / Shortage → Customer Order → Stock Reservation

## ROLES
- Admin
- Operations User
- Sales User

## AUTHENTICATION & AUTHORIZATION
- Login with password hashing
- JWT authentication
- Backend role-based authorization (security boundary)
- Protected APIs
- Frontend role-aware navigation

## INVENTORY
Supports: Item, Category, Location, Batch, Physical Quantity, Reserved Quantity, Available Quantity
Constraints:
- No negative inventory
- No invalid quantities
- Reserved quantity ≤ physical quantity
- Valid inventory transactions only
- No duplicate transactions where applicable
- Available quantity = physical quantity - reserved quantity

## WORK ORDERS
Contains:
- Work Order ID
- Location
- Item
- Required Quantity
- Assigned User
- Status (Assigned, In Progress, Completed)
- Automatic material shortage calculation (Shortage = Required - Available)

## INTERNAL STOCK TRANSFERS
Contains:
- Transfer ID
- Source Location
- Destination Location
- Item
- Quantity
- Status (Requested → Dispatched → Received)
Rules:
1. Dispatch decreases source inventory
2. Destination inventory unchanged during dispatch
3. Receipt increases destination inventory
4. Transfer cannot be dispatched twice
5. Transfer cannot be received before dispatch
6. Transfer cannot be received twice
7. Transfer quantity ≤ available source inventory
8. Valid source and destination locations
- Inventory-changing operations use database transactions

## CUSTOMER ORDERS & RESERVATIONS
- Sales users create customer orders
- Orders support item quantities and stock reservations
- Prevent reservations beyond available inventory
- **Concurrency Guarantee**: Database transaction with row-level locking (SELECT ... FOR UPDATE)
  - Availability check after lock acquisition
  - Final state: reserved ≤ physical and available ≥ 0

## MANDATORY TESTS
1. Cannot reserve more than available inventory
2. Cannot transfer more than available inventory
3. Destination stock increases only after transfer receipt
4. Same transfer cannot be received twice
5. Unauthorized users cannot perform restricted operations
Edge cases: zero/negative quantities, invalid state transitions, concurrent reservations, transaction rollback, duplicate operations

## REQUIRED FRONTEND SCREENS
- Login
- Inventory
- Work Orders
- Internal Transfers
- Customer Orders
Prioritize functionality and clarity over excessive visual design.

## TECHNICAL REQUIREMENTS
- Relational database with PKs, FKs, relationships, unique/check constraints, indexes
- Backend separation: routes, controllers, services, database layer, middleware, validation, error handling
- Frontend communicates with backend via APIs
- Environment variables for secrets and config (no committed secrets)

## EVALUATION-CRITICAL AREAS
- Backend/API correctness
- Database design
- Business logic
- Inventory correctness
- Transaction safety
- Concurrency
- Authentication
- Authorization
- Testing
- Maintainable code
- Designed for future business-rule changes without full rewrite

## DOCUMENTATION REQUIREMENTS (Future)
- README
- System architecture
- Database/ER diagram
- API documentation
- Business rules
- Transaction/concurrency explanation
- Setup instructions
- Testing instructions
- Deployment instructions