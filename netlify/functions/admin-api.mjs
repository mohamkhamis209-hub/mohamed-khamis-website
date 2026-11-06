/**
 * NETLIFY SERVERLESS FUNCTION: admin-api
 * Secured Administrative Controller
 * Validates Firebase ID Tokens, verifies Firestore admin roles and executes privileged actions
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const SUPER_ADMIN_UID = '6kUrmstc69T4AnwhoUJ4ZrFbRez2';

function getFirebaseAdmin() {
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
  return {
    auth: getAuth(),
    db: getFirestore()
  };
}

async function verifyAdminAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or malformed Authorization header', status: 401 };
  }

  const idToken = authHeader.split('Bearer ')[1];
  const { auth, db } = getFirebaseAdmin();

  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch (authErr) {
    console.error('verifyIdToken failed:', authErr.message);
    return { error: 'Invalid or expired Firebase ID Token', status: 401 };
  }

  const uid = decoded.uid;
  const adminDoc = await db.collection('admins').doc(uid).get();

  if (!adminDoc.exists) {
    return { error: 'User is not an authorized administrator', status: 403 };
  }

  const adminData = adminDoc.data();
  if (adminData.active !== true) {
    return { error: 'Administrator account is deactivated', status: 403 };
  }

  const isSuperAdmin = uid === SUPER_ADMIN_UID || adminData.role === 'super_admin';

  return {
    uid,
    isSuperAdmin,
    adminData,
    permissions: adminData.permissions || {}
  };
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  let firebaseServices;
  try {
    firebaseServices = getFirebaseAdmin();
  } catch (err) {
    if (err.message === 'FIREBASE_SERVICE_ACCOUNT_MISSING') {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          error: 'FIREBASE_SERVICE_ACCOUNT environment variable is not configured.',
          errorAr: 'مفتاح خدمة قاعدة البيانات FIREBASE_SERVICE_ACCOUNT غير مضبوط في Netlify.'
        })
      };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server initialization failure.' })
    };
  }

  const { db } = firebaseServices;
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const authResult = await verifyAdminAuth(authHeader);

  if (authResult.error) {
    return {
      statusCode: authResult.status,
      headers,
      body: JSON.stringify({ error: authResult.error })
    };
  }

  const { uid, isSuperAdmin, permissions } = authResult;

  try {
    const payload = JSON.parse(event.body || '{}');
    const action = payload.action;

    // Helper to log administrative actions
    const logAudit = async (act, target, details = {}) => {
      try {
        await db.collection('auditLogs').add({
          adminUid: uid,
          action: act,
          target,
          details,
          timestamp: FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.error('Audit log failed:', e);
      }
    };

    switch (action) {
      // 1. Dashboard Statistics
      case 'get-dashboard-stats': {
        const [reqSnap, msgSnap, projSnap, srvSnap] = await Promise.all([
          db.collection('requests').get(),
          db.collection('messages').get(),
          db.collection('projects').get(),
          db.collection('services').get()
        ]);

        let newRequests = 0;
        let reviewRequests = 0;
        reqSnap.forEach(doc => {
          const s = doc.data().status;
          if (s === 'new') newRequests++;
          if (s === 'under_review') reviewRequests++;
        });

        let unreadMessages = 0;
        msgSnap.forEach(doc => {
          if (!doc.data().read) unreadMessages++;
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            stats: {
              totalRequests: reqSnap.size,
              newRequests,
              reviewRequests,
              totalMessages: msgSnap.size,
              unreadMessages,
              publishedProjects: projSnap.size,
              publishedServices: srvSnap.size
            }
          })
        };
      }

      // 2. Client Request Status Update
      case 'update-request-status': {
        if (!isSuperAdmin && !permissions.manageRequests) {
          return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized to manage requests' }) };
        }
        const { trackingId, status, internalNotes } = payload;
        if (!trackingId || !status) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'trackingId and status required' }) };
        }

        const validStatuses = ['new', 'under_review', 'contacting', 'in_progress', 'completed', 'rejected', 'archived'];
        if (!validStatuses.includes(status)) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid status value' }) };
        }

        const updateData = {
          status,
          updatedAt: new Date().toISOString(),
          updatedAtServer: FieldValue.serverTimestamp()
        };
        if (typeof internalNotes === 'string') {
          updateData.internalNotes = internalNotes;
        }

        await db.collection('requests').doc(trackingId).update(updateData);
        await logAudit('UPDATE_REQUEST_STATUS', trackingId, { status });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, trackingId, status })
        };
      }

      // 3. Settings Update (settings/public)
      case 'update-site-settings': {
        if (!isSuperAdmin && !permissions.manageSettings) {
          return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized to manage site settings' }) };
        }
        const { settings } = payload;
        if (!settings || typeof settings !== 'object') {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Settings object required' }) };
        }

        await db.collection('settings').doc('public').set(
          {
            ...settings,
            updatedAtServer: FieldValue.serverTimestamp()
          },
          { merge: true }
        );

        await logAudit('UPDATE_SITE_SETTINGS', 'settings/public', settings);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Settings saved.' })
        };
      }

      // 4. Admin Management (Super Admin Only)
      case 'manage-admin-user': {
        if (!isSuperAdmin) {
          return { statusCode: 403, headers, body: JSON.stringify({ error: 'Only Super Admin can manage admin users' }) };
        }

        const { targetUid, name, active, role, adminPermissions } = payload;
        if (!targetUid) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'targetUid required' }) };
        }

        // Prevent modifying super admin account role or active status
        if (targetUid === SUPER_ADMIN_UID && (active === false || role !== 'super_admin')) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Cannot deactivate or demote Super Admin' }) };
        }

        const updateObj = {
          name: name || '',
          active: active !== false,
          role: role || 'admin',
          permissions: adminPermissions || {},
          updatedAtServer: FieldValue.serverTimestamp()
        };

        await db.collection('admins').doc(targetUid).set(updateObj, { merge: true });
        await logAudit('MANAGE_ADMIN_USER', targetUid, { active, role });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, targetUid })
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` })
        };
    }
  } catch (err) {
    console.error('Admin API error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal admin error' })
    };
  }
};
