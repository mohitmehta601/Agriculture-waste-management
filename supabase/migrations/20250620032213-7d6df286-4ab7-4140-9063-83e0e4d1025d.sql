
-- Create farmers_submissions table to store farmer data and submissions
CREATE TABLE farmers_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    land_area_acres DECIMAL(10, 2) NOT NULL,
    crop_grown TEXT NOT NULL,
    crop_yield_per_acre DECIMAL(10, 2) NOT NULL,
    crop_field_location_lat DECIMAL(10, 7),
    crop_field_location_lon DECIMAL(10, 7),
    crop_field_address TEXT,
    waste_type TEXT NOT NULL,
    harvest_date DATE NOT NULL,
    image_url TEXT,
    calculated_waste_tons DECIMAL(10, 2),
    estimated_market_value_inr DECIMAL(10, 2),
    carbon_footprint_kg_co2e DECIMAL(10, 2),
    chosen_action TEXT,
    ai_recommendations TEXT[],
    pickup_status TEXT DEFAULT 'Pending',
    pickup_scheduled_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_products table for aggregated products
CREATE TABLE marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_residue_type TEXT NOT NULL UNIQUE,
    total_stock_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table for buyer orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_name TEXT NOT NULL,
    buyer_mobile_number TEXT NOT NULL,
    buyer_address TEXT NOT NULL,
    company_name TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status TEXT DEFAULT 'Pending',
    estimated_esg_score DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table for individual items in orders
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    marketplace_product_id UUID REFERENCES marketplace_products(id) ON DELETE RESTRICT,
    crop_residue_type TEXT NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    price_per_kg_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default marketplace products
INSERT INTO marketplace_products (crop_residue_type, total_stock_kg, price_per_kg, image_url) VALUES
('Rice Husk', 0, 5.35, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop'),
('Wheat Straw', 0, 8.5, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop'),
('Sugarcane Bagasse', 0, 2.0, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'),
('Coconut Fiber', 0, 179, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'),
('Peanut Shell', 0, 7.5, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop'),
('Corn Stalks', 0, 6.5, 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=400&h=300&fit=crop'),
('Cotton Waste', 0, 10.5, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop');
