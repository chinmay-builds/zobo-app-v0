class AutoSaveManager {
    constructor() {
        this.saveKey = 'zobo-autosave';
        this.draftKey = 'zobo-draft';
        this.conversationKey = 'zobo-conversation';
        this.autoSaveInterval = 5000; // 5 seconds
        this.draftSaveDelay = 1000; // 1 second after typing stops
        
        this.draftSaveTimer = null;
        this.autoSaveTimer = null;
        this.lastSaveTime = null;
        this.isOnline = navigator.onLine;
        this.draftSaveEnabled = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startAutoSave();
        this.loadDraft();
        this.showAutoSaveStatus();
        
        // Show restore option if there's saved data
        this.checkForRestorable();
    }

    setupEventListeners() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateAutoSaveStatus('Online - Auto-save active', 'success');
            this.syncWithServer();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateAutoSaveStatus('Offline - Saving locally', 'warning');
        });

        // Draft saving on input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.saveDraftDelayed();
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    // Clear draft when sending message
                    this.clearDraft();
                }
            });
        }

        // Save conversation on new messages
        document.addEventListener('messageAdded', (e) => {
            this.saveConversation();
        });

        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveImmediate();
        });
    }

    // Draft Management
    saveDraftDelayed() {
        clearTimeout(this.draftSaveTimer);
        this.draftSaveTimer = setTimeout(() => {
            this.saveDraft();
        }, this.draftSaveDelay);
    }

    saveDraft() {
        if (!this.draftSaveEnabled) return;
        
        const messageInput = document.getElementById('messageInput');
        if (messageInput && messageInput.value.trim()) {
            try {
                const draft = {
                    content: messageInput.value,
                    timestamp: Date.now()
                };
                localStorage.setItem(this.draftKey, JSON.stringify(draft));
                this.showDraftSaved();
            } catch (error) {
                console.error('Error saving draft:', error);
            }
        } else {
            this.clearDraft();
        }
    }

    loadDraft() {
        try {
            const saved = localStorage.getItem(this.draftKey);
            if (saved) {
                const draft = JSON.parse(saved);
                const messageInput = document.getElementById('messageInput');
                
                // Only restore if draft is less than 24 hours old
                if (messageInput && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
                    messageInput.value = draft.content;
                    this.showDraftRestored();
                } else {
                    this.clearDraft();
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }

    clearDraft() {
        localStorage.removeItem(this.draftKey);
    }

    // Conversation Management
    saveConversation() {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        try {
            const messages = Array.from(messagesArea.querySelectorAll('.message')).map(msg => {
                const isUser = msg.classList.contains('user-message');
                const textElement = msg.querySelector('.message-text');
                const timeElement = msg.querySelector('.message-time');
                
                return {
                    role: isUser ? 'user' : 'assistant',
                    content: textElement ? textElement.textContent : '',
                    timestamp: timeElement ? timeElement.textContent : 'Now',
                    time: Date.now()
                };
            });

            const conversationData = {
                messages,
                lastSaved: Date.now(),
                version: '1.0'
            };

            localStorage.setItem(this.conversationKey, JSON.stringify(conversationData));
            this.lastSaveTime = Date.now();
            this.updateAutoSaveStatus('Conversation saved', 'success');

        } catch (error) {
            console.error('Error saving conversation:', error);
            this.updateAutoSaveStatus('Save failed', 'error');
        }
    }

    loadConversation() {
        try {
            const saved = localStorage.getItem(this.conversationKey);
            if (saved) {
                const data = JSON.parse(saved);
                return data.messages || [];
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
        return [];
    }

    // Auto-save Management
    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            this.saveConversation();
        }, this.autoSaveInterval);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    saveImmediate() {
        this.saveDraft();
        this.saveConversation();
    }

    // Recovery Functions
    checkForRestorable() {
        const saved = localStorage.getItem(this.conversationKey);
        const draft = localStorage.getItem(this.draftKey);
        
        if (saved || draft) {
            this.showRestoreDialog();
        }
    }

    restoreConversation() {
        const messages = this.loadConversation();
        const messagesArea = document.getElementById('messagesArea');
        
        if (messages.length > 0 && messagesArea && window.chatApp) {
            // Clear existing messages except welcome message
            const welcomeMsg = messagesArea.querySelector('.message.assistant-message');
            messagesArea.innerHTML = '';
            if (welcomeMsg) {
                messagesArea.appendChild(welcomeMsg);
            }

            // Restore messages
            messages.forEach(msg => {
                if (msg.content && msg.content.trim()) {
                    window.chatApp.addMessage(msg.content, msg.role === 'user' ? 'user' : 'assistant');
                }
            });

            this.updateAutoSaveStatus('Conversation restored', 'success');
        }
    }

    // Server Sync
    async syncWithServer() {
        if (!this.isOnline) return;

        try {
            // Try to sync local data with server
            const localData = this.loadConversation();
            if (localData.length > 0) {
                // Could implement server sync here
                console.log('Local conversation available for sync');
            }
        } catch (error) {
            console.error('Error syncing with server:', error);
        }
    }

    // UI Feedback
    showAutoSaveStatus() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'autoSaveStatus';
        statusDiv.className = 'auto-save-status';
        statusDiv.innerHTML = `
            <div class="auto-save-indicator">
                <i class="fas fa-save"></i>
                <span class="auto-save-text">Auto-save active</span>
            </div>
        `;

        const header = document.querySelector('.chat-header');
        if (header) {
            header.appendChild(statusDiv);
        }
    }

    updateAutoSaveStatus(message, type = 'info') {
        const statusElement = document.querySelector('.auto-save-text');
        const iconElement = document.querySelector('.auto-save-indicator i');
        
        if (statusElement) {
            statusElement.textContent = message;
        }

        if (iconElement) {
            iconElement.className = this.getStatusIcon(type);
        }

        // Reset to default after 3 seconds
        setTimeout(() => {
            if (statusElement) {
                statusElement.textContent = 'Auto-save active';
            }
            if (iconElement) {
                iconElement.className = 'fas fa-save';
            }
        }, 3000);
    }

    getStatusIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-save'
        };
        return icons[type] || icons.info;
    }

    showDraftSaved() {
        this.updateAutoSaveStatus('Draft saved', 'success');
    }

    showDraftRestored() {
        this.updateAutoSaveStatus('Draft restored', 'info');
    }

    showRestoreDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-history me-2"></i>Restore Previous Session
                        </h5>
                    </div>
                    <div class="modal-body">
                        <p>We found a previous conversation and draft message. Would you like to restore them?</p>
                        <div class="restore-options">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="restoreConversation" checked>
                                <label class="form-check-label" for="restoreConversation">
                                    Restore conversation history
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="restoreDraft" checked>
                                <label class="form-check-label" for="restoreDraft">
                                    Restore draft message
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="skipRestore">Skip</button>
                        <button type="button" class="btn btn-primary" id="confirmRestore">Restore</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // Handle restore actions
        modal.querySelector('#confirmRestore').addEventListener('click', () => {
            const restoreConv = modal.querySelector('#restoreConversation').checked;
            const restoreDraft = modal.querySelector('#restoreDraft').checked;

            if (restoreConv) {
                this.restoreConversation();
            }
            if (!restoreDraft) {
                this.clearDraft();
            }

            bootstrapModal.hide();
            modal.remove();
        });

        modal.querySelector('#skipRestore').addEventListener('click', () => {
            this.clearDraft();
            localStorage.removeItem(this.conversationKey);
            bootstrapModal.hide();
            modal.remove();
        });
    }

    // Public API
    enableAutoSave() {
        if (!this.autoSaveTimer) {
            this.startAutoSave();
            this.updateAutoSaveStatus('Auto-save enabled', 'success');
        }
    }

    disableAutoSave() {
        this.stopAutoSave();
        this.updateAutoSaveStatus('Auto-save disabled', 'warning');
    }

    clearAllSaved() {
        if (confirm('Clear all saved data? This cannot be undone.')) {
            localStorage.removeItem(this.conversationKey);
            localStorage.removeItem(this.draftKey);
            this.updateAutoSaveStatus('All data cleared', 'info');
        }
    }

    exportConversation() {
        const messages = this.loadConversation();
        if (messages.length > 0) {
            const exportData = {
                conversation: messages,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], 
                { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `zobo-conversation-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.updateAutoSaveStatus('Conversation exported', 'success');
        }
    }
}

// Initialize auto-save manager
const autoSaveManager = new AutoSaveManager();

// Export for global use
window.autoSaveManager = autoSaveManager;