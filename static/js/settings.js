class SettingsManager {
    constructor() {
        this.defaultSettings = {
            fontFamily: 'Inter',
            fontSize: 'medium',
            compactMode: false,
            backgroundTheme: 'dark',
            assistantBubbleColor: 'default',
            userBubbleColor: 'default',
            customBgColor: '#1a1a1a',
            customAssistantColor: '#2d2d2d',
            customUserColor: '#1e3a8a'
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

        // Background theme selector
        const backgroundThemeSelect = document.getElementById('backgroundThemeSelect');
        if (backgroundThemeSelect) {
            backgroundThemeSelect.addEventListener('change', (e) => {
                this.updateSetting('backgroundTheme', e.target.value);
                this.toggleCustomColorPicker('bg', e.target.value === 'custom-bg');
            });
        }

        // Custom background color picker
        const customBgColor = document.getElementById('customBgColor');
        if (customBgColor) {
            customBgColor.addEventListener('change', (e) => {
                this.updateSetting('customBgColor', e.target.value);
            });
        }

        // Assistant bubble color selector
        const assistantBubbleSelect = document.getElementById('assistantBubbleSelect');
        if (assistantBubbleSelect) {
            assistantBubbleSelect.addEventListener('change', (e) => {
                this.updateSetting('assistantBubbleColor', e.target.value);
                this.toggleCustomColorPicker('assistant', e.target.value === 'custom-assistant');
            });
        }

        // Custom assistant color picker
        const customAssistantColor = document.getElementById('customAssistantColor');
        if (customAssistantColor) {
            customAssistantColor.addEventListener('change', (e) => {
                this.updateSetting('customAssistantColor', e.target.value);
            });
        }

        // User bubble color selector
        const userBubbleSelect = document.getElementById('userBubbleSelect');
        if (userBubbleSelect) {
            userBubbleSelect.addEventListener('change', (e) => {
                this.updateSetting('userBubbleColor', e.target.value);
                this.toggleCustomColorPicker('user', e.target.value === 'custom-user');
            });
        }

        // Custom user color picker
        const customUserColor = document.getElementById('customUserColor');
        if (customUserColor) {
            customUserColor.addEventListener('change', (e) => {
                this.updateSetting('customUserColor', e.target.value);
            });
        }

        // Preview colors button
        const previewColorsBtn = document.getElementById('previewColorsBtn');
        if (previewColorsBtn) {
            previewColorsBtn.addEventListener('click', () => {
                this.previewColors();
            });
        }

        // Reset colors button
        const resetColorsBtn = document.getElementById('resetColorsBtn');
        if (resetColorsBtn) {
            resetColorsBtn.addEventListener('click', () => {
                this.resetColors();
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

        // Apply background theme
        this.applyBackgroundTheme(this.currentSettings.backgroundTheme);
        
        // Apply bubble colors
        this.applyBubbleColors();
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

    applyBackgroundTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.className = body.className.replace(/theme-[\w-]+/g, '');
        
        if (theme === 'custom-bg') {
            document.documentElement.style.setProperty('--bg-primary', this.currentSettings.customBgColor);
            document.documentElement.style.setProperty('--bg-secondary', this.adjustBrightness(this.currentSettings.customBgColor, 20));
            document.documentElement.style.setProperty('--bg-tertiary', this.adjustBrightness(this.currentSettings.customBgColor, 40));
        } else if (theme !== 'dark') {
            body.classList.add(`theme-${theme}`);
        }
    }

    applyBubbleColors() {
        const body = document.body;
        
        // Remove existing bubble color classes
        body.className = body.className.replace(/assistant-[\w-]+|user-[\w-]+/g, '');
        
        // Apply assistant bubble color
        if (this.currentSettings.assistantBubbleColor === 'custom-assistant') {
            document.documentElement.style.setProperty('--assistant-bubble-bg', this.currentSettings.customAssistantColor);
            document.documentElement.style.setProperty('--assistant-bubble-border', this.adjustBrightness(this.currentSettings.customAssistantColor, 30));
            document.documentElement.style.setProperty('--assistant-bubble-text', this.getContrastColor(this.currentSettings.customAssistantColor));
        } else if (this.currentSettings.assistantBubbleColor !== 'default') {
            body.classList.add(`assistant-${this.currentSettings.assistantBubbleColor}`);
        }
        
        // Apply user bubble color
        if (this.currentSettings.userBubbleColor === 'custom-user') {
            document.documentElement.style.setProperty('--user-bubble-bg', this.currentSettings.customUserColor);
            document.documentElement.style.setProperty('--user-bubble-border', this.adjustBrightness(this.currentSettings.customUserColor, 20));
            document.documentElement.style.setProperty('--user-bubble-text', this.getContrastColor(this.currentSettings.customUserColor));
        } else if (this.currentSettings.userBubbleColor !== 'default') {
            body.classList.add(`user-${this.currentSettings.userBubbleColor}`);
        }
    }

    adjustBrightness(hex, percent) {
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        // Adjust brightness
        const newR = Math.min(255, Math.max(0, r + (r * percent / 100)));
        const newG = Math.min(255, Math.max(0, g + (g * percent / 100)));
        const newB = Math.min(255, Math.max(0, b + (b * percent / 100)));
        
        // Convert back to hex
        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    }

    getContrastColor(hex) {
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        // Calculate relative luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    toggleCustomColorPicker(type, show) {
        const pickerMap = {
            'bg': 'customBgColorPicker',
            'assistant': 'customAssistantColorPicker',
            'user': 'customUserColorPicker'
        };
        
        const picker = document.getElementById(pickerMap[type]);
        if (picker) {
            if (show) {
                picker.classList.remove('d-none');
            } else {
                picker.classList.add('d-none');
            }
        }
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

        // Update background theme selector
        const backgroundThemeSelect = document.getElementById('backgroundThemeSelect');
        if (backgroundThemeSelect) {
            backgroundThemeSelect.value = this.currentSettings.backgroundTheme;
            this.toggleCustomColorPicker('bg', this.currentSettings.backgroundTheme === 'custom-bg');
        }

        // Update custom background color
        const customBgColor = document.getElementById('customBgColor');
        if (customBgColor) {
            customBgColor.value = this.currentSettings.customBgColor;
        }

        // Update assistant bubble color selector
        const assistantBubbleSelect = document.getElementById('assistantBubbleSelect');
        if (assistantBubbleSelect) {
            assistantBubbleSelect.value = this.currentSettings.assistantBubbleColor;
            this.toggleCustomColorPicker('assistant', this.currentSettings.assistantBubbleColor === 'custom-assistant');
        }

        // Update custom assistant color
        const customAssistantColor = document.getElementById('customAssistantColor');
        if (customAssistantColor) {
            customAssistantColor.value = this.currentSettings.customAssistantColor;
        }

        // Update user bubble color selector
        const userBubbleSelect = document.getElementById('userBubbleSelect');
        if (userBubbleSelect) {
            userBubbleSelect.value = this.currentSettings.userBubbleColor;
            this.toggleCustomColorPicker('user', this.currentSettings.userBubbleColor === 'custom-user');
        }

        // Update custom user color
        const customUserColor = document.getElementById('customUserColor');
        if (customUserColor) {
            customUserColor.value = this.currentSettings.customUserColor;
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

    previewColors() {
        // Add a temporary preview message to show color changes
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'message assistant-message';
            previewDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-circle">
                        <i class="fas fa-eye"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-name">Preview</span>
                        <span class="message-time">Now</span>
                    </div>
                    <div class="message-text">
                        This is how AI messages will look with your current color settings.
                    </div>
                </div>
            `;
            
            const userPreviewDiv = document.createElement('div');
            userPreviewDiv.className = 'message user-message';
            userPreviewDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-circle">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-name">You</span>
                        <span class="message-time">Now</span>
                    </div>
                    <div class="message-text">
                        This is how your messages will look with the selected colors.
                    </div>
                </div>
            `;

            messagesArea.appendChild(previewDiv);
            messagesArea.appendChild(userPreviewDiv);

            // Auto-remove preview after 5 seconds
            setTimeout(() => {
                if (previewDiv.parentNode) previewDiv.remove();
                if (userPreviewDiv.parentNode) userPreviewDiv.remove();
            }, 5000);

            // Scroll to bottom to show preview
            const chatContainer = document.getElementById('chatContainer');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }

        this.showSettingsSaved('Color preview added to chat');
    }

    resetColors() {
        if (confirm('Reset all colors to defaults?')) {
            this.currentSettings.backgroundTheme = this.defaultSettings.backgroundTheme;
            this.currentSettings.assistantBubbleColor = this.defaultSettings.assistantBubbleColor;
            this.currentSettings.userBubbleColor = this.defaultSettings.userBubbleColor;
            this.currentSettings.customBgColor = this.defaultSettings.customBgColor;
            this.currentSettings.customAssistantColor = this.defaultSettings.customAssistantColor;
            this.currentSettings.customUserColor = this.defaultSettings.customUserColor;
            
            this.saveSettings();
            this.applySettings();
            this.updateUI();
            this.showSettingsSaved('Colors reset to defaults');
        }
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager();

// Export for global use
window.settingsManager = settingsManager;