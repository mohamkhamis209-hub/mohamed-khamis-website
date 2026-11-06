# MOHAMED KHAMIS Website

## الملفات
- موقع عربي متجاوب مع صورة الملف الشخصي التي أرسلتها.
- لوحة إدارة أساسية: تسجيل الدخول، إضافة/حذف المشاريع والخدمات، عرض الطلبات.
- Firebase Auth + Firestore.
- Netlify Functions لحفظ طلبات العملاء ورفع الصور إلى ImgBB.
- قواعد Firestore مقيدة.

## إعداد النشر
1. ارفع محتويات المجلد إلى GitHub ثم اربط المستودع بـ Netlify.
2. في Netlify: Publish directory = `.` وFunctions directory = `netlify/functions`.
3. أضف متغير البيئة `FIREBASE_SERVICE_ACCOUNT` في Netlify فقط، بقيمة JSON حساب خدمة Firebase. أنشئه من Firebase Console > Project settings > Service accounts. لا ترسله في المحادثات ولا تضعه في GitHub.
4. ألغِ مفتاح ImgBB الذي سبق كشفه، وأنشئ مفتاحًا جديدًا، ثم أضفه في Netlify باسم `IMGBB_API_KEY`. لا تضعه في ملفات الواجهة.
5. انشر `firestore.rules` من Firebase Console > Firestore > Rules.
6. تأكد أن `admins/6kUrmstc69T4AnwhoUJ4ZrFbRez2` موجود وبه `active: true` و`role: super_admin`.
7. أضف نطاق Netlify إلى Firebase Authentication > Settings > Authorized domains.
8. اختبر إرسال طلب تجريبي ثم تأكد من ظهوره في مجموعة `requests`.

## تنبيهات دقيقة
- إعداد Firebase Web في `assets/js/firebase.js` هو إعداد عميل عام وليس مفتاح Admin. قيّده بنطاق موقعك وواجهات Google المناسبة.
- لا تضع Service Account أو ImgBB API key في الواجهة أو GitHub.
- لا تسمح بإنشاء requests مباشرة من المتصفح؛ الوظيفة الخلفية تستخدم Admin SDK.
- وظيفة الطلبات بها حد أولي 8 طلبات لكل IP يوميًا؛ أضف Turnstile/CAPTCHA وخدمة rate-limit مناسبة قبل التوسع.
- وظيفة رفع الصور تحتاج `IMGBB_API_KEY` جديدًا.
- لوحة الإدارة في هذه النسخة تدعم أساسًا المشاريع والخدمات والاطلاع على الطلبات؛ بقية عناصر الإدارة المتقدمة (تعديل كامل، FAQ، آراء، إعدادات، رسائل، تحليلات) ليست مكتملة بعد.
- إشعارات البريد غير مفعّلة لعدم إعداد مزود بريد ومفاتيحه.
- لا تنشر رقم هاتف شخصيًا للعامة دون مراجعة وموافقة ولي الأمر؛ استخدم رقم عمل مخصصًا عند توفره.
- لم يتم نشر الموقع أو اختباره داخل حساب Firebase/Netlify الخاص بك من هنا. يلزم إعداد أسرار الخادم ثم إجراء اختبار بعد النشر.
