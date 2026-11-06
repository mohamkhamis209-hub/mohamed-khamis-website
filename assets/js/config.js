/**
 * MOHAMED KHAMIS — Official Digital Brand & Platform Configuration
 * Firebase Web Config & Global Application Constants
 */

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
    submitRequest: '/.netlify/functions/submit-request',
    submitMessage: '/.netlify/functions/submit-message',
    uploadImage: '/.netlify/functions/upload-image',
    adminApi: '/.netlify/functions/admin-api'
  },
  defaults: {
    language: 'ar',
    theme: 'dark',
    maintenanceMode: false
  }
};
