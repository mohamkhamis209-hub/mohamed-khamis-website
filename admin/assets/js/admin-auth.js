/**
 * MOHAMED KHAMIS — Admin Authentication Module
 * Firebase Auth, Role Verification & Session Management
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  getDoc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { APP_CONFIG } from '../../assets/js/config.js';

export const SUPER_ADMIN_UID = '6kUrmstc69T4AnwhoUJ4ZrFbRez2';

class AdminAuthManager {
  constructor() {
    this.app = initializeApp(APP_CONFIG.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.currentUser = null;
    this.adminProfile = null;
    this.listeners = [];
  }

  init() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const isAuthorized = await this.verifyAdminPrivileges(user.uid);
          if (isAuthorized) {
            this.currentUser = user;
            this.notify(true, this.adminProfile);
          } else {
            await this.logout();
            this.notify(false, null, 'الحساب غير مصرح له بالدخول كمدير أو تم تعطيله.');
          }
        } catch (err) {
          console.error('Admin privilege check error:', err);
          await this.logout();
          this.notify(false, null, 'حدث خطأ أثناء التحقق من صلاحيات المدير.');
        }
      } else {
        this.currentUser = null;
        this.adminProfile = null;
        this.notify(false, null);
      }
    });
  }

  async verifyAdminPrivileges(uid) {
    // 1. Check if UID matches hardcoded Super Admin UID
    const isSuperAdminUid = uid === APP_CONFIG.brand.superAdminUid;

    // 2. Fetch record from admins collection in Firestore
    const adminRef = doc(this.db, 'admins', uid);
    const snap = await getDoc(adminRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.active === true) {
        this.adminProfile = {
          uid,
          name: data.name || 'المدير',
          role: data.role || (isSuperAdminUid ? 'super_admin' : 'admin'),
          isSuperAdmin: isSuperAdminUid || data.role === 'super_admin',
          permissions: data.permissions || {}
        };
        return true;
      }
    } else if (isSuperAdminUid) {
      // Super admin initial profile fallback
      this.adminProfile = {
        uid,
        name: 'محمد خميس',
        role: 'super_admin',
        isSuperAdmin: true,
        permissions: {
          manageProjects: true,
          manageServices: true,
          manageRequests: true,
          manageMessages: true,
          manageTestimonials: true,
          manageFaqs: true,
          manageSettings: true,
          viewStats: true
        }
      };
      return true;
    }

    return false;
  }

  async login(email, password) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    await signOut(this.auth);
    this.currentUser = null;
    this.adminProfile = null;
  }

  async getIdToken() {
    if (!this.currentUser) return null;
    return await this.currentUser.getIdToken();
  }

  onAuthChanged(cb) {
    this.listeners.push(cb);
  }

  notify(isAuthenticated, profile, errorMsg = '') {
    this.listeners.forEach(cb => cb(isAuthenticated, profile, errorMsg));
  }
}

export const adminAuth = new AdminAuthManager();
