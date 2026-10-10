# Phase 2 Preparation Document
## YAS Order & Delivery Management System
## Backend Integration & Database Implementation

**Document Date**: October 10, 2026  
**Phase 1 Status**: ✅ COMPLETE  
**Phase 2 Status**: 🟡 READY TO START  

---

## Overview

Phase 2 will transition the YAS Order & Delivery system from frontend-only with mock data to a full-stack application with real backend, database, and authentication. This document outlines the requirements, architecture, and integration points.

---

## Current State (End of Phase 1)

### Frontend Deliverables
✅ Complete HTML5/CSS3/JavaScript interface  
✅ 5 main views (Sales, New Order, Driver, Tracking, Admin)  
✅ Form validation and user feedback  
✅ Data storage via localStorage (mock)  
✅ 100% test coverage  
✅ Full Arabic RTL support  
✅ Mobile-responsive design  

### Frontend Data Model (localStorage)

```javascript
// Order Structure (stored in localStorage)
{
  id: "YAS-20261010-001",
  customer: "أحمد محمد",
  phone: "01012345678",
  address: "Cairo, Egypt",
  mapLink: "https://maps.google.com/...",
  
  deviceType: "لابتوب",
  brand: "Dell",
  quantity: 1,
  amount: 18500,
  details: "Laptop for office",
  
  paymentMethod: "كاش",
  paymentStatus: "مدفوع",
  
  driver: "أحمد حسن",
  receivedAt: "2026-10-10T10:30:00.000Z",
  status: "تم التوصيل",
  notes: "Call before arrival",
  
  history: [
    { status: "تم طلبه", at: "2026-10-10T10:30:00.000Z" }
  ],
  
  location: {
    lat: "30.0444",
    lng: "31.2357",
    at: "2026-10-10T14:45:00.000Z"
  }
}
```

---

## Phase 2 Architecture

### Technology Stack

**Backend**:
- Supabase (PostgreSQL + Auth + RLS)
- Node.js/Express (optional, for custom logic)
- API: REST endpoints

**Database**:
- PostgreSQL (via Supabase)
- Row Level Security (RLS) policies

**Authentication**:
- Supabase Auth
- JWT tokens
- Role-based access control

**Frontend Changes**:
- Replace localStorage with API calls
- Add authentication screens
- Add loading states
- Error handling for API failures

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Browser)                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  YAS Frontend (HTML/CSS/JS)                   │   │
│  │  ├─ Sales Dashboard                          │   │
│  │  ├─ New Order Form                           │   │
│  │  ├─ Driver Interface                         │   │
│  │  ├─ Customer Tracking                        │   │
│  │  └─ Admin Dashboard                          │   │
│  └──────────────────────────────────────────────┘   │
│                        ↓                             │
│               HTTPS API Calls                        │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│              BACKEND (Supabase)                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Authentication Layer (JWT)                  │   │
│  │  ├─ Login                                     │   │
│  │  ├─ Session Management                       │   │
│  │  └─ Role Verification                        │   │
│  └──────────────────────────────────────────────┘   │
│                        ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │  API Layer (REST Endpoints)                  │   │
│  │  ├─ /api/orders                              │   │
│  │  ├─ /api/orders/:id                          │   │
│  │  ├─ /api/orders/:id/status                   │   │
│  │  ├─ /api/orders/:id/location                 │   │
│  │  ├─ /api/drivers                             │   │
│  │  ├─ /api/users                               │   │
│  │  └─ /api/tracking/:id                        │   │
│  └──────────────────────────────────────────────┘   │
│                        ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │  Row Level Security (RLS)                    │   │
│  │  ├─ Sales user can only see own orders       │   │
│  │  ├─ Driver can only see assigned orders      │   │
│  │  ├─ Admin can see all orders                 │   │
│  │  └─ Public can only track with verification  │   │
│  └──────────────────────────────────────────────┘   │
│                        ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                         │   │
│  │  ├─ profiles (users)                         │   │
│  │  ├─ drivers                                  │   │
│  │  ├─ orders                                   │   │
│  │  ├─ order_status_history                     │   │
│  │  ├─ order_locations                          │   │
│  │  └─ payment_transactions                     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema (PostgreSQL)

### Table: profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales', 'driver')),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: drivers

