/** Direct ImgBB upload from the admin browser (API key is public by request). */
import { APP_CONFIG } from '../../assets/js/config.js';

export class AdminImageUploader {
  async fileToBase64(file, maxSizeMB = 7) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('لم يتم اختيار صورة.'));
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowed.includes(file.type.toLowerCase())) return reject(new Error('صيغة الصورة غير مدعومة. الصيغ المسموحة: JPEG, PNG, WEBP.'));
      if (file.size > maxSizeMB * 1024 * 1024) return reject(new Error(`حجم الصورة يتجاوز الحد الأقصى (${maxSizeMB} ميجابايت).`));
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('تعذر قراءة الصورة.'));
      reader.readAsDataURL(file);
    });
  }

  async uploadImage(base64Data, filename = 'mohamed-khamis-upload') {
    if (!APP_CONFIG.imgbb.apiKey) throw new Error('مفتاح ImgBB غير موجود في config.js.');
    const form = new FormData();
    form.append('image', String(base64Data).split(',').pop());
    form.append('name', filename);
    const response = await fetch(`${APP_CONFIG.imgbb.uploadUrl}?key=${encodeURIComponent(APP_CONFIG.imgbb.apiKey)}`, { method: 'POST', body: form });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result?.error?.message || 'فشل رفع الصورة إلى ImgBB.');
    return result.data.display_url || result.data.url;
  }
}
