// Typing Speed Test - JavaScript Application

class TypingTest {
    constructor() {
        this.currentText = '';
        this.startTime = null;
        this.endTime = null;
        this.isTestActive = false;
        this.currentPosition = 0;
        this.errors = 0;
        this.timer = null;
        this.timeLimit = 60; // Default 1 minute
        this.timeLimitTimer = null;
        
        // Text display management
        this.words = [];
        this.currentLineIndex = 0;
        this.wordsPerLine = [];
        this.lineHeight = 1.6; // rem * line-height
        
        // User authentication state
        this.isAuthenticated = false;
        this.currentUser = null;
        
        this.initializeElements();
        this.bindEvents();
        this.checkAuthenticationStatus();
    }
    
    initializeElements() {
        // DOM elements
        this.elements = {
            textDisplay: document.getElementById('textDisplay'),
            typingInput: document.getElementById('typingInput'),
            usernameInput: document.getElementById('username'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            newTextBtn: document.getElementById('newTextBtn'),
            
            // Progress
            progressBar: document.getElementById('progressBar'),
            progressText: document.getElementById('progressText'),
            
            // Real-time stats
            currentWpm: document.getElementById('currentWpm'),
            currentAccuracy: document.getElementById('currentAccuracy'),
            currentTime: document.getElementById('currentTime'),
            currentErrors: document.getElementById('currentErrors'),
            
            // Modal elements
            resultsModal: document.getElementById('resultsModal'),
            closeModal: document.getElementById('closeModal'),
            finalWpm: document.getElementById('finalWpm'),
            finalAccuracy: document.getElementById('finalAccuracy'),
            finalTime: document.getElementById('finalTime'),
            finalChars: document.getElementById('finalChars'),
            tryAgainBtn: document.getElementById('tryAgainBtn'),
            viewLeaderboardBtn: document.getElementById('viewLeaderboardBtn'),
            
            // Authentication modal
            authModal: document.getElementById('authModal'),
            closeAuthModal: document.getElementById('closeAuthModal'),
            showLoginBtn: document.getElementById('showLoginBtn'),
            showSignupBtn: document.getElementById('showSignupBtn'),
            loginForm: document.getElementById('loginForm'),
            signupForm: document.getElementById('signupForm'),
            loginBtn: document.getElementById('loginBtn'),
            signupBtn: document.getElementById('signupBtn'),
            skipAuthBtn: document.getElementById('skipAuthBtn'),
            skipAuthBtn2: document.getElementById('skipAuthBtn2'),
            
            // Login form elements
            loginUsername: document.getElementById('loginUsername'),
            loginPassword: document.getElementById('loginPassword'),
            
            // Signup form elements
            signupUsername: document.getElementById('signupUsername'),
            signupEmail: document.getElementById('signupEmail'),
            signupPassword: document.getElementById('signupPassword'),
            confirmPassword: document.getElementById('confirmPassword'),
            
            // User info elements
            userInfo: document.getElementById('userInfo'),
            currentUsername: document.getElementById('currentUsername'),
            logoutBtn: document.getElementById('logoutBtn'),
            
            // Leaderboard
            leaderboardSection: document.getElementById('leaderboardSection'),
            leaderboardContainer: document.getElementById('leaderboardContainer'),
            refreshLeaderboard: document.getElementById('refreshLeaderboard'),
            hideLeaderboard: document.getElementById('hideLeaderboard'),
            showStatsBtn: document.getElementById('showStatsBtn'),
            
            // Time limit
            timeLimit: document.getElementById('timeLimit')
        };
    }
    
    bindEvents() {
        // Button events
        this.elements.startBtn.addEventListener('click', () => this.startTest());
        this.elements.resetBtn.addEventListener('click', () => this.resetTest());
        this.elements.newTextBtn.addEventListener('click', () => this.loadNewText());
        
        // Typing input events
        this.elements.typingInput.addEventListener('input', (e) => this.handleTyping(e));
        this.elements.typingInput.addEventListener('paste', (e) => e.preventDefault());
        
        // Modal events
        this.elements.closeModal.addEventListener('click', () => this.closeModal());
        this.elements.tryAgainBtn.addEventListener('click', () => this.tryAgain());
        this.elements.viewLeaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        
        // Authentication events
        this.elements.closeAuthModal.addEventListener('click', () => this.closeAuthModal());
        this.elements.showLoginBtn.addEventListener('click', () => this.showLoginForm());
        this.elements.showSignupBtn.addEventListener('click', () => this.showSignupForm());
        this.elements.loginBtn.addEventListener('click', () => this.handleLogin());
        this.elements.signupBtn.addEventListener('click', () => this.handleSignup());
        this.elements.skipAuthBtn.addEventListener('click', () => this.skipAuth());
        this.elements.skipAuthBtn2.addEventListener('click', () => this.skipAuth());
        this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Leaderboard events
        this.elements.refreshLeaderboard.addEventListener('click', () => this.loadLeaderboard());
        this.elements.hideLeaderboard.addEventListener('click', () => this.hideLeaderboard());
        this.elements.showStatsBtn.addEventListener('click', () => this.showUserStats());
        
        // Close modal on outside click
        this.elements.resultsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.resultsModal) {
                this.closeModal();
            }
        });
        
        this.elements.authModal.addEventListener('click', (e) => {
            if (e.target === this.elements.authModal) {
                this.skipAuth();
            }
        });
        
        // Enter key handling for forms
        this.elements.loginPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
        
        this.elements.confirmPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleSignup();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeAuthModal();
            }
        });
    }
    
    async startTest() {
        try {
            // Get time limit setting
            this.timeLimit = parseInt(this.elements.timeLimit.value);
            
            // Load new text
            const response = await fetch('/get_text');
            const data = await response.json();
            this.currentText = data.text;
            
            // Update UI
            this.displayTextWithCursor();
            this.elements.typingInput.disabled = false;
            this.elements.typingInput.focus();
            this.elements.typingInput.value = '';
            
            // Update button states
            this.elements.startBtn.disabled = true;
            this.elements.resetBtn.disabled = false;
            this.elements.newTextBtn.disabled = false;
            this.elements.timeLimit.disabled = true;
            
            // Start test
            this.startTime = Date.now();
            this.isTestActive = true;
            this.currentPosition = 0;
            this.errors = 0;
            
            // Start timer
            this.timer = setInterval(() => this.updateRealTimeStats(), 100);
            
            // Set time limit timer if specified
            if (this.timeLimit > 0) {
                this.timeLimitTimer = setTimeout(() => {
                    if (this.isTestActive) {
                        this.endTest(this.elements.typingInput.value, 'Time limit reached!');
                    }
                }, this.timeLimit * 1000);
            }
            
        } catch (error) {
            console.error('Error starting test:', error);
            alert('Failed to start test. Please try again.');
        }
    }
    
    resetTest() {
        this.isTestActive = false;
        this.currentPosition = 0;
        this.errors = 0;
        this.startTime = null;
        this.endTime = null;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        if (this.timeLimitTimer) {
            clearTimeout(this.timeLimitTimer);
            this.timeLimitTimer = null;
        }
        
        // Reset UI
        this.elements.typingInput.value = '';
        this.elements.typingInput.disabled = true;
        this.elements.textDisplay.innerHTML = '<p class="instruction-text">Click "Start Test" to begin typing!</p>';
        
        // Reset button states
        this.elements.startBtn.disabled = false;
        this.elements.resetBtn.disabled = true;
        this.elements.newTextBtn.disabled = true;
        this.elements.timeLimit.disabled = false;
        
        // Reset word tracking
        this.words = [];
        this.currentLineIndex = 0;
        this.wordsPerLine = [];
        
        // Reset stats
        this.updateStats(0, 100, 0, 0);
        this.updateProgress(0);
    }
    
    async loadNewText() {
        if (this.isTestActive) {
            if (!confirm('This will end your current test. Continue?')) {
                return;
            }
        }
        
        this.resetTest();
    }
    
    handleTyping(e) {
        if (!this.isTestActive) return;
        
        const typedText = e.target.value;
        this.currentPosition = typedText.length;
        
        // Update text display with colors
        this.displayTextWithCursor();
        
        // Check for test completion
        if (typedText.length >= this.currentText.length) {
            this.endTest(typedText);
        }
        
        // Update real-time stats
        this.updateRealTimeStats();
    }
    
    displayTextWithCursor() {
        if (!this.currentText) return;
        
        // Split text into words for line management
        if (this.words.length === 0) {
            this.words = this.currentText.split(' ');
            this.calculateWordsPerLine();
        }
        
        const typedText = this.elements.typingInput.value;
        const typedWords = typedText.split(' ');
        const currentTypedWord = typedWords[typedWords.length - 1] || '';
        const completedWords = typedWords.slice(0, -1);
        
        // Determine current line based on completed words
        let currentWordIndex = completedWords.length;
        let currentLineIdx = this.getLineForWordIndex(currentWordIndex);
        
        // Calculate display lines (show 3 lines)
        let startLineIdx = Math.max(0, currentLineIdx - 1); // Show current line in middle
        let endLineIdx = Math.min(this.wordsPerLine.length - 1, startLineIdx + 2);
        
        // Adjust if we're near the end
        if (endLineIdx - startLineIdx < 2 && startLineIdx > 0) {
            startLineIdx = Math.max(0, endLineIdx - 2);
        }
        
        let html = '<div class="text-to-type">';
        
        for (let lineIdx = startLineIdx; lineIdx <= endLineIdx; lineIdx++) {
            html += '<div class="line">';
            
            const lineStart = this.getWordIndexForLine(lineIdx);
            const lineEnd = lineStart + this.wordsPerLine[lineIdx];
            
            for (let wordIdx = lineStart; wordIdx < lineEnd; wordIdx++) {
                const word = this.words[wordIdx];
                const isCurrentWord = wordIdx === currentWordIndex;
                const isCompletedWord = wordIdx < completedWords.length;
                
                // Add space before word (except first word)
                if (wordIdx > lineStart) {
                    html += ' ';
                }
                
                if (isCompletedWord) {
                    // Word is fully typed - check if correct
                    const typedWord = completedWords[wordIdx];
                    const isCorrect = typedWord === word;
                    
                    for (let charIdx = 0; charIdx < Math.max(word.length, typedWord.length); charIdx++) {
                        const originalChar = word[charIdx] || '';
                        const typedChar = typedWord[charIdx] || '';
                        const className = originalChar === typedChar ? 'char correct' : 'char incorrect';
                        html += `<span class="${className}">${originalChar || typedChar}</span>`;
                    }
                } else if (isCurrentWord) {
                    // Currently typing this word
                    for (let charIdx = 0; charIdx < word.length; charIdx++) {
                        const char = word[charIdx];
                        let className = 'char';
                        
                        if (charIdx < currentTypedWord.length) {
                            className += currentTypedWord[charIdx] === char ? ' correct' : ' incorrect';
                        } else if (charIdx === currentTypedWord.length) {
                            className += ' current';
                        }
                        
                        html += `<span class="${className}">${char}</span>`;
                    }
                    
                    // Add cursor at end if we've typed the whole word
                    if (currentTypedWord.length === word.length) {
                        html += '<span class="char current"> </span>';
                    }
                } else {
                    // Future word - not typed yet
                    for (let charIdx = 0; charIdx < word.length; charIdx++) {
                        html += `<span class="char">${word[charIdx]}</span>`;
                    }
                }
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        this.elements.textDisplay.innerHTML = html;
    }
    
    calculateWordsPerLine() {
        // Simplified approach: estimate words per line based on average word length
        const containerWidth = this.elements.textDisplay.clientWidth - 48; // Account for padding
        const charWidth = 0.66; // Approximate character width in rem for Roboto Mono at 1.1rem
        const fontSize = 1.1; // rem
        const estimatedCharWidth = charWidth * fontSize * 16; // Convert to pixels (16px = 1rem)
        
        // Calculate average word length
        const totalChars = this.words.join(' ').length;
        const avgWordLength = totalChars / this.words.length;
        const avgWordWidth = avgWordLength * estimatedCharWidth;
        
        // Estimate words per line (with some padding for safety)
        const estimatedWordsPerLine = Math.max(8, Math.floor(containerWidth / avgWordWidth * 0.85));
        
        console.log('Container width:', containerWidth, 'Estimated words per line:', estimatedWordsPerLine);
        
        // Create lines with approximately equal word counts
        this.wordsPerLine = [];
        let remainingWords = this.words.length;
        let currentLineWords = 0;
        
        for (let i = 0; i < this.words.length; i += currentLineWords) {
            const remainingLines = Math.ceil(remainingWords / estimatedWordsPerLine);
            currentLineWords = Math.min(
                estimatedWordsPerLine,
                Math.ceil(remainingWords / remainingLines)
            );
            
            this.wordsPerLine.push(currentLineWords);
            remainingWords -= currentLineWords;
            
            if (remainingWords <= 0) break;
        }
        
        console.log('Words per line:', this.wordsPerLine);
    }
    
    getLineForWordIndex(wordIndex) {
        let lineIdx = 0;
        let wordCount = 0;
        
        for (let i = 0; i < this.wordsPerLine.length; i++) {
            wordCount += this.wordsPerLine[i];
            if (wordIndex < wordCount) {
                return i;
            }
        }
        
        return this.wordsPerLine.length - 1;
    }
    
    getWordIndexForLine(lineIdx) {
        let wordIndex = 0;
        for (let i = 0; i < lineIdx; i++) {
            wordIndex += this.wordsPerLine[i];
        }
        return wordIndex;
    }
    
    updateRealTimeStats() {
        if (!this.isTestActive || !this.startTime) return;
        
        const typedText = this.elements.typingInput.value;
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        
        // Calculate WPM
        const wordCount = typedText.trim().split(/\s+/).length;
        const wpm = timeElapsed > 0 ? Math.round((wordCount / timeElapsed) * 60) : 0;
        
        // Calculate accuracy and errors
        let correct = 0;
        let errors = 0;
        
        for (let i = 0; i < Math.min(typedText.length, this.currentText.length); i++) {
            if (typedText[i] === this.currentText[i]) {
                correct++;
            } else {
                errors++;
            }
        }
        
        const accuracy = typedText.length > 0 ? Math.round((correct / typedText.length) * 100) : 100;
        
        // Calculate progress
        const progress = Math.round((typedText.length / this.currentText.length) * 100);
        
        // Update UI
        this.updateStats(wpm, accuracy, Math.round(timeElapsed), errors);
        this.updateProgress(progress);
    }
    
    updateStats(wpm, accuracy, time, errors) {
        this.elements.currentWpm.textContent = wpm;
        this.elements.currentAccuracy.textContent = accuracy + '%';
        this.elements.currentTime.textContent = time + 's';
        this.elements.currentErrors.textContent = errors;
    }
    
    updateProgress(percentage) {
        this.elements.progressBar.style.width = percentage + '%';
        this.elements.progressText.textContent = percentage + '%';
    }
    
    async endTest(typedText, reason = '') {
        this.isTestActive = false;
        this.endTime = Date.now();
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        if (this.timeLimitTimer) {
            clearTimeout(this.timeLimitTimer);
            this.timeLimitTimer = null;
        }
        
        // Disable input
        this.elements.typingInput.disabled = true;
        
        // Validate input before submission
        if (!typedText || typedText.trim().length === 0) {
            alert('No text was typed. Please try again.');
            this.resetTest();
            return;
        }
        
        const timeTaken = (this.endTime - this.startTime) / 1000;
        if (timeTaken < 1) {
            alert('Test completed too quickly. Please try again.');
            this.resetTest();
            return;
        }
        
        try {
            // Determine username based on authentication status or guest name
            let username;
            if (this.isAuthenticated && this.currentUser) {
                username = this.currentUser.username;
            } else {
                // Check for guest name from session storage (set by landing page)
                username = sessionStorage.getItem('guestName') || 'Anonymous';
            }
            
            const response = await fetch('/submit_test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    typed_text: typedText,
                    username: username
                })
            });
            
            if (response.ok) {
                const results = await response.json();
                
                if (results.success) {
                    // Show results modal with server data
                    this.showResults(results, typedText.length);
                    
                    // Show success message based on authentication status
                    if (this.isAuthenticated) {
                        this.showMessage('Score saved successfully!', 'success');
                    } else {
                        this.showMessage('Score calculated! Sign up to save your progress.', 'info');
                    }
                } else {
                    // Server returned error in JSON
                    console.error('Server error:', results.error);
                    const localResults = this.calculateLocalResults(typedText);
                    this.showResults(localResults, typedText.length);
                    this.showMessage('Score calculated locally. Server error: ' + (results.error || 'Unknown error'), 'warning');
                }
            } else {
                // HTTP error
                const errorText = await response.text();
                console.error('HTTP error:', response.status, errorText);
                const localResults = this.calculateLocalResults(typedText);
                this.showResults(localResults, typedText.length);
                this.showMessage(`Score calculated locally. Server error (${response.status}).`, 'warning');
            }
            
        } catch (error) {
            console.error('Network error:', error);
            // Show results modal with local calculation as fallback
            const localResults = this.calculateLocalResults(typedText);
            this.showResults(localResults, typedText.length);
            this.showMessage('Score calculated locally. Network connection failed.', 'warning');
        }
        
        // Show completion reason if provided
        if (reason) {
            this.showMessage(reason, 'info');
        }
    }
    
    showResults(results, charCount) {
        this.elements.finalWpm.textContent = results.wpm;
        this.elements.finalAccuracy.textContent = results.accuracy + '%';
        this.elements.finalTime.textContent = results.time_taken + 's';
        this.elements.finalChars.textContent = charCount;
        
        this.elements.resultsModal.style.display = 'block';
    }
    
    closeModal() {
        this.elements.resultsModal.style.display = 'none';
    }
    
    tryAgain() {
        this.closeModal();
        this.resetTest();
    }
    
    showLeaderboard() {
        this.closeModal();
        this.elements.leaderboardSection.style.display = 'block';
        this.loadLeaderboard();
    }
    
    hideLeaderboard() {
        this.elements.leaderboardSection.style.display = 'none';
    }
    
    async loadLeaderboard() {
        try {
            this.elements.leaderboardContainer.innerHTML = '<div class="loading">Loading leaderboard...</div>';
            
            const response = await fetch('/leaderboard');
            const data = await response.json();
            
            if (data.length === 0) {
                this.elements.leaderboardContainer.innerHTML = '<div class="loading">No results yet. Be the first to take a test!</div>';
                return;
            }
            
            let html = '';
            data.forEach((user, index) => {
                html += `
                    <div class="leaderboard-item">
                        <span class="leaderboard-rank">#${index + 1}</span>
                        <span class="leaderboard-name">${user.username}</span>
                        <div class="leaderboard-stats">
                            <div class="leaderboard-stat">
                                <span class="leaderboard-stat-label">WPM</span>
                                <span class="leaderboard-stat-value">${user.wpm}</span>
                            </div>
                            <div class="leaderboard-stat">
                                <span class="leaderboard-stat-label">Accuracy</span>
                                <span class="leaderboard-stat-value">${user.accuracy}%</span>
                            </div>
                            <div class="leaderboard-stat">
                                <span class="leaderboard-stat-label">Tests</span>
                                <span class="leaderboard-stat-value">${user.tests_taken}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            this.elements.leaderboardContainer.innerHTML = html;
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.elements.leaderboardContainer.innerHTML = '<div class="loading">Failed to load leaderboard.</div>';
        }
    }
    
    async showUserStats() {
        // Use authenticated user's username if available, otherwise ask for username
        let username;
        if (this.isAuthenticated && this.currentUser) {
            username = this.currentUser.username;
        } else {
            username = this.elements.usernameInput ? this.elements.usernameInput.value.trim() : '';
            if (!username) {
                username = prompt('Enter your username to view stats:');
                if (!username) {
                    return;
                }
            }
        }
        
        try {
            const response = await fetch(`/stats/${encodeURIComponent(username)}`);
            const data = await response.json();
            
            if (data.error) {
                alert('No stats found for this username.');
                return;
            }
            
            const statsMessage = `
Stats for ${username}:

Average WPM: ${data.avg_wpm}
Best WPM: ${data.best_wpm}
Average Accuracy: ${data.avg_accuracy}%
Best Accuracy: ${data.best_accuracy}%
Total Tests: ${data.total_tests}
            `;
            
            alert(statsMessage);
            
        } catch (error) {
            console.error('Error loading user stats:', error);
            alert('Failed to load user statistics.');
        }
    }
    
    // Authentication methods
    async checkAuthenticationStatus() {
        try {
            const response = await fetch('/check_auth');
            const data = await response.json();
            
            if (data.authenticated) {
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.updateUIForAuthenticatedUser();
            } else {
                this.isAuthenticated = false;
                this.currentUser = null;
                this.showAuthModal();
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            this.showAuthModal();
        }
    }
    
    showAuthModal() {
        this.elements.authModal.style.display = 'block';
        this.showLoginForm();
    }
    
    closeAuthModal() {
        this.elements.authModal.style.display = 'none';
    }
    
    skipAuth() {
        this.closeAuthModal();
        // Continue as guest user
    }
    
    showLoginForm() {
        this.elements.loginForm.style.display = 'block';
        this.elements.signupForm.style.display = 'none';
        this.elements.showLoginBtn.classList.add('active');
        this.elements.showSignupBtn.classList.remove('active');
        this.elements.loginUsername.focus();
    }
    
    showSignupForm() {
        this.elements.loginForm.style.display = 'none';
        this.elements.signupForm.style.display = 'block';
        this.elements.showLoginBtn.classList.remove('active');
        this.elements.showSignupBtn.classList.add('active');
        this.elements.signupUsername.focus();
    }
    
    async handleLogin() {
        const username = this.elements.loginUsername.value.trim();
        const password = this.elements.loginPassword.value;
        
        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }
        
        try {
            this.elements.loginBtn.disabled = true;
            this.elements.loginBtn.textContent = 'Logging in...';
            
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.updateUIForAuthenticatedUser();
                this.closeAuthModal();
                this.clearLoginForm();
            } else {
                alert(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed. Please check your connection and try again.');
        } finally {
            this.elements.loginBtn.disabled = false;
            this.elements.loginBtn.textContent = 'Login';
        }
    }
    
    async handleSignup() {
        const username = this.elements.signupUsername.value.trim();
        const email = this.elements.signupEmail.value.trim();
        const password = this.elements.signupPassword.value;
        const confirmPassword = this.elements.confirmPassword.value;
        
        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        try {
            this.elements.signupBtn.disabled = true;
            this.elements.signupBtn.textContent = 'Creating account...';
            
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.updateUIForAuthenticatedUser();
                this.closeAuthModal();
                this.clearSignupForm();
                alert('Account created successfully! Welcome to Typing Speed Test!');
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('Registration failed. Please check your connection and try again.');
        } finally {
            this.elements.signupBtn.disabled = false;
            this.elements.signupBtn.textContent = 'Sign Up';
        }
    }
    
    async handleLogout() {
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.isAuthenticated = false;
                this.currentUser = null;
                this.updateUIForGuestUser();
                alert('Logged out successfully.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            // Still update UI even if request fails
            this.isAuthenticated = false;
            this.currentUser = null;
            this.updateUIForGuestUser();
        }
    }
    
    updateUIForAuthenticatedUser() {
        if (this.currentUser) {
            this.elements.userInfo.style.display = 'block';
            this.elements.currentUsername.textContent = this.currentUser.username;
        }
    }
    
    updateUIForGuestUser() {
        this.elements.userInfo.style.display = 'none';
    }
    
    clearLoginForm() {
        this.elements.loginUsername.value = '';
        this.elements.loginPassword.value = '';
    }
    
    clearSignupForm() {
        this.elements.signupUsername.value = '';
        this.elements.signupEmail.value = '';
        this.elements.signupPassword.value = '';
        this.elements.confirmPassword.value = '';
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    calculateLocalResults(typedText) {
        // Calculate results locally as fallback when server submission fails
        const timeElapsed = (this.endTime - this.startTime) / 1000;
        const wordCount = typedText.trim().split(/\s+/).length;
        const wpm = timeElapsed > 0 ? (wordCount / timeElapsed) * 60 : 0;
        
        // Calculate accuracy
        let correct = 0;
        for (let i = 0; i < Math.min(typedText.length, this.currentText.length); i++) {
            if (typedText[i] === this.currentText[i]) {
                correct++;
            }
        }
        
        const accuracy = typedText.length > 0 ? (correct / typedText.length) * 100 : 100;
        
        return {
            wpm: Math.round(wpm * 100) / 100,
            accuracy: Math.round(accuracy * 100) / 100,
            time_taken: Math.round(timeElapsed * 100) / 100
        };
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
            border-radius: 4px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
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
    
    // Feedback system methods
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
        
        if (!this.feedbackIcon) return; // Exit if feedback elements are not present
        
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const typingTest = new TypingTest();
    // Initialize feedback system if elements are present
    typingTest.initializeFeedbackSystem();
});
