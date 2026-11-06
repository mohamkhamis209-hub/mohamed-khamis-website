/**
 * NETLIFY SERVERLESS FUNCTION: submit-request
 * Secure processing and storage of client project inquiries into Firestore
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// In-memory rate limiting store (cleared on container restart)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, firstSeen: now };
  if (now - record.firstSeen > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstSeen: now });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
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

function generateTrackingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `MK-REQ-${year}-${rand}`;
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
  // CORS & Security Headers
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
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';

  if (!checkRateLimit(clientIp)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Too many requests. Please wait before submitting another project inquiry.',
        errorAr: 'تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار دقائق قليلة والمحاولة مجدداً.'
      })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Honeypot check for bots
    if (data.website || data.hp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Bot submission detected.' })
      };
    }

    // Validation
    const clientName = sanitize(data.clientName);
    const email = sanitize(data.email).toLowerCase();
    const phone = sanitize(data.phone);
    const country = sanitize(data.country || '');
    const projectType = sanitize(data.projectType);
    const projectDescription = sanitize(data.projectDescription);
    const budget = sanitize(data.budget || '');
    const contactMethod = sanitize(data.contactMethod || 'whatsapp');
    const attachmentUrl = typeof data.attachmentUrl === 'string' ? data.attachmentUrl.trim() : '';

    if (!clientName || clientName.length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid client name is required (min 2 chars).' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid email address is required.' })
      };
    }

    if (!phone || phone.length < 7) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid phone number is required.' })
      };
    }

    if (!projectType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Project type is required.' })
      };
    }

    if (!projectDescription || projectDescription.length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Detailed project description is required (min 10 chars).' })
      };
    }

    const trackingId = generateTrackingId();
    const requestDoc = {
      trackingId,
      clientName,
      email,
      phone,
      country,
      projectType,
      projectDescription,
      budget,
      contactMethod,
      attachmentUrl,
      status: 'new', // new, under_review, contacting, in_progress, completed, rejected, archived
      internalNotes: '',
      submittedIp: clientIp,
      createdAt: new Date().toISOString()
    };

    // Attempt writing to Firestore via Firebase Admin SDK
    try {
      const db = getFirestoreDb();
      await db.collection('requests').doc(trackingId).set({
        ...requestDoc,
        createdAtServer: FieldValue.serverTimestamp()
      });

      // Log notification in auditLogs
      await db.collection('auditLogs').add({
        action: 'PROJECT_REQUEST_RECEIVED',
        trackingId,
        clientName,
        email,
        timestamp: FieldValue.serverTimestamp()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          trackingId,
          messageAr: 'تم استلام وتوثيق طلبك بنجاح وسنتواصل معك قريباً.',
          messageEn: 'Your project request has been successfully registered.'
        })
      };
    } catch (dbError) {
      console.error('Firestore Admin SDK Error:', dbError);

      if (dbError.message === 'FIREBASE_SERVICE_ACCOUNT_MISSING') {
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
        body: JSON.stringify({
          success: false,
          error: 'An internal error occurred while saving the request.'
        })
      };
    }
  } catch (err) {
    console.error('Submit Request Function Error:', err);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Malformed JSON payload.' })
    };
  }
};
