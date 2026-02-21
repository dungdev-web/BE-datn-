# BE-DATN — Ecommerce Backend

Backend RESTful API cho hệ thống thương mại điện tử về giày, xây dựng theo kiến trúc **Clean Architecture + DDD (Domain-Driven Design)**.

---

## Tech Stack

| Công nghệ | Mục đích |
|-----------|---------|
| Node.js + TypeScript | Runtime & ngôn ngữ chính |
| Prisma ORM | Truy vấn database |
| Docker + Docker Compose | Container hóa môi trường |
| PostgreSQL / MySQL | Database chính |
| ZaloPay API | Cổng thanh toán trực tuyến |

---

## Cấu trúc thư mục

```
BE-DATN/
│
├── src/
│   ├── adapter/              ← Chuyển đổi dữ liệu giữa các tầng (DTO ↔ Domain)
│   │
│   ├── application/          ← Application layer: điều phối use case, business flow
│   │
│   ├── config/
│   │   └── db.js             ← Cấu hình kết nối database
│   │
│   ├── domain/               ← Tầng core: business logic thuần túy
│   │   ├── product/          ← Entity, Value Object, Domain Service cho Product
│   │   └── user/             ← Entity, Value Object, Domain Service cho User
│   │   ...
│   ├── entrypoint/
│   │   ├── index.js          ← Khởi động ứng dụng
│   │   └── server.js         ← Cấu hình Express server, middleware, routes
│   │
│   ├── infrastructure/
│   │   ├── repository/       ← Triển khai Repository (Prisma, DB queries)
│   │   └── usecase/          ← Triển khai Use Case cụ thể
│   │
│   |
│   │
│   ├── shared/               ← Utilities dùng chung: errors, constants, helpers
│   │
│   └── utils/                ← Hàm tiện ích: hash, token, format, ...
│
├── prisma/                   ← Schema database & migrations (Prisma)
│
├── uploads/                  ← File upload tạm thời (ảnh sản phẩm, ...)
│
├── .env                      ← Biến môi trường (không commit)
├── .env.examble              ← Mẫu biến môi trường
├── .dockerignore
├── .gitignore
├── compose.yaml              ← Docker Compose config
├── Dockerfile
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## Kiến trúc Clean Architecture

```
┌─────────────────────────────────────────┐
│           adapter/api                   │  ← HTTP Controllers, Routes
├─────────────────────────────────────────┤
│           application/                  │  ← Use Cases, Orchestration
├─────────────────────────────────────────┤
│           domain/                       │  ← Business Logic (không phụ thuộc gì)
├─────────────────────────────────────────┤
│    infrastructure/    │    adapter/     │  ← DB, External Services, Mapping
└─────────────────────────────────────────┘
```

> Tầng trong **không** phụ thuộc tầng ngoài. Dependency chỉ đi từ ngoài vào trong.

---

## Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL (hoặc dùng Docker)

### 1. Clone & cài dependencies

```bash
git clone https://github.com/your-username/BE-DATN.git
npm install
```

### 2. Cấu hình môi trường

```bash
cp .env.examble .env
# Mở .env và điền thông tin thực tế
```

Các biến môi trường cần thiết:

```env
# Database
DATABASE_URL="mysql://root:@localhost:3306/terashoes"
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="tera"
BASE_URL=
# Server
PORT=3000
#Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
GOOGLE_REDIRECT_URI=
# JWT
JWT_SECRET=your_super_secret_key

# Url
FRONTEND_URL=

# ZaloPay
ZALOPAY_APP_ID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2
ZALOPAY_CALLBACK_URL=https://yourdomain.com/api/payment/zalopay/callback
NGROK_URL=
#Mail
RESEND_API_KEY=
MAIL_FROM=onboarding@resend.dev
MAIL_RECEIVER=dung.dev.web@gmail.com
#Api key chat bot
OPENAI_API_KEY=
```

### 3. Chạy với Docker (khuyến nghị)

```bash
docker compose up -d
```

### 4. Chạy thủ công

```bash
# Migrate database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Development (hot-reload)
npm run dev

# Production
npm run build && npm start
```

---

## Prisma Database

```bash
# Tạo migration mới
npx prisma migrate dev --name ten_migration

# Xem database qua UI
npx prisma studio

# Reset database (xoá hết data)
npx prisma migrate reset

# Seed data mẫu
npx prisma db seed
```

---

## Some API Endpoints (tổng quan)

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/user/auth/register` | Đăng ký tài khoản |
| POST | `/user/auth/login` | Đăng nhập |
| POST | `/user/auth/check-token` | Kiểm tra token |
| POST | `/user/auth/logout` | Đăng xuất |
| POST | `/user/google/callback` | Đăng nhập google |
...
### User
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/users/profile/:userId` | Thông tin cá nhân |
| PUT | `/users/addresses/:addressId` | Cập nhật địa chỉ giao hàng |
| PUT | `/users/update` | Upload hình đại diện hồ sơ |
| GET | `/users/orders/:orderId` | Lấy danh sách đơn hàng |
| GET | `/users/addresses/:userId` | Lấy danh sách địa chỉ giao hàng |
...
### Product
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/product` | Danh sách sản phẩm |
| GET | `/product/detail/:id` | Chi tiết sản phẩm |
| GET | `/product/detail/slug` | Chi tiết sản phẩm |
| POST | `/product/add-product` | Tạo sản phẩm (Admin) |
| PUT | `/product/update-product/:id` | Cập nhật sản phẩm (Admin) |
| DELETE | `/product/delete/:id` | Xoá sản phẩm (Admin) |
...
### Payment — ZaloPay
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/payment/checkout` | Tạo đơn thanh toán ZaloPay hoặc thanh toán bằng tiền mặt|
| POST | `/payment/callback` | Nhận kết quả từ ZaloPay (webhook) |
| POST | `/payment/order-status/:app_trans_id` | Truy vấn trạng thái giao dịch |

---

## Luồng thanh toán ZaloPay

```
[Client] ──POST /create──→ [Backend]
                                │
                    Ký HMAC_SHA256 bằng key1
                                │
                                ▼
                         [ZaloPay API]
                                │
                    Trả về order_url + zp_trans_token
                                │
                                ▼
              [Client redirect → Trang thanh toán ZaloPay]
                                │
                    User thanh toán thành công
                                │
                                ▼
              [ZaloPay gọi callback_url của Backend]
                                │
                    Verify HMAC bằng key2
                    Cập nhật trạng thái đơn hàng
                                │
                                ▼
                         [Order: PAID ]
```

### Sandbox testing

ZaloPay cung cấp môi trường sandbox để test trước khi lên production:

```env
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2   # Sandbox
# ZALOPAY_ENDPOINT=https://openapi.zalopay.vn/v2    # Production
```

Thông tin tài khoản sandbox lấy tại: [https://developers.zalopay.vn](https://developers.zalopay.vn)

---

## Scripts

```bash
npm run dev        # Chạy development với hot-reload
npm run build      # Build TypeScript → JavaScript
npm start          # Chạy production build
npm run lint       # Kiểm tra lỗi ESLint
npm run lint:fix   # Tự động sửa lỗi ESLint
npm test           # Chạy unit tests
```

---

## Quy ước code

- Tên file: `camelCase.ts`
- Tên class: `PascalCase`
- Tên biến/hàm: `camelCase`
- Commit message: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

