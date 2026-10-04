# Taskline — سیستم مدیریت تسک و پروژه

اپلیکیشن مدیریت پروژه و تسک به‌سبک **کانبان** با فرانت‌اند **React (Vite)** و بک‌اند **Laravel + Sanctum**.

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
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── config/
│   ├── .env.example
│   └── composer.json
├── FrontEnd/         # فرانت React (Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
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

# نصب وابستگی‌ها
composer install

# ساخت فایل محیط
cp .env.example .env

# تولید کلید اپلیکیشن
php artisan key:generate

# ساخت دیتابیس SQLite (در صورت استفاده از SQLite)
touch database/database.sqlite

# اجرای مایگریشن‌ها
php artisan migrate

# (اختیاری) اجرای سیدر برای داده نمونه
php artisan db:seed

# اجرای سرور
php artisan serve
```

API روی آدرس زیر در دسترس خواهد بود:

```text
http://127.0.0.1:8000
```

---

## راه‌اندازی فرانت‌اند (React)

```bash
cd FrontEnd

# نصب وابستگی‌ها
npm install

# اجرای حالت توسعه
npm run dev
```

فرانت معمولاً روی پورت Vite (مثلاً `http://localhost:5173`) بالا می‌آید.

> پروکسی Vite طوری تنظیم شده که درخواست‌های `/api` به بک‌اند لاراول (`http://127.0.0.1:8000`) هدایت شوند. پس حتماً بک‌اند باید روشن باشد.

### ساخت نسخه نهایی (Production)

```bash
npm run build
```

---

## تنظیمات محیط (.env)

در پوشه `BackEnd` فایل `.env` را از روی `.env.example` بسازید و مقادیر مهم را تنظیم کنید:

```env
APP_NAME=Taskflow
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=sqlite
# یا برای MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=taskflow
# DB_USERNAME=root
# DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
```

---

## API اصلی

همه روت‌های زیر (به‌جز register و login) نیاز به احراز هویت Sanctum دارند.

### احراز هویت
| متد | مسیر | توضیح |
|-----|------|--------|
| POST | `/api/auth/register` | ثبت‌نام |
| POST | `/api/auth/login` | ورود |
| POST | `/api/auth/logout` | خروج |
| GET | `/api/auth/me` | اطلاعات کاربر فعلی |

### پروژه‌ها
| متد | مسیر | توضیح |
|-----|------|--------|
| GET | `/api/projects` | لیست پروژه‌ها |
| POST | `/api/projects` | ایجاد پروژه |
| PATCH | `/api/projects/{id}` | ویرایش پروژه |
| DELETE | `/api/projects/{id}` | حذف پروژه |
| GET | `/api/projects/{id}/board` | دریافت بورد پروژه |

### ستون‌ها و تسک‌ها
| متد | مسیر | توضیح |
|-----|------|--------|
| POST | `/api/projects/{id}/columns` | ایجاد ستون |
| PATCH | `/api/columns/{id}` | ویرایش ستون |
| DELETE | `/api/columns/{id}` | حذف ستون |
| POST | `/api/columns/{id}/tasks` | ایجاد تسک |
| GET | `/api/tasks/{id}` | جزئیات تسک |
| PATCH | `/api/tasks/{id}` | ویرایش تسک |
| DELETE | `/api/tasks/{id}` | حذف تسک |

### سایر
| متد | مسیر | توضیح |
|-----|------|--------|
| POST | `/api/tasks/{id}/checklist` | افزودن آیتم چک‌لیست |
| POST | `/api/tasks/{id}/comments` | افزودن کامنت |
| POST | `/api/tasks/{id}/attachments` | آپلود پیوست |
| GET/POST | `/api/projects/{id}/labels` | برچسب‌ها |
| GET/POST | `/api/projects/{id}/members` | اعضای پروژه |
| POST | `/api/users/invite` | دعوت کاربر |

---

## تکنولوژی‌ها

**بک‌اند**
- Laravel ۱۳
- Laravel Sanctum (احراز هویت API)
- PHP ۸.۳+

**فرانت‌اند**
- React ۱۹
- Vite ۸
- @dnd-kit (درگ‌اند‌دراپ)
- jalaali-js (تقویم جلالی)

---

## نکات مهم

1. فولدرهای `vendor` و `node_modules` در ریپو نیستند؛ باید با `composer install` و `npm install` نصب شوند.
2. فایل `.env` را هرگز در گیت کامیت نکنید.
3. برای استفاده از MySQL به‌جای SQLite، تنظیمات دیتابیس را در `.env` تغییر دهید و سپس `php artisan migrate` را اجرا کنید.
4. در محیط Production مقدار `APP_DEBUG` را `false` بگذارید و `APP_KEY` را امن نگه دارید.

---

## مجوز

این پروژه تحت مجوز MIT منتشر شده است.
