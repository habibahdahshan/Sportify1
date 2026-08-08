# Deployment Guide

This app is a standard Node.js + Express + MongoDB app, so it can be deployed to any Node host. Below are two straightforward, free-tier-friendly paths.

## 1. Database: MongoDB Atlas (free tier)

1. Create a free cluster at https://www.mongodb.com/atlas.
2. Add a database user (username/password).
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) for simplicity, or restrict to your host's IP range.
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sportify?retryWrites=true&w=majority
   ```
5. Use this as `MONGO_URI` in your deployment's environment variables.

## 2. Hosting: Render (recommended, free tier available)

1. Push this project to a GitHub repository.
2. Go to https://render.com → **New → Web Service** → connect your repo.
3. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables (Render dashboard → Environment):
   ```
   NODE_ENV=production
   MONGO_URI=<your Atlas connection string>
   SESSION_SECRET=<a long random string>
   FORCE_HTTPS=true
   ```
5. Deploy. Render gives you a free `https://your-app.onrender.com` URL with **HTTPS already enabled** (TLS is terminated at Render's load balancer).
6. Run the seed and admin-creation scripts once, from your local machine, pointed at the production database:
   ```bash
   MONGO_URI="<atlas uri>" npm run seed
   MONGO_URI="<atlas uri>" npm run create-admin
   ```

### Custom domain on Render

1. In the Render dashboard, open your service → **Settings → Custom Domain**.
2. Add your domain (e.g. `www.sportify-shop.com`) and follow the CNAME/A record instructions Render gives you — add those records at your domain registrar (Namecheap, GoDaddy, etc.).
3. Render automatically provisions and renews a free HTTPS certificate (via Let's Encrypt) for your custom domain — no extra setup needed.

## 3. Alternative hosting: Railway

Same idea as Render:

1. https://railway.app → **New Project → Deploy from GitHub repo**.
2. Add the same environment variables as above.
3. Railway also terminates HTTPS automatically and supports custom domains under **Settings → Domains**.

## HTTPS in this codebase

- `app.js` sets `app.set("trust proxy", 1)` in production so Express correctly detects HTTPS when running behind a reverse proxy/load balancer (Render, Railway, Nginx, etc.).
- Setting `FORCE_HTTPS=true` makes the app 301-redirect any plain HTTP request to HTTPS.
- Session handling is secured in production, so authentication is only exposed over HTTPS.
- If you need to test HTTPS **locally**, generate a self-signed certificate and run a small wrapper:
  ```bash
  openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365
  ```
  ```js
  // local-https.js (optional, for local HTTPS testing only)
  const https = require("https");
  const fs = require("fs");
  const app = require("./app");

  https
    .createServer(
      { key: fs.readFileSync("server.key"), cert: fs.readFileSync("server.cert") },
      app
    )
    .listen(3443, () => console.log("HTTPS dev server: https://localhost:3443"));
  ```
  In production you generally don't need this — the host (Render/Railway/etc.) handles TLS termination for you.

## Environment variables summary

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | defaults to 3000 |
| `NODE_ENV` | recommended | set to `production` on your host |
| `MONGO_URI` | yes | MongoDB Atlas connection string |
| `SESSION_SECRET` | yes (production) | long random string |
| `_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | used by `npm run create-admin` | |
| `FORCE_HTTPS` | optional | `true` to redirect HTTP → HTTPS |
