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
# Activate: .\venv\Scripts\activate (Windows)
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
