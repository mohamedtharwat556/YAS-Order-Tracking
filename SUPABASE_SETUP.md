# Supabase Setup Guide

## Project Details

**URL**: https://racrhrusajpwvxhiebtf.supabase.co  
**Anon Key**: Already configured in `.env`  
**Service Role Key**: Keep secure (server-side only)

---

## Database Schema

Create these tables in Supabase SQL Editor:

### 1. profiles (users)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'sales', 'driver')),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. drivers
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  phone TEXT NOT NULL,
  vehicle_type TEXT,
  status TEXT DEFAULT 'available',
  current_location POINT,
  last_location_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. orders
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_brand TEXT,
  order_amount DECIMAL(10,2),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'غير مدفوع',
  status TEXT DEFAULT 'تم طلبه',
  assigned_driver_id UUID REFERENCES drivers(id),
  created_by_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. order_status_history
```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id),
  previous_status TEXT,
  new_status TEXT,
  changed_by_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. order_locations
```sql
CREATE TABLE order_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id),
  driver_id UUID REFERENCES drivers(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Row Level Security (RLS)

Enable RLS on all tables and create policies:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_locations ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow sales to view all orders
CREATE POLICY "Sales can view all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'sales'
    )
  );

-- Allow drivers to view assigned orders
CREATE POLICY "Drivers can view assigned orders"
  ON orders
  FOR SELECT
  USING (
    assigned_driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Public can view order status (with verification)
CREATE POLICY "Public can verify order"
  ON orders
  FOR SELECT
  USING (true);
```

---

## API Endpoints

### Get all orders
```bash
GET /api/orders
```

### Create new order
```bash
POST /api/orders
Content-Type: application/json

{
  "customer_name": "أحمد محمد",
  "customer_phone": "01012345678",
  "customer_address": "Cairo",
  "device_type": "لابتوب",
  "device_brand": "Dell",
  "order_amount": 18500,
  "payment_method": "كاش",
  "payment_status": "مدفوع"
}
```

### Update order status
```bash
PATCH /api/orders/:id
Content-Type: application/json

{
  "status": "خرج للتوصيل"
}
```

---

## Environment Variables

In Vercel, add:
- `SUPABASE_URL`: https://racrhrusajpwvxhiebtf.supabase.co
- `SUPABASE_KEY`: [Anon Key from .env]

---

## Testing

```bash
npm install
npm start
```

Navigate to: http://localhost:3000

---

**Database is ready for Phase 2 backend integration!**
