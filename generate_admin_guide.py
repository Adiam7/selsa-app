#!/usr/bin/env python3
"""One-shot script to generate the Selsa Admin Guide PDF."""

from fpdf import FPDF

# ── Colours ──────────────────────────────────────────────────────────────────
WHITE   = (255, 255, 255)
BLACK   = (30, 30, 30)
GREY    = (100, 100, 100)
LIGHT   = (240, 240, 245)
ACCENT  = (37, 99, 235)   # blue-600
ACCENT2 = (22, 163, 74)   # green-600
DARK_BG = (15, 23, 42)    # slate-900
ROW_ALT = (248, 250, 252) # slate-50
BORDER  = (203, 213, 225) # slate-300
WARN    = (234, 179, 8)   # yellow-500

class PDF(FPDF):
    chapter_num = 0

    def setup_fonts(self):
        # Use built-in Helvetica for everything; replace special chars in text
        pass

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*GREY)
        self.cell(0, 8, "Selsa Admin Guide", align="L")
        self.cell(0, 8, f"Page {self.page_no()}", align="R")
        self.ln(12)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(*GREY)
        self.cell(0, 8, "Confidential - Selsa Internal Use Only", align="C")

    # ── Helpers ──────────────────────────────────────────────────────────────

    def cover_page(self):
        self.add_page()
        self.set_fill_color(*DARK_BG)
        self.rect(0, 0, 210, 297, "F")
        self.ln(80)
        self.set_font("Helvetica", "B", 36)
        self.set_text_color(*WHITE)
        self.cell(0, 16, "Selsa Admin Panel", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 16)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, "Staff & Administrator Guide", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(20)
        self.set_draw_color(*ACCENT)
        self.set_line_width(0.8)
        self.line(60, self.get_y(), 150, self.get_y())
        self.ln(20)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(148, 163, 184)
        self.cell(0, 8, "Version 1.0  -  March 2026", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "For internal use by authorised personnel only.", align="C", new_x="LMARGIN", new_y="NEXT")

    def toc_page(self):
        self.add_page()
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(*BLACK)
        self.cell(0, 14, "Table of Contents", new_x="LMARGIN", new_y="NEXT")
        self.ln(6)
        entries = [
            ("1", "Getting Started"),
            ("2", "Dashboard"),
            ("3", "Reports"),
            ("4", "Orders"),
            ("5", "Fulfillment"),
            ("6", "Finance"),
            ("7", "Inventory"),
            ("8", "Products"),
            ("9", "Customers"),
            ("10", "Staff Management"),
            ("11", "Audit Logs"),
            ("12", "Risk Monitoring"),
            ("13", "Support & Tickets"),
        ]
        for num, title in entries:
            self.set_font("Helvetica", "", 11)
            self.set_text_color(*ACCENT)
            self.cell(10, 8, num + ".")
            self.set_text_color(*BLACK)
            self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")

    def chapter_title(self, title):
        self.chapter_num += 1
        self.add_page()
        self.set_fill_color(*ACCENT)
        self.rect(0, 0, 210, 48, "F")
        self.set_y(14)
        self.set_font("Helvetica", "B", 28)
        self.set_text_color(*WHITE)
        self.cell(0, 14, f"{self.chapter_num}.  {title}", align="L", new_x="LMARGIN", new_y="NEXT")
        self.ln(20)
        self.set_text_color(*BLACK)

    def section(self, title):
        self.ln(4)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*ACCENT)
        self.cell(0, 9, title, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(*BLACK)
        self.ln(1)

    def subsection(self, title):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*BLACK)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*BLACK)
        self.set_x(self.l_margin)
        self.multi_cell(self.w - self.l_margin - self.r_margin, 5.5, text)
        self.ln(1)

    def bullet(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*BLACK)
        indent = 8
        self.set_x(self.l_margin)
        self.cell(indent, 5.5, "  -")
        self.multi_cell(self.w - self.l_margin - self.r_margin - indent, 5.5, text)

    def numbered(self, num, text):
        indent = 10
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*ACCENT)
        self.set_x(self.l_margin)
        self.cell(indent, 5.5, f"  {num}.")
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*BLACK)
        self.multi_cell(self.w - self.l_margin - self.r_margin - indent, 5.5, text)

    def tip_box(self, text):
        self.ln(2)
        self.set_fill_color(239, 246, 255)
        self.set_draw_color(*ACCENT)
        x = self.get_x()
        y = self.get_y()
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*ACCENT)
        # measure height
        self.set_xy(x + 10, y + 4)
        self.cell(12, 5, "TIP  ")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(30, 64, 175)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 22, 5, text)
        h = self.get_y() - y + 4
        self.set_xy(x, y)
        self.rect(x, y, self.w - self.l_margin - self.r_margin, h, "DF")
        self.set_xy(x + 10, y + 4)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*ACCENT)
        self.cell(12, 5, "TIP  ")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(30, 64, 175)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 22, 5, text)
        self.ln(3)

    def warn_box(self, text):
        self.ln(2)
        self.set_fill_color(254, 252, 232)
        self.set_draw_color(*WARN)
        x = self.get_x()
        y = self.get_y()
        self.set_xy(x + 10, y + 4)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(161, 98, 7)
        self.cell(24, 5, "WARNING  ")
        self.set_font("Helvetica", "", 9)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 34, 5, text)
        h = self.get_y() - y + 4
        self.set_xy(x, y)
        self.rect(x, y, self.w - self.l_margin - self.r_margin, h, "DF")
        self.set_xy(x + 10, y + 4)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(161, 98, 7)
        self.cell(24, 5, "WARNING  ")
        self.set_font("Helvetica", "", 9)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 34, 5, text)
        self.ln(3)

    def simple_table(self, headers, rows, col_widths=None):
        self.ln(2)
        w = col_widths or [int((self.w - self.l_margin - self.r_margin) / len(headers))] * len(headers)
        # header
        self.set_font("Helvetica", "B", 9)
        self.set_fill_color(*DARK_BG)
        self.set_text_color(*WHITE)
        for i, h in enumerate(headers):
            self.cell(w[i], 7, h, border=1, fill=True, align="C")
        self.ln()
        # rows
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*BLACK)
        for ri, row in enumerate(rows):
            fill = ri % 2 == 1
            if fill:
                self.set_fill_color(*ROW_ALT)
            for i, cell in enumerate(row):
                self.cell(w[i], 6.5, cell, border=1, fill=fill, align="L")
            self.ln()
        self.ln(2)