```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  phone TEXT NOT NULL,
  vehicle_type TEXT,
  vehicle_number TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  current_location POINT,
  last_location_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);
```

### Table: orders

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- YAS-20261010-001
  
  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_map_link TEXT,
  
  -- Device/Order Info
  device_type TEXT NOT NULL,
  device_brand TEXT,
  device_quantity INTEGER DEFAULT 1,
  device_description TEXT,
  
  -- Amount & Payment
  order_amount DECIMAL(10,2),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('كاش', 'عند الاستلام', 'تحويل بنكي', 'اتفاق خاص')),
  payment_status TEXT DEFAULT 'غير مدفوع' CHECK (payment_status IN ('غير مدفوع', 'مدفوع جزئيًا', 'مدفوع')),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_remaining DECIMAL(10,2),
  
  -- Status & Tracking
  status TEXT DEFAULT 'تم طلبه' CHECK (status IN ('تم طلبه', 'تم الشحن', 'خرج للتوصيل', 'تم التوصيل', 'تعذر التسليم')),
  failure_reason TEXT,
  
  -- Assignments
  created_by_id UUID REFERENCES profiles(id),
  assigned_driver_id UUID REFERENCES drivers(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  received_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Notes
  internal_notes TEXT,
  customer_notes TEXT,
  
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_status (status),
  INDEX idx_driver (assigned_driver_id),
  INDEX idx_created_by (created_by_id),
  INDEX idx_created_at (created_at)
);
```

### Table: order_status_history

```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_id UUID REFERENCES profiles(id),
  reason TEXT,
  source TEXT DEFAULT 'web', -- 'web', 'api', 'mobile'
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_order (order_id),
  INDEX idx_created_at (created_at)
);
```

### Table: order_locations

```sql
CREATE TABLE order_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy DECIMAL(10,2),
  updated_by_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_order (order_id),
  INDEX idx_driver (driver_id),
  INDEX idx_created_at (created_at)
);
```

### Table: payment_transactions

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  recorded_by_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_order (order_id),
  INDEX idx_created_at (created_at)
);
```

---

## API Endpoints Specification

### Authentication Endpoints

#### POST `/auth/register`
Register a new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "محمد أحمد",
  "role": "sales",
  "phone": "01012345678"
}
```

**Response** (200):
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "message": "Registration successful"
}
```

#### POST `/auth/login`
Authenticate user and get session token

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response** (200):
```json
{
  "access_token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "محمد أحمد",
    "role": "sales"
  }
}
```

#### POST `/auth/logout`
Logout user and invalidate session

---

### Order Endpoints

#### GET `/api/orders`
Get list of orders (filtered by user role)

**Query Parameters**:
- `status`: Filter by status
- `search`: Search by order ID, customer name, or phone
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `date_from`: Orders from this date
- `date_to`: Orders until this date

