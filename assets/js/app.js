/**
 * MOHAMED KHAMIS — Main Client-Side Controller
 * Minimal Luxury Architecture, Bilingual RTL/LTR, Interactive Modals
 */

import { APP_CONFIG } from './config.js';
import { i18n } from './i18n.js';
import { themeManager } from './theme.js';
import { INITIAL_SERVICES } from './services-data.js';
import { INITIAL_PROJECTS } from './projects-data.js';
import { initForms } from './forms.js';
import { initPWA } from './pwa.js';

class MohamedKhamisApp {
  constructor() {
    this.services = [...INITIAL_SERVICES];
    this.projects = [...INITIAL_PROJECTS];
    this.siteSettings = {
      siteName: APP_CONFIG.brand.name,
      tagline: APP_CONFIG.brand.sloganAr,
      defaultLanguage: 'ar',
      defaultTheme: 'dark',
      maintenanceMode: false,
      contactEmail: APP_CONFIG.brand.defaultEmail,
      workPhone: '', // Hidden by default until configured
      workWhatsapp: '' // Hidden by default until configured
    };
  }

  async init() {
    // 1. Initialize Theme & Language
    themeManager.init();
    i18n.init();

    // 2. Fetch public Firestore settings if available
    await this.fetchPublicSettings();

    // 3. Render dynamic content
    this.renderServices();
    this.renderProjects();
    this.renderWorkProcess();
    this.renderFaq();
    this.renderWhatsAppStatus();

    // 4. Setup Global Event Listeners & Modals
    this.setupNavigation();
    this.setupLanguageAndThemeControls();
    this.setupModals();

    // 5. Initialize Forms & PWA
    initForms();
    initPWA();

    // Listen for language changes to re-render dynamic content
    i18n.onLanguageChange(() => {
      this.renderServices();
      this.renderProjects();
      this.renderWorkProcess();
      this.renderFaq();
      this.renderWhatsAppStatus();
    });
  }

