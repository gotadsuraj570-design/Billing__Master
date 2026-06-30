-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Create Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    purchase_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bills table
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bill Items table
CREATE TABLE bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Insert Admin User (Password: admin123)
INSERT INTO users (name, email, password) VALUES 
('System Admin', 'admin@example.com', '$2a$10$.jG6Zr5sdpP9F59VEsiJEek42n6yFHE2hdJDq3We6Vmfaj50qhYHu');

-- Insert Categories
INSERT INTO categories (name) VALUES 
('Electronics'),
('Stationery'),
('Groceries');

-- Insert Products
-- Note: Some products are seeded with low stock (quantity < 5) to demo the feature
INSERT INTO products (category_id, name, description, purchase_price, selling_price, quantity) VALUES
((SELECT id FROM categories WHERE name='Electronics'), 'Premium Wireless Keyboard', 'Mechanical keyboard with blue switches and RGB backlight', 500.00, 800.00, 3),
((SELECT id FROM categories WHERE name='Electronics'), 'Developer Laptop Pro', 'Intel i7, 16GB RAM, 512GB SSD, 15.6 inch screen', 40000.00, 55000.00, 10),
((SELECT id FROM categories WHERE name='Stationery'), 'A5 Spiral Notebook', '120 pages, ruled notebook for office and school notes', 30.00, 50.00, 40),
((SELECT id FROM categories WHERE name='Stationery'), 'Fine Gel Pen (Black)', '0.5mm smooth flow ink gel pen', 5.00, 10.00, 4),
((SELECT id FROM categories WHERE name='Groceries'), 'Organic Almond Milk 1L', 'Unsweetened plant-based milk enriched with calcium', 40.00, 55.00, 15);

-- Insert Customers
INSERT INTO customers (name, phone, email, address) VALUES
('John Doe', '9876543210', 'john.doe@example.com', '123 Tech Street, Silicon Valley'),
('Jane Smith', '8765432109', 'jane.smith@example.com', '456 Paper Lane, Booktown'),
('Alice Johnson', '7654321098', 'alice.j@example.com', '789 Grocery Blvd, Food City');

-- Insert Sample Bills
-- Bill 1 for John Doe (1 Laptop, 1 Keyboard) -> Total: 55800.00
INSERT INTO bills (customer_id, total_amount, discount) VALUES
((SELECT id FROM customers WHERE name='John Doe'), 55800.00, 0.00);

INSERT INTO bill_items (bill_id, product_id, quantity, price) VALUES
((SELECT id FROM bills LIMIT 1), (SELECT id FROM products WHERE name='Developer Laptop Pro'), 1, 55000.00),
((SELECT id FROM bills LIMIT 1), (SELECT id FROM products WHERE name='Premium Wireless Keyboard'), 1, 800.00);

-- Bill 2 for Jane Smith (2 Notebooks, 2 Pens, discount 10.00) -> Total: 110.00 (discounted to 110.00, original 120.00)
INSERT INTO bills (customer_id, total_amount, discount) VALUES
((SELECT id FROM customers WHERE name='Jane Smith'), 110.00, 10.00);

INSERT INTO bill_items (bill_id, product_id, quantity, price) VALUES
((SELECT id FROM bills OFFSET 1 LIMIT 1), (SELECT id FROM products WHERE name='A5 Spiral Notebook'), 2, 50.00),
((SELECT id FROM bills OFFSET 1 LIMIT 1), (SELECT id FROM products WHERE name='Fine Gel Pen (Black)'), 2, 10.00);
