/**
 * NETLIFY SERVERLESS FUNCTION: submit-message
 * Secure reception and persistence of contact inquiries
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_MESSAGES_PER_WINDOW = 4;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, firstSeen: now };
  if (now - record.firstSeen > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstSeen: now });
    return true;
  }
  if (record.count >= MAX_MESSAGES_PER_WINDOW) {
    return false;
  }
  record.count += 1;
  rateLimitMap.set(ip, record);
  return true;
}

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim();
}

function getFirestoreDb() {
  if (getApps().length === 0) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountVar) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_MISSING');
    }
    const serviceAccount = JSON.parse(serviceAccountVar);
    initializeApp({
      credential: cert(serviceAccount),
      projectId: 'mohamed-khamis'
    });
  }
  return getFirestore();
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';

  if (!checkRateLimit(clientIp)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Too many messages sent. Please wait a few moments.',
        errorAr: 'تم إرسال عدد كبير من الرسائل. يرجى الانتظار دقائق قليلة.'
      })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Honeypot bot trap
    if (data.company_website || data.website) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bot detected.' }) };
    }

    const name = sanitize(data.name);
    const email = sanitize(data.email).toLowerCase();
    const subject = sanitize(data.subject);
    const message = sanitize(data.message);

    if (!name || name.length < 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid name is required.' }) };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email is required.' }) };
    }

    if (!subject || subject.length < 3) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Subject is required.' }) };
    }

    if (!message || message.length < 5) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message content is required.' }) };
    }

    try {
      const db = getFirestoreDb();
      const messageDoc = {
        name,
        email,
        subject,
        message,
        read: false,
        archived: false,
        submittedIp: clientIp,
        createdAt: new Date().toISOString(),
        createdAtServer: FieldValue.serverTimestamp()
      };

      await db.collection('messages').add(messageDoc);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          messageAr: 'تم إرسال رسالتك بنجاح. شكراً لتواصلك!',
          messageEn: 'Your message has been sent successfully. Thank you!'
        })
      };
    } catch (dbErr) {
      console.error('Firestore Message Error:', dbErr);
      if (dbErr.message === 'FIREBASE_SERVICE_ACCOUNT_MISSING') {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Backend Database Service Key is not yet configured in Netlify Environment Variables.',
            errorAr: 'مفتاح خدمة قاعدة البيانات FIREBASE_SERVICE_ACCOUNT غير مضبوط حالياً في Netlify.'
          })
        };
      }
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Failed to record message in database.' })
      };
    }
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON payload.' }) };
  }
};
