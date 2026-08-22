# Demo Flow Script

This document provides a step-by-step guide to demonstrating the core capabilities of the Fundsroom-2 ERP application, fulfilling the "Short Demo Video" requirement of the case study.

## 1. Login

1. Open the application in your browser.
2. You will be redirected to the `/login` page.
3. Log in using an Admin account (e.g., `admin` / `admin123`) to ensure full access across all modules.
4. Upon successful login, you are redirected to the Dashboard.

## 2. Inventory Check

1. Navigate to the **Inventory** module using the sidebar.
2. View the current stock levels across all locations.
3. Note the `Available Quantity` of a specific item (e.g., "Steel Pipes") at a specific location (e.g., "Warehouse A"). 
   - Observe that `Available Quantity = Physical Quantity - Reserved Quantity`.

## 3. Work Order Creation & Shortage Check

1. Navigate to the **Work Orders** module.
2. Create a new Work Order requiring the item noted above.
3. Deliberately set the `Required Quantity` to a value *higher* than the `Available Quantity` at the chosen location to simulate a material shortage.
4. Save the Work Order. The system or the UI should indicate a shortage since the required quantity exceeds local availability.

## 4. Internal Stock Transfer

1. Navigate to the **Transfers** module to resolve the shortage.
2. Create a new Internal Transfer.
   - **Source**: Select a location that has excess stock of the required item (e.g., "Warehouse B").
   - **Destination**: Select the location of the Work Order ("Warehouse A").
   - **Quantity**: Enter the amount needed to cover the shortage.
3. Submit the transfer request. The status will be `Requested`.
4. Click **Dispatch**.
   - *Verification step*: Quickly check the Inventory module to show that the source inventory has decreased, but the destination inventory has *not* increased yet.
5. Go back to Transfers and click **Receive**.
   - *Verification step*: Check the Inventory module again to show that the destination inventory has now successfully increased.

## 5. Customer Order & Reservation

1. Log out, and log back in as a Sales User (or remain as Admin).
2. Navigate to the **Customer Orders** module.
3. Create a new Customer Order.
4. Add the item to the order and attempt to reserve stock for it.
5. The system will allocate the stock.
6. *Verification step*: Check the Inventory module (as Admin/Ops) to show that the `Reserved Quantity` has increased, and the `Available Quantity` has decreased accordingly, while the `Physical Quantity` remains the same.
7. *Failure Test*: Attempt to create another reservation that exceeds the newly reduced `Available Quantity`. The system must explicitly block this request, demonstrating correct transaction and constraint handling.
