# Taskline — سیستم مدیریت تسک و پروژه

اپلیکیشن مدیریت پروژه و تسک به‌سبک **کانبان** با فرانت‌اند **React (Vite)** و بک‌اند **Laravel + Sanctum**.

---

## شروع سریع

دو ترمینال باز کنید:

**ترمینال ۱ — بک‌اند**

```bash
cd BackEnd
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve
```

**ترمینال ۲ — فرانت‌اند**

```bash
cd FrontEnd
npm install
npm run dev
```

سپس مرورگر را روی آدرس Vite (معمولاً `http://localhost:5173`) باز کنید. بک‌اند روی `http://127.0.0.1:8000` است.

---

## ویژگی‌ها

- بورد کانبان با قابلیت درگ‌اند‌دراپ (Drag & Drop)
- مدیریت پروژه‌ها، ستون‌ها (Columns) و تسک‌ها
- برچسب‌ها (Labels) برای دسته‌بندی تسک‌ها
- چک‌لیست داخل هر تسک
- کامنت‌گذاری روی تسک
- پیوست فایل به تسک
- تقویم جلالی
- احراز هویت با توکن (Laravel Sanctum)
- دعوت کاربر با ایمیل (توسط ادمین)
- مدیریت نقش کاربران
- مدیریت اعضای پروژه

---

## ساختار پروژه

```text
Task-Manager/
├── BackEnd/          # API لاراول
├── FrontEnd/         # فرانت React (Vite)
├── .gitignore
└── README.md
```

---

## پیش‌نیازها

| ابزار | نسخه پیشنهادی |
|--------|----------------|
| PHP | ۸.۳ یا بالاتر |
| Composer | ۲.x |
| Node.js | ۱۸ یا بالاتر |
| npm | ۹ یا بالاتر |
| دیتابیس | SQLite (پیش‌فرض) یا MySQL/PostgreSQL |

---

## راه‌اندازی بک‌اند (Laravel)

```bash
cd BackEnd
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan db:seed   # اختیاری
php artisan serve
```

API: `http://127.0.0.1:8000`

---

## راه‌اندازی فرانت‌اند (React)

```bash
cd FrontEnd
npm install
npm run dev
```

> پروکسی Vite درخواست‌های `/api` را به لاراول می‌فرستد؛ بک‌اند باید روشن باشد.

ساخت نسخه نهایی:

```bash
npm run build
```

---

## تنظیمات محیط (.env)

```env
APP_NAME=Taskflow
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=sqlite
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
```

برای MySQL به‌جای SQLite، مقادیر `DB_*` را در `.env` تنظیم کنید.

---

## API اصلی

مسیرهای احراز هویت‌شده نیاز به توکن Sanctum دارند.

| متد | مسیر | توضیح |
|-----|------|--------|
| POST | `/api/auth/register` | ثبت‌نام |
| POST | `/api/auth/login` | ورود |
| GET | `/api/projects` | لیست پروژه‌ها |
| POST | `/api/projects` | ایجاد پروژه |
| PATCH | `/api/projects/{id}` | ویرایش پروژه |
| GET | `/api/projects/{id}/board` | بورد پروژه |
| POST | `/api/columns/{id}/tasks` | ایجاد تسک |
| PATCH | `/api/tasks/{id}` | ویرایش تسک |

جزئیات بیشتر روت‌ها در `BackEnd/routes/api.php` است.

---

## تکنولوژی‌ها

**بک‌اند:** Laravel ۱۳ · Sanctum · PHP ۸.۳+  
**فرانت‌اند:** React ۱۹ · Vite ۸ · @dnd-kit · jalaali-js

---

## نکات مهم

1. `vendor` و `node_modules` در ریپو نیستند؛ با `composer install` و `npm install` نصب شوند.
2. فایل `.env` را کامیت نکنید.
3. در Production مقدار `APP_DEBUG=false` بگذارید.

---

مجوز: MIT
