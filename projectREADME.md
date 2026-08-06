# 🚗 Vehicle Rental Booking System

> A full-stack web application for managing vehicle rentals — built with Next.js, NestJS, and PostgreSQL.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-Backend-red?style=for-the-badge&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

---

## 📌 Project Overview

The **Vehicle Rental Booking System** is a web-based platform that allows customers to browse, book, and pay for rental vehicles online. It includes a customer-facing website and a full admin panel for managing vehicles, bookings, payments, and customers.

This project was developed as part of an academic software engineering module.

---

## 🏗️ Project Structure

```
vehicle-rental/
│
├── frontend/          → 🌐 Customer Website (Next.js)
├── admin/             → 🛡️ Admin Panel (Next.js)
├── backend/           → ⚙️ REST API (NestJS)
│
└── docker-compose.yml → PostgreSQL local setup
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Customer Frontend | Next.js 14 (App Router) |
| Admin Panel | Next.js 14 |
| Backend API | NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| File Storage | Cloudinary |
| Payments | PayHere + KokoPay + Payzy |
| Email | Nodemailer / Resend |
| PDF Generation | react-pdf |
| Styling | Tailwind CSS |

---

## ✅ In Scope

### 1. Available Vehicles
Users can view all vehicles available for rent. Each vehicle displays:
- Vehicle name, brand, and model
- Vehicle type and category
- Rental price per day
- Seating capacity
- Transmission type (Auto / Manual)
- Fuel type
- Availability status
- Vehicle images

Users can search and filter vehicles by type, category, price range, and availability dates.

---

### 2. Vehicle Booking
Customers can select a vehicle and complete a booking. The booking process includes:
- Selecting pickup and return dates
- Selecting pickup location
- Viewing estimated rental cost
- Entering / confirming customer details
- Confirming or cancelling a booking
- Viewing booking status (Pending / Confirmed / Handed Over / Completed / Cancelled)

**Booking Status Flow:**
```
Pending → Confirmed → Handed Over (Active) → Completed
                                           ↘ Cancelled
