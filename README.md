# Full-Stack Inventory & Billing Management System

A beginner-friendly, clean, and modular full-stack application built to manage product inventory, track customer details, and compile billing invoices. This project is structured with a clean model-view-controller (MVC) architecture, making it highly educational and easy to explain in a college viva or project review.

---

## 🚀 Tech Stack

*   **Frontend**: React.js (built with Vite)
*   **Styling**: Tailwind CSS v4 (using the `@tailwindcss/vite` compiler plugin)
*   **Backend**: Node.js + Express.js
*   **Database**: Supabase (PostgreSQL) using standard SQL queries via the `pg` client
*   **Authentication**: JWT (JSON Web Tokens) with passwords secured using `bcryptjs`
*   **Routing**: React Router DOM v6
*   **API Calls**: Axios (configured with request/response interceptors)

---

## 📋 Features

1.  **Authentication**: Secure login/logout system with JWT stored in LocalStorage and protected dashboard routing.
2.  **Dashboard**: Metrics summary cards for total products, categories, customers, bills, and accumulated revenue, alongside a dedicated **Low Stock Warn Panel** (highlights items with quantity < 5).
3.  **Category Management**: Add, edit, delete, and view product categories.
4.  **Product Management**: CRUD operations for items, each containing product name, category dropdown, purchase price, selling price, and stock levels.
5.  **Customer Management**: CRUD operations for client accounts (name, phone, email, billing address).
6.  **Billing Invoices**: Dynamic invoice compilation screen. Select a customer, search/add items, enter quantities (validates stock availability in real-time), view subtotals, apply a flat rupee discount, calculate final totals, and save.
7.  **Stock Decrement**: Stock levels are automatically reduced in a PostgreSQL database transaction upon invoice generation.
8.  **Invoice History & Details**: Search, view, and read old invoice sheets.
9.  **User Profile Settings**: Update administrator name and change accounts password.

---

## 🛠️ Step-by-Step Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) installed (v16.0.0 or higher recommended)
*   A free [Supabase](https://supabase.com/) account.

---

### Step 1: Database Setup (Supabase)
1.  Log in to [Supabase](https://supabase.com/) and click **New Project**.
2.  Once created, go to the **SQL Editor** from the left-side navigation.
3.  Click **New Query**, open the file [backend/schema.sql](file:///C:/Myproject/backend/schema.sql), and copy all of its content.
4.  Paste the SQL commands into the Supabase editor and click **Run**.
    *   *This will automatically generate the database tables (Users, Categories, Products, Customers, Bills, Bill Items) and pre-populate them with demo data, including a default admin account.*

---

### Step 2: Configure Backend Environment Variables
1.  Navigate to the `backend` folder.
2.  Rename the `.env.example` file to `.env` or create a new file named `.env`.
3.  Set the `DATABASE_URL` variable to your Supabase PostgreSQL connection string.
    *   *You can find this in Supabase under Project Settings > Database > Connection String (choose URI, transaction pooler mode recommended).*
    *   *Example configuration inside `.env`:*
        ```env
        PORT=5000
        DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
        JWT_SECRET=your_custom_secret_key_here
        ```

---

### Step 3: Run the Express Server
1.  Open your terminal inside the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server (runs with `nodemon` for auto-reloading):
    ```bash
    npm run dev
    ```
    *The server will start on `http://localhost:5000`.*

---

### Step 4: Run the React Frontend
1.  Open a second terminal window and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite local development server:
    ```bash
    npm run dev
    ```
    *The frontend will run on `http://localhost:3000` and automatically proxy all `/api` calls to the backend.*

---

## 🔑 Demo Account Credentials

Use the default administrator credentials to log in:
*   **Email**: `admin@example.com`
*   **Password**: `admin123`

---

## 📂 Project Architecture

The codebase follows a standard **MVC (Model-View-Controller)** separation:

*   **Model**: Defines SQL query operations to interact directly with PostgreSQL (located in `backend/src/models`).
*   **Controller**: Handles requests, applies business logic (like verifying stock limits, computing discounts, and coordinating database transactions), and returns JSON responses (located in `backend/src/controllers`).
*   **View (React Frontend)**: Employs Vite+React styled with Tailwind CSS v4, drawing data from controllers through Axios client calls (`frontend/src`).
*   **Router (Express)**: Wires API endpoints to their controllers with JWT protection guards (`backend/src/routes`).

---



4.  **Why do we use Tailwind CSS v4?**
    *   *Answer*: Tailwind CSS v4 has a new high-performance Rust engine, simplifying configuration. Instead of a large config file, it uses CSS variables and a single `@import "tailwindcss";` in `src/index.css`. The compiler handles all utilities automatically.
