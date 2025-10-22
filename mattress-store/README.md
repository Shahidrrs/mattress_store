# Mattress Store - Full Stack (Frontend + Backend)

This is a ready-to-run mattress e-commerce project with a React + Tailwind frontend and Node/Express + MongoDB backend.
Payment integration is **not** enabled in this package — the code includes placeholders so you can add payments later (Razorpay/Stripe/PayPal).

## Quick start

1. Unzip `mattress-store.zip`.
2. Backend:
   - `cd backend`
   - Copy `.env.example` to `.env` and set `MONGO_URI` and `ADMIN_TOKEN`.
   - `npm install`
   - `node server.js`
   - Backend runs at http://localhost:5000

3. Frontend:
   - `cd frontend`
   - `npm install`
   - Create a `.env` file (Vite) if you want:
     ```
     VITE_API_URL=http://localhost:5000
     VITE_ADMIN_TOKEN=change_me
     ```
   - `npm run dev`
   - Frontend runs at http://localhost:5173

## Notes
- The backend order endpoints currently save orders with `status: created`. When you later add a payment provider:
  - Create provider order (e.g., Razorpay order) in `/api/orders/create`.
  - Confirm payment in `/api/orders/confirm`.
- Add provider scripts to `frontend/index.html` when integrating payments.
- Secure the admin area with proper auth before using in production.

