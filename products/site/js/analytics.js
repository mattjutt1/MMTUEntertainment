// GA4 Analytics Implementation
(function() {
    'use strict';
    
    let analyticsConfig = null;
    
    // Load analytics configuration
    async function loadAnalyticsConfig() {
        try {
            const response = await fetch('/config/analytics.json');
            analyticsConfig = await response.json();
            
            if (analyticsConfig.ga4_measurement_id && !analyticsConfig.ga4_measurement_id.startsWith('TODO')) {
                initializeGA4();
            }
        } catch (error) {
            console.warn('Analytics config not available:', error);
        }
    }
    
    // Initialize GA4 tracking
    function initializeGA4() {
        const measurementId = analyticsConfig.ga4_measurement_id;
        
        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', measurementId);
        
        // Track page view
        if (analyticsConfig.events.page_view) {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }
    
    // Track CTA clicks
    function trackCTAClick(element) {
        if (!analyticsConfig?.events.cta_click || !window.gtag) return;
        
        const product = element.getAttribute('data-stripe-product');
        const price = element.textContent.match(/\$(\d+)/)?.[1];
        
        window.gtag('event', 'cta_click', {
            event_category: 'engagement',
            event_label: product || 'unknown',
            value: price ? parseInt(price) : 0,
            custom_parameters: {
                product_tier: product,
                button_text: element.textContent.trim()
            }
        });
    }
    
    // Track purchase success
    function trackPurchaseSuccess(product, value) {
        if (!analyticsConfig?.events.purchase_success || !window.gtag) return;
        
        window.gtag('event', 'purchase', {
            transaction_id: Date.now().toString(),
            value: value,
            currency: 'USD',
            items: [{
                item_id: product,
                item_name: `Security Service ${product}`,
                category: 'security_services',
                quantity: 1,
                price: value
            }]
        });
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Track CTA button clicks
        document.addEventListener('click', function(event) {
            const element = event.target;
            if (element.matches('[data-stripe-product]')) {
                trackCTAClick(element);
            }
        });
        
        // Check for purchase success page
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            const product = urlParams.get('product');
            const value = urlParams.get('value');
            if (product && value) {
                trackPurchaseSuccess(product, parseInt(value));
            }
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadAnalyticsConfig();
            setupEventListeners();
        });
    } else {
        loadAnalyticsConfig();
        setupEventListeners();
    }
    
    // Expose for testing
    window.mmtuAnalytics = {
        trackCTAClick,
        trackPurchaseSuccess
    };
})();