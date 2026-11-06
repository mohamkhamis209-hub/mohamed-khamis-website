/**
 * NETLIFY SERVERLESS FUNCTION: upload-image
 * Secure server-side image upload proxy to ImgBB
 * Keeps IMGBB_API_KEY private on the server.
 */

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'IMGBB_API_KEY is not configured in Netlify Environment Variables.',
        errorAr: 'مفتاح IMGBB_API_KEY غير مضبوط حالياً في إعدادات البيئة على Netlify.'
      })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const imageBase64 = data.image; // can be data URL or raw base64 string
    const name = data.name || 'upload';

    if (!imageBase64) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image base64 data is required.' })
      };
    }

    // Clean base64 string if data URL prefix exists
    let cleanedBase64 = imageBase64;
    let mimeType = 'image/jpeg';
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      cleanedBase64 = parts[1];
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Unsupported image format. Allowed formats: JPEG, PNG, WEBP.',
          errorAr: 'صيغة الصورة غير مدعومة. الصيغ المسموحة: JPEG, PNG, WEBP.'
        })
      };
    }

    // Check size limit: ~10MB base64 is ~13.5MB string length
    if (cleanedBase64.length > 14 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Image file size exceeds 10MB limit.',
          errorAr: 'حجم الصورة يتجاوز الحد الأقصى المسموح (10 ميجابايت).'
        })
      };
    }

    // Build Form Data for ImgBB API
    const formData = new URLSearchParams();
    formData.append('image', cleanedBase64);
    formData.append('name', name);

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      body: formData
    });

    const imgbbJson = await imgbbResponse.json();

    if (!imgbbResponse.ok || !imgbbJson.success) {
      console.error('ImgBB API Upload Error:', imgbbJson);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          success: false,
          error: imgbbJson.error?.message || 'ImgBB service upload failed.',
          errorAr: 'فشل رفع الصورة إلى خدمة ImgBB.'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: imgbbJson.data.display_url || imgbbJson.data.url,
        deleteUrl: imgbbJson.data.delete_url,
        thumbUrl: imgbbJson.data.thumb?.url || imgbbJson.data.url,
        width: imgbbJson.data.width,
        height: imgbbJson.data.height
      })
    };
  } catch (err) {
    console.error('Upload Image Handler Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error processing image upload.' })
    };
  }
};
