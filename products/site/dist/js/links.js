
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
