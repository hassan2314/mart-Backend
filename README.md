# M&M's Mart API

Express REST API for the [M&M's](https://mart-frontend.netlify.app/) grocery demo. MongoDB stores users, products, orders, and blog posts. JWT cookies authenticate shoppers, and an admin role check guards the dashboard. The [Netlify storefront](https://mart-frontend.netlify.app/) calls this API for the catalog, checkout, Smart Cooking posts, and the admin panel.

Companion frontend: [hassan2314/mart-frontend](https://github.com/hassan2314/mart-frontend)

Live API: `https://mart-backend-1-ci1l.onrender.com`

## Features

- Public product catalog and product detail
- Customer registration, login, logout, profile updates, and order history
- Checkout that records an order and reduces stock for regular accounts
- Smart Cooking blog list and blog detail
- Admin dashboard totals (users, products, blogs, orders, revenue, recent records)
- Admin management of products, blogs, orders, users, and manager invitations
- Helmet, response compression, CORS allow-list, and rate limits on `/api/`

## Stack

Node.js (ES modules), Express 5, MongoDB with Mongoose, JWT (`jsonwebtoken`) and bcrypt, Cloudinary and Multer for images, Helmet, compression, CORS, cookie-parser, express-rate-limit, and express-validator.

## Live demo

| | |
| --- | --- |
| Storefront | https://mart-frontend.netlify.app/ |
| Frontend repo | https://github.com/hassan2314/mart-frontend |
| API base | https://mart-backend-1-ci1l.onrender.com/api/v1 |

The shop and Smart Cooking pages read public product and blog routes. Login uses a username and password. Customers place orders from the cart. An admin login is sent to `/admin`, which loads dashboard, catalog, order, blog, and user screens from the admin routes below.

Try the public catalog without an account:

```bash
curl https://mart-backend-1-ci1l.onrender.com/api/v1/products
```

There is no document at `/`. Routes live under `/api/v1`.

## Demo accounts

No demo users were hard-coded in this repo before. On startup the API upserts two public demo accounts from `src/seeds/demoUsers.js`. The passwords below are demo passwords for this project. They are not production secrets, and the seed does not read API keys or tokens from the environment.

These accounts exist after a process that includes this seed has connected to MongoDB. Set `SEED_DEMO_ACCOUNTS=false` to skip them. If a non-demo user already owns the same username or email, the seed leaves that account alone.

The storefront login form asks for **username** and password.

| | Customer | Read-only admin |
| --- | --- | --- |
| Username | `demo.customer` | `demo.admin` |
| Password | `democustomer` | `demoadmin` |
| Email | `demo.customer@example.com` | `demo.admin@example.com` |
| Role | `user` | `admin` |

`demo.admin` is a real `admin` role so the current frontend can open `/admin`. The user is also marked read-only. Dashboard, order, product, blog, and user **reads** succeed, including the same order and user records a normal admin can read. Creates, updates, and deletes (products, blogs, order status, users, invitations, profile, and checkout) return `403`. Buttons in the admin UI still appear; the API refuses the write. Set `SEED_DEMO_ACCOUNTS=false` when this database holds private customer data you do not want on a shared login.

`demo.customer` can browse, update address fields, and place up to 25 orders. Those orders show in order history and do not reduce catalog stock. The account cannot change its username, email, or password, so the published login keeps working. Each startup resets both demo profiles and restores a password that no longer matches.

Run the seed by itself with `npm run seed:demo` (uses `MONGODB_URI` from `.env`). `npm run dev` and `npm start` seed after MongoDB connects.

## API

Base path: `/api/v1`

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/users/register` | Public |
| `POST` | `/users/login` | Public. Body: `username`, `password` |
| `POST` | `/users/logout` | Authenticated |
| `POST` | `/users/refresh-token` | Refresh cookie or body |
| `GET` | `/users/current-user` | Authenticated |
| `PATCH` | `/users/update` | Authenticated |
| `PUT` | `/users/change-password` | Authenticated |
| `POST` | `/users/invite-manager` | Admin write |
| `POST` | `/users/register-manager` | Invitation token |
| `GET` | `/users/users` | Admin |
| `GET` | `/users/users/:userId` | Admin |
| `PUT` | `/users/users/:userId` | Admin write (change role) |
| `DELETE` | `/users/users/:userId` | Admin write |
| `GET` | `/products` | Public |
| `GET` | `/products/:id` | Public |
| `POST` | `/products` | Admin write |
| `PUT` | `/products/:id` | Admin write |
| `PATCH` | `/products/:id` | Admin write (image) |
| `DELETE` | `/products/:id` | Admin write |
| `POST` | `/orders` | Authenticated |
| `GET` | `/orders` | Authenticated (own orders) |
| `GET` | `/orders/:id` | Owner or admin |
| `GET` | `/blogs` | Public |
| `GET` | `/blogs/:id` | Public |
| `POST` | `/blogs` | Admin write |
| `PUT` | `/blogs/:id` | Admin write |
| `DELETE` | `/blogs/:id` | Admin write |
| `GET` | `/admin/dashboard-stats` | Admin |
| `GET` | `/admin/orders` | Admin |
| `PATCH` | `/admin/orders/:id` | Admin write (order status) |

Send the access token as an httpOnly cookie (the login response sets it) or as `Authorization: Bearer <accessToken>`.

## Local development

Requires Node.js 18+ and a MongoDB database.

```bash
cp .env.example .env
npm install
npm run dev
```

`npm run dev` listens on `PORT` from `.env`, or `4000` when `PORT` is unset. Fill in your own MongoDB URI, JWT secrets, CORS origin, and Cloudinary keys in `.env`. Do not commit that file. Placeholder names are listed in `.env.example`. Image upload needs Cloudinary; catalog reads, login, and orders do not.

`CORS_ORIGIN` is a comma-separated allow-list. Local Vite is `http://localhost:5173`. The live storefront origin is `https://mart-frontend.netlify.app`.

```bash
npm test
npm run seed:demo
```

## Deployment

Render settings, start command, and the environment variable list are in [DEPLOYMENT.md](./DEPLOYMENT.md). `render.yaml` is the Blueprint. Put secrets in the Render dashboard, not in this README. Leave `SEED_DEMO_ACCOUNTS` unset to publish the demo logins above, or set it to `false` when this database should not receive them.
