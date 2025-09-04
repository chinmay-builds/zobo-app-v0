class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.statusText = document.getElementById('loadingStatusText');
        this.progressFill = document.getElementById('progressFill');
        this.matrixCanvas = document.getElementById('matrixCanvas');
        this.matrixCtx = this.matrixCanvas ? this.matrixCanvas.getContext('2d') : null;
        
        this.loadingSteps = [
            { text: 'Initializing Zobo...', duration: 500, progress: 10 },
            { text: 'Loading user settings...', duration: 300, progress: 25 },
            { text: 'Setting up auto-save...', duration: 400, progress: 40 },
            { text: 'Initializing timer system...', duration: 300, progress: 55 },
            { text: 'Loading conversation history...', duration: 500, progress: 70 },
            { text: 'Connecting to AI services...', duration: 600, progress: 85 },
            { text: 'Finalizing setup...', duration: 400, progress: 100 }
        ];
        
        this.currentStep = 0;
        this.totalSteps = this.loadingSteps.length;
        this.isComplete = false;
        
        // Matrix animation properties
        this.matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.matrixColumns = [];
        this.matrixAnimationId = null;
        
        this.init();
    }

    init() {
        // Initialize Matrix animation
        this.initMatrix();
        
        // Start loading sequence
        this.startLoadingSequence();
        
        // Initialize app components
        this.initializeAppComponents();
    }

    initMatrix() {
        if (!this.matrixCanvas || !this.matrixCtx) return;
        
        // Set canvas size
        this.resizeMatrix();
        
        // Initialize columns
        const fontSize = 16;
        const columnCount = Math.floor(this.matrixCanvas.width / fontSize);
        
        this.matrixColumns = Array(columnCount).fill(0).map(() => ({
            y: Math.random() * this.matrixCanvas.height,
            speed: Math.random() * 3 + 2
        }));
        
        // Start animation
        this.startMatrixAnimation();
        
        // Handle resize
        window.addEventListener('resize', () => this.resizeMatrix());
    }
    
    resizeMatrix() {
        if (!this.matrixCanvas) return;
        
        this.matrixCanvas.width = this.matrixCanvas.offsetWidth;
        this.matrixCanvas.height = this.matrixCanvas.offsetHeight;
    }
    
    startMatrixAnimation() {
        if (!this.matrixCanvas || !this.matrixCtx) return;
        
        const animate = () => {
            this.drawMatrix();
            this.matrixAnimationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    drawMatrix() {
        if (!this.matrixCtx || !this.matrixCanvas) return;
        
        const ctx = this.matrixCtx;
        const canvas = this.matrixCanvas;
        
        // Fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw characters
        ctx.fillStyle = '#00BFFF'; // Blue color as requested
        ctx.font = '16px monospace';
        
        const fontSize = 16;
        
        for (let i = 0; i < this.matrixColumns.length; i++) {
            const column = this.matrixColumns[i];
            const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
            const x = i * fontSize;
            
            ctx.fillText(char, x, column.y);
            
            // Move column down
            column.y += column.speed;
            
            // Reset column when it goes off screen
            if (column.y > canvas.height) {
                column.y = -fontSize;
                column.speed = Math.random() * 3 + 2;
            }
        }
    }
    
    stopMatrix() {
        if (this.matrixAnimationId) {
            cancelAnimationFrame(this.matrixAnimationId);
            this.matrixAnimationId = null;
        }
    }

    startLoadingSequence() {
        this.executeLoadingStep(0);
    }

    executeLoadingStep(stepIndex) {
        if (stepIndex >= this.loadingSteps.length) {
            this.completeLoading();
            return;
        }

        const step = this.loadingSteps[stepIndex];
        
        // Update status text with typewriter effect
        this.typeWriterText(step.text, () => {
            // Update progress bar
            this.updateProgress(step.progress);
            
            // Wait for step duration, then proceed to next step
            setTimeout(() => {
                this.executeLoadingStep(stepIndex + 1);
            }, step.duration);
        });
    }

    typeWriterText(text, callback) {
        this.statusText.textContent = '';
        let i = 0;
        
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                this.statusText.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                callback();
            }
        }, 30); // 30ms per character
    }

    updateProgress(targetPercent) {
        const currentWidth = parseInt(this.progressFill.style.width) || 0;
        const increment = (targetPercent - currentWidth) / 20; // Smooth animation
        
        let currentProgress = currentWidth;
        
        const progressInterval = setInterval(() => {
            currentProgress += increment;
            
            if ((increment > 0 && currentProgress >= targetPercent) || 
                (increment < 0 && currentProgress <= targetPercent)) {
                currentProgress = targetPercent;
                clearInterval(progressInterval);
            }
            
            this.progressFill.style.width = `${currentProgress}%`;
        }, 20);
    }

    async initializeAppComponents() {
        // Simulate component initialization
        const components = [
            'chatApp',
            'settingsManager', 
            'autoSaveManager',
            'timerManager'
        ];

        for (const component of components) {
            await this.waitForComponent(component);
        }
    }

    waitForComponent(componentName) {
        return new Promise(resolve => {
            const checkComponent = () => {
                if (window[componentName]) {
                    resolve();
                } else {
                    setTimeout(checkComponent, 100);
                }
            };
            checkComponent();
        });
    }

    completeLoading() {
        this.isComplete = true;
        
        // Final status update
        this.statusText.textContent = 'Welcome to Zobo!';
        
        // Ensure progress is at 100%
        this.progressFill.style.width = '100%';
        
        // Wait a moment before hiding
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 800);
    }

    hideLoadingScreen() {
        if (this.loadingScreen) {
            // Stop Matrix animation
            this.stopMatrix();
            
            // Add fade-out class
            this.loadingScreen.classList.add('fade-out');
            
            // Remove from DOM after animation
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                
                // Trigger app ready event
                document.dispatchEvent(new CustomEvent('appReady'));
                
                // Show welcome message in chat
                this.showWelcomeMessage();
                
            }, 500);
        }
    }

    showWelcomeMessage() {
        // Add a slight delay to ensure chat app is ready
        setTimeout(() => {
            if (window.chatApp) {
                // Check if this is a returning user
                const hasVisited = localStorage.getItem('zobo-has-visited');
                
                let welcomeMessage;
                if (hasVisited) {
                    welcomeMessage = "👋 Welcome back! I'm ready to assist you.";
                } else {
                    welcomeMessage = "👋 Hello! I'm Zobo, your AI assistant. I can help you with conversations, set timers, and much more. Try asking me anything or explore the settings to customize your experience!";
                    localStorage.setItem('zobo-has-visited', 'true');
                }
                
                // Clear existing welcome message if any
                const existingWelcome = document.querySelector('.message.assistant-message');
                if (existingWelcome) {
                    existingWelcome.remove();
                }
                
                // Add new welcome message
                window.chatApp.addMessage(welcomeMessage, 'assistant');
            }
        }, 200);
    }

    // Public methods for manual control
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.classList.remove('fade-out');
        }
    }

    setLoadingText(text) {
        if (this.statusText) {
            this.statusText.textContent = text;
        }
    }

    setProgress(percent) {
        this.updateProgress(Math.min(100, Math.max(0, percent)));
    }

    // Quick loading for returning users
    quickLoad() {
        this.setLoadingText('Welcome back!');
        this.updateProgress(100);
        setTimeout(() => {
            this.completeLoading();
        }, 1000);
    }

    // Error state
    showError(message = 'Something went wrong. Please refresh the page.') {
        this.setLoadingText(`❌ ${message}`);
        this.progressFill.style.background = '#dc2626';
        
        // Add retry button
        const loadingContent = document.querySelector('.loading-content');
        if (loadingContent && !document.getElementById('retryBtn')) {
            const retryButton = document.createElement('button');
            retryButton.id = 'retryBtn';
            retryButton.className = 'btn btn-primary mt-3';
            retryButton.innerHTML = '<i class="fas fa-redo me-2"></i>Retry';
            retryButton.addEventListener('click', () => {
                location.reload();
            });
            loadingContent.appendChild(retryButton);
        }
    }

    // Loading with custom steps
    loadWithSteps(customSteps) {
        this.loadingSteps = customSteps;
        this.currentStep = 0;
        this.progressFill.style.width = '0%';
        this.startLoadingSequence();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if user has fast loading preference
    const fastLoad = localStorage.getItem('zobo-fast-load');
    
    window.loadingManager = new LoadingManager();
    
    if (fastLoad === 'true') {
        window.loadingManager.quickLoad();
    }
});

// Export for global use
window.LoadingManager = LoadingManager;