# A Sports Zone — App Features & Options

## Storefront (Customer-Facing)

### Homepage (`/`)
- Hero banner with featured product
- Feature band: Free shipping · Authentic gear · Easy returns · Expert advice
- CMS-managed blocks (banners, rich text — editable from Admin → Content)
- Browse by category grid
- Bat collections (Player Editions, Grade 1 Willow, Big Blade, Lite Weight)
- Featured products (8 items)
- **Where The Trust Builds** — photo/video/short wall published from admin
- Trusted brands ticker
- Visit the store section with map link & store hours

### Catalog (`/catalog`)
- Browse all 46 products across 6 categories
- **Categories:** Cricket Bats · Combos & Full Kits · Kit Bags · Cricket Shoes · Batting Protection · Accessories
- Search by keyword
- Filter by category chips
- Filter by price range (Any / Under ₹1k / ₹1k–₹5k / ₹5k–₹20k / Over ₹20k)
- Spec facet filters (dynamic per product specs)
- Sort: Newest · Price ↑ · Price ↓ · Top rated
- Pagination (12 items/page)

### Product Page (`/product/[slug]`)
- Product images, name, price (INR)
- Add to cart / Add to wishlist
- Product specs (EAV)
- Customer reviews with star ratings
- Related products

### Cart & Checkout
- Cart drawer (slide-out) with quantity controls
- Checkout page (`/checkout`) — shipping address, coupon code, gift card
- Payment via Razorpay (INR) or Stripe (global)
- Mock payment mode when keys not configured

### Account (`/account`)
- View order history with status badges
- Loyalty points balance + referral link
- Data export (GDPR — downloads account JSON)
- Delete account
- Sign out

### Wishlist (`/wishlist`)
- Save products, view saved items, add to cart from wishlist

### Authentication
- Email + password sign-in / sign-up
- **Google (Gmail) login** — "Continue with Google" on sign-in & sign-up pages
  - Requires `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` in `.env` (see setup below)
- GitHub login (same env var pattern)
- Automatic CUSTOMER account creation on first OAuth sign-in

### Other
- PWA (installable, push notification support)
- Multi-currency display (INR default)
- Sitemap (`/sitemap.xml`) + robots (`/robots.txt`)
- 404 / not-found page

---

## Admin Panel (`/admin`) — Requires ADMIN role

### Dashboard (`/admin`)
- Revenue (paid), Orders, Products, Customers at a glance
- Low-stock warning count

### Products (`/admin/products`)
- List all products with search & pagination
- Create new product (name, slug, price, category, image URL, stock, specs JSON, featured flag, active flag)
- Edit product (all fields + inline stock adjustment)
- Delete product
- Bulk CSV export → `/api/v1/admin/products/export`
- CSV import → `/api/v1/admin/products/import`

### Orders (`/admin/orders`)
- List all orders with status filter (PENDING / PAID / SHIPPED / DELIVERED / CANCELLED / REFUNDED)
- Order detail page: items, customer, shipping address, payment info
- Update order status with allowed transitions
- Refund processing (auto-restocks inventory)
- Live order stream via SSE (`/admin`)

### Customers (`/admin/customers`)
- List customers with email search
- View order count per customer

### Analytics (`/admin/analytics`)
- KPIs (last 30 days): Revenue · Avg order value · Paid orders · Conversion % · New customers · Repeat customer %
- Revenue & orders chart (daily breakdown)
- Live order feed widget

### Marketing (`/admin/marketing`)
- **Coupons:** create PERCENT / FIXED / FREE_SHIPPING coupons, set min spend, max redemptions, toggle active/inactive
- **Gift cards:** generate codes with custom INR amounts

### Content (`/admin/cms`)
- Create CMS pages with rich blocks
- Block types: Banner · Rich text · Collection · (expandable)
- Published blocks appear on homepage or any page slot

### Suppliers (`/admin/suppliers`)
- List suppliers (name, email, phone, PO count)
- Add new supplier
- **Edit supplier inline** (name, email, phone)
- **Delete supplier**
- Auto-reorder: create a draft Purchase Order for all low-stock items at 4× threshold
- Purchase orders list with status (DRAFT / RECEIVED / CANCELLED)

### Reviews (`/admin/reviews`)
- List all customer reviews
- Delete/moderate reviews (updates product rating aggregate)

### Trust Wall (`/admin/trust-wall`)
- Publish to the "Where The Trust Builds" homepage section
- Post types: **Photo** (image URL) · **Video** (YouTube link) · **Short / Reel** (YouTube Shorts)
- **Upload video file directly** (MP4, WebM, MOV — overrides URL field)
- Toggle visibility (Show / Hide) per post
- Delete posts
- Position ordering (auto-increments)

---

## Google OAuth Setup (to enable Gmail login)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Credentials → Create credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs:
   - Dev: `http://localhost:3000/api/v1/auth/callback/google`
   - Prod: `https://yourdomain.com/api/v1/auth/callback/google`
5. Copy **Client ID** and **Client Secret**
6. Edit `.env`:
   ```
   AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
   AUTH_GOOGLE_SECRET="your-client-secret"
   ```
7. Restart the dev server — Google button becomes functional immediately

---

## Environment Variables Quick Reference

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `AUTH_SECRET` | NextAuth JWT signing key |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Gmail login |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub login |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | INR payments |
| `STRIPE_SECRET_KEY` | Global payments |
| `ANTHROPIC_API_KEY` | AI features (chat assistant, analytics insights) |
| `S3_*` | File/image storage (MinIO or AWS S3) |
| `RESEND_API_KEY` | Transactional email |
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics tracking |

---

## Roles

| Role | Access |
|---|---|
| `CUSTOMER` | Storefront, account, orders, wishlist |
| `STAFF` | + Orders read/write, reviews moderation |
| `ADMIN` | Everything including products, analytics, marketing, CMS, suppliers, trust wall |
