# myui — مكتبة لوحة تحكم Admin

مكتبة React جاهزة لواجهة الإدارة (Admin Dashboard) مبنية على Tailwind CSS، مع دعم **العربية / RTL** والوضع الداكن.

مستخرجة من مشروع العسكريان وقابلة لإعادة الاستخدام في أي مشروع React مستقبلي.

## التثبيت في مشروع جديد

### 1) ربط المكتبة محلياً (موصى به للتطوير)

```bash
cd C:\Users\AL-NABAA\Desktop\myui
npm install
npm run build
```

في مشروعك:

```bash
npm install C:\Users\AL-NABAA\Desktop\myui
```

أو في `package.json`:

```json
"dependencies": {
  "myui": "file:../myui"
}
```

### 2) استيراد الأنماط

```ts
import "myui/styles.css"
```

### 3) الاستخدام السريع (صفحة admin كاملة)

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AdminProvider, AdminApp } from "myui"

function App() {
  const [isRTL, setIsRTL] = useState(true)

  return (
    <AdminProvider apiBaseUrl="">
      <BrowserRouter>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminApp
                isRTL={isRTL}
                onToggleLanguage={() => setIsRTL((v) => !v)}
                homePath="/"
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  )
}
```

### 4) استخدام يدوي (تسجيل دخول + لوحة منفصلة)

```tsx
import { AdminProvider, AdminLogin, AdminDashboard } from "myui"

<AdminProvider apiBaseUrl="https://api.example.com">
  {authenticated ? (
    <AdminDashboard
      onLogout={handleLogout}
      isRTL={isRTL}
      onToggleLanguage={toggleLang}
    />
  ) : (
    <AdminLogin
      isRTL={isRTL}
      onLogin={handleLogin}
      validateLogin={async (user, pass) => {
        const res = await fetch("/api/auth/login", { ... })
        return res.ok ? token : null
      }}
    />
  )}
</AdminProvider>
```

## واجهة API المتوقعة من الخادم

| المسار | الوصف |
|--------|--------|
| `GET/POST /api/config` | إعدادات الموقع |
| `GET /api/health` | حالة الأنظمة |
| `GET /api/logs` | السجلات |
| `GET/POST/PUT/DELETE /api/products` | المنتجات |
| `GET/PATCH/DELETE /api/requests` | الطلبات |

يمكن تغيير البادئة عبر `apiBaseUrl` في `AdminProvider`.

## المكوّنات المُصدَّرة

| التصدير | الوصف |
|---------|--------|
| `AdminProvider` | Theme + Toaster + SiteConfig |
| `AdminApp` | تسجيل دخول + لوحة مع localStorage |
| `AdminLogin` | صفحة الدخول |
| `AdminDashboard` | لوحة التحكم الكاملة |
| `SiteConfigProvider` / `useSiteConfig` | إعدادات المحتوى |
| `AddUserPopup`, `ProductPopup`, … | نوافذ منبثقة |
| `cn`, `apiFetch`, `setApiBase` | أدوات مساعدة |

## بناء المكتبة

```bash
npm run build
```

الناتج في مجلد `dist/`:
- `index.js` — المكوّنات
- `index.d.ts` — الأنواع
- `myui.css` — أنماط Tailwind

## متطلبات المشروع المضيف

- React 18+
- react-router-dom 6+
- Tailwind CSS 4 (أو استيراد `myui/styles.css` فقط)
- `next-themes` و `sonner` (peer عبر dependencies)

## بيانات الدخول الافتراضية (تجريبية)

`admin` / `admin123` — استبدلها بـ `validateLogin` في الإنتاج.

## الترخيص

MIT
