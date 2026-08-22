# Database Schema

This document outlines the PostgreSQL database schema for the Fundsroom-2 ERP application based on the actual implementation.

## Entity Relationship Diagram

```mermaid
erDiagram
    ROLES {
        int id PK
        varchar name
    }
    USERS {
        int id PK
        varchar username
        varchar email
        varchar password_hash
        int role_id FK
    }
    LOCATIONS {
        int id PK
        varchar name
        text address
    }
    CATEGORIES {
        int id PK
        varchar name
    }
    ITEMS {
        int id PK
        varchar sku
        varchar name
        text description
        int category_id FK
    }
    INVENTORY {
        int id PK
        int item_id FK
        int location_id FK
        varchar batch_number
        int physical_quantity
        int reserved_quantity
    }
    WORK_ORDERS {
        int id PK
        varchar work_order_id
        int location_id FK
        int item_id FK
        int required_quantity
        int assigned_user_id FK
        varchar status
    }
    INTERNAL_TRANSFERS {
        int id PK
        varchar transfer_id
        int source_location_id FK
        int destination_location_id FK
        int item_id FK
        int quantity
        varchar status
    }
    CUSTOMER_ORDERS {
        int id PK
        varchar order_id
        int sales_user_id FK
        timestamp created_at
    }
    CUSTOMER_ORDER_ITEMS {
        int id PK
        int order_id FK
        int item_id FK
        int quantity
        int reserved_quantity
    }

    ROLES ||--o{ USERS : "has"
    CATEGORIES ||--o{ ITEMS : "categorizes"
    ITEMS ||--o{ INVENTORY : "stocked as"
    LOCATIONS ||--o{ INVENTORY : "stores"
    LOCATIONS ||--o{ WORK_ORDERS : "has"
    ITEMS ||--o{ WORK_ORDERS : "requires"
    USERS ||--o{ WORK_ORDERS : "assigned to"
    LOCATIONS ||--o{ INTERNAL_TRANSFERS : "source / destination"
    ITEMS ||--o{ INTERNAL_TRANSFERS : "transferred"
    USERS ||--o{ CUSTOMER_ORDERS : "creates"
    CUSTOMER_ORDERS ||--o{ CUSTOMER_ORDER_ITEMS : "contains"
    ITEMS ||--o{ CUSTOMER_ORDER_ITEMS : "ordered"
```

## Tables & Relationships

### Users & Roles
- **roles**: Stores system roles (`ADMIN`, `OPERATIONS_USER`, `SALES_USER`).
- **users**: Stores user credentials and links to a specific role.

### Inventory Setup
- **locations**: Physical locations where items are stored.
- **categories**: Item classifications.
- **items**: Unique products defined by a SKU and tied to a category.
- **inventory**: Tracks the actual stock. A unique combination of `item_id`, `location_id`, and `batch_number`. Includes constraints to ensure `physical_quantity >= 0`, `reserved_quantity >= 0`, and `reserved_quantity <= physical_quantity`.

### Business Modules
- **work_orders**: Represents tasks requiring items at a location. Assigned to a user and has a status (`Assigned`, `In Progress`, `Completed`).
- **internal_transfers**: Tracks the movement of items between a `source_location_id` and a `destination_location_id`. Status moves from `Requested` to `Dispatched` to `Received`.
- **customer_orders**: Orders created by sales users.
- **customer_order_items**: The specific items and quantities requested in a customer order, along with how many have been successfully reserved.

## Database Integrity

Integrity is strictly enforced at the database level:
- **Foreign Keys**: Ensure no orphaned records exist.
- **Check Constraints**: Prevent invalid states directly in PostgreSQL (e.g., negative inventory, invalid status strings).
- **Unique Constraints**: Prevent duplicate items, usernames, and overlapping inventory batches.
