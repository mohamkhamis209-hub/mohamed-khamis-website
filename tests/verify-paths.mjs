import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const files = [
  'index.html', 'about.html', 'services.html', 'projects.html',
  'request.html', 'contact.html', 'privacy.html', 'terms.html',
  '404.html', 'admin/index.html'
];

let totalAbsolute = 0;
for (const f of files) {
  const content = fs.readFileSync(path.join(rootDir, f), 'utf-8');
  // Match href="/..." or src="/..." that do not start with //
  const matches = content.match(/(href|src)=\"\/[^\/][^\"]*\"/g) || [];
  if (matches.length > 0) {
    console.log(`[WARNING] ${f} still has absolute paths:`, matches);
    totalAbsolute += matches.length;
  }
}

if (totalAbsolute === 0) {
  console.log('✅ ALL HTML FILES VERIFIED: 100% RELATIVE PATHS (Ready for GitHub Pages & Netlify)!');
} else {
  console.log(`❌ Found ${totalAbsolute} remaining absolute paths.`);
}
