/**
 * MOHAMED KHAMIS — Admin ImgBB Image Uploader
 * Manages client previews, size validations and server-side relay
 */

export class AdminImageUploader {
  constructor() {
    this.uploadEndpoint = '/.netlify/functions/upload-image';
  }

  /**
   * Convert file to base64 with format & size validation
   */
  async fileToBase64(file, maxSizeMB = 10) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file selected'));

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        return reject(new Error('صيغة الصورة غير مدعومة. الصيغ المسموحة: JPEG, PNG, WEBP.'));
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        return reject(new Error(`حجم الصورة يتجاوز الحد الأقصى المسموح (${maxSizeMB} ميجابايت).`));
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload image to server proxy function
   */
  async uploadImage(base64Data, filename = 'upload') {
    const response = await fetch(this.uploadEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Data,
        name: filename
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const errMsg = result.errorAr || result.error || 'فشل رفع الصورة.';
      throw new Error(errMsg);
    }

    return result.url;
  }
}
