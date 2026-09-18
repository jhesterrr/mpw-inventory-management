# MPW INVENTORY MANAGEMENT SYSTEM
## CLIENT USER MANUAL & WORKFLOW GUIDE

---

### 1. QUICK SUMMARY (WHAT IS THIS APP?)

The MPW Inventory Management System is an easy-to-use web application that tracks inventory items, manages material request approvals, records stock issuances, and alerts staff when items need to be reordered.

It works smoothly on desktop computers, warehouse tablets, and smartphones.

---

### 2. WHO CAN DO WHAT? (ACCOUNT ROLES COMPARED)

There are 3 types of accounts in the system:
1. User / Customer: Everyday staff who request items and supplies.
2. Warehouse Staff: Personnel who scan, approve, and hand out items.
3. Admin / Editor: Supervisors and managers with full control over the system.

| Feature / Action | Customer / User | Warehouse Staff | Admin / Editor |
| :--- | :---: | :---: | :---: |
| Browse Inventory Catalog & View Stock | YES | YES | YES |
| Add Items to Requisition Cart | YES | NO | NO |
| Submit Material Requisition Request | YES | NO | NO |
| Track Status of Own Requests | YES | NO | NO |
| Scan Barcodes with Camera or Phone | NO | YES | YES |
| Fast Stock Adjustment (+ / -) | NO | YES | YES |
| Review & Approve / Reject Requests | NO | YES | YES |
| Fulfill & Hand Out Items (With Shift Log) | NO | YES | YES |
| Print Pick Slips & Download PDFs | NO | YES | YES |
| Create, Edit, or Delete Items (SKUs) | NO | NO | YES |
| View Analytics, Reports & Export CSV | NO | YES | YES |
| Manage User Accounts & System Settings | NO | NO | YES |

---

### 3. SIMPLE STEP-BY-STEP WORKFLOWS

#### A. FOR CUSTOMERS (HOW TO REQUEST ITEMS)

Follow these 4 simple steps to request materials:

1. Step 1: Browse Items
   - Click Inventory Catalog on the left menu (or bottom bar on mobile).
   - Use the Search box or category buttons to find the items you need.
   - Check the stock status: Green = In Stock, Yellow = Low Stock, Red = Out of Stock.

2. Step 2: Add to Cart
   - Click the Add to Cart button on each item you want.
   - Your cart badge will update immediately.

3. Step 3: Submit Your Request Form
   - Go to Requisition Cart.
   - Review your items and adjust quantities using + or -.
   - Click Proceed to Requisition Form.
   - Enter your Name, Department, Required Date, and Purpose (example: Routine Maintenance).
   - Click Submit Requisition.

4. Step 4: Check Request Status
   - Go to My Requisitions to see updates:
     - Pending: Waiting for warehouse review.
     - Approved: Approved! Ready for pickup at the warehouse.
     - Fulfilled: You have received the items.
     - Rejected: Denied (a reason will be provided).

---

#### B. FOR WAREHOUSE STAFF (HOW TO HANDLE STOCK & REQUESTS)

Follow these simple steps for daily warehouse tasks:

1. Step 1: Check Inbound Stock or Fast Adjustments
   - Open Barcode Scanner.
   - Point your phone camera at an item barcode or type the SKU code manually.
   - Review the item location and quantity.
   - Use + (Quick In) or - (Quick Out) to instantly adjust physical counts.

2. Step 2: Review Material Requests
   - Go to Requisitions.
   - View requests with the Pending badge.
   - Click any request to view who submitted it, which department, and the items requested.
   - Click Approve if you have stock, or Reject (with a quick note) if unavailable.

3. Step 3: Hand Out Items (Issuance)
   - When the customer arrives to collect items, open the Approved requisition.
   - Click Fulfill & Issue.
   - Select your current working shift (Shift A or Shift B).
   - Confirm the quantities handed over.
   - Click Confirm Issuance.
   - The system immediately deducts items from inventory and logs a permanent record in the Issuance Audit.

