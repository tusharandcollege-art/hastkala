# Hastkala (हस्तकला) 🏺

> Rural Artisan Supply Chain, Craft Inventory & Store POS Platform designed for CSR and rural livelihood initiatives.

Hastkala is a modern, mobile-responsive web platform connecting the complete rural artisan lifecycle: from central raw material intake, village dispatches, artisan tracking, to retail store inventory management and Point of Sale (POS) checkout.

---

## 🌟 Key Features

### 1. 🏭 Plant Raw Materials Management
- Central raw material intake tracking (Jute, Silk, Clay, Threads, Dyes).
- Batch passbook ledger with unit costs, quantity received, and weighted-average cost calculation.
- Live plant balance tracking.

### 2. 🚚 Village Allocation & Dispatches
- Record dispatches of raw materials from central plant to village clusters and individual women artisans.
- Quick top-up (`+ Add Qty`) on existing village dispatches with plant stock balance validation.
- Village-wise dispatch filtering and real-time search.

### 3. 👥 Villages & Women Artisans Directory
- Village profiles (Rampur, Chandpur, Sonpur, Madhopur, etc.) with Sarpanch contacts.
- Women artisan directory with craft skills, contact details, and village affiliation.

### 4. 📦 Craft Catalog Ledger
- Manage craft products across categories (Bags, Textiles, Pottery, Home Decor, etc.).
- **`+ Receive` (Inward Batches)**: Add new incoming batches to catalog balance with quantity, cost price, date, and cluster notes.
- **`→ Send to Store`**: 1-click movement from catalog balance directly into **Store POS Inventory**.
- **📜 Transaction History**: Full ledger of inward receipts and store dispatches with batch deletion and auto-recalculated balances.

### 5. 🏪 Store POS Inventory (`/inventory`)
- Real-time stock status monitoring (*In Stock*, *Low Stock*, *Out of Stock*).
- Cost vs. retail price valuation and retail margin tracking.
- Search by product and filter by category and stock level.

### 6. 🛒 Cashier POS Counter (`/sales`)
- Mobile-friendly sales counter with live product search and category filtering.
- Interactive cart with quantity controls and automatic subtotal calculation.
- Checkout with customer name and **💵 Cash** vs **📱 UPI** payment toggle.
- **30-Minute Undo Sale Window**: Restore accidental sales and return items to inventory with 1 click.
- Real-time sales register for today's transactions.

### 7. 📊 Executive Analytics & Multi-Sheet Excel Export
- Monthly revenue & profit trend line charts.
- Cash vs. UPI payment mode distribution.
- Top-selling craft products by revenue.
- Multi-sheet Excel workbook export (`.xlsx`) via SheetJS for offline reporting.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts
- **Excel Export**: SheetJS (`xlsx`)
- **Date Handling**: date-fns
- **Persistence**: LocalStorage with plug-and-play architecture for Firebase Firestore

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/tusharandcollege-art/hastkala.git

# Navigate into the project directory
cd hastkala

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📄 License

MIT License. Designed for CSR, NGO, and rural livelihood development programs.
