# دليل إعداد وتكامل Firebase لمشروع MOHAMED KHAMIS

## 1. بيانات المشروع الحالية المسجلة
- **Firebase Project Name:** `MOHAMED-KHAMIS`
- **Firebase Project ID:** `mohamed-khamis`
- **Auth Domain:** `mohamed-khamis.firebaseapp.com`
- **Storage Bucket:** `mohamed-khamis.firebasestorage.app`
- **Messaging Sender ID:** `534587371999`
- **Firebase Web App ID:** `1:534587371999:web`

---

## 2. حساب المدير الرئيسي المعتمد (Super Admin)
- **المدير:** محمد خميس
- **المعرف الفريد (UID):** `6kUrmstc69T4AnwhoUJ4ZrFbRez2`
- **مسار السجل:** `admins/6kUrmstc69T4AnwhoUJ4ZrFbRez2`
- **البيانات المسجلة:**
  ```json
  {
    "name": "محمد خميس",
    "role": "super_admin",
    "active": true,
    "permissions": {
      "manageProjects": true,
      "manageServices": true,
      "manageRequests": true,
      "manageMessages": true,
      "manageTestimonials": true,
      "manageFaqs": true,
      "manageSettings": true,
      "viewStats": true
    }
  }
  ```

---

## 3. إعدادات الموقع الأساسية في Firestore
المسار: `settings/public`
```json
{
  "siteName": "MOHAMED KHAMIS",
  "tagline": "التكنولوجيا تبدأ بفكرة، ونحن نحولها إلى واقع",
  "defaultLanguage": "ar",
  "defaultTheme": "dark",
  "maintenanceMode": false,
  "contactEmail": "mohamkhamis209@gmail.com",
  "workPhone": "",
  "workWhatsapp": "",
  "version": 1
}
```

---

## 4. مجموعات البيانات (Firestore Collections)
1. `admins`: سجلات المديرين وصلاحياتهم.
2. `projects`: المشروعات المنشورة ومعلوماتها الفنية.
3. `services`: الخدمات الرقمية الـ 20.
4. `testimonials`: تقييمات العملاء الحقيقية فقط.
5. `faqs`: الأسئلة الشائعة وإجاباتها.
6. `requests`: طلبات المشاريع الواردة من العملاء (مؤمنة، القراءة للإدارة فقط).
7. `messages`: الرسائل والاستفسارات الواردة (مؤمنة، القراءة للإدارة فقط).
8. `settings`: إعدادات الموقع العامة.
9. `analytics`: إحصائيات الزيارات والتفاعل.
10. `auditLogs`: سجل العمليات الإدارية والرقابية.

---

## 5. نشر قواعد الأمان (Firestore Rules)
توجد القواعد المجهزة في ملف `firestore.rules`.
لنشرها عبر Firebase CLI:
```bash
firebase deploy --only firestore:rules
```
أو عبر نسخ محتوى ملف `firestore.rules` ولصقه مباشرة في تبويب **Rules** داخل لوحة تحكم Firestore Console ثم الضغط على **Publish**.
