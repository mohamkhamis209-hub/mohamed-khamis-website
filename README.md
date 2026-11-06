# MOHAMED KHAMIS — الموقع الرسمي والهوية الرقمية المتكاملة
## Technology & Innovation Specialist | متخصص في التكنولوجيا والابتكار

> **"التكنولوجيا تبدأ بفكرة، ونحن نحولها إلى واقع."**  
> **"Your Vision. Our Technology."**

---

## 📌 عن المشروع

هذا المشروع هو منصة وهوية رقمية متكاملة لـ **محمد خميس (Mohamed Khamis)**، المتخصص في التكنولوجيا والابتكار وهندسة الحلول الرقمية. تم تصميم المنصة بمستوى شركات التقنية والاستشارات العالمية باتباع نمط الفخامة الهادئة (**Minimal Luxury**)، وتضم:

- **20 مجال تنفيذ رقمي معتمد** (تصميم المواقع، تطبيقات الهاتف، أنظمة ERP، الذكاء الاصطناعي، الأتمتة...).
- **5 مشاريع وتجارب برمجية واقعية** (MOJA/MJ بلغة Rust، قسمة QESMA، مساعد Mizoma AI، ومنصة منصتك التعليمية، وZOMA Student).
- **نظام كامل ثنائي اللغة (عربي RTL وإنجليزي LTR)** مع حفظ التفضيل والتبديل اللحظي.
- **دعم Dark Mode الافتراضي مع Light Mode**.
- **نموذج استقبال طلبات العملاء الآمن** عبر وظائف Netlify Serverless مع توليد أرقام تتبع فريدة (`MK-REQ-YYYY-XXXXX`).
- **لوحة تحكم إدارية مستقلة ومؤمنة بالكامل** على المسار `/admin` باستخدام Firebase Authentication وصلاحيات Firestore الدقيقة.
- **رفع الصور الإداري** عبر ImgBB مع إخفاء تام لمفتاح الـ API داخل متغيرات بيئة Netlify.
- **تطبيق ويب تقدمي (PWA)** قابل للتثبيت على كافة الأجهزة مع Service Worker ذكي يتجاهل مسارات الإدارة الحساسة.

---

## 🏗️ البنية التقنية (Architecture)

```text
/
├── index.html                  # البوابة الرئيسية وكافة الأقسام
├── about.html                  # صفحة من أنا (النبذة التعريفية الموثقة)
├── services.html               # فهرس الخدمات العشرين مع فلاتر تفاعلية
├── projects.html               # معرض المشاريع والتجارب الخمس
├── request.html                # نموذج طلب تنفيذ مشروع وحساب التكلفة
├── contact.html                # قنوات التواصل ونموذج الرسائل المباشرة
├── privacy.html                # سياسة الخصوصية وحماية البيانات
├── terms.html                  # شروط الاستخدام والملكية الفكرية
├── 404.html                    # صفحة الخطأ 404 الفاخرة
├── manifest.webmanifest        # إعدادات تثبيت تطبيق الـ PWA
├── sw.js                       # Service Worker للكاش الآمن
├── firestore.rules             # قواعد أمان Firestore الصارمة
├── netlify.toml                # إعدادات الاستضافة والتوجيه وHeaders الأمان
│
├── assets/
│   ├── css/                    # التصميم والألوان والخطوط والانسيابية
│   ├── js/                     # النواة البرمجية، الترجمة، التهيئة، النماذج
│   ├── images/                 # الصورة الشخصية الأصلية، الشعار، أغلفة المشاريع
│   └── icons/                  # أيقونات التطبيق والـ PWA
│
├── admin/                      # لوحة التحكم والإدارة المستقلة
│   ├── index.html              # واجهة لوحة الإدارة (SPA)
│   └── assets/                 # منطق المصادقة والتحكم والرفع إلى ImgBB
│
├── netlify/functions/          # وظائف الخادم السحابية Serverless Functions
│   ├── submit-request.mjs      # استقبال وتدقيق وحفظ طلبات المشاريع
│   ├── submit-message.mjs      # استقبال وحفظ رسائل التواصل
│   ├── upload-image.mjs        # وسيط رفع الصور إلى ImgBB من الخادم
│   └── admin-api.mjs           # معالج العمليات الإدارية والتحقق من التوكن
│
└── docs/                       # الأدلة التقنية الشاملة
    ├── FIREBASE_SETUP.md       # دليل ربط وتجهيز Firebase
    ├── ENV_VARS.md             # دليل متغيرات البيئة السرية
    ├── IMGBB_SETUP.md          # دليل مفتاح ImgBB
    └── TEST_REPORT.md          # تقرير الاختبارات العشرين الكامل
```

---

## 🚀 طريقة التشغيل محلياً (Local Development)

### المتطلبات:
- Node.js (الإصدار 18 فما فوق).
- أي خادم ويب ثابت (مثل `npx serve` أو Live Server في VS Code).

### خطوات التشغيل:
```bash
# 1. الدخول إلى مجلد المشروع
cd D:\Mohamed

# 2. تشغيل خادم محلي
npx serve . -p 8080
```
افتح المتصفح على: `http://localhost:8080`

---

## 🌐 النشر التلقائي على Netlify

المشروع مهيأ ومربوط بمستودع GitHub:
- **Repository:** `mohamkhamis209-hub/mohamed-khamis-website`
- **Branch:** `main`
- **Netlify Site:** `https://websitemohamedkhamis.netlify.app`

عند دفع التعديلات إلى فرع `main`، يقوم Netlify تلقائياً ببناء ونشر الموقع ودوال `netlify/functions`.

---

## 🔐 إعداد متغيرات البيئة في Netlify

من لوحة تحكم Netlify:
`Site configuration` -> `Environment variables` -> أضف القيم التالية:

1. `FIREBASE_SERVICE_ACCOUNT`:
   كود الـ JSON الكامل الخاص بمفتاح خدمة Firebase Admin SDK لمشروع `mohamed-khamis`.
2. `IMGBB_API_KEY`:
   مفتاح الـ API الخاص بحسابك في ImgBB لاستضافة الصور.

*(راجع ملف `docs/ENV_VARS.md` للشرح المفصل خطوة بخطوة).*

---

## 🛡️ أمان البيانات ولوحة الإدارة `/admin`

- **حساب المدير الرئيسي:**
  - `UID`: `6kUrmstc69T4AnwhoUJ4ZrFbRez2`
  - تم تأمين قواعد البيانات لمنع أي زائر من قراءة الطلبات أو الرسائل أو تعديل البيانات الإدارية.
  - لا يتم قبول أي طلب إداري دون التحقق من صلاحيات المدير على الخادم (`admin-api.mjs`).

---

## 📞 قنوات الدعم والتواصل
- **البريد الإلكتروني:** [mohamkhamis209@gmail.com](mailto:mohamkhamis209@gmail.com)
- **الموقع الإلكتروني:** [websitemohamedkhamis.netlify.app](https://websitemohamedkhamis.netlify.app)
