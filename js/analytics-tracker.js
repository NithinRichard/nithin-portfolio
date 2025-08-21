class AnalyticsTracker {
    constructor() {
        this.events = [];
        this.sessionData = {
            startTime: Date.now(),
            pageViews: 0,
            interactions: 0,
            scrollDepth: 0,
            timeOnPage: 0
        };
        this.conversionFunnel = {
            pageView: 0,
            heroView: 0,
            projectView: 0,
            contactFormStart: 0,
            contactFormComplete: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.trackPageView();
        this.initializeHeatmap();
        this.startSessionTracking();
    }

    setupEventListeners() {
        // Scroll tracking
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.sessionData.scrollDepth = maxScroll;
                
                // Track scroll milestones
                if (scrollPercent >= 25 && !this.scrollMilestones?.quarter) {
                    this.trackEvent('scroll_25_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, quarter: true };
                }
                if (scrollPercent >= 50 && !this.scrollMilestones?.half) {
                    this.trackEvent('scroll_50_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, half: true };
                }
                if (scrollPercent >= 75 && !this.scrollMilestones?.threeQuarter) {
                    this.trackEvent('scroll_75_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, threeQuarter: true };
                }
            }
        }, { passive: true });

        // Click tracking
        document.addEventListener('click', (e) => {
            this.trackClick(e);
            this.sessionData.interactions++;
        });

        // Form interactions
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.trackEvent('form_field_focus', {
                    fieldName: e.target.name || e.target.id,
                    fieldType: e.target.type
                });
            }
        }, true);

        // Section visibility tracking
        this.setupIntersectionObserver();

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden');
            } else {
                this.trackEvent('page_visible');
            }
        });

        // Before unload tracking
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });
    }

    trackPageView() {
        this.sessionData.pageViews++;
        this.conversionFunnel.pageView++;
        
        this.trackEvent('page_view', {
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: Date.now()
        });
    }

    trackClick(event) {
        const element = event.target;
        const clickData = {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            text: element.textContent?.trim().substring(0, 100),
            href: element.href,
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now()
        };

        // Special tracking for important elements
        if (element.matches('.btn, button')) {
            this.trackEvent('button_click', clickData);
        } else if (element.matches('a[href]')) {
            this.trackEvent('link_click', clickData);
        } else if (element.matches('.project-card, .project-card *')) {
            this.trackEvent('project_interaction', clickData);
            this.conversionFunnel.projectView++;
        }

        // Heatmap data collection
        this.recordHeatmapClick(event.clientX, event.clientY, element);
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.id || entry.target.className;
                    this.trackEvent('section_view', {
                        section: sectionName,
                        visibilityRatio: entry.intersectionRatio
                    });

                    // Update conversion funnel
                    if (entry.target.id === 'home') {
                        this.conversionFunnel.heroView++;
                    }
                }
            });
        }, { threshold: [0.1, 0.5, 0.9] });

        // Observe all sections
        document.querySelectorAll('section').forEach((section) => {
            observer.observe(section);
        });
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: {
                ...properties,
                sessionId: this.getSessionId(),
                timestamp: Date.now(),
                url: window.location.href
            }
        };

        this.events.push(event);
        
        // Send to analytics services
        this.sendToAnalytics(event);
        
        // Store locally for analysis
        this.storeEventLocally(event);
    }

    sendToAnalytics(event) {
        // Send to multiple analytics providers
        try {
            // Plausible
            if (window.plausible) {
                window.plausible(event.name, { props: event.properties });
            }

            // Google Analytics 4
            if (window.gtag) {
                window.gtag('event', event.name, event.properties);
            }

            // Console log for development
            console.log('Analytics Event:', event.name, event.properties);
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }

    storeEventLocally(event) {
        try {
            const stored = JSON.parse(localStorage.getItem('portfolio_analytics') || '[]');
            stored.push(event);
            
            // Keep only last 1000 events
            if (stored.length > 1000) {
                stored.splice(0, stored.length - 1000);
            }
            
            localStorage.setItem('portfolio_analytics', JSON.stringify(stored));
        } catch (error) {
            console.warn('Local analytics storage failed:', error);
        }
    }

    initializeHeatmap() {
        this.heatmapData = [];
        
        // Track mouse movements (throttled)
        let lastMouseTrack = 0;
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMouseTrack > 100) { // Throttle to every 100ms
                this.recordHeatmapMove(e.clientX, e.clientY);
                lastMouseTrack = now;
            }
        }, { passive: true });
    }

    recordHeatmapClick(x, y, element) {
        this.heatmapData.push({
            type: 'click',
            x: x,
            y: y,
            element: element.tagName,
            className: element.className,
            timestamp: Date.now()
        });
    }

    recordHeatmapMove(x, y) {
        // Sample mouse movements (don't record every single one)
        if (Math.random() < 0.1) { // 10% sampling rate
            this.heatmapData.push({
                type: 'move',
                x: x,
                y: y,
                timestamp: Date.now()
            });
        }
    }

    startSessionTracking() {
        // Update time on page every 30 seconds
        setInterval(() => {
            this.sessionData.timeOnPage = Date.now() - this.sessionData.startTime;
            
            // Track engagement milestones
            const minutes = Math.floor(this.sessionData.timeOnPage / 60000);
            if (minutes > 0 && minutes % 1 === 0 && !this.engagementMilestones?.[minutes]) {
                this.trackEvent('engagement_milestone', { minutes });
                this.engagementMilestones = { ...this.engagementMilestones, [minutes]: true };
            }
        }, 30000);
    }

    trackSessionEnd() {
        const sessionSummary = {
            ...this.sessionData,
            endTime: Date.now(),
            totalEvents: this.events.length,
            conversionFunnel: this.conversionFunnel,
            heatmapPoints: this.heatmapData.length
        };

        this.trackEvent('session_end', sessionSummary);
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    // A/B Testing functionality
    getVariant(testName, variants) {
        const userId = this.getUserId();
        const hash = this.hashCode(userId + testName);
        const variantIndex = Math.abs(hash) % variants.length;
        const variant = variants[variantIndex];
        
        this.trackEvent('ab_test_assignment', {
            testName,
            variant,
            userId
        });
        
        return variant;
    }

    getUserId() {
        if (!this.userId) {
            this.userId = localStorage.getItem('portfolio_user_id') || 
                         'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('portfolio_user_id', this.userId);
        }
        return this.userId;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    // Conversion tracking
    trackConversion(type, value = 0) {
        this.trackEvent('conversion', {
            type,
            value,
            conversionFunnel: this.conversionFunnel
        });

        // Update funnel based on conversion type
        if (type === 'contact_form_start') {
            this.conversionFunnel.contactFormStart++;
        } else if (type === 'contact_form_complete') {
            this.conversionFunnel.contactFormComplete++;
        }
    }

    // Performance monitoring
    trackPerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            const performanceData = {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
                connectionType: navigator.connection?.effectiveType,
                deviceMemory: navigator.deviceMemory
            };

            this.trackEvent('performance_metrics', performanceData);
        }
    }

    // Generate analytics report
    generateReport() {
        const report = {
            session: this.sessionData,
            events: this.events,
            conversionFunnel: this.conversionFunnel,
            heatmapData: this.heatmapData,
            conversionRate: this.calculateConversionRate()
        };

        return report;
    }

    calculateConversionRate() {
        const { pageView, contactFormComplete } = this.conversionFunnel;
        return pageView > 0 ? (contactFormComplete / pageView * 100).toFixed(2) : 0;
    }

    // Export data for analysis
    exportData() {
        const data = {
            analytics: this.generateReport(),
            localStorage: JSON.parse(localStorage.getItem('portfolio_analytics') || '[]')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize analytics tracking
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsTracker = new AnalyticsTracker();
    
    // Track performance after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.analyticsTracker.trackPerformance();
        }, 1000);
    });
});

// Expose global tracking function
window.trackEvent = (eventName, properties) => {
    if (window.analyticsTracker) {
        window.analyticsTracker.trackEvent(eventName, properties);
    }
};

window.trackConversion = (type, value) => {
    if (window.analyticsTracker) {
        window.analyticsTracker.trackConversion(type, value);
    }
};