  async fetchPublicSettings() {
    try {
      // Fetch public settings via Firestore REST API (no admin auth required for public document)
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${APP_CONFIG.firebase.projectId}/databases/(default)/documents/settings/public`;
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const json = await response.json();
        if (json.fields) {
          if (json.fields.siteName?.stringValue) this.siteSettings.siteName = json.fields.siteName.stringValue;
          if (json.fields.tagline?.stringValue) this.siteSettings.tagline = json.fields.tagline.stringValue;
          if (json.fields.contactEmail?.stringValue) this.siteSettings.contactEmail = json.fields.contactEmail.stringValue;
          if (json.fields.workPhone?.stringValue) this.siteSettings.workPhone = json.fields.workPhone.stringValue;
          if (json.fields.workWhatsapp?.stringValue) this.siteSettings.workWhatsapp = json.fields.workWhatsapp.stringValue;
          if (json.fields.maintenanceMode?.booleanValue !== undefined) this.siteSettings.maintenanceMode = json.fields.maintenanceMode.booleanValue;
        }
      }
    } catch (e) {
      // Fallback silently to static APP_CONFIG
      console.log('[App] Utilizing default local configuration');
    }

    if (this.siteSettings.maintenanceMode && !window.location.pathname.startsWith('/admin')) {
      document.body.innerHTML = `
        <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #060B18; color: #F8FAFC; text-align: center; padding: 24px;">
          <img src="/assets/images/logo-mk.svg" alt="MOHAMED KHAMIS" style="max-width: 260px; margin-bottom: 24px;">
          <h1 style="font-size: 2rem; margin-bottom: 12px; color: #00F2FE;">وضع الصيانة والتحديث</h1>
          <p style="color: #94A3B8; max-width: 500px; font-size: 1.1rem; line-height: 1.8;">الموقع يخضع حالياً لتحديثات دورية لتحسين الأداء وتجربة المستخدم. سنعاود العمل قريباً.</p>
        </div>
      `;
    }
  }

  renderWhatsAppStatus() {
    // Only display phone and WhatsApp when an approved business number is configured
    const whatsappBtns = document.querySelectorAll('.whatsapp-action-btn');
    const phoneContainers = document.querySelectorAll('.work-phone-container');

    if (this.siteSettings.workWhatsapp && this.siteSettings.workWhatsapp.trim() !== '') {
      whatsappBtns.forEach(btn => {
        btn.style.display = 'inline-flex';
        btn.setAttribute('href', `https://wa.me/${this.siteSettings.workWhatsapp.replace(/[^0-9]/g, '')}`);
      });
    } else {
      whatsappBtns.forEach(btn => {
        btn.style.display = 'none';
      });
    }

    if (this.siteSettings.workPhone && this.siteSettings.workPhone.trim() !== '') {
      phoneContainers.forEach(el => {
        el.style.display = 'flex';
        const link = el.querySelector('a');
        if (link) {
          link.href = `tel:${this.siteSettings.workPhone.replace(/[^0-9+]/g, '')}`;
          link.textContent = this.siteSettings.workPhone;
        }
      });
    } else {
      phoneContainers.forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  renderServices(category = 'all') {
    const container = document.getElementById('services-grid-container');
    if (!container) return;

    const isRtl = i18n.isRTL();
    const filtered = category === 'all' 
      ? this.services 
      : this.services.filter(s => s.category === category);

    container.innerHTML = filtered.map(service => {
      const title = isRtl ? service.titleAr : service.titleEn;
      const shortDesc = isRtl ? service.shortDescAr : service.shortDescEn;

      return `
        <div class="service-card" data-service-id="${service.id}">
          <div>
            <div class="service-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3 class="service-title">${title}</h3>
            <p class="service-short-desc">${shortDesc}</p>
            <div class="service-tech-tags">
              ${service.technologies.slice(0, 4).map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="service-actions">
            <button class="btn btn-secondary btn-sm view-service-btn" data-id="${service.id}">
              ${i18n.t('serviceActionDetails')}
            </button>
            <a href="#request-section" class="btn btn-primary btn-sm request-service-btn" data-service-name="${title}">
              ${i18n.t('serviceActionRequest')}
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers
    container.querySelectorAll('.view-service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openServiceModal(id);
      });
    });

    container.querySelectorAll('.request-service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const serviceName = btn.getAttribute('data-service-name');
        const projectTypeSelect = document.getElementById('form-project-type');
        if (projectTypeSelect) {
          projectTypeSelect.value = serviceName;
        }
      });
    });
  }

  renderProjects() {
    const container = document.getElementById('projects-grid-container');
    if (!container) return;

    const isRtl = i18n.isRTL();
    container.innerHTML = this.projects.map(project => {
      const title = isRtl ? project.titleAr : project.titleEn;
      const stage = isRtl ? project.stageAr : project.stageEn;
      const shortDesc = isRtl ? project.shortDescAr : project.shortDescEn;

      return `
        <div class="project-card" data-project-id="${project.id}">
          <div class="project-cover-wrapper">
            <img src="${project.coverUrl}" alt="${title}" class="project-cover-img" loading="lazy">
            <span class="project-badge ${project.badgeClass}">${stage}</span>
          </div>
          <div class="project-body">
            <div>
              <h3 class="project-title">${title}</h3>
              <p class="project-desc">${shortDesc}</p>
              <div class="service-tech-tags">
                ${project.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
              </div>
            </div>
            <div class="project-footer">
              <button class="btn btn-secondary btn-sm view-project-btn" data-id="${project.id}">
                ${i18n.t('projectActionDetails')}
              </button>
              <span class="text-cyan" style="font-size: 0.85rem; font-weight: 700;">
                ${isRtl ? 'تصور تجريبي واقعي' : 'Functional Prototype'}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openProjectModal(id);
      });
    });
  }

  renderWorkProcess() {
    const container = document.getElementById('process-timeline-container');
    if (!container) return;

    const steps = [
      { num: '01', title: i18n.t('processStep1'), desc: i18n.t('processStep1Desc') },
      { num: '02', title: i18n.t('processStep2'), desc: i18n.t('processStep2Desc') },
      { num: '03', title: i18n.t('processStep3'), desc: i18n.t('processStep3Desc') },
      { num: '04', title: i18n.t('processStep4'), desc: i18n.t('processStep4Desc') },
      { num: '05', title: i18n.t('processStep5'), desc: i18n.t('processStep5Desc') },
      { num: '06', title: i18n.t('processStep6'), desc: i18n.t('processStep6Desc') },
      { num: '07', title: i18n.t('processStep7'), desc: i18n.t('processStep7Desc') },
      { num: '08', title: i18n.t('processStep8'), desc: i18n.t('processStep8Desc') }
    ];

    container.innerHTML = steps.map(s => `
      <div class="process-step-card">
        <div class="process-step-number">${s.num}</div>
        <h3 class="process-step-title">${s.title}</h3>
        <p class="process-step-desc">${s.desc}</p>
      </div>
    `).join('');
  }

  renderFaq() {
    const container = document.getElementById('faq-accordion-container');
    if (!container) return;

    const isRtl = i18n.isRTL();
    const faqs = [
      {
        q: isRtl ? 'كيف يتم تحديد تكلفة المشروع؟' : 'How is project cost determined?',
        a: isRtl 
          ? 'تعتمد التكلفة على تحليل المتطلبات الفعلية وحجم المخرجات ونوع التقنيات المستخدمة. نقدّم عرض سعر شفافاً ومفصلاً يحدد النطاق ومراحل الدفع دون أي تكاليف خفية.' 
          : 'Cost is determined based on requirements analysis, deliverables scope, and chosen technical stack. We provide a transparent, itemized proposal with clear milestones and no hidden fees.'
      },
      {
        q: isRtl ? 'هل يمكن تنفيذ جزء محدد من المشروع فقط؟' : 'Can you develop a specific module or phase of a project?',
        a: isRtl 
          ? 'نعم، يمكننا تطوير خدمات مخصصة مثل تصميم واجهات UI/UX، أو برمجة واجهات برمجية API، أو ربط الذكاء الاصطناعي مع نظام قائم، أو حل مشكلات الأداء.' 
          : 'Yes, we handle specialized modular contracts such as UI/UX design, custom API development, AI integration into legacy architectures, or performance audits.'
      },
      {
        q: isRtl ? 'هل يتم العمل مع عملاء خارج جمهورية مصر العربية؟' : 'Do you collaborate with international clients outside Egypt?',
        a: isRtl 
          ? 'بالتأكيد. نعمل مع أفراد وشركات من مختلف أنحاء العالم العربي والعالم عبر قنوات التواصل السحابية واجتماعات المتابعة الرقمية.' 
          : 'Certainly. We collaborate with clients and enterprises across the GCC, Europe, and worldwide through cloud collaboration tools and digital check-ins.'
      },
      {
        q: isRtl ? 'هل يوجد دعم فني بعد التسليم؟' : 'Is post-delivery maintenance and technical support included?',
        a: isRtl 
          ? 'نعم، يشمل كل مشروع فترة ضمان ودعم تشغيلي مجاني لمتابعة الاستقرار ومعالجة أي استفسارات، مع إمكانية تجديد اتفاقيات الصيانة الدورية.' 
          : 'Yes, every project includes a warranty and operational stewardship period to guarantee stability, with optional ongoing maintenance SLAs.'
      },
      {
        q: isRtl ? 'ما هي المدة المتوقعة لتنفيذ المشروع؟' : 'What is the anticipated project delivery timeline?',
        a: isRtl 
          ? 'تتفاوت المدة باختلاف حجم المشروع ونطاقه؛ فالمواقع التعريفية قد تستغرق من أسبوع إلى أسبوعين، بينما تستغرق المنصات والأنظمة المتكاملة من 4 إلى 8 أسابيع.' 
          : 'Timelines vary by complexity: landing portals typically take 1-2 weeks, while full-scale ERP or LMS platforms take 4-8 weeks with phased sprints.'
      },
      {
        q: isRtl ? 'كيف يمكنني متابعة مراحل تنفيذ مشروعي؟' : 'How can I monitor the progress of my project?',
        a: isRtl 
          ? 'نوفر تقارير متابعة دورية ورابط معاينة تجريبي مباشر (Staging Environment) لمشاهدة واختبار التطورات خطوة بخطوة قبل الإطلاق النهائي.' 
          : 'We deliver structured milestone updates alongside a live Staging Environment, allowing you to review and test deliverables continuously.'
      }
    ];

    container.innerHTML = faqs.map((faq, idx) => `
      <div class="faq-item ${idx === 0 ? 'open' : ''}">
        <button class="faq-question-btn">
          <span>${faq.q}</span>
          <svg class="faq-icon-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="faq-answer-pane" style="${idx === 0 ? 'max-height: 200px;' : ''}">
          <p>${faq.a}</p>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.faq-question-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const pane = item.querySelector('.faq-answer-pane');
        const isOpen = item.classList.contains('open');

        // Close all others
        container.querySelectorAll('.faq-item').forEach(other => {
          other.classList.remove('open');
          other.querySelector('.faq-answer-pane').style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('open');
          pane.style.maxHeight = pane.scrollHeight + 'px';
        }
      });
    });
  }

  setupNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle-btn');
    const navMenu = document.getElementById('nav-menu');
    const headerNav = document.getElementById('header-nav');

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });

      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
        });
      });
    }

    // Header scroll background elevation
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        headerNav?.classList.add('scrolled');
      } else {
        headerNav?.classList.remove('scrolled');
      }
    });

    // Services Filter Tabs
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-filter') || 'all';
        this.renderServices(cat);
      });
    });
  }

  setupLanguageAndThemeControls() {
    // Theme Switch
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        themeManager.toggleTheme();
      });
    });

    // Language Switch
    document.querySelectorAll('.lang-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        i18n.toggleLanguage();
      });
    });
  }

  setupModals() {
    const overlay = document.getElementById('app-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    }
  }

  openServiceModal(serviceId) {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return;

    const isRtl = i18n.isRTL();
    const title = isRtl ? service.titleAr : service.titleEn;
    const desc = isRtl ? service.descriptionAr : service.descriptionEn;
    const features = isRtl ? service.featuresAr : service.featuresEn;
    const useCases = isRtl ? service.useCasesAr : service.useCasesEn;

    const modalBody = document.getElementById('modal-body-content');
    const overlay = document.getElementById('app-modal-overlay');

    if (modalBody && overlay) {
      modalBody.innerHTML = `
        <div style="margin-bottom: 24px;">
          <span class="section-badge">${isRtl ? 'مجال تنفيذ معتمد' : 'Verified Capability'}</span>
          <h2 style="font-size: 1.8rem; margin-top: 10px; margin-bottom: 14px;">${title}</h2>
          <p style="font-size: 1.05rem; line-height: 1.8; color: var(--text-secondary);">${desc}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 1.1rem; color: var(--accent-cyan); margin-bottom: 12px;">
            ${isRtl ? 'أبرز المزايا والمواصفات:' : 'Key Capabilities & Features:'}
          </h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
            ${features.map(f => `
              <li style="display: flex; align-items: center; gap: 10px; color: var(--text-primary); font-size: 0.95rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 1.1rem; color: var(--accent-gold); margin-bottom: 12px;">
            ${isRtl ? 'حالات الاستخدام المقترحة:' : 'Recommended Use Cases:'}
          </h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
            ${useCases.map(u => `
              <li style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 0.95rem;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-gold);"></span>
                <span>${u}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 28px;">
          <h4 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">${i18n.t('projectTechUsed')}</h4>
          <div class="service-tech-tags">
            ${service.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 20px; display: flex; justify-content: flex-end;">
          <a href="#request-section" class="btn btn-primary btn-lg" onclick="document.getElementById('app-modal-overlay').classList.remove('active'); document.getElementById('form-project-type').value = '${title}';">
            ${i18n.t('serviceActionRequest')}
          </a>
        </div>
      `;
      overlay.classList.add('active');
    }
  }

  openProjectModal(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    const isRtl = i18n.isRTL();
    const title = isRtl ? project.titleAr : project.titleEn;
    const stage = isRtl ? project.stageAr : project.stageEn;
    const desc = isRtl ? project.descriptionAr : project.descriptionEn;
    const highlights = isRtl ? project.highlightsAr : project.highlightsEn;

    const modalBody = document.getElementById('modal-body-content');
    const overlay = document.getElementById('app-modal-overlay');

    if (modalBody && overlay) {
      modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
          <img src="${project.coverUrl}" alt="${title}" style="width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
          <span class="project-badge ${project.badgeClass}">${stage}</span>
          <h2 style="font-size: 1.8rem; margin-top: 14px; margin-bottom: 14px;">${title}</h2>
          <p style="font-size: 1.05rem; line-height: 1.8; color: var(--text-secondary);">${desc}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 1.1rem; color: var(--accent-cyan); margin-bottom: 12px;">${i18n.t('projectHighlightsTitle')}</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
            ${highlights.map(h => `
              <li style="display: flex; align-items: center; gap: 10px; color: var(--text-primary); font-size: 0.95rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${h}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 28px;">
          <h4 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">${i18n.t('projectTechUsed')}</h4>
          <div class="service-tech-tags">
            ${project.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
          <span class="text-muted" style="font-size: 0.85rem;">
            ${isRtl ? 'مشروع ونموذج تجريبي حقيقي لمحمد خميس' : 'Authentic Engineering Experiment by Mohamed Khamis'}
          </span>
          <a href="#request-section" class="btn btn-primary" onclick="document.getElementById('app-modal-overlay').classList.remove('active'); document.getElementById('form-project-type').value = '${title}';">
            ${i18n.t('navRequestBtn')}
          </a>
        </div>
      `;
      overlay.classList.add('active');
    }
  }
}

// Instantiate and initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new MohamedKhamisApp();
  app.init();
});
