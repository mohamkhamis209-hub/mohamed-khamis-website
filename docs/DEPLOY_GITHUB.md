# النشر على GitHub Pages وFirebase

1. ارفع جميع ملفات مجلد المشروع إلى جذر مستودع GitHub Pages.
2. من Firebase Console افتح Firestore Database → Rules.
3. استبدل القواعد الحالية بمحتوى `firestore.rules` واضغط Publish.
4. تأكد من تفعيل Email/Password في Firebase Authentication.
5. تأكد من وجود حساب المدير في Authentication وأن صلاحياته صحيحة في `admins/{uid}`، أو أنه يستخدم UID المدير الرئيسي الموجود في `assets/js/config.js`.
6. افتح الموقع واختبر إرسال طلب تجريبي ورسالة تواصل، ثم تحقق من ظهورهما في لوحة الإدارة.

لا تحتاج هذه النسخة إلى Netlify أو Cloud Functions. جميع الاتصالات تتم مباشرة من المتصفح إلى Firebase، ورفع الصور يتم مباشرة إلى ImgBB.
