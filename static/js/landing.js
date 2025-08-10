// Landing Page JavaScript
class LandingPage {
    constructor() {
        this.currentSection = 'home';
        this.guestName = null;
        this.isAuthenticated = false;
        this.leaderboardData = [];
        this.stats = { totalTests: 0, totalUsers: 0 };
        
        this.initializeElements();
        this.bindEvents();
        this.checkAuthStatus();
        this.loadStats();
        this.startTypingAnimation();
        this.scheduleGuestModal();
    }
    
    initializeElements() {
        // Navigation elements
        this.navLinks = document.querySelectorAll('.nav-link');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.sections = document.querySelectorAll('.section');
        
        // Button elements
        this.startTestBtn = document.getElementById('startTestBtn');
        this.takeTestBtn = document.getElementById('takeTestBtn');
        this.viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');
        this.refreshLeaderboardBtn = document.getElementById('refreshLeaderboardBtn');
        
        // Modal elements
        this.guestModal = document.getElementById('guestModal');
        this.guestForm = document.getElementById('guestForm');
        this.guestNameInput = document.getElementById('guestName');
        this.guestNameError = document.getElementById('guestNameError');
        this.continueAsGuestBtn = document.getElementById('continueAsGuestBtn');
        this.signUpInsteadBtn = document.getElementById('signUpInsteadBtn');
        
        // Content elements
        this.leaderboardList = document.getElementById('leaderboardList');
        this.totalTestsEl = document.getElementById('totalTests');
        this.totalUsersEl = document.getElementById('totalUsers');
        this.typingAnimation = document.getElementById('typingAnimation');
        this.contactForm = document.getElementById('contactForm');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }
    
