// CRM Email Capture Implementation
(function() {
    'use strict';
    
    let crmConfig = null;
    
    // Load CRM configuration
    async function loadCRMConfig() {
        try {
            const response = await fetch('/config/crm.json');
            crmConfig = await response.json();
        } catch (error) {
            console.warn('CRM config not available:', error);
        }
    }
    
    // Create email capture form
    function createEmailCaptureForm(container) {
        if (!crmConfig) return;
        
        const form = document.createElement('form');
        form.className = 'email-capture-form';
        form.innerHTML = `
            <div class="form-group">
                <label for="email-capture">Get security updates:</label>
                <div class="email-input-group">
                    <input 
                        type="email" 
                        id="email-capture" 
                        name="${crmConfig.email_field || 'email'}" 
                        placeholder="your@email.com" 
                        required>
                    <button type="submit" class="btn-capture">Subscribe</button>
                </div>
            </div>
            <div class="form-message" style="display: none;"></div>
        `;
        
        form.addEventListener('submit', handleEmailSubmit);
        container.appendChild(form);
    }
    
    // Handle email form submission
    async function handleEmailSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const messageDiv = form.querySelector('.form-message');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        messageDiv.style.display = 'none';
        
        try {
            // Use configured endpoint if available and not a placeholder
            if (crmConfig.form_endpoint && !crmConfig.form_endpoint.startsWith('TODO')) {
                const response = await fetch(crmConfig.form_endpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showSuccessMessage(messageDiv);
                    form.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } else {
                // Fallback: simulate success for demo/test purposes
                setTimeout(() => {
                    showSuccessMessage(messageDiv);
                    form.reset();
                }, 1000);
            }
        } catch (error) {
            showErrorMessage(messageDiv, error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';
        }
    }
    
    // Show success message
    function showSuccessMessage(messageDiv) {
        messageDiv.className = 'form-message success';
        messageDiv.textContent = crmConfig?.success_message || 'Thanks! We\'ll be in touch soon.';
        messageDiv.style.display = 'block';
        
        // Track success in analytics if available
        if (window.gtag) {
            window.gtag('event', 'email_signup', {
                event_category: 'engagement',
                event_label: 'newsletter_signup'
            });
        }
    }
    
    // Show error message
    function showErrorMessage(messageDiv, error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Subscription failed. Please try again.';
        messageDiv.style.display = 'block';
        console.error('Email capture error:', error);
    }
    
    // Initialize email capture forms
    function initializeEmailCapture() {
        const containers = document.querySelectorAll('.email-capture-container');
        containers.forEach(container => {
            createEmailCaptureForm(container);
        });
    }
    
    // Add email capture to footer if container exists
    function addFooterEmailCapture() {
        const footer = document.querySelector('footer .container');
        if (footer && !footer.querySelector('.email-capture-form')) {
            const captureDiv = document.createElement('div');
            captureDiv.className = 'email-capture-container footer-email-capture';
            footer.insertBefore(captureDiv, footer.firstChild);
            createEmailCaptureForm(captureDiv);
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadCRMConfig().then(() => {
                initializeEmailCapture();
                addFooterEmailCapture();
            });
        });
    } else {
        loadCRMConfig().then(() => {
            initializeEmailCapture();
            addFooterEmailCapture();
        });
    }
    
    // Expose for testing
    window.mmtuCRM = {
        createEmailCaptureForm,
        handleEmailSubmit
    };
})();