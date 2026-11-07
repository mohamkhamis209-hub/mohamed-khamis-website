/** Firebase Authentication and administrator authorization. */
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { auth, db } from '../../assets/js/firebase-client.js';
import { APP_CONFIG } from '../../assets/js/config.js';

export const SUPER_ADMIN_UID = APP_CONFIG.brand.superAdminUid;

class AdminAuthManager {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.currentUser = null;
    this.adminProfile = null;
    this.listeners = [];
  }
  init() {
    onAuthStateChanged(this.auth, async user => {
      if (!user) {
        this.currentUser = null;
        this.adminProfile = null;
        this.notify(false, null);
        return;
      }
      try {
        const allowed = await this.verifyAdminPrivileges(user.uid);
        if (allowed) {
          this.currentUser = user;
          this.notify(true, this.adminProfile);
        } else {
          await this.logout();
          this.notify(false, null, 'الحساب غير مصرح له بالدخول كمدير أو تم تعطيله.');
        }
      } catch (error) {
        console.error('Admin privilege check error:', error);
        await this.logout();
        this.notify(false, null, 'حدث خطأ أثناء التحقق من صلاحيات المدير.');
      }
    });
  }
  async verifyAdminPrivileges(uid) {
    const isSuperAdminUid = uid === SUPER_ADMIN_UID;
    const snap = await getDoc(doc(this.db, 'admins', uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.active === true || (isSuperAdminUid && data.role === 'super_admin')) {
        this.adminProfile = {
          uid, name: data.name || (isSuperAdminUid ? 'محمد خميس' : 'المدير'),
          role: data.role || (isSuperAdminUid ? 'super_admin' : 'admin'),
          isSuperAdmin: isSuperAdminUid || data.role === 'super_admin',
          permissions: data.permissions || {}
        };
        return true;
      }
    } else if (isSuperAdminUid) {
      this.adminProfile = {
        uid, name: 'محمد خميس', role: 'super_admin', isSuperAdmin: true,
        permissions: { manageProjects: true, manageServices: true, manageRequests: true, manageMessages: true, manageTestimonials: true, manageFaqs: true, manageSettings: true, viewStats: true }
      };
      return true;
    }
    return false;
  }
  login(email, password) { return signInWithEmailAndPassword(this.auth, email, password); }
  async logout() { await signOut(this.auth); this.currentUser = null; this.adminProfile = null; }
  getIdToken() { return this.currentUser?.getIdToken() || Promise.resolve(null); }
  onAuthChanged(callback) { this.listeners.push(callback); }
  notify(isAuthenticated, profile, errorMsg = '') { this.listeners.forEach(callback => callback(isAuthenticated, profile, errorMsg)); }
}
export const adminAuth = new AdminAuthManager();
