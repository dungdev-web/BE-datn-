# BE-DATN — Ecommerce Backend

Backend RESTful API cho hệ thống thương mại điện tử, xây dựng theo kiến trúc **Clean Architecture + DDD (Domain-Driven Design)**.

---

## Tech Stack

| Công nghệ | Mục đích |
|-----------|---------|
| Node.js + TypeScript | Runtime & ngôn ngữ chính |
| Prisma ORM | Truy vấn database |
| Docker + Docker Compose | Container hóa môi trường |
| PostgreSQL / MySQL | Database chính |

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
│   │
│   ├── entrypoint/
│   │   ├── index.js          ← Khởi động ứng dụng
│   │   └── server.js         ← Cấu hình Express server, middleware, routes
│   │
│   ├── infrastructure/
│   │   ├── repository/       ← Triển khai Repository (Prisma, DB queries)
│   │   └── usecase/          ← Triển khai Use Case cụ thể
│   │
│   ├── interfaces/           ← Controllers, Route handlers (HTTP interface)
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
│           interfaces/                   │  ← HTTP Controllers, Routes
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
cd BE-DATN
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
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5mb
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

## API Endpoints (tổng quan)

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Làm mới token |
| POST | `/api/auth/logout` | Đăng xuất |

### User
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/users/me` | Thông tin cá nhân |
| PUT | `/api/users/me` | Cập nhật hồ sơ |

### Product
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| POST | `/api/products` | Tạo sản phẩm (Admin) |
| PUT | `/api/products/:id` | Cập nhật sản phẩm (Admin) |
| DELETE | `/api/products/:id` | Xoá sản phẩm (Admin) |

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