**Response** (200):
```json
{
  "data": [
    {
      "id": "YAS-20261010-001",
      "customer_name": "أحمد محمد",
      "status": "تم التوصيل",
      "amount": 18500,
      "payment_status": "مدفوع",
      "driver_name": "أحمد حسن",
      "created_at": "2026-10-10T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

#### POST `/api/orders`
Create a new order

**Request**:
```json
{
  "customer_name": "أحمد محمد",
  "customer_phone": "01012345678",
  "customer_address": "Cairo, Egypt",
  "device_type": "لابتوب",
  "device_brand": "Dell",
  "device_quantity": 1,
  "device_description": "Laptop for office",
  "order_amount": 18500,
  "payment_method": "كاش",
  "payment_status": "غير مدفوع",
  "assigned_driver_id": "uuid",
  "internal_notes": "Call before arrival"
}
```

**Response** (201):
```json
{
  "id": "YAS-20261010-001",
  "message": "Order created successfully"
}
```

#### GET `/api/orders/:id`
Get order details

**Response** (200):
```json
{
  "id": "YAS-20261010-001",
  "customer_name": "أحمد محمد",
  "customer_phone": "01012345678",
  "customer_address": "Cairo, Egypt",
  "device_type": "لابتوب",
  "device_brand": "Dell",
  "order_amount": 18500,
  "payment_method": "كاش",
  "payment_status": "مدفوع",
  "status": "تم التوصيل",
  "driver_name": "أحمد حسن",
  "created_at": "2026-10-10T10:30:00Z",
  "updated_at": "2026-10-10T14:45:00Z",
  "status_history": [...],
  "locations": [...]
}
```

#### PATCH `/api/orders/:id/status`
Update order status

**Request**:
```json
{
  "new_status": "خرج للتوصيل",
  "reason": "Driver picked up order"
}
```

**Response** (200):
```json
{
  "id": "YAS-20261010-001",
  "status": "خرج للتوصيل",
  "updated_at": "2026-10-10T12:00:00Z"
}
```

#### PATCH `/api/orders/:id/location`
Update driver location for order

**Request**:
```json
{
  "latitude": 30.0444,
  "longitude": 31.2357,
  "accuracy": 10
}
```

**Response** (200):
```json
{
  "id": "YAS-20261010-001",
  "location": {
    "latitude": 30.0444,
    "longitude": 31.2357,
    "timestamp": "2026-10-10T12:00:00Z"
  }
}
```

#### POST `/api/orders/:id/payment`
Record payment transaction

**Request**:
```json
{
  "amount": 9250,
  "payment_method": "كاش",
  "reference_number": "TRX123456"
}
```

**Response** (200):
```json
{
  "order_id": "YAS-20261010-001",
  "amount_paid": 9250,
  "amount_remaining": 9250,
  "payment_status": "مدفوع جزئيًا"
}
```

### Public Tracking Endpoint

#### POST `/api/tracking/verify`
Verify and track order (public endpoint)

**Request**:
```json
{
  "order_id": "YAS-20261010-001",
  "phone": "01012345678"
}
```

**Response** (200):
```json
{
  "id": "YAS-20261010-001",
  "status": "خرج للتوصيل",
  "device_type": "لابتوب",
  "device_description": "Dell Laptop",
  "address": "Cairo, Egypt",
  "created_at": "2026-10-10T10:30:00Z",
  "last_update": "2026-10-10T12:00:00Z",
  "last_location": {
    "latitude": 30.0444,
    "longitude": 31.2357,
    "timestamp": "2026-10-10T12:00:00Z"
  },
  "status_history": [...]
}
```

---

## Frontend Integration Changes

### 1. Authentication Flow

**Current**: Direct navigation to all views  
**Phase 2**: Add login screen, protect routes by role

```javascript
// Pseudo-code: Auth flow
class AuthManager {
  async login(email, password) {
    const response = await fetch('/auth/login', { ... });
    const { access_token } = await response.json();
    sessionStorage.setItem('auth_token', access_token);
  }
  
  async logout() {
    await fetch('/auth/logout', { ... });
    sessionStorage.removeItem('auth_token');
  }
  
  isAuthenticated() {
    return !!sessionStorage.getItem('auth_token');
  }
}
```

### 2. API Client

**Current**: localStorage reads  
**Phase 2**: API calls with JWT

```javascript
// Pseudo-code: API client
class APIClient {
  constructor() {
    this.baseURL = 'https://api.yas-delivery.com';
    this.token = sessionStorage.getItem('auth_token');
  }
  
