class ProjectShowcase {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadProjects();
        this.createFilterSystem();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    loadProjects() {
        this.projects = [
            {
                id: 'ecommerce-platform',
                title: 'E-commerce Platform',
                description: 'Full-stack e-commerce solution with real-time inventory, payment processing, and admin dashboard.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
                category: 'web-app',
                industry: 'retail',
                demoUrl: '#',
                codeUrl: '#',
                featured: true,
                metrics: {
                    performance: '+32% conversion',
                    speed: '-43% TTFB',
                    uptime: '99.9% uptime'
                },
                timeline: '6 weeks',
                client: 'Nova Labs',
                testimonial: {
                    text: 'Nithin delivered our MVP in 6 weeks. TTFB dropped by 43% and conversion improved 32% post-launch.',
                    author: 'Anita Kapoor',
                    role: 'Head of Product',
                    company: 'Nova Labs',
                    rating: 5
                },
                caseStudy: {
                    problem: 'DTC brand needed scalable storefront with slow TTFB and low conversion rates.',
                    solution: 'Implemented SSR with edge caching, optimized checkout flow, and real-time inventory.',
                    results: ['32% increase in conversion rate', '43% reduction in TTFB', '99.9% uptime during launch']
                }
            },
            {
                id: 'task-management',
                title: 'Real-time Task Management',
                description: 'Collaborative task board with real-time sync, team presence, and advanced filtering.',
                image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                technologies: ['Vue.js', 'FastAPI', 'Redis', 'WebSockets', 'PostgreSQL'],
                category: 'web-app',
                industry: 'productivity',
                demoUrl: '#',
                codeUrl: '#',
                featured: true,
                metrics: {
                    performance: '-50% p95 latency',
                    sync: '0 sync conflicts',
                    retention: '+22% DAU retention'
                },
                timeline: '8 weeks',
                client: 'Atlas Cloud',
                testimonial: {
                    text: 'Exceptionally fast iteration and clean architecture. We scaled to 10× traffic with zero downtime.',
                    author: 'James Lee',
                    role: 'CTO',
                    company: 'Atlas Cloud',
                    rating: 5
                },
                caseStudy: {
                    problem: 'Startup needed real-time team task board with sync conflicts and UX friction.',
                    solution: 'Built CRDT-based sync system with WebSocket connections and optimistic updates.',
                    results: ['50% reduction in p95 latency', 'Zero sync conflicts', '22% increase in DAU retention']
                }
            },
            {
                id: 'weather-dashboard',
                title: 'Weather Analytics Dashboard',
                description: 'Mobile-first PWA with real-time weather data, forecasting, and interactive visualizations.',
                image: 'https://images.unsplash.com/photo-1559028006-44a36f1143d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                technologies: ['JavaScript', 'Chart.js', 'Service Workers', 'IndexedDB', 'Cloudflare'],
                category: 'website',
                industry: 'utilities',
                demoUrl: '#',
                codeUrl: '#',
                featured: false,
                metrics: {
                    performance: '+35 Lighthouse points',
                    speed: 'p95 < 1.2s on 4G',
                    bundle: '-60% bundle size'
                },
                timeline: '3 weeks',
                client: 'Public Utility',
                testimonial: {
                    text: 'Great communication and measurable results. Lighthouse scores jumped from 68 to 96 in a week.',
                    author: 'Sara Rodrigues',
                    role: 'Growth Lead',
                    company: 'PixelCraft',
                    rating: 5
                },
                caseStudy: {
                    problem: 'Public utility needed fast, mobile-first weather dashboard with heavy client bundle.',
                    solution: 'Implemented code splitting, service worker caching, and progressive enhancement.',
                    results: ['60% reduction in bundle size', 'p95 < 1.2s on 4G', '+35 Lighthouse Performance points']
                }
            }
        ];

        this.filteredProjects = [...this.projects];
    }

