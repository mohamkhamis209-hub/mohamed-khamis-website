import '../../../assets/js/protection.js';
/**
 * MOHAMED KHAMIS — Executive Admin Dashboard Application
 * State Management, Firebase Cloud Functions API & Firestore-backed dashboard
 */

import { adminAuth } from './admin-auth.js';
import { AdminImageUploader } from './admin-upload.js';
import { INITIAL_SERVICES } from '../../../assets/js/services-data.js';
import { INITIAL_PROJECTS } from '../../../assets/js/projects-data.js';
import { db } from '../../../assets/js/firebase-client.js';
import { collection, doc, getDocs, query, orderBy, limit, where, updateDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class AdminDashboard {
  constructor() {
    this.uploader = new AdminImageUploader();
    this.activeTab = 'tab-overview';
    this.requests = [];
    this.messages = [];
    this.projects = [...INITIAL_PROJECTS];
    this.services = [...INITIAL_SERVICES];
    this.testimonials = [];
    this.faqs = [];
    this.auditLogs = [];
  }

  init() {
    // 1. Setup Auth Listener
    adminAuth.onAuthChanged((isAuth, profile, errorMsg) => {
      const authScreen = document.getElementById('auth-screen');
      const adminShell = document.getElementById('admin-shell');
      const authError = document.getElementById('auth-error-alert');

      if (isAuth && profile) {
        authScreen.style.display = 'none';
        adminShell.style.display = 'flex';
        this.renderAdminProfile(profile);
        this.loadDashboardData();
      } else {
        authScreen.style.display = 'flex';
        adminShell.style.display = 'none';
        if (errorMsg && authError) {
          authError.textContent = errorMsg;
          authError.style.display = 'block';
        }
      }
    });

    adminAuth.init();
    this.setupLoginForm();
    this.setupNavigation();
    this.setupModalsAndEvents();
  }

  setupLoginForm() {
    const form = document.getElementById('admin-login-form');
    const authError = document.getElementById('auth-error-alert');
    const submitBtn = document.getElementById('login-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('[name="email"]')?.value?.trim();
      const password = form.querySelector('[name="password"]')?.value;

      if (!email || !password) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري التحقق والمصادقة...';
      if (authError) authError.style.display = 'none';

      try {
        await adminAuth.login(email, password);
      } catch (err) {
        console.error('Login error:', err);
        if (authError) {
          authError.textContent = 'بيانات الدخول غير صحيحة أو الحساب غير معتمد.';
          authError.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'تسجيل الدخول إلى لوحة التحكم';
      }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await adminAuth.logout();
      });
    }
  }

  setupNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const targetTab = link.getAttribute('data-tab');
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        const pane = document.getElementById(targetTab);
        if (pane) pane.classList.add('active');
        this.activeTab = targetTab;
      });
    });
  }

  renderAdminProfile(profile) {
    const nameEl = document.getElementById('admin-user-name');
    const roleEl = document.getElementById('admin-user-role');
    const superAdminMenu = document.getElementById('menu-item-admins');

    if (nameEl) nameEl.textContent = profile.name;
    if (roleEl) roleEl.textContent = profile.isSuperAdmin ? 'المدير الرئيسي (Super Admin)' : 'مدير مساعد (Admin)';

    // Show or hide admin management tab based on Super Admin role
    if (superAdminMenu) {
      superAdminMenu.style.display = profile.isSuperAdmin ? 'flex' : 'none';
    }
  }

  async loadDashboardData() {
    await Promise.all([this.fetchStatsFromApi(), this.fetchAdminData()]);
    this.renderRequestsTable();
    this.renderMessagesTable();
    this.renderProjectsAdmin();
    this.renderServicesAdmin();
    this.setupProfileAndSettingsForms();
  }

  async callAdminApi(payload) {
    if (!adminAuth.currentUser) throw new Error('انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.');
    const profile = adminAuth.adminProfile || {};
    const allowed = permission => profile.isSuperAdmin || profile.permissions?.[permission] === true;
    const action = payload.action;

    if (action === 'get-dashboard-data') {
      const [requestsSnap, messagesSnap] = await Promise.all([
        allowed('manageRequests') ? getDocs(query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(200))) : Promise.resolve(null),
        allowed('manageMessages') ? getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(200))) : Promise.resolve(null)
      ]);
      return {
        success: true,
        requests: requestsSnap ? requestsSnap.docs.map(item => ({ id: item.id, ...item.data() })) : [],
        messages: messagesSnap ? messagesSnap.docs.map(item => ({ id: item.id, ...item.data() })) : []
      };
    }

    if (action === 'get-dashboard-stats') {
      if (!allowed('viewStats')) throw new Error('ليست لديك صلاحية عرض الإحصائيات.');
      const [requestsSnap, messagesSnap, projectsSnap, servicesSnap] = await Promise.all([
        allowed('manageRequests') ? getDocs(collection(db, 'requests')) : Promise.resolve({ docs: [] }),
        allowed('manageMessages') ? getDocs(collection(db, 'messages')) : Promise.resolve({ docs: [] }),
        getDocs(query(collection(db, 'projects'), where('published', '==', true))),
        getDocs(query(collection(db, 'services'), where('published', '==', true)))
      ]);
      const requests = requestsSnap.docs.map(item => item.data());
      const messages = messagesSnap.docs.map(item => item.data());
      return { success: true, stats: {
        totalRequests: requests.length,
        newRequests: requests.filter(item => item.status === 'new').length,
        reviewRequests: requests.filter(item => item.status === 'under_review').length,
        totalMessages: messages.length,
        unreadMessages: messages.filter(item => !item.read && !item.archived).length,
        publishedProjects: projectsSnap.size,
        publishedServices: servicesSnap.size
      }};
    }

    if (action === 'update-request-status') {
      if (!allowed('manageRequests')) throw new Error('ليست لديك صلاحية إدارة الطلبات.');
      const valid = ['new', 'under_review', 'contacting', 'in_progress', 'completed', 'rejected', 'archived'];
      if (!valid.includes(payload.status)) throw new Error('حالة الطلب غير صحيحة.');
      await updateDoc(doc(db, 'requests', payload.trackingId), { status: payload.status, updatedAt: new Date().toISOString() });
      return { success: true };
    }

    if (action === 'update-message') {
      if (!allowed('manageMessages')) throw new Error('ليست لديك صلاحية إدارة الرسائل.');
      await updateDoc(doc(db, 'messages', payload.messageId), { read: Boolean(payload.read), updatedAt: new Date().toISOString() });
      return { success: true };
    }

    if (action === 'update-site-settings') {
      if (!allowed('manageSettings')) throw new Error('ليست لديك صلاحية تعديل الإعدادات.');
      const safe = Object.fromEntries(Object.entries(payload.settings || {}).filter(([key]) => ['siteName', 'tagline', 'contactEmail', 'workPhone', 'workWhatsapp', 'maintenanceMode'].includes(key)));
      await setDoc(doc(db, 'settings', 'public'), { ...safe, updatedAt: new Date().toISOString(), updatedAtServer: serverTimestamp() }, { merge: true });
      return { success: true };
    }

    throw new Error('العملية المطلوبة غير مدعومة.');
  }

  async fetchAdminData() {
    try {
      const result = await this.callAdminApi({ action: 'get-dashboard-data' });
      this.requests = Array.isArray(result.requests) ? result.requests : [];
      this.messages = Array.isArray(result.messages) ? result.messages : [];
    } catch (error) {
      console.error('Admin data loading error:', error);
      this.adminDataError = error.message;
      this.requests = [];
      this.messages = [];
    }
  }

  escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  renderMessagesTable() {
    const tbody = document.getElementById('messages-table-body');
    if (!tbody) return;
    if (!this.messages.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--admin-text-muted);">لا توجد رسائل واردة حالياً.</td></tr>`;
      return;
    }
    tbody.innerHTML = this.messages.map(msg => `
      <tr>
        <td><strong>${this.escapeHtml(msg.name)}</strong>${msg.read ? '' : ' <span class="status-pill status-new">جديدة</span>'}</td>
        <td>${this.escapeHtml(msg.email)}</td>
        <td>${this.escapeHtml(msg.subject)}</td>
        <td>${this.escapeHtml(new Date(msg.createdAt || Date.now()).toLocaleDateString('ar-EG'))}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn-admin btn-admin-secondary btn-sm message-view-btn" data-id="${this.escapeHtml(msg.id)}">عرض</button>
          <button class="btn-admin btn-admin-secondary btn-sm message-read-btn" data-id="${this.escapeHtml(msg.id)}" data-read="${!msg.read}">${msg.read ? 'غير مقروءة' : 'تمت القراءة'}</button>
        </td>
      </tr>
      <tr id="message-detail-${this.escapeHtml(msg.id)}" style="display:none;"><td colspan="5" style="white-space:pre-wrap;line-height:1.8;">${this.escapeHtml(msg.message)}</td></tr>
    `).join('');
    tbody.querySelectorAll('.message-view-btn').forEach(btn => btn.addEventListener('click', () => {
      const row = document.getElementById(`message-detail-${btn.dataset.id}`);
      if (row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    }));
    tbody.querySelectorAll('.message-read-btn').forEach(btn => btn.addEventListener('click', async () => {
      try {
        await this.callAdminApi({ action: 'update-message', messageId: btn.dataset.id, read: btn.dataset.read === 'true' });
        await this.fetchAdminData();
        this.renderMessagesTable();
        await this.fetchStatsFromApi();
      } catch (error) { alert(error.message); }
    }));
  }

  async fetchStatsFromApi() {
    try {
      const result = await this.callAdminApi({ action: 'get-dashboard-stats' });
      const stats = result.stats || {};
      const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value ?? 0; };
      setText('kpi-total-requests', stats.totalRequests);
      setText('kpi-new-requests', stats.newRequests);
      setText('kpi-unread-messages', stats.unreadMessages);
      setText('kpi-published-projects', stats.publishedProjects);
    } catch (e) {
      console.error('Stats loading error:', e);
    }
  }

  renderRequestsTable(filter = 'all') {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;

    if (this.requests.length === 0) {
      const message = this.adminDataError ? `تعذر تحميل الطلبات: ${this.escapeHtml(this.adminDataError)}` : 'لا توجد طلبات عملاء مسجلة حالياً في النظام.';
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:30px;">${message}</td></tr>`;
      return;
    }

    tbody.innerHTML = this.requests.map(req => `
      <tr>
        <td style="font-family: 'Inter', monospace; font-weight: 700; color: var(--admin-cyan);">${this.escapeHtml(req.trackingId)}</td>
        <td><strong>${this.escapeHtml(req.clientName)}</strong></td>
        <td>${this.escapeHtml(req.email)}</td>
        <td>${this.escapeHtml(req.projectType)}</td>
        <td><span class="status-pill status-${req.status}">${this.formatStatus(req.status)}</span></td>
        <td>${new Date(req.createdAt).toLocaleDateString('ar-EG')}</td>
        <td>
          <select class="admin-input request-status-select" data-id="${this.escapeHtml(req.trackingId)}" style="min-width:130px;padding:6px;">
            ${['new','under_review','contacting','in_progress','completed','rejected','archived'].map(status => `<option value="${status}" ${req.status === status ? 'selected' : ''}>${this.formatStatus(status)}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('.request-status-select').forEach(select => select.addEventListener('change', async () => {
      try {
        await this.callAdminApi({ action: 'update-request-status', trackingId: select.dataset.id, status: select.value });
        const request = this.requests.find(item => item.trackingId === select.dataset.id);
        if (request) request.status = select.value;
        this.renderRequestsTable();
        await this.fetchStatsFromApi();
      } catch (error) { alert(error.message); }
    }));
  }

  renderProjectsAdmin() {
    const container = document.getElementById('admin-projects-list');
    if (!container) return;

    container.innerHTML = this.projects.map(proj => `
      <div class="kpi-card" style="margin-bottom: 12px; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="${proj.coverUrl}" alt="" style="width: 60px; height: 40px; border-radius: 6px; object-fit: cover;">
          <div>
            <h4 style="font-size: 1rem; color: #FFFFFF;">${proj.titleAr}</h4>
            <span style="font-size: 0.8rem; color: var(--admin-cyan);">${proj.stageAr}</span>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn-admin btn-admin-secondary btn-sm" onclick="alert('تعديل المشروع: ${proj.titleAr}')">تعديل</button>
        </div>
      </div>
    `).join('');
  }

  renderServicesAdmin() {
    const container = document.getElementById('admin-services-list');
    if (!container) return;

    container.innerHTML = this.services.map((srv, idx) => `
      <div class="kpi-card" style="margin-bottom: 10px; padding: 16px 20px;">
        <div>
          <span style="font-size: 0.8rem; color: var(--admin-text-muted); font-family: 'Inter';">#${idx + 1}</span>
          <strong style="margin-right: 8px; color: #FFFFFF;">${srv.titleAr}</strong>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="status-pill status-completed">منشور</span>
        </div>
      </div>
    `).join('');
  }

  setupProfileAndSettingsForms() {
    // 1. Profile Picture ImgBB Upload Handler
    const photoInput = document.getElementById('profile-photo-input');
    const photoPreview = document.getElementById('profile-photo-preview');
    const uploadBtn = document.getElementById('upload-photo-btn');
    const photoStatus = document.getElementById('photo-upload-status');

    if (photoInput && uploadBtn) {
      photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const base64 = await this.uploader.fileToBase64(file);
          if (photoPreview) photoPreview.src = base64;
          uploadBtn.disabled = false;
        } catch (err) {
          alert(err.message);
        }
      });

      uploadBtn.addEventListener('click', async () => {
        const file = photoInput.files[0];
        if (!file) return;

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'جاري الرفع إلى ImgBB...';
        if (photoStatus) photoStatus.textContent = '';

        try {
          const base64 = await this.uploader.fileToBase64(file);
          const uploadedUrl = await this.uploader.uploadImage(base64, 'mohamed-khamis-portrait');
          if (photoStatus) {
            photoStatus.style.color = '#10B981';
            photoStatus.textContent = `تم رفع الصورة بنجاح! الرابط: ${uploadedUrl}`;
          }
        } catch (err) {
          if (photoStatus) {
            photoStatus.style.color = '#EF4444';
            photoStatus.textContent = err.message;
          }
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'رفع وحفظ الصورة';
        }
      });
    }

    // 2. Settings Save Handler
    const settingsForm = document.getElementById('site-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const siteName = settingsForm.querySelector('[name="siteName"]')?.value;
        const tagline = settingsForm.querySelector('[name="tagline"]')?.value;
        const contactEmail = settingsForm.querySelector('[name="contactEmail"]')?.value;
        const workPhone = settingsForm.querySelector('[name="workPhone"]')?.value;
        const workWhatsapp = settingsForm.querySelector('[name="workWhatsapp"]')?.value;
        const maintenanceMode = settingsForm.querySelector('[name="maintenanceMode"]')?.checked;

        try {
          await this.callAdminApi({
            action: 'update-site-settings',
            settings: { siteName, tagline, contactEmail, workPhone, workWhatsapp, maintenanceMode }
          });
          alert('تم حفظ إعدادات الموقع بنجاح في Firebase.');
        } catch (err) {
          alert(err.message || 'تعذر حفظ الإعدادات.');
        }
      });
    }

    // 3. Export CSV Handler
    const exportBtn = document.getElementById('export-requests-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportRequestsToCSV();
      });
    }
  }

  exportRequestsToCSV() {
    if (this.requests.length === 0) {
      alert('لا توجد طلبات لتصديرها.');
      return;
    }

    let csv = '\uFEFFرقم المرجع,الاسم,البريد الإلكتروني,الهاتف,نوع المشروع,الحالة,تاريخ الطلب\n';
    this.requests.forEach(r => {
      csv += `"${r.trackingId}","${r.clientName}","${r.email}","${r.phone}","${r.projectType}","${r.status}","${r.createdAt}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mohamed-khamis-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  setupModalsAndEvents() {
    // Modal controls for admin if needed
  }

  formatStatus(status) {
    const map = {
      new: 'جديد',
      under_review: 'قيد المراجعة',
      contacting: 'جاري التواصل',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      rejected: 'مرفوض',
      archived: 'مؤرشف'
    };
    return map[status] || status;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const adminDashboard = new AdminDashboard();
  adminDashboard.init();
});
