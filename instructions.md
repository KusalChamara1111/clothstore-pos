# POS System Requirements Document (Clothing Business)

## 1. Project Overview
A lightweight, browser-based Point of Sale (POS) system designed for a clothing business handling both Wholesale and Retail sales, and managing both in-house manufactured and outsourced stock.

## 2. Business Requirements (Functional)

### A. Inventory Management
* **Item Categories:** Ability to categorize items (e.g., T-shirts, Frocks, Trousers).
* **Stock Sources:** * *In-house:* Items manufactured by the shop.
    * *Outsourced:* Items bought from vendors.
* **Pricing Tiers:** Each item must have two price points:
    1. Retail Price (Standard)
    2. Wholesale Price (Bulk)
* **Stock Tracking:** Auto-deduct stock on sales and manual update for new arrivals/production.

### B. Sales & Billing
* **Mode Selection:** Toggle between 'Wholesale' and 'Retail' mode during checkout.
* **Cart System:** Add items by searching or scanning (future-proof).
* **Discounts:** Ability to apply flat or percentage discounts per bill.
* **Receipt Generation:** Generate a clean, printable bill (A5 or thermal paper size).

### C. Vendor & Customer Management
* **Vendor Log:** Keep a record of suppliers and purchase history.
* **Wholesale Customer Directory:** Basic info for frequent wholesale buyers.

### D. Reporting
* **Daily Sales:** Total revenue and profit for the day.
* **Low Stock Alerts:** Highlight items running below a certain threshold.

---

## 3. Technical Requirements

### A. Tech Stack
* **Frontend:** HTML5, CSS3 (Tailwind CSS for styling).
* **Logic:** Vanilla JavaScript (ES6+).
* **Database:** Dexie.js (Wrapper for IndexedDB) for local, persistent browser storage.
* **Icons:** Lucide Icons or FontAwesome.

### B. Database Schema (Dexie.js Stores)
* `products`: `++id, name, category, retailPrice, wholesalePrice, stockQty, source`
* `sales`: `++id, date, totalAmount, discount, type(wholesale/retail), items`
* `vendors`: `++id, name, contact, company`

### C. UI/UX Design Goals
* **Single Page Application (SPA) feel.**
* **Sidebar Navigation:** Dashboard, Inventory, Sales (POS), Reports, Settings.
* **Responsive Design:** Must work on laptops/tablets.
* **Print Styles:** CSS `@media print` to ensure bills look professional.

---

## 4. Implementation Steps for Developers/AI
1.  **Boilerplate:** Setup HTML with Tailwind CDN and Dexie.js script.
2.  **Database Init:** Initialize Dexie database and define the schema.
3.  **Inventory Module:** Create forms to Add/Edit/Delete products.
4.  **POS Interface:** Build the cart logic that calculates totals based on the selected "Sale Type" (Retail/Wholesale).
5.  **Print Logic:** Implement a function to open a print-friendly window for receipts.
6.  **Dashboard:** Simple cards showing Today's Total Sales and Low Stock count.

---

## 5. Security & Backup
* **Local Backup:** Since data is stored in the browser (IndexedDB), include a button to "Export Data" as a `.json` file for manual backups.