  async getOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    return fetch(`${this.baseURL}/api/orders?${params}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
  
  async createOrder(orderData) {
    return fetch(`${this.baseURL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
  }
}
```

### 3. Data Storage

**Current**: localStorage ('yas_orders_frontend_v1')  
**Phase 2**: Supabase real-time queries

```javascript
// Pseudo-code: Data storage transition
// CURRENT
const orders = JSON.parse(localStorage.getItem('yas_orders_frontend_v1'));

// PHASE 2
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('created_by_id', user.id)
  .order('created_at', { ascending: false });
```

### 4. Error Handling

**Current**: Silent failures, localStorage fallback  
**Phase 2**: API error handling, user feedback

```javascript
// Pseudo-code: Error handling
try {
  const response = await api.getOrders();
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
    } else if (response.status === 403) {
      // Show "Access Denied"
    } else {
      // Show generic error
    }
  }
} catch (error) {
  console.error('Network error:', error);
  showToast('Connection error. Please try again.');
}
```

---

## Migration Strategy

### Step 1: Prepare Frontend (Week 1)
- [ ] Add authentication UI (login/register screens)
- [ ] Create API client class
- [ ] Add loading states to all views
- [ ] Add error handling for API failures
- [ ] Add JWT token management

### Step 2: Setup Supabase (Week 1-2)
- [ ] Create Supabase project
- [ ] Create database schema
- [ ] Setup Row Level Security policies
- [ ] Configure authentication
- [ ] Create API endpoints

### Step 3: API Implementation (Week 2-3)
- [ ] Implement order CRUD endpoints
- [ ] Implement status update endpoint
- [ ] Implement location tracking
- [ ] Implement public tracking endpoint
- [ ] Setup error handling

### Step 4: Integration Testing (Week 3-4)
- [ ] Connect frontend to API
- [ ] Test all CRUD operations
- [ ] Test authentication flows
- [ ] Test role-based access
- [ ] Test error scenarios

### Step 5: Data Migration (Week 4)
- [ ] Migrate seed data to database
- [ ] Verify data integrity
- [ ] Test data persistence
- [ ] Backup database

### Step 6: Production Deployment (Week 4-5)
- [ ] Setup production environment
- [ ] Configure HTTPS
- [ ] Setup monitoring
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Run smoke tests

---

## Testing Strategy for Phase 2

### Unit Tests
- API client methods
- Data validation
- Error handling
- Authentication logic

### Integration Tests
- Frontend ↔ Backend communication
- Database operations
- Authentication flows
- Error scenarios

### End-to-End Tests
- Complete user flows (sales)
- Driver workflows
- Customer tracking
- Admin operations

### Security Tests
- Role-based access control
- Data isolation
- API rate limiting
- XSS/CSRF prevention

---

## Success Criteria for Phase 2

### Functional Requirements
- [ ] Users can login with role-based access
- [ ] Orders persist to database
- [ ] Search/filtering works on server
- [ ] Status updates sync across all users
- [ ] Driver location tracking functional
- [ ] Customer tracking page works securely
- [ ] Admin dashboard operational
- [ ] Payment tracking functional

### Non-Functional Requirements
- [ ] Response times < 500ms
- [ ] 99.5% uptime
- [ ] Support for 1000+ concurrent users
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Security audit passed
- [ ] Performance optimized

### Quality Requirements
- [ ] 80%+ code coverage (backend)
- [ ] All acceptance tests passing
- [ ] Zero critical security issues
- [ ] Documentation complete
- [ ] Team trained on new system

---

## Dependencies & Environment Setup

### Supabase Setup
```bash
# 1. Create Supabase project
# 2. Get project URL and API key
# 3. Create .env file:

VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_KEY=xxxxx
VITE_API_URL=https://api.yas-delivery.com
```

### Frontend Dependencies (Phase 2)
```bash
npm install @supabase/supabase-js
npm install axios (optional, for API calls)
npm install jwt-decode (for token handling)
```

### Database Tools
- pgAdmin (database management)
- Supabase Studio (built-in)
- PostGIS (for location features)

---

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 2.1 Frontend Prep | 1 week | Auth UI, API client, error handling |
| 2.2 Backend Setup | 1 week | Supabase project, schema, RLS |
| 2.3 API Implementation | 2 weeks | All endpoints, validation, testing |
| 2.4 Integration | 1 week | Frontend ↔ Backend, testing |
| 2.5 Deployment | 1 week | Production setup, launch |
| **Total** | **6 weeks** | **Fully functional backend system** |

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Data loss during migration | Low | High | Backup and verify before migration |
| API performance issues | Medium | Medium | Load testing and optimization |
| Authentication bugs | Medium | High | Comprehensive security testing |
| Database schema issues | Low | High | Careful schema design and review |
| User adoption | Low | Medium | Training and documentation |

---

## Conclusion

Phase 2 will transform the YAS Order & Delivery system from a frontend-only application to a complete, scalable backend system with real data persistence, authentication, and role-based access control.

### Handoff Requirements
- ✅ Phase 1 code complete and tested
- ✅ Frontend well-documented
- ✅ API specifications defined
- ✅ Database schema designed
- ✅ Security requirements identified
- ✅ Timeline established
- ✅ Team ready for Phase 2

**Ready to proceed to Phase 2 Backend Development**

---

**Document Version**: 1.0  
**Last Updated**: October 10, 2026  
**Next Phase Start Date**: TBD (Based on business priority)

