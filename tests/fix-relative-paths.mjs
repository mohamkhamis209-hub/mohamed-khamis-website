import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rootHtmlFiles = [
  'index.html',
  'about.html',
  'services.html',
  'projects.html',
  'request.html',
  'contact.html',
  'privacy.html',
  'terms.html',
  '404.html'
];

for (const file of rootHtmlFiles) {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace root-relative asset and page paths with relative ./
  content = content.replace(/href=\"\/assets\//g, 'href="./assets/');
  content = content.replace(/src=\"\/assets\//g, 'src="./assets/');
  content = content.replace(/href=\"\/manifest\.webmanifest\"/g, 'href="./manifest.webmanifest"');
  content = content.replace(/href=\"\/\"(?=[\s>])/g, 'href="./"');
  content = content.replace(/href=\"\/about\.html\"/g, 'href="./about.html"');
  content = content.replace(/href=\"\/services\.html\"/g, 'href="./services.html"');
  content = content.replace(/href=\"\/projects\.html\"/g, 'href="./projects.html"');
  content = content.replace(/href=\"\/request\.html\"/g, 'href="./request.html"');
  content = content.replace(/href=\"\/contact\.html\"/g, 'href="./contact.html"');
  content = content.replace(/href=\"\/privacy\.html\"/g, 'href="./privacy.html"');
  content = content.replace(/href=\"\/terms\.html\"/g, 'href="./terms.html"');
  content = content.replace(/href=\"\/admin\"/g, 'href="./admin/"');
  content = content.replace(/href=\"\/admin\/\"/g, 'href="./admin/"');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${file} to 100% relative paths.`);
}

// Update admin/index.html
const adminIndex = path.join(rootDir, 'admin', 'index.html');
if (fs.existsSync(adminIndex)) {
  let content = fs.readFileSync(adminIndex, 'utf-8');
  content = content.replace(/href=\"\/assets\//g, 'href="../assets/');
  content = content.replace(/src=\"\/assets\//g, 'src="../assets/');
  content = content.replace(/href=\"\/admin\/assets\//g, 'href="./assets/');
  content = content.replace(/src=\"\/admin\/assets\//g, 'src="./assets/');
  content = content.replace(/href=\"\/\"(?=[\s>])/g, 'href="../"');
  fs.writeFileSync(adminIndex, content, 'utf-8');
  console.log('Updated admin/index.html to relative paths.');
}
