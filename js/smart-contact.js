class SmartContactSystem {
    constructor() {
        this.leadScore = 0;
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.init();
    }

    init() {
        this.createSmartForm();
        this.setupEventListeners();
        this.initializeAnalytics();
    }

    createSmartForm() {
        const initForm = () => {
            
            const formHTML = `
                <div class="smart-contact-form">
                    <div class="form-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 25%"></div>
                        </div>
                        <span class="step-indicator">Step 1 of 4</span>
                    </div>
                    
                    <div class="form-steps">
                        <!-- Step 1: Basic Info -->
                        <div class="form-step active" data-step="1">
                            <h3>Let's get started</h3>
                            <p>Tell me a bit about yourself</p>
                            <div class="form-group">
                                <input type="text" id="name" name="name" placeholder="Your Name" required>
                            </div>
                            <div class="form-group">
                                <input type="email" id="email" name="email" placeholder="Email Address" required>
                            </div>
                            <div class="form-group">
                                <input type="text" id="company" name="company" placeholder="Company (Optional)">
                            </div>
                            <button type="button" class="btn btn-primary next-step">Next</button>
                        </div>

                        <!-- Step 2: Project Type -->
                        <div class="form-step" data-step="2">
                            <h3>What type of project?</h3>
                            <p>This helps me understand your needs better</p>
                            <div class="project-types">
                                <div class="project-type" data-value="web-app" data-score="10">
                                    <i class="fas fa-laptop-code"></i>
                                    <h4>Web Application</h4>
                                    <p>Custom web apps, dashboards, SaaS</p>
                                </div>
                                <div class="project-type" data-value="website" data-score="5">
                                    <i class="fas fa-globe"></i>
                                    <h4>Website</h4>
                                    <p>Business sites, portfolios, landing pages</p>
                                </div>
                                <div class="project-type" data-value="ecommerce" data-score="8">
                                    <i class="fas fa-shopping-cart"></i>
                                    <h4>E-commerce</h4>
                                    <p>Online stores, marketplaces</p>
                                </div>
                                <div class="project-type" data-value="api" data-score="7">
                                    <i class="fas fa-code"></i>
                                    <h4>API Development</h4>
                                    <p>Backend services, integrations</p>
                                </div>
                            </div>
                            <div class="form-navigation">
                                <button type="button" class="btn btn-outline prev-step">Back</button>
                                <button type="button" class="btn btn-primary next-step" disabled>Next</button>
                            </div>
                        </div>

                        <!-- Step 3: Budget & Timeline -->
                        <div class="form-step" data-step="3">
                            <h3>Project scope</h3>
                            <p>Help me provide the best recommendations</p>
                            <div class="form-group">
                                <label>Budget Range</label>
                                <select name="budget" required>
                                    <option value="">Select budget range</option>
                                    <option value="under-5k" data-score="3">Under $5,000</option>
                                    <option value="5k-15k" data-score="7">$5,000 - $15,000</option>
                                    <option value="15k-30k" data-score="10">$15,000 - $30,000</option>
                                    <option value="30k-plus" data-score="15">$30,000+</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Timeline</label>
                                <select name="timeline" required>
                                    <option value="">When do you need this?</option>
                                    <option value="asap" data-score="5">ASAP (Rush job)</option>
                                    <option value="1-2months" data-score="10">1-2 months</option>
                                    <option value="3-6months" data-score="8">3-6 months</option>
                                    <option value="flexible" data-score="6">Flexible</option>
                                </select>
                            </div>
                            <div class="form-navigation">
                                <button type="button" class="btn btn-outline prev-step">Back</button>
                                <button type="button" class="btn btn-primary next-step">Next</button>
                            </div>
                        </div>

                        <!-- Step 4: Project Details -->
                        <div class="form-step" data-step="4">
                            <h3>Tell me about your project</h3>
                            <p>The more details, the better I can help</p>
                            <div class="form-group">
                                <textarea name="message" placeholder="Describe your project, goals, and any specific requirements..." rows="6" required></textarea>
                            </div>
                            <div class="lead-score-display">
                                <div class="score-indicator">
                                    <span class="score-label">Project Priority:</span>
                                    <span class="score-value" id="leadScoreDisplay">Medium</span>
                                </div>
                            </div>
                            <div class="form-navigation">
                                <button type="button" class="btn btn-outline prev-step">Back</button>
                                <button type="submit" class="btn btn-primary submit-form">Send Message</button>
                            </div>
                        </div>
                    </div>

                    <div class="form-message" id="formMessage"></div>
                </div>
            `;

            // Replace existing contact form content
            const existingForm = document.querySelector('#contactForm');
            if (existingForm) {
                existingForm.innerHTML = formHTML;
                console.log('Smart contact form loaded successfully');
            } else {
                console.error('Contact form not found');
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initForm);
        } else {
            initForm();
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('next-step')) {
                this.nextStep();
            } else if (e.target.classList.contains('prev-step')) {
                this.prevStep();
            } else if (e.target.closest('.project-type')) {
                this.selectProjectType(e.target.closest('.project-type'));
            } else if (e.target.classList.contains('submit-form')) {
                e.preventDefault();
                this.submitForm();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.name === 'budget' || e.target.name === 'timeline') {
                this.updateLeadScore();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.type === 'text' || e.target.type === 'email') {
                this.validateStep();
            }
        });
    }

    nextStep() {
        if (!this.validateCurrentStep()) return;
        
        this.saveCurrentStepData();
        this.currentStep++;
        this.updateFormDisplay();
        this.updateProgress();
        this.trackEvent('form_step_completed', { step: this.currentStep - 1 });
    }

    prevStep() {
        this.currentStep--;
        this.updateFormDisplay();
        this.updateProgress();
    }

    selectProjectType(element) {
        document.querySelectorAll('.project-type').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        
        const score = parseInt(element.dataset.score);
        const value = element.dataset.value;
        
        this.formData.projectType = value;
        this.leadScore += score;
        
        const nextBtn = document.querySelector('.form-step.active .next-step');
        if (nextBtn) nextBtn.disabled = false;
        this.updateLeadScore();
    }

    updateFormDisplay() {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.querySelector('.progress-fill');
        const stepIndicator = document.querySelector('.step-indicator');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (stepIndicator) stepIndicator.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
    }

    validateCurrentStep() {
        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepEl.querySelectorAll('[required]');
        
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                this.showError('Please fill in all required fields');
                return false;
            }
        }

        if (this.currentStep === 2) {
            const selected = document.querySelector('.project-type.selected');
            if (!selected) {
                this.showError('Please select a project type');
                return false;
            }
        }

        return true;
    }

    saveCurrentStepData() {
        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        const inputs = currentStepEl.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.value) {
                this.formData[input.name] = input.value;
            }
        });
    }

    updateLeadScore() {
        const budgetSelect = document.querySelector('[name="budget"]');
        const timelineSelect = document.querySelector('[name="timeline"]');
        
        let score = 0;
        
        // Add project type score
        const selectedProject = document.querySelector('.project-type.selected');
        if (selectedProject) {
            score += parseInt(selectedProject.dataset.score);
        }
        
        // Add budget score
        if (budgetSelect && budgetSelect.value) {
            const option = budgetSelect.querySelector(`[value="${budgetSelect.value}"]`);
            if (option) score += parseInt(option.dataset.score);
        }
        
        // Add timeline score
        if (timelineSelect && timelineSelect.value) {
            const option = timelineSelect.querySelector(`[value="${timelineSelect.value}"]`);
            if (option) score += parseInt(option.dataset.score);
        }
        
        this.leadScore = score;
        this.displayLeadScore();
    }

    displayLeadScore() {
        const scoreDisplay = document.getElementById('leadScoreDisplay');
        if (!scoreDisplay) return;
        
        let priority, color;
        if (this.leadScore >= 25) {
            priority = 'High Priority';
            color = '#22c55e';
        } else if (this.leadScore >= 15) {
            priority = 'Medium Priority';
            color = '#f59e0b';
        } else {
            priority = 'Standard';
            color = '#6b7280';
        }
        
        scoreDisplay.textContent = priority;
        scoreDisplay.style.color = color;
    }

    async submitForm() {
        if (!this.validateCurrentStep()) return;
        
        this.saveCurrentStepData();
        
        const submitBtn = document.querySelector('.submit-form');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData();
            formData.append('access_key', '65b13d2d-da21-4380-8537-606ef2cd7c6e');
            formData.append('subject', `New ${this.getLeadPriority()} Lead: ${this.formData.name}`);
            formData.append('message', this.formatMessage());
            
            Object.keys(this.formData).forEach(key => {
                formData.append(key, this.formData[key]);
            });
            
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess();
                this.trackEvent('form_submitted', { 
                    leadScore: this.leadScore,
                    projectType: this.formData.projectType 
                });
                
                // Trigger appropriate follow-up based on lead score
                this.triggerFollowUp();
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            this.showError('Failed to send message. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    formatMessage() {
        return `
Lead Score: ${this.leadScore} (${this.getLeadPriority()})

Project Type: ${this.formData.projectType}
Budget: ${this.formData.budget}
Timeline: ${this.formData.timeline}
Company: ${this.formData.company || 'Not specified'}

Message:
${this.formData.message}
        `.trim();
    }

    getLeadPriority() {
        if (this.leadScore >= 25) return 'High Priority';
        if (this.leadScore >= 15) return 'Medium Priority';
        return 'Standard';
    }

    triggerFollowUp() {
        if (this.leadScore >= 25) {
            // High priority - show calendar booking
            this.showCalendarBooking();
        } else if (this.leadScore >= 15) {
            // Medium priority - show quick response promise
            this.showMediumPriorityMessage();
        }
        // Standard leads get standard confirmation
    }

    showCalendarBooking() {
        const message = `
            <div class="priority-message high-priority">
                <i class="fas fa-star"></i>
                <h4>High Priority Project Detected!</h4>
                <p>I'll respond within 2 hours. Want to skip the wait?</p>
                <button class="btn btn-primary" onclick="window.smartContact.openCalendar()">
                    <i class="fas fa-calendar"></i> Book a Call Now
                </button>
            </div>
        `;
        this.showMessage(message, 'success');
    }

    showMediumPriorityMessage() {
        const message = `
            <div class="priority-message medium-priority">
                <i class="fas fa-clock"></i>
                <h4>Thanks for your interest!</h4>
                <p>I'll get back to you within 24 hours with a detailed proposal.</p>
            </div>
        `;
        this.showMessage(message, 'success');
    }

    showSuccess() {
        const message = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h4>Message sent successfully!</h4>
                <p>I'll review your project details and get back to you soon.</p>
            </div>
        `;
        this.showMessage(message, 'success');
        
        // Reset form after delay
        setTimeout(() => {
            this.resetForm();
        }, 3000);
    }

    showError(message) {
        this.showMessage(`<i class="fas fa-exclamation-triangle"></i> ${message}`, 'error');
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('formMessage');
        if (messageEl) {
            messageEl.innerHTML = message;
            messageEl.className = `form-message ${type}`;
            messageEl.style.display = 'block';
        }
    }

    resetForm() {
        this.currentStep = 1;
        this.leadScore = 0;
        this.formData = {};
        this.updateFormDisplay();
        this.updateProgress();
        
        // Clear all form fields
        document.querySelectorAll('.smart-contact-form input, .smart-contact-form select, .smart-contact-form textarea').forEach(field => {
            field.value = '';
        });
        
        // Clear selections
        document.querySelectorAll('.project-type').forEach(el => el.classList.remove('selected'));
        
        // Hide message
        const messageEl = document.getElementById('formMessage');
        if (messageEl) messageEl.style.display = 'none';
    }

    openCalendar() {
        window.open('https://calendly.com/nithinrichard1/30min', '_blank', 'noopener,noreferrer');
        this.trackEvent('calendar_opened', { source: 'high_priority_lead' });
    }

    trackEvent(eventName, properties) {
        if (window.analytics && window.analytics.track) {
            window.analytics.track(eventName, properties);
        }
    }

    initializeAnalytics() {
        this.trackEvent('smart_form_viewed', { timestamp: Date.now() });
    }

    validateStep() {
        const nextBtn = document.querySelector('.next-step');
        if (nextBtn && !nextBtn.disabled) {
            // Enable/disable next button based on validation
        }
    }
}

// Initialize smart contact system immediately
window.smartContact = new SmartContactSystem();