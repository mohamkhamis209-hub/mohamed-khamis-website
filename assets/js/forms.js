/**
 * MOHAMED KHAMIS — Client-side Form Handling & Serverless Integration
 * Handles Project Inquiries & Contact Messages
 */

import { APP_CONFIG } from './config.js';
import { i18n } from './i18n.js';

export function initForms() {
  setupProjectRequestForm();
  setupContactForm();
}

/**
 * Setup Project Request Form
 */
function setupProjectRequestForm() {
  const form = document.getElementById('project-request-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const alertBox = document.getElementById('request-form-alert');
  const trackingContainer = document.getElementById('tracking-result-box');
  const trackingCodeEl = document.getElementById('tracking-code-val');
  const copyBtn = document.getElementById('copy-tracking-btn');

  if (copyBtn && trackingCodeEl) {
    copyBtn.addEventListener('click', () => {
      const code = trackingCodeEl.textContent;
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = i18n.t('formCopied');
          setTimeout(() => { copyBtn.textContent = originalText; }, 2500);
        });
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientName = form.querySelector('[name="clientName"]')?.value?.trim();
    const email = form.querySelector('[name="email"]')?.value?.trim();
    const phone = form.querySelector('[name="phone"]')?.value?.trim();
    const country = form.querySelector('[name="country"]')?.value?.trim() || '';
    const projectType = form.querySelector('[name="projectType"]')?.value?.trim();
    const projectDescription = form.querySelector('[name="projectDescription"]')?.value?.trim();
    const budget = form.querySelector('[name="budget"]')?.value?.trim() || '';
    const contactMethod = form.querySelector('[name="contactMethod"]')?.value || 'whatsapp';
    const honeypot = form.querySelector('[name="website"]')?.value || '';

    // Bot honeypot check
    if (honeypot) return;

    // Validation
    if (!clientName || clientName.length < 2) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى إدخال اسم صحيح لا يقل عن حرفين.' : 'Please enter a valid name (min 2 characters).', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.', 'error');
      return;
    }

    if (!phone || phone.length < 7) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى إدخال رقم هاتف صحيح.' : 'Please enter a valid phone number.', 'error');
      return;
    }

    if (!projectType) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى اختيار نوع المشروع المطلوب.' : 'Please select the project category.', 'error');
      return;
    }

    if (!projectDescription || projectDescription.length < 10) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى كتابة وصف تفصيلي للمشروع (10 أحرف كحد أدنى).' : 'Please provide project details (min 10 characters).', 'error');
      return;
    }

    // Set loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> <span>${i18n.t('formSubmitting')}</span>`;
    hideAlert(alertBox);
    if (trackingContainer) trackingContainer.style.display = 'none';

    try {
      const response = await fetch(APP_CONFIG.endpoints.submitRequest, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          email,
          phone,
          country,
          projectType,
          projectDescription,
          budget,
          contactMethod
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        showAlert(alertBox, i18n.isRTL() ? result.messageAr || i18n.t('formSuccessDesc') : result.messageEn || i18n.t('formSuccessDesc'), 'success');
        if (trackingContainer && trackingCodeEl && result.trackingId) {
          trackingCodeEl.textContent = result.trackingId;
          trackingContainer.style.display = 'flex';
        }
      } else {
        const errorMsg = i18n.isRTL() 
          ? (result.errorAr || result.error || i18n.t('errorDesc')) 
          : (result.error || i18n.t('errorDesc'));
        showAlert(alertBox, errorMsg, 'error');
      }
    } catch (err) {
      console.error('Request submission error:', err);
      showAlert(alertBox, i18n.t('errorDesc'), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

/**
 * Setup Contact Form
 */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const alertBox = document.getElementById('contact-form-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]')?.value?.trim();
    const email = form.querySelector('[name="email"]')?.value?.trim();
    const subject = form.querySelector('[name="subject"]')?.value?.trim();
    const message = form.querySelector('[name="message"]')?.value?.trim();
    const honeypot = form.querySelector('[name="website"]')?.value || '';

    if (honeypot) return;

    if (!name || name.length < 2) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى إدخال اسم صحيح.' : 'Please enter a valid name.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.', 'error');
      return;
    }

    if (!subject || subject.length < 3) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى إدخال موضوع الرسالة.' : 'Please enter a subject.', 'error');
      return;
    }

    if (!message || message.length < 5) {
      showAlert(alertBox, i18n.isRTL() ? 'يرجى كتابة نص الرسالة.' : 'Please enter your message.', 'error');
      return;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> <span>${i18n.t('contactFormSubmitting')}</span>`;
    hideAlert(alertBox);

    try {
      const response = await fetch(APP_CONFIG.endpoints.submitMessage, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        showAlert(alertBox, i18n.isRTL() ? result.messageAr || i18n.t('contactFormSuccess') : result.messageEn || i18n.t('contactFormSuccess'), 'success');
      } else {
        const errorMsg = i18n.isRTL() ? (result.errorAr || result.error || i18n.t('errorDesc')) : (result.error || i18n.t('errorDesc'));
        showAlert(alertBox, errorMsg, 'error');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      showAlert(alertBox, i18n.t('errorDesc'), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

function showAlert(box, message, type) {
  if (!box) return;
  box.textContent = message;
  box.className = `form-status-alert ${type}`;
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAlert(box) {
  if (!box) return;
  box.style.display = 'none';
  box.textContent = '';
  box.className = 'form-status-alert';
}
