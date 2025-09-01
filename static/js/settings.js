class SettingsManager {
    constructor() {
        this.defaultSettings = {
            fontFamily: 'Inter',
            fontSize: 'medium',
            compactMode: false
        };
        
        this.currentSettings = { ...this.defaultSettings };
        this.init();
    }

    init() {
        this.loadSettings();
        this.applySettings();
        this.bindEventListeners();
        this.updateUI();
    }

    bindEventListeners() {
        // Font family selector
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                this.updateSetting('fontFamily', e.target.value);
            });
        }

        // Font size selector
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                this.updateSetting('fontSize', e.target.value);
            });
        }

        // Compact mode switch
        const compactModeSwitch = document.getElementById('compactModeSwitch');
        if (compactModeSwitch) {
            compactModeSwitch.addEventListener('change', (e) => {
                this.updateSetting('compactMode', e.target.checked);
            });
        }

        // Reset settings button
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }

    updateSetting(key, value) {
        this.currentSettings[key] = value;
        this.saveSettings();
        this.applySettings();
        
        // Show feedback
        this.showSettingsSaved();
    }

    applySettings() {
        const body = document.body;
        
        // Apply font family
        this.applyFontFamily(this.currentSettings.fontFamily);
        
        // Apply font size
        body.className = body.className.replace(/font-(small|medium|large|xl)/g, '');
        if (this.currentSettings.fontSize !== 'medium') {
            body.classList.add(`font-${this.currentSettings.fontSize}`);
        }
        
        // Apply compact mode
        if (this.currentSettings.compactMode) {
            body.classList.add('compact-mode');
        } else {
            body.classList.remove('compact-mode');
        }
    }

    applyFontFamily(fontFamily) {
        const fontMap = {
            'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Roboto': "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            'Open Sans': "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Lato': "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Poppins': "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Montserrat': "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Nunito': "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Source Sans Pro': "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Raleway': "'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Ubuntu': "'Ubuntu', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            'Playfair Display': "'Playfair Display', Georgia, 'Times New Roman', serif",
            'Merriweather': "'Merriweather', Georgia, 'Times New Roman', serif",
            'Crimson Text': "'Crimson Text', Georgia, 'Times New Roman', serif",
            'Georgia': "'Georgia', 'Times New Roman', serif",
            'Times New Roman': "'Times New Roman', serif",
            'JetBrains Mono': "'JetBrains Mono', 'Courier New', Monaco, monospace",
            'Fira Code': "'Fira Code', 'Courier New', Monaco, monospace",
            'Courier New': "'Courier New', Monaco, monospace",
            'Monaco': "'Monaco', 'Courier New', monospace",
            'Creepster': "'Creepster', cursive, fantasy"
        };

        const fontStack = fontMap[fontFamily] || fontMap['Inter'];
        document.documentElement.style.setProperty('--primary-font-family', fontStack);
    }

    updateUI() {
        // Update font selector
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            fontSelect.value = this.currentSettings.fontFamily;
        }

        // Update font size selector
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        if (fontSizeSelect) {
            fontSizeSelect.value = this.currentSettings.fontSize;
        }

        // Update compact mode switch
        const compactModeSwitch = document.getElementById('compactModeSwitch');
        if (compactModeSwitch) {
            compactModeSwitch.checked = this.currentSettings.compactMode;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('zoboSettings', JSON.stringify(this.currentSettings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('zoboSettings');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                this.currentSettings = { ...this.defaultSettings, ...parsedSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.currentSettings = { ...this.defaultSettings };
        }
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            this.currentSettings = { ...this.defaultSettings };
            this.saveSettings();
            this.applySettings();
            this.updateUI();
            this.showSettingsSaved('Settings reset to defaults');
        }
    }

    showSettingsSaved(message = 'Settings saved successfully') {
        // Create or update notification
        const existingNotification = document.querySelector('.settings-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'settings-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);

        // Add animations if not already present
        if (!document.querySelector('#settings-animations')) {
            const style = document.createElement('style');
            style.id = 'settings-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Public method to get current font info
    getCurrentFont() {
        return {
            family: this.currentSettings.fontFamily,
            size: this.currentSettings.fontSize,
            compact: this.currentSettings.compactMode
        };
    }

    // Public method to set font programmatically
    setFont(fontFamily) {
        if (fontFamily && typeof fontFamily === 'string') {
            this.updateSetting('fontFamily', fontFamily);
            return true;
        }
        return false;
    }

    // Voice command integration
    processVoiceCommand(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // Font family commands
        const fontCommands = {
            'set font to inter': 'Inter',
            'change font to roboto': 'Roboto',
            'use courier new font': 'Courier New',
            'switch to arial': 'Arial',
            'use times new roman': 'Times New Roman',
            'set font to georgia': 'Georgia',
            'change to jack armstrong': 'Creepster'
        };

        for (const [command, font] of Object.entries(fontCommands)) {
            if (lowerTranscript.includes(command)) {
                this.setFont(font);
                return `Font changed to ${font}`;
            }
        }

        // Size commands
        if (lowerTranscript.includes('make text larger') || lowerTranscript.includes('increase font size')) {
            const sizes = ['small', 'medium', 'large', 'xl'];
            const currentIndex = sizes.indexOf(this.currentSettings.fontSize);
            const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
            this.updateSetting('fontSize', sizes[nextIndex]);
            return `Font size increased to ${sizes[nextIndex]}`;
        }

        if (lowerTranscript.includes('make text smaller') || lowerTranscript.includes('decrease font size')) {
            const sizes = ['small', 'medium', 'large', 'xl'];
            const currentIndex = sizes.indexOf(this.currentSettings.fontSize);
            const nextIndex = Math.max(currentIndex - 1, 0);
            this.updateSetting('fontSize', sizes[nextIndex]);
            return `Font size decreased to ${sizes[nextIndex]}`;
        }

        // Compact mode
        if (lowerTranscript.includes('enable compact mode') || lowerTranscript.includes('turn on compact mode')) {
            this.updateSetting('compactMode', true);
            return 'Compact mode enabled';
        }

        if (lowerTranscript.includes('disable compact mode') || lowerTranscript.includes('turn off compact mode')) {
            this.updateSetting('compactMode', false);
            return 'Compact mode disabled';
        }

        return null; // No settings command found
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager();

// Export for global use
window.settingsManager = settingsManager;