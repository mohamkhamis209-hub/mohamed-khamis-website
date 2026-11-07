/** Shared Firebase client for the public site and admin dashboard. */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { APP_CONFIG } from './config.js';

export const firebaseApp = getApps().length ? getApp() : initializeApp(APP_CONFIG.firebase);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