    createFilterSystem() {
        const filterHTML = `
            <div class="project-filters">
                <div class="filter-tabs">
                    <button class="filter-btn active" data-filter="all">All Projects</button>
                    <button class="filter-btn" data-filter="web-app">Web Apps</button>
                    <button class="filter-btn" data-filter="website">Websites</button>
                    <button class="filter-btn" data-filter="featured">Featured</button>
                </div>
                <div class="filter-search">
                    <input type="text" placeholder="Search projects..." id="projectSearch">
                    <i class="fas fa-search"></i>
                </div>
            </div>
        `;

        const projectsSection = document.getElementById('projects');
        const sectionTitle = projectsSection.querySelector('.section-title');
        sectionTitle.insertAdjacentHTML('afterend', filterHTML);
    }

    setupEventListeners() {
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.handleFilterClick(e.target);
            } else if (e.target.classList.contains('project-demo-btn')) {
                this.openProjectDemo(e.target.dataset.projectId);
            } else if (e.target.classList.contains('view-case-study')) {
                this.openCaseStudy(e.target.dataset.projectId);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('projectSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Intersection observer for animations
        this.setupScrollAnimations();
    }

    handleFilterClick(button) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Apply filter
        this.currentFilter = button.dataset.filter;
        this.applyFilters();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.projects];