    bindEvents() {
        // Navigation events
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });
        
        // Mobile menu toggle
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
        });
        
        // Button events
        this.startTestBtn.addEventListener('click', () => this.goToTypingTest());
        this.takeTestBtn.addEventListener('click', () => this.goToTypingTest());
        this.viewLeaderboardBtn.addEventListener('click', () => this.navigateToSection('leaderboard'));
        this.refreshLeaderboardBtn.addEventListener('click', () => this.loadLeaderboard());
        
        // Guest modal events
        this.guestForm.addEventListener('submit', (e) => this.handleGuestSubmit(e));
        this.signUpInsteadBtn.addEventListener('click', () => this.goToSignUp());
        
        // Contact form event
        this.contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        
        // Feedback system events
        this.initializeFeedbackSystem();
        
        // Close modal on background click
        this.guestModal.addEventListener('click', (e) => {
            if (e.target === this.guestModal) {
                this.closeGuestModal();
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
                this.hamburger.classList.remove('active');
                this.navMenu.classList.remove('active');
            }
        });
    }
    
    async checkAuthStatus() {
        try {
            const response = await fetch('/check_auth');
            const data = await response.json();
            this.isAuthenticated = data.authenticated;
            
            if (this.isAuthenticated) {
                this.guestName = data.user.username;
                // Don't show guest modal if user is already authenticated
                return;
            } else {
                // Check if there's a guest name stored from previous session
                this.guestName = sessionStorage.getItem('guestName');
            }
        } catch (error) {
            console.log('Auth check failed, continuing as guest');
            this.isAuthenticated = false;
            // Check if there's a guest name stored from previous session
            this.guestName = sessionStorage.getItem('guestName');
        }
    }
    
    scheduleGuestModal() {
        // Show guest modal after 2 seconds if not authenticated and no guest name
        setTimeout(() => {
            if (!this.isAuthenticated && !this.guestName && !sessionStorage.getItem('guestName')) {
                this.showGuestModal();
            }
        }, 2000);
    }
    
    showGuestModal() {
        this.guestModal.style.display = 'block';
        this.guestNameInput.focus();
        // Reset form
        this.guestForm.reset();
        this.hideError();
    }
    
    closeGuestModal() {
        this.guestModal.style.display = 'none';
    }
    
    async handleGuestSubmit(e) {
        e.preventDefault();
        
        const name = this.guestNameInput.value.trim();
        if (!name) {
            this.showError('Please enter your name');
            return;
        }
        
        if (name.length < 2) {
            this.showError('Name must be at least 2 characters long');
            return;
        }
        
        if (name.length > 50) {
            this.showError('Name must be less than 50 characters');
            return;
        }
        
        // Check if username already exists
        try {
            this.showLoading();
            const response = await fetch('/check_username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: name })
            });
            
            const data = await response.json();
            
            if (data.exists) {
                this.hideLoading();
                this.showError('This name is already taken. Please choose a different name.');
                return;
            }
            
            // Set guest name and close modal
            this.guestName = name;
            sessionStorage.setItem('guestName', name);
            this.hideLoading();
            this.closeGuestModal();
            this.showMessage(`Welcome, ${name}! You can now take the typing test.`, 'success');
            
        } catch (error) {
            this.hideLoading();
            console.error('Error checking username:', error);
            this.showError('Unable to verify name. Please try again.');
        }
    }
    
    goToSignUp() {
        this.closeGuestModal();
        window.location.href = '/test';
    }
    
    goToTypingTest() {
        if (this.isAuthenticated || this.guestName) {
            window.location.href = '/test';
        } else {
            this.showGuestModal();
        }
    }
    
    navigateToSection(sectionName) {
        // Update active navigation
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });
        
        // Show/hide sections
        this.sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionName) {
                section.classList.add('active');
            }
        });
        
        this.currentSection = sectionName;
        
        // Load section-specific data
        if (sectionName === 'leaderboard') {
            this.loadLeaderboard();
        }
        
        // Close mobile menu
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        
        // Update URL hash
        window.location.hash = sectionName;
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            this.stats = data;
            this.animateCounter(this.totalTestsEl, data.totalTests || 0);
            this.animateCounter(this.totalUsersEl, data.totalUsers || 0);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            // Set default values
            this.animateCounter(this.totalTestsEl, 1247);
            this.animateCounter(this.totalUsersEl, 856);
        }
    }
    
    async loadLeaderboard() {
        try {
            this.leaderboardList.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-cell">
                        <div class="loader"></div>
                        <p>Loading leaderboard...</p>
                    </td>
                </tr>
            `;
            
            const response = await fetch('/leaderboard');
            const data = await response.json();
            
            this.leaderboardData = data;
            this.renderLeaderboard(data);
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.leaderboardList.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-cell">
                        <p>Failed to load leaderboard. Please try again.</p>
                    </td>
                </tr>
            `;
        }
    }
    
    renderLeaderboard(data) {
        if (data.length === 0) {
            this.leaderboardList.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-cell">
                        <p>No results yet. Be the first to take a test!</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        const html = data.map((user, index) => `
            <tr>
                <td>#${index + 1}</td>
                <td>${this.escapeHtml(user.username)}</td>
                <td>${user.wpm}</td>
                <td>${user.accuracy}%</td>
                <td>${user.tests_taken}</td>
            </tr>
        `).join('');
        
        this.leaderboardList.innerHTML = html;
    }
    
    handleContactSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this.contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }
        
        // Simulate form submission
        this.showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
        this.contactForm.reset();
    }
    
    startTypingAnimation() {
        const texts = [
            'Welcome to Keyzio!',
            'Test your typing speed...',
            'Compete with others...',
            'Master your skills!'
        ];
        
        let currentIndex = 0;
        
        const animateText = () => {
            const text = texts[currentIndex];
            this.typingAnimation.textContent = '';
            
            let charIndex = 0;
            const typeText = () => {
                if (charIndex < text.length) {
                    this.typingAnimation.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeText, 100);
                } else {
                    setTimeout(() => {
                        currentIndex = (currentIndex + 1) % texts.length;
                        setTimeout(animateText, 1000);
                    }, 2000);
                }
            };
            
            typeText();
        };
        
        animateText();
    }
    
    animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const duration = 2000; // 2 seconds
        const stepTime = duration / 100;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, stepTime);
    }
    
    showError(message) {
        this.guestNameError.textContent = message;
        this.guestNameError.classList.add('show');
        this.guestNameInput.style.borderColor = 'var(--error)';
    }
    
    hideError() {
        this.guestNameError.classList.remove('show');
        this.guestNameInput.style.borderColor = '';
    }
    
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }
    
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
    
    showMessage(message, type = 'info') {
        // Create or get message container
        let messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(messageContainer);
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 8px;
            color: white;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: var(--shadow-lg);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // Set background color based on type
        const colors = {
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--primary-color)'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        messageEl.textContent = message;
        
        messageContainer.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateX(0)';
        }, 50);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageContainer.removeChild(messageEl);
                }
            }, 300);
        }, 5000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    initializeFeedbackSystem() {
        // Feedback elements
        this.feedbackIcon = document.getElementById('feedbackIcon');
        this.feedbackModal = document.getElementById('feedbackModal');
        this.feedbackForm = document.getElementById('feedbackForm');
        this.closeFeedbackModal = document.getElementById('closeFeedbackModal');
        this.cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
        this.feedbackText = document.getElementById('feedbackText');
        this.charCount = document.getElementById('charCount');
        this.feedbackSuccess = document.getElementById('feedbackSuccess');
        
        // Bind feedback events
        this.feedbackIcon.addEventListener('click', () => this.showFeedbackModal());
        this.closeFeedbackModal.addEventListener('click', () => this.hideFeedbackModal());
        this.cancelFeedbackBtn.addEventListener('click', () => this.hideFeedbackModal());
        this.feedbackForm.addEventListener('submit', (e) => this.handleFeedbackSubmit(e));
        
        // Character counter
        this.feedbackText.addEventListener('input', () => this.updateCharCounter());
        
        // Close modal on background click
        this.feedbackModal.addEventListener('click', (e) => {
            if (e.target === this.feedbackModal) {
                this.hideFeedbackModal();
            }
        });
    }
    
    showFeedbackModal() {
        this.feedbackModal.style.display = 'flex';
        this.feedbackText.focus();
        // Reset form
        this.feedbackForm.reset();
        this.feedbackForm.style.display = 'block';
        this.feedbackSuccess.style.display = 'none';
        this.updateCharCounter();
    }
    
    hideFeedbackModal() {
        this.feedbackModal.style.display = 'none';
    }
    
    updateCharCounter() {
        const length = this.feedbackText.value.length;
        this.charCount.textContent = length;
        
        // Update color based on length
        if (length > 4500) {
            this.charCount.style.color = '#ef4444';
        } else if (length > 4000) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = 'var(--text-secondary)';
        }
    }
    
    async handleFeedbackSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.feedbackForm);
        const feedback = formData.get('feedback').trim();
        const type = formData.get('type');
        
        // Validation
        if (!feedback) {
            this.showMessage('Please enter your feedback.', 'error');
            return;
        }
        
        if (feedback.length < 10) {
            this.showMessage('Feedback must be at least 10 characters long.', 'error');
            return;
        }
        
        if (feedback.length > 5000) {
            this.showMessage('Feedback must be less than 5000 characters.', 'error');
            return;
        }
        
        try {
            // Disable submit button
            const submitBtn = document.getElementById('submitFeedbackBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            const response = await fetch('/submit_feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    feedback: feedback,
                    type: type
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success message
                this.feedbackForm.style.display = 'none';
                this.feedbackSuccess.style.display = 'block';
                
                // Auto close after 3 seconds
                setTimeout(() => {
                    this.hideFeedbackModal();
                }, 3000);
                
            } else {
                this.showMessage(data.error || 'Failed to submit feedback. Please try again.', 'error');
            }
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showMessage('Failed to submit feedback. Please check your connection and try again.', 'error');
            
            // Re-enable submit button
            const submitBtn = document.getElementById('submitFeedbackBtn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Feedback';
        }
    }
}

// Initialize landing page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
    
    // Handle hash navigation
    if (window.location.hash) {
        const section = window.location.hash.substring(1);
        const landingPage = new LandingPage();
        setTimeout(() => {
            landingPage.navigateToSection(section);
        }, 100);
    }
});
