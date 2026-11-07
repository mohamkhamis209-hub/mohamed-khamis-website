import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];
function test(name, ok) { checks.push({ name, ok }); console.log(`${ok ? '✅' : '❌'} ${name}`); }
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
const mustExist = [
  'index.html','about.html','services.html','projects.html','request.html','contact.html',
  'privacy.html','terms.html','404.html','manifest.webmanifest','sw.js','firestore.rules',
  'firebase.json','.firebaserc','assets/js/config.js','assets/js/firebase-client.js',
  'assets/js/forms.js','assets/js/protection.js','admin/index.html','admin/assets/js/admin-app.js',
  'admin/assets/js/admin-auth.js','admin/assets/js/admin-upload.js'
];
test('Core site and Firebase-only files exist', mustExist.every(file => fs.existsSync(path.join(root, file))));
const config = read('assets/js/config.js');
test('Firebase config targets the requested project', config.includes("projectId: 'mohamed-khamis'") && config.includes('1:534587371999:web:ae906a8cd8d377571a546a'));
test('ImgBB key is included in browser config as requested', config.includes("apiKey: '7e80b4d2c0145794b6f5951a12dfdb29'"));
test('Frontend request form writes directly to Firestore', read('assets/js/forms.js').includes("doc(db, 'requests', trackingId)") && !read('assets/js/forms.js').includes('fetch('));
test('Frontend contact form writes directly to Firestore', read('assets/js/forms.js').includes("collection(db, 'messages')") && read('assets/js/forms.js').includes('addDoc'));
test('Admin dashboard reads and updates Firestore directly', read('admin/assets/js/admin-app.js').includes("collection(db, 'requests')") && read('admin/assets/js/admin-app.js').includes('updateDoc'));
test('Admin image uploader uses ImgBB directly', read('admin/assets/js/admin-upload.js').includes('APP_CONFIG.imgbb.apiKey') && read('assets/js/config.js').includes('https://api.imgbb.com/1/upload'));
const rules = read('firestore.rules');
test('Firestore permits validated public request creation only', rules.includes('match /requests/{id}') && rules.includes('allow create: if') && rules.includes('allow read: if can(\'manageRequests\')'));
test('Firestore permits validated public messages and keeps them private', rules.includes('match /messages/{id}') && rules.includes('allow read: if can(\'manageMessages\')'));
test('Admin permissions remain enforced in Firestore rules', rules.includes("function can(permission)") && rules.includes("allow write: if can('manageSettings')"));
test('No Netlify or Firebase Functions dependency remains', !read('firebase.json').includes('functions') && !fs.existsSync(path.join(root, 'functions')) && !read('assets/js/config.js').includes('cloudfunctions.net'));
test('Developer-tools deterrent is loaded on public and admin pages', read('assets/js/app.js').includes("import './protection.js'") && read('admin/assets/js/admin-app.js').includes("import '../../../assets/js/protection.js'"));
test('PWA cache version refreshed and Firebase/ImgBB requests bypass cache', read('sw.js').includes('mk-cache-v5') && read('sw.js').includes('api.imgbb.com') && read('sw.js').includes('googleapis.com'));
const passed = checks.filter(item => item.ok).length;
console.log(`\nSUMMARY: ${passed}/${checks.length} checks passed.`);
if (passed !== checks.length) process.exitCode = 1;
