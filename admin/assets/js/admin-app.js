/**
 * MOHAMED KHAMIS — Executive Admin Dashboard Application
 * State Management, CRUD Operations, Firestore & Serverless Relays
 */

import { adminAuth } from './admin-auth.js';
import { AdminImageUploader } from './admin-upload.js';
import { INITIAL_SERVICES } from '../../assets/js/services-data.js';
import { INITIAL_PROJECTS } from '../../assets/js/projects-data.js';
import { APP_CONFIG } from '../../assets/js/config.js';

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
    await this.fetchStatsFromApi();
    this.renderRequestsTable();
    this.renderProjectsAdmin();
    this.renderServicesAdmin();
    this.setupProfileAndSettingsForms();
  }

  async fetchStatsFromApi() {
    try {
      const token = await adminAuth.getIdToken();
      if (!token) return;

      const response = await fetch(APP_CONFIG.endpoints.adminApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'get-dashboard-stats' })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.stats) {
          const stats = result.stats;
          document.getElementById('kpi-total-requests').textContent = stats.totalRequests;
          document.getElementById('kpi-new-requests').textContent = stats.newRequests;
          document.getElementById('kpi-unread-messages').textContent = stats.unreadMessages;
          document.getElementById('kpi-published-projects').textContent = stats.publishedProjects;
        }
      }
    } catch (e) {
      console.log('Stats fetch fallback to local indicators');
    }
  }

  renderRequestsTable(filter = 'all') {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;

    if (this.requests.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 30px;">
            لا توجد طلبات عملاء مسجلة حالياً في النظام.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.requests.map(req => `
      <tr>
        <td style="font-family: 'Inter', monospace; font-weight: 700; color: var(--admin-cyan);">${req.trackingId}</td>
        <td><strong>${req.clientName}</strong></td>
        <td>${req.email}</td>
        <td>${req.projectType}</td>
        <td><span class="status-pill status-${req.status}">${this.formatStatus(req.status)}</span></td>
        <td>${new Date(req.createdAt).toLocaleDateString('ar-EG')}</td>
        <td>
          <button class="btn-admin btn-admin-secondary btn-sm view-req-btn" data-id="${req.trackingId}">
            عرض وتحديث
          </button>
        </td>
      </tr>
    `).join('');
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

        const token = await adminAuth.getIdToken();
        if (!token) return;

        try {
          const response = await fetch(APP_CONFIG.endpoints.adminApi, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              action: 'update-site-settings',
              settings: { siteName, tagline, contactEmail, workPhone, workWhatsapp, maintenanceMode }
            })
          });

          const resJson = await response.json();
          if (response.ok && resJson.success) {
            alert('تم حفظ إعدادات الموقع بنجاح في قاعدة البيانات.');
          } else {
            alert(resJson.error || 'فشل حفظ الإعدادات.');
          }
        } catch (err) {
          alert('خطأ أثناء الاتصال بالخادم.');
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