        // Apply category filter
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'featured') {
                filtered = filtered.filter(project => project.featured);
            } else {
                filtered = filtered.filter(project => project.category === this.currentFilter);
            }
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(project => 
                project.title.toLowerCase().includes(this.searchQuery) ||
                project.description.toLowerCase().includes(this.searchQuery) ||
                project.technologies.some(tech => tech.toLowerCase().includes(this.searchQuery))
            );
        }

        this.filteredProjects = filtered;
        this.renderProjects();
    }

    renderProjects() {
        const container = document.querySelector('.projects-container');
        if (!container) return;

        // Fade out current projects
        container.style.opacity = '0.5';

        setTimeout(() => {
            container.innerHTML = this.filteredProjects.map(project => this.createProjectCard(project)).join('');
            
            // Fade in new projects
            container.style.opacity = '1';
            
            // Reinitialize animations for new cards
            this.initializeCardAnimations();
        }, 300);
    }

    createProjectCard(project) {
        return `
            <div class="project-card enhanced-card" data-project-id="${project.id}">
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                    <div class="project-overlay">
                        <button class="project-demo-btn" data-project-id="${project.id}">
                            <i class="fas fa-play"></i> Live Demo
                        </button>
                    </div>
                </div>
                <div class="project-info">
                    <div class="project-header">
                        <h3 class="project-title">${project.title}</h3>
                        ${project.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                    <p class="project-description">${project.description}</p>
                    
                    <div class="project-metrics">
                        ${Object.entries(project.metrics).map(([key, value]) => 
                            `<div class="metric"><strong>${value}</strong></div>`
                        ).join('')}
                    </div>
                    
                    <div class="project-meta">
                        <div class="meta-item">
                            <span class="label">Timeline</span>
                            <span class="value">${project.timeline}</span>
                        </div>
                        <div class="meta-item">
                            <span class="label">Client</span>
                            <span class="value">${project.client}</span>
                        </div>
                    </div>
                    
                    <div class="project-tags">
                        ${project.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
                    </div>
                    
                    <div class="project-actions">
                        <button class="view-case-study" data-project-id="${project.id}">
                            <i class="fas fa-file-alt"></i> Case Study
                        </button>
                        <a href="${project.codeUrl}" target="_blank" rel="noopener">
                            <i class="fab fa-github"></i> Code
                        </a>
                    </div>
                    
                    ${project.testimonial ? this.createTestimonialSnippet(project.testimonial) : ''}
                </div>
            </div>
        `;
    }

    createTestimonialSnippet(testimonial) {
        return `
            <div class="testimonial-snippet">
                <div class="testimonial-stars">
                    ${'★'.repeat(testimonial.rating)}
                </div>
                <p class="testimonial-text">"${testimonial.text}"</p>
                <div class="testimonial-author">
                    <strong>${testimonial.author}</strong>
                    <span>${testimonial.role}, ${testimonial.company}</span>
                </div>
            </div>
        `;
    }

    openProjectDemo(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        // Create demo modal
        const modalHTML = `
            <div class="demo-modal" id="demoModal">
                <div class="demo-modal-content">
                    <div class="demo-header">
                        <h3>${project.title} - Live Demo</h3>
                        <button class="close-demo">&times;</button>
                    </div>
                    <div class="demo-iframe-container">
                        <iframe src="${project.demoUrl}" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <div class="demo-info">
                        <p>This is a live demonstration of ${project.title}. Feel free to interact with all features.</p>
                        <div class="demo-actions">
                            <a href="${project.demoUrl}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i> Open in New Tab
                            </a>
                            <a href="${project.codeUrl}" target="_blank" class="btn btn-outline">
                                <i class="fab fa-github"></i> View Code
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup modal events
        const modal = document.getElementById('demoModal');
        const closeBtn = modal.querySelector('.close-demo');
        
        closeBtn.addEventListener('click', () => this.closeDemoModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeDemoModal();
        });

        // Track demo view
        this.trackEvent('project_demo_viewed', { projectId, title: project.title });
    }

    closeDemoModal() {
        const modal = document.getElementById('demoModal');
        if (modal) {
            modal.remove();
        }
    }

    openCaseStudy(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project || !project.caseStudy) return;

        const caseStudy = project.caseStudy;
        const modalHTML = `
            <div class="case-study-modal" id="caseStudyModal">
                <div class="case-study-content">
                    <div class="case-study-header">
                        <h2>${project.title} - Case Study</h2>
                        <button class="close-case-study">&times;</button>
                    </div>
                    <div class="case-study-body">
                        <div class="case-study-section">
                            <h3><i class="fas fa-exclamation-triangle"></i> The Problem</h3>
                            <p>${caseStudy.problem}</p>
                        </div>
                        <div class="case-study-section">
                            <h3><i class="fas fa-lightbulb"></i> The Solution</h3>
                            <p>${caseStudy.solution}</p>
                        </div>
                        <div class="case-study-section">
                            <h3><i class="fas fa-chart-line"></i> The Results</h3>
                            <ul class="results-list">
                                ${caseStudy.results.map(result => `<li>${result}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="case-study-tech">
                            <h3><i class="fas fa-code"></i> Technologies Used</h3>
                            <div class="tech-stack">
                                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                            </div>
                        </div>
                        ${project.testimonial ? `
                            <div class="case-study-testimonial">
                                <h3><i class="fas fa-quote-left"></i> Client Feedback</h3>
                                ${this.createTestimonialSnippet(project.testimonial)}
                            </div>
                        ` : ''}
                    </div>
                    <div class="case-study-footer">
                        <a href="${project.demoUrl}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-external-link-alt"></i> View Live Project
                        </a>
                        <button class="btn btn-outline" onclick="this.openContactForm('${project.title}')">
                            <i class="fas fa-envelope"></i> Discuss Similar Project
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup modal events
        const modal = document.getElementById('caseStudyModal');
        const closeBtn = modal.querySelector('.close-case-study');
        
        closeBtn.addEventListener('click', () => this.closeCaseStudyModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeCaseStudyModal();
        });

        // Track case study view
        this.trackEvent('case_study_viewed', { projectId, title: project.title });
    }

    closeCaseStudyModal() {
        const modal = document.getElementById('caseStudyModal');
        if (modal) {
            modal.remove();
        }
    }

    openContactForm(projectTitle) {
        // Pre-fill contact form with project interest
        const contactBubble = document.querySelector('.contact-bubble');
        if (contactBubble) {
            contactBubble.click();
            
            // Pre-fill message
            setTimeout(() => {
                const messageField = document.querySelector('[name="message"]');
                if (messageField) {
                    messageField.value = `Hi Nithin, I'm interested in discussing a project similar to "${projectTitle}". `;
                }
            }, 500);
        }
    }

    initializeAnimations() {
        // Stagger animation for project cards
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    initializeCardAnimations() {
        // Reinitialize animations for newly rendered cards
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.project-card').forEach((card) => {
            observer.observe(card);
        });
    }

    trackEvent(eventName, properties) {
        if (window.analytics && window.analytics.track) {
            window.analytics.track(eventName, properties);
        }
    }
}

// Initialize project showcase
document.addEventListener('DOMContentLoaded', () => {
    window.projectShowcase = new ProjectShowcase();
});