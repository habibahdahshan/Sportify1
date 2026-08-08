# Sportify

A full-stack e-commerce web app for performance sportswear, built with **Node.js, Express, MongoDB (Mongoose) and EJS**, following the classic **MVC** pattern. This project takes the original static Sportify front-end (HTML/CSS/JS mockup) and turns it into a complete, working application with real authentication, a database-backed catalog and cart, an admin panel, and everything else required for the course rubric.

## Tech stack

- **Backend:** Node.js, Express 4
- **Database:** MongoDB with Mongoose ODM
- **Views:** EJS (server-rendered) + vanilla JS (fetch/AJAX) for dynamic pieces
- **Auth:** express-session + connect-mongo (DB-backed sessions) + bcryptjs (password hashing)
- **File uploads:** Multer (local disk storage, `public/uploads`)
- **Styling:** the original Sportify CSS files, reused as-is, plus a small `public/site-extra.css` for new components (pagination, flash messages, admin extras)

## Project structure (MVC)

```
web/
├── app.js                 # app entry point — wires middleware, routes, error handling
├── models/                 # Mongoose schemas: User, Product, Cart, Order, PromoCode
├── controllers/             # business logic per resource
├── routes/                  # Express routers, one per resource area
├── middleware/               # auth guards, validation, uploads, error handling, i18n
├── views/                    # EJS templates
│   ├── partials/               # head, navbar, footer, cart/fav drawers, pagination, admin nav
│   ├── pages/                  # home, shop, product, checkout, about, 404, error…
│   ├── auth/                   # login, signup
│   ├── orders/                  # my-orders
│   └── admin/                    # dashboard, product/order/promo/user CRUD forms
├── public/
│   ├── User/CSS, User/Js, User/media  # original Sportify assets + new AJAX scripts
│   ├── Admin/CSS, Admin/Js
│   ├── uploads/                       # admin-uploaded product images land here
│   └── site-extra.css
└── seed/
    ├── seedProducts.js         # loads the real 17-item Sportify catalog into MongoDB
    └── createAdmin.js          # creates/promotes a super admin account
```

## Rubric coverage

| Requirement | Where |
|---|---|
| **MVC & Routing** | `models/`, `controllers/`, `routes/`, `app.js` — one router per resource, thin controllers |
| **Sessions & Auth (Security/Privacy)** | `express-session` + `connect-mongo`, bcrypt password hashing, role-based guards (`user`/`admin`/`superadmin`) in `middleware/authMiddleware.js`, session regenerated on login to prevent fixation |
| **External API & Responsive UI** | `/api/external/currency` calls a live exchange-rate API (`open.er-api.com`); layout reuses the original responsive Sportify CSS |
| **Uploading Files** | Admin product form uploads images via Multer to `public/uploads` (`middleware/upload.js`) |
| **Error Handling** | Centralized `middleware/errorMiddleware.js` (404 + error page/JSON), Mongoose validation & duplicate-key handling, Multer error handling |
| **Data Validation (Frontend + Backend)** | HTML5 `required`/`pattern`/`minlength` on all forms **and** server-side checks in `middleware/validationMiddleware.js` + Mongoose schema validators |
| **CRUD (users, products, orders, promo codes)** | Full admin CRUD for Products, Orders, Users, Promo codes; user CRUD on own profile & favorites |
| **AJAX / Fetch** | Cart, favorites, search, shop filtering/pagination, checkout promo code — all via `fetch()` against JSON endpoints (`public/User/Js/*.js`) |
| **Pagination** | Shop grid (`/api/products?page=`), admin Products/Orders/Users lists, "My orders" |
| **Localization** | EN/AR toggle (`middleware/i18n.js`), switches nav strings and page direction (`dir="rtl"`) |
| **HTTPS support** | `app.js` trusts the proxy and can force HTTPS redirects in production (`FORCE_HTTPS=true`); see `DEPLOYMENT.md` |
| **Deployment & domain** | See `DEPLOYMENT.md` |

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment** — copy `.env.example` to `.env` and fill in your MongoDB URI and session secret:
   ```bash
   cp .env.example .env
   ```
   A local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster both work.

3. **Seed the product catalog** (17 real Sportify products across Men/Women/Unisex):
   ```bash
   npm run seed
   ```
4. **Create an admin account**
   ```bash
   npm run create-admin
   ```
   Uses `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (defaults: `admin@sportify.com` / `Admin1234`). This account gets the `superadmin` role, which unlocks user management and promo codes in addition to product/order management.

5. **Run the app**
   ```bash
   npm run dev     # nodemon, auto-restart
   # or
   npm start
   ```
   Visit `http://localhost:3000`.

## Roles

- **user** — shop, cart, favorites, checkout, order history
- **admin** — everything a user can do, plus the admin panel: manage products & orders
- **superadmin** — everything an admin can do, plus manage promo codes and staff accounts

## Notes on the original Sportify mockup

The original zip only contained static HTML/CSS/JS with a fake `localStorage`-based cart/admin and no backend at all. This rebuild:

- Kept every CSS file and product image from the original design.
- Replaced the hard-coded product list with a MongoDB collection you manage from the admin panel.
- Replaced the fake `localStorage` cart with a session-backed cart (guest carts fall back to `localStorage` and automatically merge into the account cart on login).
- Replaced the fake admin login with a real, role-gated admin panel.
- Added things the mockup didn't have at all: checkout with real stock validation, promo codes, order history, pagination, and localization.
