/** Client-side forms: write validated public submissions directly to Firestore. */
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from './firebase-client.js';
import { i18n } from './i18n.js';

export function initForms() {
  setupProjectRequestForm();
  setupContactForm();
}

function makeTrackingId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const suffix = [...bytes].map(value => alphabet[value % alphabet.length]).join('');
  return `MK-REQ-${new Date().getFullYear()}-${suffix}`;
}

function setupProjectRequestForm() {
  const form = document.getElementById('project-request-form');
  if (!form) return;
  const submitBtn = form.querySelector('button[type="submit"]');
  const alertBox = document.getElementById('request-form-alert');
  const trackingContainer = document.getElementById('tracking-result-box');
  const trackingCodeEl = document.getElementById('tracking-code-val');
  const copyBtn = document.getElementById('copy-tracking-btn');

  copyBtn?.addEventListener('click', () => {
    const code = trackingCodeEl?.textContent;
    if (code) navigator.clipboard.writeText(code).then(() => {
      const old = copyBtn.textContent;
      copyBtn.textContent = i18n.t('formCopied');
      setTimeout(() => { copyBtn.textContent = old; }, 2500);
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const value = name => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';
    const clientName = value('clientName');
    const email = value('email').toLowerCase();
    const phone = value('phone');
    const country = value('country');
    const projectType = value('projectType');
    const projectDescription = value('projectDescription');
    const budget = value('budget');
    const contactMethod = value('contactMethod') || 'whatsapp';
    if (value('website')) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (clientName.length < 2) return showAlert(alertBox, 'يرجى إدخال اسم صحيح لا يقل عن حرفين.', 'error');
    if (!emailRegex.test(email)) return showAlert(alertBox, 'يرجى إدخال بريد إلكتروني صحيح.', 'error');
    if (phone.length < 7) return showAlert(alertBox, 'يرجى إدخال رقم هاتف صحيح.', 'error');
    if (!projectType) return showAlert(alertBox, 'يرجى اختيار نوع المشروع المطلوب.', 'error');
    if (projectDescription.length < 10) return showAlert(alertBox, 'يرجى كتابة وصف تفصيلي للمشروع (10 أحرف كحد أدنى).', 'error');

    const oldText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> <span>${i18n.t('formSubmitting')}</span>`;
    hideAlert(alertBox);
    if (trackingContainer) trackingContainer.style.display = 'none';

    try {
      const trackingId = makeTrackingId();
      await setDoc(doc(db, 'requests', trackingId), {
        trackingId, clientName, email, phone, country, projectType, projectDescription,
        budget, contactMethod, attachmentUrl: '', status: 'new', internalNotes: '',
        createdAt: new Date().toISOString(), createdAtServer: serverTimestamp()
      });
      form.reset();
      showAlert(alertBox, i18n.isRTL() ? 'تم استلام طلبك بنجاح، وسيتم التواصل معك قريباً.' : 'Your project request has been received successfully.', 'success');
      if (trackingContainer && trackingCodeEl) {
        trackingCodeEl.textContent = trackingId;
        trackingContainer.style.display = 'flex';
      }
    } catch (error) {
      console.error('Request submission error:', error);
      showAlert(alertBox, 'تعذر إرسال الطلب حالياً. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = oldText;
    }
  });
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const submitBtn = form.querySelector('button[type="submit"]');
  const alertBox = document.getElementById('contact-form-alert');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const value = name => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';
    const name = value('name');
    const email = value('email').toLowerCase();
    const subject = value('subject');
    const message = value('message');
    if (value('website')) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (name.length < 2) return showAlert(alertBox, 'يرجى إدخال اسم صحيح.', 'error');
    if (!emailRegex.test(email)) return showAlert(alertBox, 'يرجى إدخال بريد إلكتروني صحيح.', 'error');
    if (subject.length < 3 || message.length < 5) return showAlert(alertBox, 'يرجى إدخال موضوع ونص رسالة صحيحين.', 'error');

    const oldText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> <span>${i18n.t('contactFormSubmitting')}</span>`;
    hideAlert(alertBox);
    try {
      await addDoc(collection(db, 'messages'), {
        name, email, subject, message, read: false, archived: false,
        createdAt: new Date().toISOString(), createdAtServer: serverTimestamp()
      });
      form.reset();
      showAlert(alertBox, i18n.isRTL() ? 'تم إرسال رسالتك بنجاح. شكراً لتواصلك!' : 'Your message has been sent successfully. Thank you!', 'success');
    } catch (error) {
      console.error('Contact submission error:', error);
      showAlert(alertBox, 'تعذر إرسال الرسالة حالياً. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = oldText;
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
