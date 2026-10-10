# YAS Order & Delivery Management System

🚀 **Frontend + Backend Ready** - Order Management Platform

## 🎯 Features

### Sales Dashboard
- **Create Orders** - Full order form with validation
- **View Orders** - Real-time order list with search and filter
- **Track Orders** - View order status and history
- **Copy Tracking Link** - Share with customers

### Driver App
- **View Assigned Orders** - Only your deliveries
- **Update Status** - Track order progress
- **Share Location** - Manual geolocation updates
- **Customer Details** - Phone, address, device info

### Customer Tracking
- **Secure Lookup** - Order ID + Phone verification
- **Status Timeline** - Visual progress display
- **Location Display** - Last driver location (if shared)
- **Order Details** - Device, payment method, address

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Authentication**: Supabase Auth (upcoming)

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the server
npm run dev
```

Open: http://localhost:3000

### Environment Variables

```
PORT=3000
SUPABASE_URL=https://racrhrusajpwvxhiebtf.supabase.co
SUPABASE_KEY=your-anon-key
```

---

## 📁 Project Structure

```
YAS-Order-Tracking/
├── index.html              (Sales Dashboard)
├── driver.html             (Driver App)
├── track.html              (Customer Tracking)
├── server.js               (Node.js Express server)
├── package.json            (Dependencies)
├── vercel.json             (Deployment config)
├── assets/
│   ├── css/
│   │   └── style.css       (Styling - RTL/Arabic)
│   └── js/
│       ├── app-sales.js    (Sales logic)
│       ├── app-driver.js   (Driver logic)
│       └── app-track.js    (Tracking logic)
├── .env                    (Local config)
├── .env.example            (Template)
└── SUPABASE_SETUP.md       (Database guide)
```

---

## 📚 Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Database schema and setup
- **[PHASE-2-PREPARATION.md](./PHASE-2-PREPARATION.md)** - Backend architecture
- **[README.md](./README.md)** - This file

---

## 🔗 Links

- **GitHub**: https://github.com/mohamedtharwat556/YAS-Order-Tracking
- **Supabase**: https://racrhrusajpwvxhiebtf.supabase.co
- **Live Demo**: (Deploy to Vercel)

---

## 📝 Pages

### Sales (`/` or `/index.html`)
- Dashboard with order statistics
- Create new orders
- Search and filter orders
- Copy tracking link for customers

### Driver (`/driver.html`)
- View assigned orders only
- Update order status
- Share current location
- Call customer / View address

### Customer (`/track.html?order=YAS-20261010-001`)
- Enter order ID + phone
- View order status
- See delivery timeline
- Check last location update

---

## 🔐 Security Features

- ✅ HTML5 form validation
- ✅ XSS protection (text content only)
- ✅ Phone number pattern validation
- ✅ Order ID + Phone verification (tracking)
- ⏳ Row Level Security (Phase 2)
- ⏳ User authentication (Phase 2)

---

## 🗄️ Database

**Supabase PostgreSQL** with tables:
- `profiles` - Users and roles
- `drivers` - Driver information
- `orders` - Order data
- `order_status_history` - Status changes
- `order_locations` - Driver locations

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for schema.

---

## 🚀 Deployment

### Vercel

1. Connect GitHub repo to Vercel
2. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
3. Deploy automatically on push

```bash
git push origin main
```

---

## 📊 API Endpoints

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order

### Health
- `GET /api/health` - Server status

---

## 🎓 Learning

- RTL/Arabic UI design
- Supabase integration
- Express.js API
- Vanilla JavaScript SPA
- Geolocation API
- localStorage data management

---

## 📞 Support

For issues or questions, check:
1. SUPABASE_SETUP.md
2. PHASE-2-PREPARATION.md
3. GitHub Issues

---

## 📄 License

MIT

---

**Made with ❤️ by YAS Team**
