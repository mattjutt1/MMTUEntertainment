// Links handler for three-tier revenue funnel
// Handles data-stripe-product attributes with config-driven URLs

// Enhanced pending detector - checks for TODO, <...>, and "your_" patterns
function isPendingLink(link) {
  if (!link) return true;
  
  // Standard TODO patterns
  if (link === 'TODO' || link.includes('TODO_')) return true;
  
  // Angular bracket patterns: <anything>
  if (link.includes('<') && link.includes('>')) return true;
  
  // "your_" placeholder patterns: your_stripe_url, your_calendly_link, etc.
  if (link.includes('your_')) return true;
  
  return false;
}

// Load configuration and set up buttons
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Load links configuration
    const response = await fetch('/config/links.json');
    const config = await response.json();
    
    // Handle Stripe product buttons
    const stripeButtons = document.querySelectorAll('[data-stripe-product]');
    stripeButtons.forEach(button => {
      const product = button.getAttribute('data-stripe-product');
      const link = config.stripe[product];
      
      if (!isPendingLink(link)) {
        // Live link - enable button with click handler
        button.addEventListener('click', function() {
          window.open(link, '_blank');
        });
        button.style.cursor = 'pointer';
      } else {
        // Pending link - show placeholder state
        button.textContent = button.textContent.replace(/Get |Start |Transform /, 'Link pending - ');
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
        button.title = 'Payment link not configured yet';
        
        // Add data attribute for testing
        button.setAttribute('data-stripe-link', 'TODO');
      }
    });
    
    // Handle Calendly links (for contact/scheduling)
    const calendlyLinks = document.querySelectorAll('[data-calendly-product]');
    calendlyLinks.forEach(link => {
      const url = config.scheduler.calendly;
      if (!isPendingLink(url)) {
        link.href = url;
        link.target = '_blank';
      } else {
        link.href = '#';
        link.style.opacity = '0.6';
        link.title = 'Calendly link not configured yet';
        link.addEventListener('click', e => e.preventDefault());
      }
    });
    
  } catch (error) {
    console.log('Links configuration not available, using placeholder mode');
    
    // Fallback: disable all Stripe buttons in placeholder mode
    const stripeButtons = document.querySelectorAll('[data-stripe-product]');
    stripeButtons.forEach(button => {
      button.textContent = button.textContent.replace(/Get |Start |Transform /, 'Link pending - ');
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
      button.title = 'Payment link not configured yet';
      button.setAttribute('data-stripe-link', 'TODO');
    });
  }
});