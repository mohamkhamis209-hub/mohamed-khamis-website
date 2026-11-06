/**
 * MOHAMED KHAMIS — Official Digital Brand & Platform Configuration
 * Firebase Web Config & Global Application Constants
 */

const isNetlify = typeof window !== 'undefined' && (
  window.location.hostname.includes('netlify.app') ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

// Fallback to Netlify production backend when accessed from GitHub Pages or custom domain
const backendOrigin = isNetlify ? '' : 'https://websitemohamedkhamis.netlify.app';

export const APP_CONFIG = {
  brand: {
    name: 'MOHAMED KHAMIS',
    titleAr: 'متخصص في التكنولوجيا والابتكار',
    titleEn: 'Technology & Innovation Specialist',
    sloganAr: 'التكنولوجيا تبدأ بفكرة، ونحن نحولها إلى واقع.',
    sloganEn: 'Your Vision. Our Technology.',
    taglineAr: 'نحوّل أفكارك إلى حلول رقمية.',
    taglineEn: 'Transforming ideas into digital solutions.',
    portraitUrl: 'assets/images/mohamed-khamis.jpg',
    defaultEmail: 'mohamkhamis209@gmail.com',
    superAdminUid: '6kUrmstc69T4AnwhoUJ4ZrFbRez2'
  },
  firebase: {
    projectId: 'mohamed-khamis',
    authDomain: 'mohamed-khamis.firebaseapp.com',
    storageBucket: 'mohamed-khamis.firebasestorage.app',
    messagingSenderId: '534587371999',
    appId: '1:534587371999:web'
  },
  endpoints: {
    submitRequest: `${backendOrigin}/.netlify/functions/submit-request`,
    submitMessage: `${backendOrigin}/.netlify/functions/submit-message`,
    uploadImage: `${backendOrigin}/.netlify/functions/upload-image`,
    adminApi: `${backendOrigin}/.netlify/functions/admin-api`
  },
  defaults: {
    language: 'ar',
    theme: 'dark',
    maintenanceMode: false
  }
};