---

#### C. FOR ADMINS & MANAGERS (HOW TO RUN & MAINTAIN THE SYSTEM)

1. Add or Edit Inventory Items
   - Go to Inventory Catalog.
   - Click + New Item to add a new SKU, name, storage location, unit cost, and reorder point.
   - Click the pencil icon on any item row to edit its details.

2. Monitor Reorders & Replenishment
   - Open Stock Reorder.
   - Quickly see all items that are low in stock or completely depleted.
   - View recommended order amounts and estimated replenishment costs.

3. Download Reports & Analytics
   - Go to Analytics & Reports.
   - View visual charts on stock value, category usage, and warehouse activity.
   - Click Export CSV or Download PDF for weekly meetings and accounting.

4. Manage Accounts
   - Go to System Settings.
   - Add new staff accounts, assign roles (customer, warehouse, or editor), and update department information.

---

### 4. SUMMARY OF SYSTEM FEATURES (WHAT DOES EACH PAGE DO?)

1. Dashboard: Overview of company inventory including total worth, number of SKUs, items that need reordering, and recent activity.
2. Inventory Catalog: Complete item masterlist. Includes quick search, category tabs, and status pills (All, In Stock, Reorder Point, Out of Stock).
3. Barcode Scanner: Camera scanner for phones and laptops. Lets warehouse staff look up items and adjust counts in seconds.
4. Requisition Cart & Approval Form: Digital requisition system. Employees add items to their cart, provide a reason, and submit for sign-off.
5. Requisitions Manager: The central queue where warehouse staff and managers review, approve, reject, or fulfill item requests.
6. My Requisitions: A personal tracking page for employees to see whether their requests are pending, approved, or ready for pickup.
7. Issuance Audit (History): A secure activity log that records who took what item, who released it, on which shift, and at what exact time.
8. Stock Reorder (Purchase): Automatically identifies items running low and calculates how many units to purchase to restore safe levels.
9. Analytics & Reports: Easy-to-read charts and tables with one-click export to Excel (CSV) and PDF.
10. Support & Notifications: Internal alert center notifying users of approvals, low-stock warnings, and system updates.
11. System Settings: Account settings, dark/light theme switch, and admin tools for user role management.

---

### 5. TECHNOLOGY STACK USED

- Frontend Framework: React 18 with TypeScript (reliable, clean, bug-resistant code).
- Build Engine: Vite (fast loading and smooth performance).
- Styling: Tailwind CSS with custom branding (Burgundy, Crimson, and Gold luxury theme).
- Animations & Interactions: Motion (Framer Motion) and GSAP (smooth navigation, tabs, and popups).
- Icons & Visuals: Lucide React (clean modern icons).
- Charts & Graphs: Recharts (interactive visual reporting).
- Camera Scanning: HTML5-QRCode (high-accuracy device camera barcode reading).
- Document Generation: jsPDF & AutoTable (client-side PDF generation for slips and reports).
- State Management: Zustand (fast, responsive state tracking without page reloads).
- Database & Cloud Storage: Supabase PostgreSQL (secure cloud database with live data sync).
- Hosting & Deployment: Vercel (fast global cloud hosting with automated updates).

---

### 6. FREQUENTLY ASKED QUESTIONS (FAQS)

- Q: Can I use this system on my mobile phone?  
  A: Yes! The system is fully mobile-responsive. Navigation pills, search bars, and scanners automatically adapt to phone screens.
- Q: What happens if an item runs out of stock?  
  A: The system marks it red as Out of Stock and sends an alert to the reorder page so warehouse managers can restock it immediately.
- Q: Can I open exported reports in Microsoft Excel?  
  A: Yes. All exported CSV files open directly in Microsoft Excel, Google Sheets, or Apple Numbers.
- Q: What are Shift A and Shift B?  
  A: They represent operational work shifts. Selecting a shift during item issuance helps track which team handled the materials for audit compliance.
