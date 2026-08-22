# API Documentation

This document outlines the REST API endpoints provided by the Fundsroom-2 backend.

## Base URL
All API endpoints are prefixed with `/api` except where noted.

## Authentication

### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "token": "eyJhbGciOiJIUz...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  }
  ```

## Operations

These endpoints require `ADMIN` or `OPERATIONS_USER` roles.

### Get Inventory
- **Endpoint**: `GET /inventory`
- **Description**: Retrieves all inventory records, joined with item and location details.
- **Response** (200 OK):
  ```json
  [
    {
      "id": 1,
      "batch_number": "B001",
      "physical_quantity": 100,
      "reserved_quantity": 20,
      "available_quantity": 80,
      "item_id": 1,
      "item_name": "Item A",
      "location_id": 1,
      "location_name": "Warehouse 1"
    }
  ]
  ```

### Update Inventory
- **Endpoint**: `PATCH /inventory/:id`
- **Description**: Adjust physical quantity directly (often used for manual stock correction).
- **Request Body**:
  ```json
  {
    "physical_quantity": 150
  }
  ```

### Get Work Orders
- **Endpoint**: `GET /work-orders`
- **Description**: Lists all work orders.

### Create Work Order
- **Endpoint**: `POST /work-orders`
- **Description**: Creates a new work order.
- **Request Body**:
  ```json
  {
    "location_id": 1,
    "item_id": 1,
    "required_quantity": 50,
    "assigned_user_id": 2
  }
  ```

### Update Work Order Status
- **Endpoint**: `PATCH /work-orders/:id/status`
- **Description**: Updates the status of a work order (`Assigned`, `In Progress`, `Completed`).
- **Request Body**:
  ```json
  {
    "status": "In Progress"
  }
  ```

### Get Transfers
- **Endpoint**: `GET /transfers`
- **Description**: Lists internal stock transfers.

### Create Transfer
- **Endpoint**: `POST /transfers`
- **Description**: Initiates a stock transfer request between two locations.
- **Request Body**:
  ```json
  {
    "source_location_id": 1,
    "destination_location_id": 2,
    "item_id": 1,
    "quantity": 30
  }
  ```

### Dispatch Transfer
- **Endpoint**: `POST /transfers/:id/dispatch`
- **Description**: Dispatches a requested transfer. Reduces stock at the source location.

### Receive Transfer
- **Endpoint**: `POST /transfers/:id/receive`
- **Description**: Receives a dispatched transfer. Increases stock at the destination location.

## Customer Orders

These endpoints require `ADMIN` or `SALES_USER` roles.

### Get Customer Orders
- **Endpoint**: `GET /customer-orders`
- **Description**: Lists all customer orders.

### Get Single Customer Order
- **Endpoint**: `GET /customer-orders/:id`
- **Description**: Retrieves a specific customer order and its associated items.

### Create Customer Order
- **Endpoint**: `POST /customer-orders`
- **Description**: Creates an empty customer order.

### Reserve Stock for Order
- **Endpoint**: `POST /customer-orders/:id/reservations`
- **Description**: Reserves inventory for a customer order. Must provide batch details to safely allocate available stock.
- **Request Body**:
  ```json
  {
    "item_id": 1,
    "quantity": 10,
    "location_id": 1,
    "batch_number": "B001"
  }
  ```
