# Selsa Admin Panel — Page Documentation

> Complete reference for every page accessible from the admin sidebar.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication & Access Control](#authentication--access-control)
3. [Dashboard](#1-dashboard)
4. [Reports](#2-reports)
5. [Orders](#3-orders)
6. [Fulfillment](#4-fulfillment)
7. [Finance](#5-finance)
8. [Inventory](#6-inventory)
9. [Products](#7-products)
10. [Customers](#8-customers)
11. [Staff](#9-staff)
12. [Audit Logs](#10-audit-logs)
13. [Risk Monitoring](#11-risk-monitoring)
14. [Support](#12-support)

---

## Architecture Overview

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Framework       | Next.js 16 (App Router)     |
| Styling         | Tailwind CSS v4 + shadcn/ui |
| Auth            | next-auth (JWT/session)     |
| i18n            | react-i18next               |
| Backend         | Django REST Framework       |
| Print-on-Demand | Printful API                |
| Payments        | Stripe + PayPal             |

**File structure:**

```
src/app/admin/
├── layout.tsx            # Server-side auth gate + sidebar shell
├── dashboard/page.tsx
├── reports/page.tsx
├── orders/page.tsx
├── fulfillment/page.tsx
├── finance/page.tsx
├── inventory/page.tsx
├── products/page.tsx
├── customers/page.tsx
├── staff/page.tsx
├── audit-logs/page.tsx
├── risk-monitoring/page.tsx
└── support/
    ├── page.tsx
    └── SupportTicketsPanel.tsx
```

All admin pages share a common layout (`src/app/admin/layout.tsx`) that renders the `AdminSidebar` on the left and the page content in a max-width container on the right.

---

## Authentication & Access Control

**File:** `src/app/admin/layout.tsx`

The admin layout is a **server component** that runs before any child page renders:

1. **Session check** — Calls `getServerSession(authOptions)`. If no session exists, the user is redirected to `/auth/login?callbackUrl=/admin/dashboard`.
2. **Role check (client claims)** — Inspects the session `user` object for any of: `role === "admin"`, `is_staff`, `is_superuser`, `isAdmin`, `isStaff`, `isSuperuser`.
3. **Backend verification** — If an `accessToken` is present, calls `GET /api/accounts/me/profile/` on the Django backend to confirm the user genuinely has admin/staff privileges. The backend is treated as the **source of truth**.
4. **Access denied** — If neither client claims nor backend confirms admin access, a static "You do not have access to this area" card is rendered instead of the admin content.

---

## 1. Dashboard

|                         |                                    |
| ----------------------- | ---------------------------------- |
| **Route**               | `/admin/dashboard`                 |
| **File**                | `src/app/admin/dashboard/page.tsx` |
| **Icon**                | `LayoutGrid`                       |
| **Sidebar description** | "Sessions and ops overview"        |

### What it does

The Dashboard is the admin landing page. It combines **two panels**:

#### a) Session Monitoring Dashboard

- **Component:** `SessionMonitoringDashboard`
- **Tabs:** Overview · Logs · Errors · Performance
- **Metrics displayed:**
  - Total sessions, active sessions, total events, error count
  - Average session duration, conversion rate
  - Error breakdown by type + recent error log
  - Slowest API endpoints (>500 ms threshold)
- **Data source:** Client-side only — reads from in-memory `logger.getLogs()` and `analytics.getSessionMetrics()`. No backend HTTP calls.
- **Auto-refresh:** Toggle to continuously poll in-memory metrics.

#### b) Orders Overview

- **Component:** `AdminOrdersPanel` (with `showHeader={true}`)
- Shows a read-only overview of recent orders with search, status filter, and pagination.
- Configured with default status filter (all statuses visible).

### How it works

Both panels are client-side (`"use client"`) and render independently inside a `space-y-8` flex column. Session metrics are populated from the browser's in-memory analytics service, while orders are fetched from `GET /api/admin/orders/`.

---

## 2. Reports

|                         |                                  |
| ----------------------- | -------------------------------- |
| **Route**               | `/admin/reports`                 |
| **File**                | `src/app/admin/reports/page.tsx` |
| **Icon**                | `BarChart3`                      |
| **Sidebar description** | "Sales and operational KPIs"     |

### What it does

Unified reporting hub combining sales, inventory, and support KPIs into one view with **CSV/PDF export**.

### Key sections

| Section               | Details                                                                             |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Date Range Picker** | Last 7 days · This month · This quarter · This year                                 |
| **Report Type**       | Dashboard Overview · Sales · Tax · Inventory Snapshot · Customer Report             |
| **Export**            | Downloads a CSV or PDF blob via `exportDashboardReport()`                           |
| **Sales Card**        | Total revenue for the selected period                                               |
| **Orders Card**       | Order count for the selected period                                                 |
| **Inventory Card**    | Count of low-stock variants                                                         |
| **Support Card**      | Open ticket count                                                                   |
| **Support SLA**       | First-response breaches, resolution breaches, average first-response time (minutes) |
| **Risk Link**         | Quick-nav card linking to `/admin/risk-monitoring`                                  |

### API calls

| Endpoint                                                     | Purpose                           |
| ------------------------------------------------------------ | --------------------------------- |
| `getDashboardStats({ date_range })`                          | Sales & order KPIs                |
| `getInventorySummary()`                                      | Low-stock count                   |
| `listSupportTickets()`                                       | Ticket metrics & SLA calculations |
| `exportDashboardReport({ format, report_type, date_range })` | CSV/PDF generation                |

---

## 3. Orders

|                         |                                 |
| ----------------------- | ------------------------------- |
| **Route**               | `/admin/orders`                 |
| **File**                | `src/app/admin/orders/page.tsx` |
| **Icon**                | `ClipboardList`                 |
| **Sidebar description** | "Manage orders and shipping"    |

### What it does

Full order management table focused on the **fulfillment queue** — processing paid orders, adding tracking numbers, and managing shipments.

### Features

- **Default filter:** `FULFILLMENT_PENDING`
- **Status options:** ALL · FULFILLMENT_PENDING · SHIPPED · DELIVERED
- **Search:** By order ID or customer email
- **Per-row actions:**
  - **Ship** — Enter carrier + tracking number, transitions order to `SHIPPED` (available for `FULFILLMENT_PENDING` orders)
  - **Resend shipping email** — Re-sends the shipping confirmation (available for `SHIPPED` / `DELIVERED`)
- **Bulk actions:** Update status, cancel, refund (with tracking number fields for bulk shipping)
- **Pagination:** Server-side with configurable page size

### API calls

| Endpoint                             | Purpose                       |
| ------------------------------------ | ----------------------------- |
| `getAdminOrders(params)`             | Paginated order list          |
| `adminUpdateOrderStatus(id, status)` | Single status change          |
| `adminBulkUpdateStatus(ids, status)` | Bulk status change            |
| `adminBulkCancel(ids)`               | Bulk cancellation             |
| `adminBulkRefund(ids)`               | Bulk refund                   |
| `adminResendShippingEmail(id)`       | Re-send shipment notification |

---

## 4. Fulfillment

|                         |                                                  |
| ----------------------- | ------------------------------------------------ |
| **Route**               | `/admin/fulfillment`                             |
| **File**                | `src/app/admin/fulfillment/page.tsx` (757 lines) |
| **Icon**                | `ClipboardList`                                  |
| **Sidebar description** | "Print and ship pipeline"                        |

### What it does

Dedicated fulfillment pipeline for managing the order lifecycle from payment through to delivery, with **Printful print-on-demand integration**.

### Key sections

| Section             | Details                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Pipeline Cards**  | Visual summary — Paid · Fulfillment Pending · Backordered · Shipped (click to filter)                                            |
| **Order List**      | Paginated, filterable by fulfillment stage, with status badges                                                                   |
| **Ship Form**       | Inline form to enter tracking number + carrier for each order                                                                    |
| **Printful Detail** | Shows sync status, Printful order ID, fulfillment status, tracking info, carrier, error messages, retry count, and recent events |

### Actions

| Action               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| Submit to Printful   | Sends order to Printful for print-on-demand production |
| Retry Printful       | Retries a previously failed Printful submission        |
| Mark Shipped         | Manually marks the order as shipped                    |
| Mark Delivered       | Manually marks the order as delivered                  |
| Mark Backordered     | Flags the order as backordered                         |
| View Printful Status | Pulls the latest status from the Printful API          |

### API calls

`getFulfillmentPipeline`, `getFulfillmentOrders`, `submitToPrintful`, `retryPrintful`, `markOrderShipped`, `markOrderDelivered`, `markOrderBackordered`, `getPrintfulStatus` — all from `@/lib/api/adminFulfillment`.

---

## 5. Finance

|                         |                                              |
| ----------------------- | -------------------------------------------- |
| **Route**               | `/admin/finance`                             |
| **File**                | `src/app/admin/finance/page.tsx` (836 lines) |
| **Icon**                | `DollarSign`                                 |
| **Sidebar description** | "Payments and refunds"                       |

### What it does

Full finance operations dashboard covering payment provider events, automated reconciliation, chargebacks, and refunds.

### Key sections

| Section              | Details                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **Finance Overview** | High-level revenue/fee summary filtered by provider (Stripe / PayPal) and date range                  |
| **Provider Events**  | List of raw payment events from Stripe/PayPal. Includes a JSON import tool for manual event ingestion |
| **Reconciliation**   | Trigger new reconciliation runs (provider + period), view run history, drill down into missing items  |
| **Chargebacks**      | List chargeback cases, update status/notes/evidence per case                                          |
| **Refunds**          | View refund history + create new refunds by order ID (with optional amount and reason)                |

### Supported providers

- **Stripe**
- **PayPal**

### API calls

`getFinanceOverview`, `listProviderEvents`, `importProviderEvents`, `listReconciliationRuns`, `runReconciliation`, `getReconciliationMissingItems`, `listChargebacks`, `setChargebackStatus`, `listRefunds`, `createRefund`, `buildExportUrl` — all from `@/lib/api/adminFinance`.

---

## 6. Inventory

|                         |                                                |
| ----------------------- | ---------------------------------------------- |
| **Route**               | `/admin/inventory`                             |
| **File**                | `src/app/admin/inventory/page.tsx` (757 lines) |
| **Icon**                | `Boxes`                                        |
| **Sidebar description** | "Stock and adjustments"                        |

### What it does

Comprehensive inventory management — summary overview, stock health drilldowns, SKU-level audit trails, manual stock adjustments, and reconciliation workflows.

### Key sections

| Section                    | Details                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Summary Overview**       | High-level inventory metrics                                                                                                                  |
| **Stock Health Drilldown** | Filter by level: low (< 5 units) · zero · negative — lists affected variants                                                                  |
| **SKU Lookup**             | Enter a SKU to view its full audit event timeline and variant history                                                                         |
| **Audit Events**           | Date-range filtered list of all inventory mutations, exportable as CSV                                                                        |
| **Manual Adjustment**      | Two modes: **set** (absolute quantity) or **delta** (add/subtract), with mandatory reason                                                     |
| **Reconciliation**         | Create new reconciliation with line items (SKU + counted quantity), view previous reconciliations, inspect details, apply results, export CSV |

### API calls

`getInventorySummary`, `listReconciliations`, `getReconciliation`, `createReconciliation`, `applyReconciliation`, `exportReconciliationCsv`, `listInventoryHealth`, `listInventoryAuditEvents`, `listSkuHistory`, `exportInventoryAuditEventsCsv`, `createInventoryAdjustment` — all from `@/lib/api/adminInventory`.

---

## 7. Products

|                         |                                               |
| ----------------------- | --------------------------------------------- |
| **Route**               | `/admin/products`                             |
| **File**                | `src/app/admin/products/page.tsx` (300 lines) |
| **Icon**                | `Package`                                     |
| **Sidebar description** | "Publish and unpublish"                       |

### What it does

Product catalog management — search, filter, publish/unpublish, and delete products.

### Features

| Feature                 | Details                                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search**              | Free-text search across product names                                                                                                           |
| **Source filter**       | All · Local · Printful                                                                                                                          |
| **Availability filter** | All · Published · Unpublished                                                                                                                   |
| **Publish / Unpublish** | Toggle product visibility with one click                                                                                                        |
| **Delete**              | Available only for **local** products (not Printful-synced). Safety: unpublishes first, then deletes permanently. Requires confirmation dialog. |
| **Product link**        | Each product links to its design editor (`/products/[id]/design`)                                                                               |
| **Thumbnail**           | Shows product image with fallback placeholder                                                                                                   |
| **Pagination**          | Server-side, 50 items per page                                                                                                                  |
| **Ordering**            | Default: most recently updated first (`-updated_at`)                                                                                            |

### API calls

| Endpoint                                       | Purpose                         |
| ---------------------------------------------- | ------------------------------- |
| `listAdminCatalogProducts(params)`             | Paginated product list          |
| `setAdminCatalogProductAvailability(id, bool)` | Publish / unpublish             |
| `deleteAdminLocalCatalogProduct(id)`           | Permanent deletion (local only) |

---

## 8. Customers

|                         |                                    |
| ----------------------- | ---------------------------------- |
| **Route**               | `/admin/customers`                 |
| **File**                | `src/app/admin/customers/page.tsx` |
| **Icon**                | `Users`                            |
| **Sidebar description** | "Customer records"                 |

### What it does

Paginated customer directory with search and status filtering.

### Features

- **Search:** By email or username (client-side filter over server page)
- **Status filter:** ALL · PENDING · ACTIVE · SUSPENDED · DEACTIVATED
- **Table columns:** Email · Username · Status · Order count · Total spent · Date joined
- **Pagination:** Server-side with page controls
- **Refresh:** Manual reload button

### API calls

| Endpoint                                        | Purpose                 |
| ----------------------------------------------- | ----------------------- |
| `getAdminCustomers({ page, pageSize, status })` | Paginated customer list |

---

## 9. Staff

|                         |                                            |
| ----------------------- | ------------------------------------------ |
| **Route**               | `/admin/staff`                             |
| **File**                | `src/app/admin/staff/page.tsx` (343 lines) |
| **Icon**                | `Users`                                    |
| **Sidebar description** | "Access and roles"                         |

### What it does

Staff access and role management — invite new team members, assign backoffice groups, and revoke access.

### Features

| Feature               | Details                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Staff list**        | Paginated list of all staff users with search by email/username                                                                       |
| **Backoffice groups** | Toggle group membership per user: `BackofficeAdmin` · `BackofficeSupport` · `BackofficeFulfillment` (loaded dynamically from backend) |
| **Dirty detection**   | Shows a "Save" button only when group assignments have been modified                                                                  |
| **Invite**            | Enter email + optional store ID + select groups → generates an invite link with a one-time token                                      |
| **Remove access**     | Revoke all backoffice access for a staff member (with confirmation)                                                                   |

### API calls

| Endpoint                                     | Purpose               |
| -------------------------------------------- | --------------------- |
| `listAdminStaff({ search, pageSize })`       | Staff user list       |
| `listBackofficeGroups()`                     | Available group names |
| `setStaffBackofficeGroups(userId, groups[])` | Update user's groups  |
| `inviteStaff({ email, storeId, groups })`    | Send staff invitation |
| `removeStaffAccess(userId)`                  | Revoke all access     |

---

## 10. Audit Logs

|                         |                                                 |
| ----------------------- | ----------------------------------------------- |
| **Route**               | `/admin/audit-logs`                             |
| **File**                | `src/app/admin/audit-logs/page.tsx` (367 lines) |
| **Icon**                | `FileText`                                      |
| **Sidebar description** | "Activity trail"                                |

### What it does

Unified read-only audit trail across orders and inventory, with filtering and pagination.

### Tabs

#### Orders Tab

| Filter      | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| Order ID    | Filter logs for a specific order                                 |
| Action      | Filter by action type (e.g. `cancel`, `refund`, `status_change`) |
| Actor email | Filter by the admin who performed the action                     |

**Columns:** Action · Status transition · Order ID · Actor · Timestamp · Metadata summary

#### Inventory Tab

| Filter     | Description                  |
| ---------- | ---------------------------- |
| SKU        | Filter by product SKU        |
| Variant ID | Filter by variant identifier |
| Event type | Filter by event type         |

**Columns:** Event details with timestamp and actor information

Both tabs are **paginated** (25 items per page) and **auto-reload** when filter parameters change.

### API calls

| Endpoint                                                                              | Purpose               |
| ------------------------------------------------------------------------------------- | --------------------- |
| `getAdminAuditLogs({ orderId, action, actorEmail, page, pageSize })`                  | Order audit trail     |
| `listInventoryAuditEventsPaginated({ sku, variant_id, event_type, page, page_size })` | Inventory audit trail |

---

## 11. Risk Monitoring

|                         |                                          |
| ----------------------- | ---------------------------------------- |
| **Route**               | `/admin/risk-monitoring`                 |
| **File**                | `src/app/admin/risk-monitoring/page.tsx` |
| **Icon**                | `Shield`                                 |
| **Sidebar description** | "Fraud and risk"                         |

### What it does

Security-focused dashboard for monitoring brute-force login attempts, locked accounts, blacklisted IPs, and suspicious activity patterns.

### Key sections

| Section                   | Details                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Total Attempts (24 h)** | Count of login attempts in the last 24 hours                                                                    |
| **Failed Attempts**       | Count + failure rate percentage                                                                                 |
| **Locked Accounts**       | Number of currently locked accounts                                                                             |
| **Blacklisted IPs**       | Number of IPs on the deny list                                                                                  |
| **Attack Pattern Table**  | Sortable by fail count or date, expandable rows showing IP address, location, attempt times, and attack details |
| **Empty state**           | "No suspicious patterns detected" when no threats are active                                                    |

### Data source

Client-side — reads from `bruteForceDetection.getStatistics()` (in-memory service at `@/lib/services/bruteForceDetection`). Uses `RiskLevel` types from `@/lib/services/riskAssessment`.

> **Note:** This is a server component with `metadata` export. The dashboard itself renders inside the `RiskMonitoringDashboard` client component.

---

## 12. Support

|                         |                                                                          |
| ----------------------- | ------------------------------------------------------------------------ |
| **Route**               | `/admin/support`                                                         |
| **File**                | `src/app/admin/support/page.tsx` (373 lines) + `SupportTicketsPanel.tsx` |
| **Icon**                | `LifeBuoy`                                                               |
| **Sidebar description** | "Tickets and macros"                                                     |

### What it does

Two-section support page combining **customer lookup** with **ticket management**.

### Section A — Customer Lookup & Returns

| Feature                    | Details                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Smart search**           | Auto-detects query type: email (contains `@`), phone (starts with `+` or long numeric), order ID (short numeric)  |
| **Customer info**          | Displays profile data, addresses                                                                                  |
| **Order history**          | Lists orders with shipping/billing addresses, shipment labels, line items                                         |
| **Messages**               | Customer communication history                                                                                    |
| **Return/Refund requests** | Displays pending requests with actions: **Approve**, **Reject**, **Mark received** — all with optional admin note |
| **Disputes**               | Lists any active disputes                                                                                         |

### Section B — Support Tickets Panel

Full-featured ticket management system rendered below the lookup section.

| Feature           | Details                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| **Ticket list**   | Filterable, selectable list of all support tickets                      |
| **Create ticket** | New ticket form: customer email/phone, subject, message, priority, tags |
| **Ticket detail** | Full conversation thread with reply capability                          |
| **Reply**         | Public reply or internal note, with optional macro pre-fill             |
| **Assign**        | Assign to a specific agent or self-claim                                |
| **Status**        | Change ticket status through its lifecycle                              |
| **Tags**          | Manage ticket tags; create new tags inline                              |
| **Macros**        | Pre-defined response templates; create new macros inline                |

### API calls

| Endpoint                                               | Purpose                 |
| ------------------------------------------------------ | ----------------------- |
| `supportCustomerLookup({ email \| phone \| orderId })` | Customer lookup         |
| `approveReturnRefundRequest(id, note?)`                | Approve return/refund   |
| `rejectReturnRefundRequest(id, note?)`                 | Reject return/refund    |
| `markReturnReceived(id)`                               | Mark return as received |
| `listSupportTickets(params?)`                          | Ticket list             |
| `getSupportTicket(id)`                                 | Ticket detail           |
| `createSupportTicket(data)`                            | Create ticket           |
| `addSupportTicketMessage(id, data)`                    | Reply / internal note   |
| `assignSupportTicket(id, agentId)`                     | Assign to agent         |
| `claimSupportTicket(id)`                               | Self-claim              |
| `setSupportTicketStatus(id, status)`                   | Update status           |
| `setSupportTicketTags(id, tags[])`                     | Update tags             |
| `listSupportAgents()`                                  | Available agents        |
| `listSupportTags()`                                    | Available tags          |
| `listSupportMacros()`                                  | Available macros        |
| `createSupportTag(data)`                               | Create new tag          |
| `createSupportMacro(data)`                             | Create new macro        |

---

## Sidebar Navigation Reference

| #   | Label           | Route                    | Icon            | Description                |
| --- | --------------- | ------------------------ | --------------- | -------------------------- |
| 1   | Dashboard       | `/admin/dashboard`       | `LayoutGrid`    | Sessions and ops overview  |
| 2   | Reports         | `/admin/reports`         | `BarChart3`     | Sales and operational KPIs |
| 3   | Orders          | `/admin/orders`          | `ClipboardList` | Manage orders and shipping |
| 4   | Fulfillment     | `/admin/fulfillment`     | `ClipboardList` | Print and ship pipeline    |
| 5   | Finance         | `/admin/finance`         | `DollarSign`    | Payments and refunds       |
| 6   | Inventory       | `/admin/inventory`       | `Boxes`         | Stock and adjustments      |
| 7   | Products        | `/admin/products`        | `Package`       | Publish and unpublish      |
| 8   | Customers       | `/admin/customers`       | `Users`         | Customer records           |
| 9   | Staff           | `/admin/staff`           | `Users`         | Access and roles           |
| 10  | Audit Logs      | `/admin/audit-logs`      | `FileText`      | Activity trail             |
| 11  | Risk Monitoring | `/admin/risk-monitoring` | `Shield`        | Fraud and risk             |
| 12  | Support         | `/admin/support`         | `LifeBuoy`      | Tickets and macros         |

---

_Generated from source code analysis of the Selsa admin panel._
