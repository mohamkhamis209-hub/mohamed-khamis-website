# دليل متغيرات البيئة السرية (Environment Variables)

لحماية أمان النظام وضمان عدم كشف أي مفاتيح سرية داخل ملفات الواجهة العامة أو مستودع GitHub، يعتمد الموقع على إعداد المتغيرات السرية مباشرة داخل لوحة تحكم **Netlify**.

---

## 🔑 قائمة المتغيرات المطلوبة:

### 1. `FIREBASE_SERVICE_ACCOUNT` (إلزامي للـ Backend)
- **الوصف:** ملف مفتاح الحساب الخدمي (Firebase Service Account Key) الخاص بـ Firebase Admin SDK لمشروع `mohamed-khamis`.
- **الصيغة:** نص JSON كامل يحتوي على:
  ```json
  {
    "type": "service_account",
    "project_id": "mohamed-khamis",
    "private_key_id": "...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-...@mohamed-khamis.iam.gserviceaccount.com",
    "client_id": "...",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "..."
  }
  ```
- **كيفية استخراجه:**
  1. ادخل إلى [Firebase Console](https://console.firebase.google.com/).
  2. اختر مشروع **mohamed-khamis**.
  3. اضغط على أيقونة الترس ⚙️ بجوار Project Overview واختر **Project settings**.
  4. انتقل إلى تبويب **Service accounts**.
  5. اضغط على زر **Generate new private key** وقم بتحميل الملف.
  6. افتح الملف المنسوخ وانسخ محتواه كاملاً كقيمة لمتغير `FIREBASE_SERVICE_ACCOUNT` في Netlify.

---

### 2. `IMGBB_API_KEY` (إلزامي لرفع الصور)
- **الوصف:** مفتاح الـ API الخاص بحسابك في ImgBB.
- **كيفية الحصول عليه:**
  1. سجّل الدخول إلى [ImgBB API](https://api.imgbb.com/).
  2. انسخ مفتاح الـ API الخاص بك وأضفه في Netlify.

---

### 3. متغيرات البريد الإلكتروني (اختياري)
- `EMAIL_PROVIDER_API_KEY`: مفتاح خدمة إرسال الإشعارات البريدية (مثل Resend أو SendGrid).
- `ADMIN_NOTIFICATION_EMAIL`: البريد المراد استقبال الإشعارات عليه: `mohamkhamis209@gmail.com`.

---

## ⚙️ خطوات إضافة المتغيرات في Netlify:

1. ادخل إلى حسابك في [Netlify](https://app.netlify.com/).
2. اختر الموقع: **websitemohamedkhamis**.
3. من القائمة الجانبية، اختر **Site configuration**.
4. اختر **Environment variables**.
5. اضغط على **Add a variable** -> **Add a single variable**.
6. أدخل اسم المتغير وقيمته ثم احفظ التغييرات.
7. اضغط على **Deploy site** -> **Trigger deploy** لإعادة بناء الدوال مع المتغيرات الجديدة.