```

| Status | Meaning |
|---|---|
| `Pending` | Booking created, awaiting admin confirmation |
| `Confirmed` | Admin approved — customer can come to collect |
| `Handed Over` | Physical handover done, documents uploaded, vehicle given |
| `Completed` | Vehicle returned |
| `Cancelled` | Booking cancelled |

---

### 3. Payment
The system integrates with three payment providers:

| Provider | Type | Details |
|---|---|---|
| **PayHere** | Online Payment | Visa, Mastercard, Bank Transfer, eZ Cash, mCash |
| **KokoPay** | Installments | Buy Now Pay Later — 3 or 6 month plans |
| **Payzy** | Installments | Flexible installment repayment plans |

Payment features include:
- Total rental cost breakdown
- Payment method selection
- Payment status tracking (Paid / Pending / Failed)
- Downloadable PDF payment receipts
- Installment schedule tracking (KokoPay / Payzy)

> For academic demonstration, all payment gateways can be run in **sandbox / test mode**.

---

### 4. Vehicle Handover & Document Management
When a customer visits the rental center to collect their vehicle, the admin performs a physical handover and uploads verification documents into the system.

**Admin uploads (per booking):**
- 📷 Customer's NIC / Passport photo
- 📷 Driver's License copy photo
- 📷 Signed physical rental agreement photo
- Handover date & time stamp
- Optional handover notes

**Customer can view (in their dashboard):**
- Their uploaded NIC / Passport photo
- Their Driver's License photo
- Their signed agreement photo (downloadable)
- Handover timestamp and status

Once documents are uploaded, the booking status automatically updates to **Handed Over (Active)**.

---

### 5. Driver & Rental History
The system maintains complete rental history including:
- Customer and driver details
- Previously rented vehicles
- Rental dates and duration
- Completed and cancelled bookings
- Payment history
- Damage or incident reports

---

### 6. Admin Dashboard
The administrator manages the entire system through a dedicated panel:
- Add, edit, and delete vehicles
- Create and manage vehicle categories (dynamic — reflected on customer website)
- Update vehicle availability status
- View and manage all bookings (confirm, cancel, update status)
- **Upload vehicle handover documents** (NIC, driver's license, signed agreement photos)
- **Mark booking as Handed Over** after physical vehicle collection
- View customer and driver history
- Monitor and track all payments
- Create and manage deals & discount offers
- Manage customer accounts (activate / suspend)
- View summary stats — total vehicles, bookings, revenue, customers
- View and respond to customer inquiries
- View damage and incident reports
- Revenue and booking reports & analytics

---

## ❌ Out of Scope

- Multi-tenancy / multiple rental companies
- GPS / real-time vehicle tracking
- Mobile app (iOS / Android)
- Driver-specific mobile app
- Third-party insurance integration
- Multi-currency support

---

## 🌐 Customer Website — Pages

| # | Page | Access |
|---|---|---|
| 1 | Home | Public |
| 2 | All Vehicles / Browse | Public |
| 3 | Vehicle Detail | Public |
| 4 | Services | Public |
| 5 | Deals & Offers | Public |
| 6 | About Us | Public |
| 7 | Contact | Public |
| 8 | Register | Public |
| 9 | Login | Public |
| 10 | Forgot Password | Public |
| 11 | Booking Flow (multi-step) | 🔐 Login Required |
| 12 | Payment Page | 🔐 Login Required |
| 13 | Payment Success / Failed | 🔐 Login Required |
| 14 | My Profile | 🔐 Login Required |
| 15 | My Bookings | 🔐 Login Required |
| 16 | Booking Detail | 🔐 Login Required |
| 17 | Payment History | 🔐 Login Required |
| 18 | My Favourites | 🔐 Login Required |
| 19 | Notifications | 🔐 Login Required |
| 20 | Damage Report | 🔐 Login Required |
| 21 | My Documents (NIC, License, Agreement) | 🔐 Login Required |

---

## 🛡️ Admin Panel — Pages

| # | Page |
|---|---|
| 1 | Admin Login |
| 2 | Dashboard (Overview & Stats) |
| 3 | Vehicles List |
| 4 | Add / Edit Vehicle |
| 5 | Vehicle Categories |
| 6 | Bookings List |
| 7 | Booking Detail |
| 8 | Payments List |
| 9 | Payment Detail |
| 10 | Customers List |
| 11 | Customer Detail & History |
| 12 | Deals & Offers List |
| 13 | Create / Edit Deal |
| 14 | Customer Inquiries |
| 15 | Reports & Analytics |
| 16 | Booking Handover & Document Upload |
| 17 | System Settings |

---

## 🗄️ Database Schema

```
users           → id, name, email, phone, nic, password_hash, role, status, created_at
vehicles        → id, name, brand, model, year, category_id, seats, fuel, transmission, price_per_day, status, created_at
categories      → id, name, icon, description, created_at
bookings        → id, user_id, vehicle_id, pickup_date, return_date, pickup_location, status, total_amount, created_at
payments        → id, booking_id, amount, method, status, transaction_id, paid_at
deals           → id, vehicle_id, category_id, discount_percent, image, start_date, end_date, is_active
reviews         → id, user_id, vehicle_id, booking_id, rating, comment, created_at
damage_reports  → id, booking_id, user_id, description, images, created_at
inquiries       → id, name, email, phone, subject, message, is_read, created_at
notifications   → id, user_id, title, message, is_read, created_at
favourites      → id, user_id, vehicle_id, created_at
installments      → id, payment_id, provider, total_installments, paid_installments, next_due_date, status
vehicle_handovers → id, booking_id, nic_photo_url, license_photo_url, agreement_photo_url, handover_date, handover_notes, uploaded_by, created_at
```

---

## 💳 Payment Integration

### PayHere
- Sri Lanka's leading online payment gateway
- Supports: Visa, Mastercard, Amex, bank transfers, eZ Cash, mCash
- Webhook support for real-time payment status updates
- [PayHere Developer Docs](https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout)

### KokoPay
- Buy Now Pay Later (BNPL) service
- Installment options: 3 months / 6 months
- [KokoPay Merchant Info](https://www.kokopay.lk)

### Payzy
- Flexible installment payment platform
- [Payzy Info](https://www.payzy.lk)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 15+
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/vehicle-rental.git
cd vehicle-rental
```

### Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your database and payment credentials in .env
npx prisma migrate dev
npm run start:dev
```

### Setup Frontend (Customer Website)
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Setup Admin Panel
```bash
cd admin
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

**Backend `.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/vehicle_rental
JWT_SECRET=your_jwt_secret
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_SECRET=your_secret
KOKOPAY_API_KEY=your_kokopay_key
PAYZY_API_KEY=your_payzy_key
CLOUDINARY_URL=your_cloudinary_url
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email
MAIL_PASS=your_password
```

---

## 👥 Team

| Name | Role |
|---|---|
| [Team Member 1] | Frontend Developer |
| [Team Member 2] | Backend Developer |
| [Team Member 3] | UI/UX + Frontend |
| [Team Member 4] | Database + Backend |

---

## 📄 License

This project is developed for academic purposes only.

---

> 📬 For questions or contributions, open an issue or contact the team.