def build():
    pdf = PDF("P", "mm", "A4")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_left_margin(18)
    pdf.set_right_margin(18)

    # ── Cover ────────────────────────────────────────────────────────────────
    pdf.cover_page()

    # ── TOC ──────────────────────────────────────────────────────────────────
    pdf.toc_page()

    # ══════════════════════════════════════════════════════════════════════════
    # 1  GETTING STARTED
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Getting Started")

    pdf.section("Accessing the Admin Panel")
    pdf.body(
        "Open your browser and navigate to your Selsa store URL followed by /admin/dashboard "
        "(for example, https://yourstore.selsa.com/admin/dashboard). "
        "You must be logged in with an account that has staff or administrator privileges."
    )

    pdf.section("Login & Authentication")
    pdf.numbered(1, "Go to the login page (/auth/login).")
    pdf.numbered(2, "Enter your email and password.")
    pdf.numbered(3, "The system verifies your credentials against the backend. If you have admin or staff access, you will be redirected to the admin dashboard.")
    pdf.numbered(4, "If you do not have the required permissions, you will see an \"Access Denied\" message.")
    pdf.ln(2)
    pdf.tip_box("Your session is validated on every page load. If your access is revoked while you are logged in, you will be blocked on the next navigation.")

    pdf.section("Navigation")
    pdf.body(
        "The admin panel uses a sidebar on the left side of the screen. Each menu item is described "
        "in detail in the following chapters. Click any item to navigate to that section. "
        "The currently active page is highlighted in the sidebar."
    )
    pdf.body("The site header and footer remain visible across all admin pages for quick access to the main store and account settings.")

    pdf.section("Roles & Permissions")
    pdf.body("Access is controlled through backoffice groups assigned in the Staff page:")
    pdf.simple_table(
        ["Group", "Description"],
        [
            ["BackofficeAdmin", "Full access to all admin features, staff management, and settings."],
            ["BackofficeSupport", "Access to support tickets, customer lookup, and order viewing."],
            ["BackofficeFulfillment", "Access to orders, fulfillment pipeline, and inventory."],
        ],
        [55, 119],
    )

    # ══════════════════════════════════════════════════════════════════════════
    # 2  DASHBOARD
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Dashboard")

    pdf.body(
        "The Dashboard is the first page you see after logging in. It provides a real-time "
        "overview of your store's health and recent order activity."
    )

    pdf.section("Session Monitoring")
    pdf.body("The top section shows live application metrics in four tabs:")
    pdf.bullet("Overview - Total sessions, active sessions, events, errors, average session duration, and conversion rate.")
    pdf.bullet("Logs - A chronological feed of application events.")
    pdf.bullet("Errors - Error breakdown by type and a list of recent errors.")
    pdf.bullet("Performance - Identifies the slowest API endpoints (those taking longer than 500 ms).")
    pdf.ln(2)
    pdf.tip_box("Enable Auto-Refresh (toggle in the top-right corner) to keep the dashboard updating every few seconds without manual reloads.")

    pdf.section("Orders Overview")
    pdf.body(
        "Below the monitoring section you will find a summary of recent orders. You can search by "
        "order ID or customer email, filter by status, and paginate through results. "
        "This is a read-only preview; for full order management go to the Orders page."
    )

    # ══════════════════════════════════════════════════════════════════════════
    # 3  REPORTS
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Reports")

    pdf.body(
        "The Reports page aggregates key performance indicators from sales, inventory, and support "
        "into a single view with export capabilities."
    )

    pdf.section("How to Generate a Report")
    pdf.numbered(1, "Select a Date Range from the dropdown (Last 7 Days, This Month, This Quarter, This Year).")
    pdf.numbered(2, "Choose a Report Type: Dashboard Overview, Sales, Tax, Inventory Snapshot, or Customer Report.")
    pdf.numbered(3, "Pick an Export Format (CSV or PDF).")
    pdf.numbered(4, 'Click "Export" to download the report file to your computer.')

    pdf.section("Summary Cards")
    pdf.body("Four cards are always visible at the top of the page:")
    pdf.simple_table(
        ["Card", "What it shows"],
        [
            ["Sales", "Total revenue for the selected period."],
            ["Orders", "Total number of orders in the period."],
            ["Inventory", "Count of product variants with low stock."],
            ["Support", "Number of currently open support tickets."],
        ],
        [35, 139],
    )

    pdf.section("Support SLA Metrics")
    pdf.body(
        "Below the cards you will see support response metrics: first-response SLA breaches, "
        "resolution SLA breaches, and the average first-response time in minutes."
    )

    # ══════════════════════════════════════════════════════════════════════════
    # 4  ORDERS
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Orders")

    pdf.body(
        "The Orders page is your primary tool for processing paid orders, adding tracking "
        "information, and managing shipments."
    )

    pdf.section("Viewing Orders")
    pdf.body(
        "By default the page shows orders in the FULFILLMENT_PENDING status. Use the status "
        "dropdown to switch between ALL, FULFILLMENT_PENDING, SHIPPED, and DELIVERED."
    )
    pdf.body("Use the search bar to find orders by Order ID or customer email address.")

    pdf.section("Shipping an Order")
    pdf.numbered(1, "Find the order in the list (it must be in FULFILLMENT_PENDING status).")
    pdf.numbered(2, 'Click the "Ship" button on that row.')
    pdf.numbered(3, "Enter the Carrier name (e.g. DHL, FedEx) and the Tracking Number.")
    pdf.numbered(4, 'Click "Confirm". The order status will change to SHIPPED and the customer receives a shipping notification email.')

    pdf.section("Resending Shipping Email")
    pdf.body(
        "For orders already in SHIPPED or DELIVERED status, click the \"Resend Email\" button "
        "to re-send the shipping confirmation to the customer."
    )

    pdf.section("Bulk Actions")
    pdf.body("Select multiple orders using the checkboxes, then choose a bulk action:")
    pdf.bullet("Update Status - Change the status of all selected orders at once.")
    pdf.bullet("Cancel - Cancel all selected orders.")
    pdf.bullet("Refund - Issue refunds for all selected orders.")
    pdf.ln(2)
    pdf.warn_box("Bulk cancel and refund actions cannot be undone. Double-check your selection before confirming.")

    # ══════════════════════════════════════════════════════════════════════════
    # 5  FULFILLMENT
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Fulfillment")

    pdf.body(
        "The Fulfillment page manages the complete order lifecycle from payment to delivery, "
        "including integration with the Printful print-on-demand service."
    )

    pdf.section("Pipeline Overview")
    pdf.body(
        "At the top of the page, four summary cards show the number of orders in each stage. "
        "Click any card to filter the order list to that stage:"
    )
    pdf.simple_table(
        ["Stage", "Meaning"],
        [
            ["Paid", "Payment received, awaiting fulfillment processing."],
            ["Fulfillment Pending", "Order is queued for production/shipping."],
            ["Backordered", "Items temporarily out of stock; order is on hold."],
            ["Shipped", "Order has been dispatched with a tracking number."],
        ],
        [50, 124],
    )

    pdf.section("Printful Integration")
    pdf.body("For print-on-demand products, you can manage the Printful workflow directly:")
    pdf.bullet("Submit to Printful - Sends the order to Printful for production.")
    pdf.bullet("Retry Printful - Retries a failed submission (check the error message and retry count before retrying).")
    pdf.bullet("View Printful Status - Pulls the latest fulfillment status from Printful's API.")
    pdf.ln(2)
    pdf.body(
        "The Printful Detail panel shows: sync status, Printful order ID, fulfillment status, "
        "tracking info, carrier, any error messages, retry count, and recent events."
    )

    pdf.section("Manual Actions")
    pdf.bullet("Mark Shipped - Enter a tracking number and carrier, then manually mark the order as shipped.")
    pdf.bullet("Mark Delivered - Manually confirm delivery when the carrier confirms it.")
    pdf.bullet("Mark Backordered - Flag an order as backordered if items are temporarily unavailable.")

    # ══════════════════════════════════════════════════════════════════════════
    # 6  FINANCE
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Finance")

    pdf.body(
        "The Finance page covers all payment-related operations: viewing provider events, "
        "running reconciliation, managing chargebacks, and issuing refunds."
    )

    pdf.section("Finance Overview")
    pdf.body(
        "Select a payment provider (Stripe or PayPal) and a date range to see a high-level "
        "summary of revenue, fees, and net amounts."
    )

    pdf.section("Provider Events")
    pdf.body(
        "Lists raw payment events received from Stripe or PayPal. You can also import events "
        "manually by pasting a JSON payload - useful for reconciling missing webhooks."
    )

    pdf.section("Reconciliation")
    pdf.numbered(1, "Choose a provider and period (start/end dates).")
    pdf.numbered(2, "Click \"Run Reconciliation\". The system compares internal records against provider events.")
    pdf.numbered(3, "View the run results. Drill into \"Missing Items\" to see discrepancies.")
    pdf.ln(2)
    pdf.tip_box("Run reconciliation weekly to catch any missed payments or webhook failures early.")

    pdf.section("Chargebacks")
    pdf.body(
        "Lists all chargeback cases. For each case you can update the status, add notes, "
        "and attach evidence. Respond to chargebacks promptly to improve dispute outcomes."
    )

    pdf.section("Refunds")
    pdf.body(
        "View the refund history or create a new refund. To issue a refund:"
    )
    pdf.numbered(1, "Enter the Order ID.")
    pdf.numbered(2, "Optionally specify a partial amount (leave empty for full refund).")
    pdf.numbered(3, "Add a reason for the refund.")
    pdf.numbered(4, "Click \"Create Refund\".")
    pdf.ln(2)
    pdf.warn_box("Refunds are processed through the original payment provider and cannot be reversed.")

    # ══════════════════════════════════════════════════════════════════════════
    # 7  INVENTORY
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Inventory")

    pdf.body(
        "The Inventory page gives you complete control over stock levels, health monitoring, "
        "audit trails, and reconciliation."
    )

    pdf.section("Summary")
    pdf.body("The top of the page shows a high-level overview of your total inventory status.")

    pdf.section("Stock Health")
    pdf.body(
        "Filter variants by stock health level to find items that need attention:"
    )
    pdf.bullet("Low - Fewer than 5 units remaining.")
    pdf.bullet("Zero - Completely out of stock.")
    pdf.bullet("Negative - Stock has gone below zero (data issue that needs correction).")

    pdf.section("SKU Lookup")
    pdf.body(
        "Enter a SKU to see its complete audit event timeline and variant history. "
        "This is useful for investigating specific stock discrepancies."
    )

    pdf.section("Manual Stock Adjustment")
    pdf.body("To adjust stock for a specific SKU:")
    pdf.numbered(1, "Enter the SKU in the lookup field.")
    pdf.numbered(2, "Choose an adjustment mode: Set (absolute value) or Delta (add/subtract).")
    pdf.numbered(3, "Enter the new quantity or the change amount.")
    pdf.numbered(4, "Provide a reason for the adjustment (mandatory for audit trail).")
    pdf.numbered(5, "Click \"Apply\".")

    pdf.section("Reconciliation")
    pdf.body("For larger stock checks:")
    pdf.numbered(1, "Click \"New Reconciliation\".")
    pdf.numbered(2, "Add line items: enter each SKU and the physical counted quantity.")
    pdf.numbered(3, "Submit the reconciliation. The system calculates discrepancies.")
    pdf.numbered(4, "Review the results, then click \"Apply\" to update stock levels.")
    pdf.numbered(5, "Export the reconciliation as CSV for your records.")

    pdf.section("Audit Events Export")
    pdf.body(
        "Filter audit events by date range and export them as CSV. This is useful for "
        "end-of-month reporting or external audits."
    )

    # ══════════════════════════════════════════════════════════════════════════
    # 8  PRODUCTS
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Products")

    pdf.body(
        "The Products page lets you manage your product catalog - search, filter, publish, "
        "unpublish, and delete products."
    )

    pdf.section("Finding Products")
    pdf.body("Use the controls at the top of the page to narrow down your product list:")
    pdf.bullet("Search - Type a product name to filter results.")
    pdf.bullet("Source - Filter by All, Local (manually created), or Printful (synced from Printful).")
    pdf.bullet("Availability - Filter by All, Published, or Unpublished.")
    pdf.body("Products are sorted by most recently updated. Pagination is at 50 items per page.")

    pdf.section("Publishing & Unpublishing")
    pdf.body(
        "Click the publish/unpublish toggle next to any product to control its visibility "
        "on the storefront. Unpublished products are hidden from customers but remain in the catalog."
    )

    pdf.section("Deleting Products")
    pdf.body("Only locally created products can be deleted. Printful-synced products can only be unpublished.")
    pdf.numbered(1, "Click the delete icon next to a local product.")
    pdf.numbered(2, "Confirm the deletion in the dialog.")
    pdf.numbered(3, "The product is unpublished first (safety measure), then permanently removed.")
    pdf.ln(2)
    pdf.warn_box("Product deletion is permanent and cannot be undone. If in doubt, unpublish instead.")

    pdf.section("Design Editor")
    pdf.body("Each product has a link to its design editor where you can customise artwork and mockups.")

    # ══════════════════════════════════════════════════════════════════════════
    # 9  CUSTOMERS
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Customers")

    pdf.body(
        "The Customers page provides a searchable directory of all customer accounts."
    )

    pdf.section("Searching & Filtering")
    pdf.bullet("Search by email or username using the search bar.")
    pdf.bullet("Filter by account status: All, Pending, Active, Suspended, or Deactivated.")

    pdf.section("Customer Information")
    pdf.body("The table displays the following for each customer:")
    pdf.simple_table(
        ["Column", "Description"],
        [
            ["Email", "Customer's email address."],
            ["Username", "Customer's display name."],
            ["Status", "Account status (Pending / Active / Suspended / Deactivated)."],
            ["Orders", "Total number of orders placed."],
            ["Total Spent", "Lifetime spend amount."],
            ["Date Joined", "When the account was created."],
        ],
        [40, 134],
    )

    # ══════════════════════════════════════════════════════════════════════════
    # 10  STAFF
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Staff Management")

    pdf.body(
        "The Staff page allows administrators to manage team access, assign roles, "
        "invite new staff members, and revoke access."
    )

    pdf.section("Viewing Staff")
    pdf.body("All current staff members are listed with their email, groups, and status. Use the search bar to find specific people.")

    pdf.section("Assigning Roles")
    pdf.numbered(1, "Find the staff member in the list.")
    pdf.numbered(2, "Toggle the checkboxes next to each backoffice group (Admin, Support, Fulfillment).")
    pdf.numbered(3, "A \"Save\" button appears when changes are detected. Click it to apply.")

    pdf.section("Inviting New Staff")
    pdf.numbered(1, "Enter the new member's email address.")
    pdf.numbered(2, "Optionally enter a Store ID if they are assigned to a specific store.")
    pdf.numbered(3, "Select which groups they should belong to.")
    pdf.numbered(4, "Click \"Invite\". An invitation link with a one-time token is generated.")
    pdf.numbered(5, "Share the link with the new team member. They can use it to set up their account.")

    pdf.section("Revoking Access")
    pdf.body(
        "Click \"Remove Access\" next to a staff member to revoke all their backoffice permissions. "
        "They will be blocked from the admin panel on their next page load."
    )
    pdf.warn_box("Removing access is immediate. The staff member does not need to log out - they will see an access denied message on their next navigation.")

    # ══════════════════════════════════════════════════════════════════════════
    # 11  AUDIT LOGS
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Audit Logs")

    pdf.body(
        "The Audit Logs page provides a read-only trail of all significant actions "
        "performed in the system. Use it for compliance, debugging, and accountability."
    )

    pdf.section("Orders Tab")
    pdf.body("Shows a log of every order-related action (status changes, cancellations, refunds, etc.).")
    pdf.body("Available filters:")
    pdf.bullet("Order ID - See all actions for a specific order.")
    pdf.bullet("Action - Filter by action type (e.g. cancel, refund, status_change).")
    pdf.bullet("Actor Email - See all actions performed by a specific admin.")
    pdf.body("Each log entry shows: action, status transition, order ID, who performed it, timestamp, and metadata.")

    pdf.section("Inventory Tab")
    pdf.body("Shows a log of every inventory mutation (stock adjustments, reconciliation applications, order deductions, etc.).")
    pdf.body("Available filters:")
    pdf.bullet("SKU - Filter by product SKU.")
    pdf.bullet("Variant ID - Filter by variant identifier.")
    pdf.bullet("Event Type - Filter by the type of inventory event.")

    pdf.tip_box("Both tabs support pagination (25 entries per page) and auto-reload when you change any filter.")

    # ══════════════════════════════════════════════════════════════════════════
    # 12  RISK MONITORING
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Risk Monitoring")

    pdf.body(
        "The Risk Monitoring page helps you detect and respond to security threats, "
        "particularly brute-force login attacks and suspicious activity."
    )

    pdf.section("Metric Cards")
    pdf.body("Four cards at the top give you an instant security snapshot:")
    pdf.simple_table(
        ["Metric", "What it means"],
        [
            ["Total Attempts (24h)", "All login attempts in the last 24 hours."],
            ["Failed Attempts", "Failed logins with the failure rate percentage."],
            ["Locked Accounts", "Accounts currently locked due to too many failed attempts."],
            ["Blacklisted IPs", "IP addresses on the deny list."],
        ],
        [50, 124],
    )

    pdf.section("Attack Pattern Table")
    pdf.body(
        "Below the cards, a sortable table lists detected attack patterns. "
        "You can sort by fail count or date. Expand any row to see details: "
        "IP address, approximate location, attempt times, and attack characteristics."
    )
    pdf.body(
        "If no threats are active, you will see a \"No suspicious patterns detected\" message."
    )
    pdf.tip_box("Check this page at least once daily. A spike in failed attempts or new blacklisted IPs may indicate an ongoing attack.")

    # ══════════════════════════════════════════════════════════════════════════
    # 13  SUPPORT
    # ══════════════════════════════════════════════════════════════════════════
    pdf.chapter_title("Support & Tickets")

    pdf.body(
        "The Support page combines customer lookup, return/refund management, and a full "
        "ticket management system."
    )

    pdf.section("Customer Lookup")
    pdf.body("The search bar at the top auto-detects the type of query you enter:")
    pdf.bullet("Email - if it contains @")
    pdf.bullet("Phone - if it starts with + or is a long number")
    pdf.bullet("Order ID - if it is a short number (up to 8 digits)")
    pdf.ln(2)
    pdf.body("Once found, the system displays:")
    pdf.bullet("Customer profile and addresses")
    pdf.bullet("Order history with shipping details, labels, and line items")
    pdf.bullet("Communication history (messages)")
    pdf.bullet("Return/refund requests")
    pdf.bullet("Active disputes")

    pdf.section("Handling Return/Refund Requests")
    pdf.body("For each pending return or refund request:")
    pdf.numbered(1, 'Review the request details.')
    pdf.numbered(2, 'Optionally add an admin note explaining your decision.')
    pdf.numbered(3, 'Click "Approve" to accept, "Reject" to decline, or "Mark Received" when the returned item arrives.')

    pdf.section("Ticket Management")
    pdf.body("The bottom half of the page is the ticket management panel.")

    pdf.subsection("Creating a Ticket")
    pdf.numbered(1, "Click \"New Ticket\".")
    pdf.numbered(2, "Enter the customer's email or phone, a subject line, the message, and a priority level.")
    pdf.numbered(3, "Optionally add tags for categorisation.")
    pdf.numbered(4, "Submit the ticket.")

    pdf.subsection("Replying to a Ticket")
    pdf.numbered(1, "Select a ticket from the list to open its detail view.")
    pdf.numbered(2, "Type your reply in the message box.")
    pdf.numbered(3, 'Choose between "Public Reply" (customer sees it) or "Internal Note" (staff only).')
    pdf.numbered(4, "Optionally select a Macro to pre-fill a template response before editing.")

    pdf.subsection("Managing Tickets")
    pdf.bullet("Assign - Assign the ticket to a specific agent, or click \"Claim\" to assign it to yourself.")
    pdf.bullet("Status - Change the ticket status (Open, Pending, Resolved, Closed).")
    pdf.bullet("Tags - Add or remove tags for categorisation and reporting.")

    pdf.subsection("Macros & Tags")
    pdf.body(
        "You can create new macros (template responses) and tags directly from within the "
        "ticket panel without leaving the page. Macros save time on frequently asked questions."
    )

    # ── Output ───────────────────────────────────────────────────────────────
    out = "Selsa_Admin_Guide.pdf"
    pdf.output(out)
    print(f"PDF generated: {out}")


if __name__ == "__main__":
    build()
