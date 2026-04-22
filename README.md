# Enterprise E-commerce Application

A production-ready, enterprise-grade e-commerce system built with Django (Backend) and React (Frontend). Featuring dual payment methods, secure authentication with email verification, and a modular architecture.

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Gmail account (for SMTP)
- SSLCommerz Sandbox Account (optional, for testing online payments)

### 2. Backend Setup
```bash
cd backend
# Virtual environment (assumed created)
# Activate: .\venv\Scripts\activate (Windows)# 🛒 RB Trading — Full-Stack E-Commerce Platform

A production-ready e-commerce web application with dual payment methods, JWT authentication with email verification, and automated order management — built with Django REST Framework and React.

## ✨ Features

- **JWT Authentication** — email-based login with mandatory email verification before account activation
- **SSLCommerz Integration** — secure online payment with IPN (Instant Payment Notification) validation
- **Cash on Delivery** — COD order flow with real-time status tracking
- **Order Management** — full order history, invoice details, and automated email alerts on `Shipped` / `Delivered` status changes
- **Admin Dashboard** — Jazzmin-powered admin panel with store settings, payment credential management, and order control
- **Cloudflare Deployment** — frontend deployable to Cloudflare Pages, backend via tunnel or cloud service

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django, Django REST Framework |
| Frontend | React, Vite, CSS |
| Authentication | JWT (email-based, custom flow) |
| Payment | SSLCommerz (online) + Cash on Delivery |
| Email | Gmail SMTP |
| Admin | Jazzmin |
| Deployment | Cloudflare Pages (frontend) |


### Prerequisites

- Python 3.10+
- Node.js 18+
- Gmail account (for SMTP)
- SSLCommerz sandbox account (for payment testing)

### 1. Clone the repository

```bash
git clone https://github.com/Probir127/e-commerce-.git
cd e-commerce-
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for dev, `False` for production |
| `FRONTEND_URL` | Frontend URL (e.g. `http://localhost:5173`) |
| `SSLCOMMERZ_STORE_ID` | SSLCommerz Store ID |
| `SSLCOMMERZ_STORE_PASS` | SSLCommerz Store Password |
| `EMAIL_HOST_USER` | Gmail address for sending emails |
| `EMAIL_HOST_PASSWORD` | Gmail App Password (not your login password) |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 💳 Payment Flow

### Online (SSLCommerz)
1. User places order → redirected to SSLCommerz payment page
2. On success, SSLCommerz sends IPN callback to backend
3. Backend validates IPN and marks order as `Paid`

### Cash on Delivery
1. User places order → instantly created with `Pending` payment status
2. Admin updates status to `Shipped` / `Delivered` via dashboard
3. Customer receives automated email notification at each stage

---

## 🔐 Authentication Flow

1. User registers → account created as **inactive**
2. Verification code sent to email
3. User verifies → account activated
4. JWT tokens issued on login (email-based, not username)

---

## 🚢 Deployment

### Frontend (Cloudflare Pages)

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name rb-trading-frontend
```

### Backend

Deploy to Heroku, Railway, or DigitalOcean. Update these in `settings.py`:
```python
ALLOWED_HOSTS = ['your-backend-domain.com']
CORS_ALLOWED_ORIGINS = ['https://your-frontend-domain.com']
```

---

## 📌 Future Improvements

- [ ] Product search and category filtering
- [ ] PostgreSQL for production database
- [ ] Image CDN integration (Cloudinary)
- [ ] Mobile-responsive UI improvements
- [ ] Wishlist and product reviews

---

## 👤 Author

**Probir Saha Shohom**
[GitHub](https://github.com/Probir127) · [LinkedIn](https://www.linkedin.com/in/probir-saha-shohom-b01868280/)

---

## 📝 License

This project is licensed under the MIT License.
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Configuration (.env)

Create a `.env` file in the project root based on `.env.example`.

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key for session/token security. |
| `DEBUG` | Set to `False` in production. |
| `FRONTEND_URL` | URL where your frontend is hosted (e.g., `http://localhost:5173`). |
| `SSLCOMMERZ_STORE_ID` | Your SSLCommerz Store ID. |
| `SSLCOMMERZ_STORE_PASS`| Your SSLCommerz Store Password. |
| `EMAIL_HOST_USER` | Your Gmail address (also used for Admin notifications). |
| `EMAIL_HOST_PASSWORD` | Your Gmail App Password (NOT your regular password). |

---

## 🛠️ Key Features & Modules

### 🔐 Authentication Flow
- **Registration**: All new accounts are created as `inactive`.
- **Verification**: Users receive a code via email. They must verify their email before logging in.
- **JWT**: Custom JWT flow using email instead of username.

### 💳 Payment Methods
- **Online (SSLCommerz)**: Secure redirect with IPN (Instant Payment Notification) validation.
- **COD (Cash on Delivery)**: Immediate order creation with 'Pending' payment status and dedicated tracking.

### 📦 Order Management
- **Site Settings**: Administrators can update store contact details and payment credentials via the Admin panel.
- **Notifications**: Automatic email updates to customers when status changes to `Shipped` or `Delivered`.
- **History**: Full order history with invoice details for customers.

---

## 🌐 Deployment (Cloudflare)

### Frontend Deployment
The frontend is Vite-based and can be hosted on Cloudflare Pages.
1. `cd frontend`
2. `npm run build`
3. Deploy the `dist` folder:
   ```bash
   npx wrangler pages deploy dist
   ```

### Backend Deployment
For the Django backend, use a service like Heroku, DigitalOcean, or AWS. Ensure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in `settings.py` are updated with your production URLs.

---

## ⚡ Quick CLI Deployment (One-Liners)

### 1. Deploy Frontend (Cloudflare Pages)
Run from the root directory (PowerShell):
```powershell
cd frontend; npm run build; npx wrangler pages deploy dist --project-name e-commerce-demo-frontend
```

### 2. Demo Host Backend (Cloudflare Tunnel)
To expose your local Django server, you first need the `cloudflared` utility:
```powershell
# Install the tunnel utility globally
npm install -g @cloudflare/cloudflared

# Start the tunnel
cloudflared tunnel --url http://localhost:8000
```
*(Note: This provides a secure HTTPS URL for your backend that doesn't expire during the session.)*

---

## 🧹 Maintenance
- **Clean Code**: Use `python manage.py check` to verify backend integrity.
- **Assets**: All `static` and `media` files are located inside the `backend/` directory for structure isolation.
- **Admin**: Access the enhanced Jazzmin dashboard at `/admin/`.
