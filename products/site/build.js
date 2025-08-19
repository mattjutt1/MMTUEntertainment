#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load links configuration (use test fixtures in TEST_LIVE mode)
const isTestLiveMode = process.env.TEST_LIVE === '1';
const configPath = isTestLiveMode 
  ? './e2e/fixtures/links-live.json'
  : './config/links.json';

const linksConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Create dist directory
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Copy all files from pages to dist
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    let content = fs.readFileSync(src, 'utf8');
    
    // Replace TODO placeholders with actual links (file-specific)
    if (src.includes('audit.html')) {
      content = content.replace(/data-stripe-link="TODO"/g, `data-stripe-link="${linksConfig.stripe.audit}"`);
    } else if (src.includes('kit.html')) {
      content = content.replace(/data-stripe-link="TODO"/g, `data-stripe-link="${linksConfig.stripe.kit}"`);
    }
    content = content.replace(/data-calendly-link="TODO"/g, `data-calendly-link="${linksConfig.scheduler.calendly}"`);
    
    // Replace template placeholders in templates
    if (src.includes('templates.md')) {
      content = content.replace(/TODO_AUDIT_URL/g, linksConfig.stripe.audit);
      content = content.replace(/TODO_KIT_URL/g, linksConfig.stripe.kit);
      content = content.replace(/TODO_CALENDLY_URL/g, linksConfig.scheduler.calendly);
    }
    
    fs.writeFileSync(dest, content);
  }
}

// Copy and process files
copyRecursive('./pages', './dist');

// Copy styles directory
if (fs.existsSync('./styles')) {
  copyRecursive('./styles', './dist/styles');
}

// Copy js directory (but we'll overwrite links.js later)
if (fs.existsSync('./js')) {
  copyRecursive('./js', './dist/js');
}

// Copy config directory
if (fs.existsSync('./config')) {
  copyRecursive('./config', './dist/config');
}

// Ensure js directory exists
if (!fs.existsSync('./dist/js')) {
  fs.mkdirSync('./dist/js', { recursive: true });
}

// Add click handlers for Stripe links (if not pending)
const jsContent = `
// Enhanced pending detector - checks for TODO, <...>, and "your_" patterns
function isPendingLink(link) {
  if (!link) return true;
  
  // Standard TODO patterns
  if (link === 'TODO' || link === 'TODO_KIT' || link.includes('TODO_')) return true;
  
  // Angular bracket patterns: <anything>
  if (link.includes('<') && link.includes('>')) return true;
  
  // "your_" placeholder patterns: your_stripe_url, your_calendly_link, etc.
  if (link.includes('your_')) return true;
  
  return false;
}

// Stripe link handlers
document.addEventListener('DOMContentLoaded', function() {
  const stripeButtons = document.querySelectorAll('[data-stripe-link]');
  stripeButtons.forEach(button => {
    const link = button.getAttribute('data-stripe-link');
    if (!isPendingLink(link)) {
      button.addEventListener('click', function() {
        window.open(link, '_blank');
      });
      button.style.cursor = 'pointer';
    } else {
      // Disable button if pending link
      button.disabled = true;
      button.style.opacity = '0.5';
      button.title = 'Payment link not configured yet';
    }
  });
  
  // Calendly link handlers
  const calendlyLinks = document.querySelectorAll('[data-calendly-link]');
  calendlyLinks.forEach(link => {
    const url = link.getAttribute('data-calendly-link');
    if (!isPendingLink(url)) {
      link.href = url;
      link.target = '_blank';
    } else {
      link.href = '#';
      link.style.opacity = '0.5';
      link.title = 'Calendly link not configured yet';
      link.addEventListener('click', e => e.preventDefault());
    }
  });
});
`;

// Write JavaScript file
fs.writeFileSync('./dist/js/links.js', jsContent);

// Update HTML files to include the JavaScript
const htmlFiles = ['./dist/index.html', './dist/offer/audit.html', './dist/offer/kit.html'];
htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Add script tag before closing body
    content = content.replace('</body>', '    <script src="/js/links.js"></script>\n</body>');
    fs.writeFileSync(file, content);
  }
});

console.log('Build complete! Links configuration applied.');
console.log('Current link status:');
console.log('- Audit Stripe link:', linksConfig.stripe.audit === 'TODO_AUDIT_URL' ? 'NOT CONFIGURED' : 'CONFIGURED');
console.log('- Kit Stripe link:', linksConfig.stripe.kit === 'TODO_KIT_URL' ? 'NOT CONFIGURED' : 'CONFIGURED');  
console.log('- Calendly link:', linksConfig.scheduler.calendly === 'TODO_CALENDLY_URL' ? 'NOT CONFIGURED' : 'CONFIGURED');