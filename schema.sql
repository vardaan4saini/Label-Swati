-- SQL Schema for Label Swati Clothing Brand (Supabase PostgreSQL)

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id text PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    price numeric NOT NULL,
    original_price numeric,
    description text NOT NULL,
    sizes text[] NOT NULL, -- e.g. ARRAY['S', 'M', 'L']
    stock jsonb NOT NULL, -- Size -> Quantity, e.g. {"S": 10, "M": 5}
    images text[] NOT NULL, -- Array of image URLs
    sales_count integer DEFAULT 0 NOT NULL,
    creation_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_new_arrival boolean DEFAULT false NOT NULL,
    is_upcoming boolean DEFAULT false NOT NULL,
    whatsapp_link text -- URL to the product page on the WhatsApp catalogue
);

-- Migration statement if table already exists:
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS whatsapp_link text;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE SET NULL,
    user_name text NOT NULL,
    user_contact text NOT NULL,
    user_address text NOT NULL,
    items jsonb NOT NULL, -- JSON array of OrderItem: [{productId, productName, productImage, size, quantity, priceAtPurchase}]
    subtotal numeric NOT NULL,
    discount_coins_applied numeric DEFAULT 0 NOT NULL,
    discount_coupon_applied numeric DEFAULT 0 NOT NULL,
    coupon_code_used text,
    total_paid numeric NOT NULL,
    payment_method text NOT NULL,
    payment_id text NOT NULL,
    delivery_status text NOT NULL CHECK (delivery_status IN ('Pending', 'Shipped', 'Delivered')),
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    code text PRIMARY KEY,
    discount_value numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('percent', 'flat')),
    min_cart_value numeric NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    description text NOT NULL
);

-- 5. Seasonal Lookbooks Table (stored in DB for sync)
CREATE TABLE IF NOT EXISTS public.lookbooks (
    id text PRIMARY KEY,
    title text NOT NULL,
    season text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    featured_product_ids text[] NOT NULL
);

-- 6. User Feedback Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id text PRIMARY KEY,
    user_name text NOT NULL,
    user_email text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message text NOT NULL,
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id text PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    type text NOT NULL CHECK (type IN ('sale', 'arrival', 'general'))
);

-- Enable Realtime for all tables so the Admin dashboard and storefront are always in perfect sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lookbooks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedbacks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Disable Row Level Security on all tables to allow client-side CRUD using the anonymous role
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
