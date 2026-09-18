-- ==============================================================================
-- MPW Inventory Management System - Complete Supabase Database Schema
-- Run this script inside the Supabase SQL Editor (supabase.com -> Project -> SQL Editor)
-- ==============================================================================

-- 1. Create custom enums
CREATE TYPE user_role AS ENUM ('editor', 'warehouse', 'customer');
CREATE TYPE requisition_status AS ENUM ('Pending', 'Approved', 'Fulfilled', 'Rejected');
CREATE TYPE shift_id AS ENUM ('Shift A', 'Shift B');

-- 2. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  department TEXT,
  dept TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  password TEXT,
  avatar_initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'Piece',
  quantity INT NOT NULL DEFAULT 0,
  reorder_point INT NOT NULL DEFAULT 10,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  barcode_string TEXT NOT NULL,
  supplier TEXT,
  location TEXT,
  created_at BIGINT NOT NULL,
  image_url TEXT
);

-- Ensure image_url column exists if table was created previously
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Requisitions Table
CREATE TABLE IF NOT EXISTS public.requisitions (
  id TEXT PRIMARY KEY,
  requestor_name TEXT NOT NULL,
  requestor_email TEXT,
  purpose TEXT NOT NULL,
  dept_code TEXT NOT NULL,
  required_date DATE NOT NULL,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status requisition_status NOT NULL DEFAULT 'Pending',
  submitted_at BIGINT NOT NULL,
  submitted_by TEXT,
  processed_by TEXT,
  processed_at BIGINT,
  rejection_reason TEXT,
  shift_id shift_id DEFAULT 'Shift A'
);

-- 5. Issuance Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.issuance_logs (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  requisition_id TEXT,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  qty_issued INT NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  requestor_name TEXT NOT NULL,
  issuing_staff TEXT NOT NULL,
  issuing_staff_role user_role NOT NULL,
  shift_id shift_id NOT NULL DEFAULT 'Shift A',
  purpose TEXT NOT NULL,
  updated_stock_level INT NOT NULL
);

-- 6. Email / Notification Logs Table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  from_user TEXT NOT NULL,
  from_role user_role,
  to_user TEXT NOT NULL,
  to_role user_role,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  event_type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  requisition_id TEXT
);

-- 7. Enable Row Level Security (RLS) & Public Access Policies for Demo/System
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for inventory" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for requisitions" ON public.requisitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for issuance_logs" ON public.issuance_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for email_logs" ON public.email_logs FOR ALL USING (true) WITH CHECK (true);

-- 8. Seed / Update Demo Users Migration Query
INSERT INTO public.profiles (id, name, email, role, department, dept, active, password, avatar_initials)
VALUES 
  ('u-editor-001', 'GilbertRed', 'GilbertRed@mpw.com', 'editor', 'Head Office', 'Head Office', true, 'mpw@123', 'GR'),
  ('u-warehouse-001', 'YvesWhite', 'YvesWhite@mpw.com', 'warehouse', 'Warehouse Operations', 'Warehouse Operations', true, 'mpw@123', 'YW'),
  ('u-customer-001', 'ThomasCustomer', 'ThomasCustomer@mpw.com', 'customer', 'Project Alpha', 'Project Alpha', true, 'mpw@123', 'TC')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  avatar_initials = EXCLUDED.avatar_initials;

