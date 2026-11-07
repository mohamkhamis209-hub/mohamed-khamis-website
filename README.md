# Mohamed Khamis Website

موقع MOHAMED KHAMIS جاهز للاستضافة الثابتة على GitHub Pages، ويستخدم Firebase مباشرة من المتصفح.

## التقنيات
- GitHub Pages: استضافة ملفات الموقع.
- Firebase Authentication: تسجيل دخول لوحة الإدارة.
- Cloud Firestore: الطلبات والرسائل والإعدادات.
- ImgBB: رفع صور لوحة الإدارة.

## النشر
1. ارفع محتويات هذا المجلد إلى جذر مستودع `mohamed-khamis-website` في GitHub.
2. فعّل GitHub Pages من إعدادات المستودع واختر فرع `main` ومجلد `/ (root)`.
3. انشر محتوى `firestore.rules` في Firebase Console من Firestore Database → Rules، ثم اضغط Publish.
4. تأكد أن حساب المدير مسجل في Firebase Authentication، وأن UID الخاص به يطابق المدير الرئيسي في `assets/js/config.js` أو أن له وثيقة نشطة في مجموعة `admins`.

## إعدادات الربط
إعدادات Firebase ومفتاح ImgBB موجودان في `assets/js/config.js` كما طلب مالك الموقع. إعداد Firebase Web config ليس كلمة مرور، لكن مفتاح ImgBB سيصبح عاماً عند رفع الموقع إلى GitHub ويمكن لأي زائر نسخه واستخدامه.

## ملاحظات مهمة
- لا توجد حاجة إلى Netlify أو Netlify Functions أو Firebase Cloud Functions في هذه النسخة.
- نماذج الطلبات والتواصل تكتب مباشرة إلى Firestore، وقواعد Firestore تقيد إنشاء السجلات وقراءة بيانات العملاء للمديرين فقط.
- حظر كليك يمين وبعض اختصارات الفحص مجرد عائق بسيط؛ لا يمكن منع أدوات المطور أو عرض مصدر HTML/JavaScript فعلياً في موقع ويب عام.
