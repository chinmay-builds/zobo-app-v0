// Chat application JavaScript
class ChatApp {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.statusBtn = document.getElementById('statusBtn');
        this.voiceStatusBtn = document.getElementById('voiceStatusBtn');
        this.recordBtn = document.getElementById('recordBtn');
        this.speakBtn = document.getElementById('speakBtn');
        this.oneDriveBtn = document.getElementById('oneDriveBtn');
        

        this.messagesArea = document.getElementById('messagesArea');
        this.chatContainer = document.getElementById('chatContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.chatForm = document.getElementById('chatForm');
        this.charCount = document.getElementById('charCount');
        this.statusAlert = document.getElementById('statusAlert');
        this.statusMessage = document.getElementById('statusMessage');
        this.attachBtn = document.getElementById('attachBtn');
        this.localFileBtn = document.getElementById('localFileBtn');
        this.addLinkBtn = document.getElementById('addLinkBtn');
        this.fileInput = document.getElementById('fileInput');
        
        this.isLoading = false;
        this.attachedFiles = [];
        this.attachedLinks = [];
        
        // Voice functionality
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.voiceEnabled = false;
        
        this.initializeEventListeners();
        this.loadConversationHistory();
        this.checkApiStatus();
        this.checkVoiceStatus();
    }
    
    initializeEventListeners() {
        // Form submission
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        // Clear conversation
        this.clearBtn.addEventListener('click', () => {
            this.clearConversation();
        });
        
        // Check API status
        this.statusBtn.addEventListener('click', () => {
            this.checkApiStatus();
        });
        
        // Message input handling
        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.autoResizeTextarea();
        });
        
        // Keyboard shortcuts
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // File attachment handlers
        this.localFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.fileInput.click();
        });
        
        this.addLinkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAddLinkDialog();
        });
        
        this.oneDriveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openOneDrivePicker();
        });
        
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
        
        // Auto-focus on message input
        this.messageInput.focus();
        
        // Check for calendar connection status
        this.checkCalendarStatus();
        
        // Voice functionality
        this.voiceStatusBtn.addEventListener('click', () => {
            this.checkVoiceStatus();
        });
        
        this.recordBtn.addEventListener('click', () => {
            this.toggleRecording();
        });
        
        this.speakBtn.addEventListener('click', () => {
            this.speakLastMessage();
        });
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) {
            return;
        }
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input and show loading
        this.messageInput.value = '';
        this.updateCharCount();
        this.autoResizeTextarea();
        this.setLoading(true);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.addMessage(data.response, 'assistant');
                this.hideStatusAlert();
            } else {
                console.error('Server error:', response.status, data);
                this.addMessage(`Error: ${data.error || 'Server error'}`, 'error');
                this.showStatusAlert('error', data.error || 'Server error');
            }
        } catch (error) {
            console.error('Network error:', error);
            this.addMessage('Error: Network error. Please check your connection and try again.', 'error');
            this.showStatusAlert('error', 'Network error occurred');
        } finally {
            this.setLoading(false);
            this.messageInput.focus();
        }
    }
    
    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-circle">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-name">You</span>
                        <span class="message-time">${currentTime}</span>
                    </div>
                    <div class="message-text">
                        ${this.formatMessage(content)}
                    </div>
                </div>
            `;
        } else {
            const iconClass = type === 'error' ? 'fas fa-exclamation-triangle' : 'fas fa-robot';
            const name = type === 'error' ? 'System' : 'Zobo';
            const messageType = type === 'error' ? 'error' : 'assistant';
            
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-circle">
                        <i class="${iconClass}"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-name">${name}</span>
                        <span class="message-time">${currentTime}</span>
                    </div>
                    <div class="message-text">
                        ${this.formatMessage(content)}
                    </div>
                </div>
            `;
        }
        
        this.messagesArea.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMessage(content) {
        // Basic formatting for code blocks and line breaks
        return content
            .replace(/\n/g, '<br>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading;
        this.messageInput.disabled = loading;
        
        if (loading) {
            this.loadingIndicator.classList.remove('d-none');
            this.scrollToBottom();
        } else {
            this.loadingIndicator.classList.add('d-none');
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }
    
    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = count;
        
        const charCountElement = this.charCount.parentElement;
        
        if (count > 1800) {
            charCountElement.style.color = '#fbbf24'; // warning color
        } else if (count >= 2000) {
            charCountElement.style.color = '#ef4444'; // danger color
        } else {
            charCountElement.style.color = '#9aa0a6'; // default color
        }
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        const newHeight = Math.min(this.messageInput.scrollHeight, 120);
        this.messageInput.style.height = newHeight + 'px';
    }
    
    async clearConversation() {
        if (!confirm('Are you sure you want to clear the conversation history?')) {
            return;
        }
        
        try {
            const response = await fetch('/api/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                // Clear messages except welcome message
                const welcomeMessage = this.messagesArea.firstElementChild;
                this.messagesArea.innerHTML = '';
                this.messagesArea.appendChild(welcomeMessage);
                
                this.showStatusAlert('success', 'Conversation cleared successfully');
            } else {
                const data = await response.json();
                this.showStatusAlert('error', `Failed to clear conversation: ${data.error}`);
            }
        } catch (error) {
            console.error('Error clearing conversation:', error);
            this.showStatusAlert('error', 'Network error occurred while clearing conversation');
        }
    }
    
    async loadConversationHistory() {
        try {
            const response = await fetch('/api/conversation');
            const data = await response.json();
            
            if (response.ok && data.conversation && data.conversation.length > 0) {
                // Load existing conversation
                data.conversation.forEach(message => {
                    if (message.role === 'user') {
                        this.addMessage(message.content, 'user');
                    } else if (message.role === 'assistant') {
                        this.addMessage(message.content, 'assistant');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }
    
    async checkApiStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.showStatusAlert('success', `API is working properly. Model: ${data.model || 'Zobo'}`);
            } else {
                this.showStatusAlert('warning', data.message);
            }
        } catch (error) {
            console.error('Error checking API status:', error);
            this.showStatusAlert('error', 'Failed to check API status');
        }
    }
    
    showStatusAlert(type, message) {
        const alertTypes = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        };
        
        this.statusAlert.className = `status-alert ${alertTypes[type]} d-none`;
        this.statusMessage.textContent = message;
        this.statusAlert.classList.remove('d-none');
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.hideStatusAlert();
            }, 3000);
        }
    }
    
    hideStatusAlert() {
        this.statusAlert.classList.add('d-none');
    }
    
    showAddLinkDialog() {
        const url = prompt('Enter a URL or link:');
        if (url && url.trim()) {
            const trimmedUrl = url.trim();
            
            // Basic URL validation
            if (!this.isValidUrl(trimmedUrl)) {
                this.showStatusAlert('warning', 'Please enter a valid URL (e.g., https://example.com)');
                return;
            }
            
            this.attachedLinks.push({
                url: trimmedUrl,
                title: this.getUrlTitle(trimmedUrl)
            });
            
            this.displayAttachedItems();
            this.showStatusAlert('success', 'Link added successfully!');
        }
    }
    
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            // Try adding https:// if no protocol
            try {
                new URL('https://' + string);
                return true;
            } catch (_) {
                return false;
            }
        }
    }
    
    getUrlTitle(url) {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
            return urlObj.hostname;
        } catch (_) {
            return url;
        }
    }
    
    handleFileSelection(files) {
        if (files.length === 0) return;
        
        // Upload files to connect them to Zobo instead of adding to chat
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showStatusAlert('warning', `File "${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }
            
            // Upload and connect file to Zobo
            this.uploadFileToZobo(file);
        });
    }
    
    async uploadFileToZobo(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Show upload progress
        this.showStatusAlert('info', `Connecting "${file.name}" to Zobo...`);
        
        try {
            const response = await fetch('/api/upload-file', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showStatusAlert('success', `"${file.name}" is now connected to Zobo! You can reference it in conversations.`);
                
                // Add a system message to show file connection
                this.addMessage(`📎 Connected file: ${file.name} (${this.formatFileSize(file.size)}) - Zobo can now access this file`, 'system');
            } else {
                this.showStatusAlert('error', `Failed to connect "${file.name}": ${data.error}`);
            }
        } catch (error) {
            console.error('File upload error:', error);
            this.showStatusAlert('error', `Failed to connect "${file.name}": Network error`);
        }
    }
    
    displayAttachedItems() {
        // Create or update display area
        let itemDisplay = document.getElementById('attachedItemsDisplay');
        if (!itemDisplay) {
            itemDisplay = document.createElement('div');
            itemDisplay.id = 'attachedItemsDisplay';
            itemDisplay.className = 'attached-files-display mb-2';
            this.messageInput.parentElement.parentElement.insertBefore(itemDisplay, this.messageInput.parentElement);
        }
        
        itemDisplay.innerHTML = '';
        
        // Display files
        this.attachedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'attached-file-item d-inline-flex align-items-center bg-secondary rounded px-2 py-1 me-2 mb-1';
            fileItem.innerHTML = `
                <i class="fas fa-file me-2"></i>
                <span class="file-name">${file.name}</span>
                <button type="button" class="btn-close btn-close-white ms-2" data-type="file" data-index="${index}" title="Remove file"></button>
            `;
            
            itemDisplay.appendChild(fileItem);
        });
        
        // Display links
        this.attachedLinks.forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'attached-file-item d-inline-flex align-items-center bg-info rounded px-2 py-1 me-2 mb-1';
            linkItem.innerHTML = `
                <i class="fas fa-link me-2"></i>
                <span class="file-name" title="${link.url}">${link.title}</span>
                <button type="button" class="btn-close btn-close-white ms-2" data-type="link" data-index="${index}" title="Remove link"></button>
            `;
            
            itemDisplay.appendChild(linkItem);
        });
        
        // Add remove handlers
        itemDisplay.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                const index = parseInt(e.target.getAttribute('data-index'));
                this.removeAttachedItem(type, index);
            });
        });
        
        const totalItems = this.attachedFiles.length + this.attachedLinks.length;
        if (totalItems > 0) {
            this.showStatusAlert('success', `${totalItems} item(s) attached. Note: Attachment functionality is prepared but not yet connected to the AI.`);
        }
    }
    
    removeAttachedItem(type, index) {
        if (type === 'file') {
            this.attachedFiles.splice(index, 1);
        } else if (type === 'link') {
            this.attachedLinks.splice(index, 1);
        }
        
        if (this.attachedFiles.length === 0 && this.attachedLinks.length === 0) {
            const itemDisplay = document.getElementById('attachedItemsDisplay');
            if (itemDisplay) {
                itemDisplay.remove();
            }
        } else {
            this.displayAttachedItems();
        }
    }
    
    openOneDrivePicker() {
        // OneDrive file picker integration
        try {
            // Check if OneDrive API is available
            if (typeof OneDrive !== 'undefined') {
                const odOptions = {
                    clientId: "your-app-id", // This would need to be configured
                    action: "download",
                    multiSelect: true,
                    openInNewWindow: true,
                    advanced: {
                        filter: "folder,.txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    },
                    success: (files) => {
                        this.handleOneDriveFiles(files);
                    },
                    cancel: () => {
                        console.log('OneDrive picker cancelled');
                    },
                    error: (error) => {
                        console.error('OneDrive picker error:', error);
                        this.showStatusAlert('error', 'Error accessing OneDrive: ' + error.message);
                    }
                };
                
                OneDrive.open(odOptions);
            } else {
                // Fallback: Show instructions for OneDrive setup
                this.showOneDriveSetupDialog();
            }
        } catch (error) {
            console.error('OneDrive integration error:', error);
            this.showOneDriveSetupDialog();
        }
    }
    
    showOneDriveSetupDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-dark">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fab fa-microsoft me-2"></i>OneDrive Integration
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>OneDrive integration is available! Here's how to use it:</p>
                        
                        <h6>Option 1: Share OneDrive Link</h6>
                        <ol>
                            <li>Go to your OneDrive and find the file</li>
                            <li>Right-click and select "Share"</li>
                            <li>Copy the sharing link</li>
                            <li>Use the "Add Link" option to paste it</li>
                        </ol>
                        
                        <h6>Option 2: Download and Upload</h6>
                        <ol>
                            <li>Download the file from OneDrive to your computer</li>
                            <li>Use the "Upload File" option to attach it</li>
                        </ol>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Coming Soon:</strong> Direct OneDrive file picker integration for seamless file access!
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('addLinkBtn').click()" data-bs-dismiss="modal">
                            <i class="fas fa-link me-2"></i>Add OneDrive Link
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Clean up modal after hiding
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }
    
    handleOneDriveFiles(files) {
        // Handle files selected from OneDrive
        files.value.forEach(file => {
            const linkItem = {
                type: 'onedrive',
                name: file.name,
                url: file['@microsoft.graph.downloadUrl'] || file.webUrl,
                size: file.size || 'Unknown size',
                icon: this.getFileIcon(file.name)
            };
            
            this.attachedLinks.push(linkItem);
        });
        
        this.displayAttachedItems();
        this.showStatusAlert('success', `Added ${files.value.length} file(s) from OneDrive`);
    }

    // Calendar integration functions
    async checkCalendarStatus() {
        try {
            const response = await fetch('/api/calendar/events?days=1');
            if (response.ok) {
                this.calendarConnected = true;
            } else {
                this.calendarConnected = false;
            }
        } catch (error) {
            this.calendarConnected = false;
        }
    }
    
    async scheduleEvent(summary, startTime, endTime, description = '', location = '') {
        try {
            const response = await fetch('/api/calendar/confirm-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary: summary,
                    start_time: startTime,
                    end_time: endTime,
                    description: description,
                    location: location
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showStatusAlert('success', `Event "${summary}" scheduled successfully!`);
                return data.event;
            } else {
                this.showStatusAlert('error', `Failed to schedule event: ${data.error}`);
                return null;
            }
        } catch (error) {
            console.error('Error scheduling event:', error);
            this.showStatusAlert('error', 'Network error while scheduling event');
            return null;
        }
    }
    
    async getFreeTimeSlots(durationMinutes = 60, days = 7) {
        try {
            const response = await fetch(`/api/calendar/free-slots?duration=${durationMinutes}&days=${days}`);
            const data = await response.json();
            
            if (response.ok) {
                return data.free_slots;
            } else {
                console.error('Error getting free slots:', data.error);
                return [];
            }
        } catch (error) {
            console.error('Error fetching free slots:', error);
            return [];
        }
    }
    
    async getCalendarEvents(days = 7) {
        try {
            const response = await fetch(`/api/calendar/events?days=${days}`);
            const data = await response.json();
            
            if (response.ok) {
                return data.events;
            } else {
                console.error('Error getting calendar events:', data.error);
                return [];
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            return [];
        }
    }
    
    // Voice functionality methods
    async checkVoiceStatus() {
        try {
            const response = await fetch('/api/voice/status');
            const data = await response.json();
            
            if (data.configured) {
                this.voiceEnabled = true;
                this.showStatusAlert('success', `Gemini Live API is ready! Model: ${data.model}`);
                this.recordBtn.disabled = false;
                this.speakBtn.disabled = false;
            } else {
                this.voiceEnabled = false;
                this.showStatusAlert('warning', 'Gemini Live API not configured. Voice features will be disabled.');
                this.recordBtn.disabled = true;
                this.speakBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error checking voice status:', error);
            this.voiceEnabled = false;
            this.showStatusAlert('error', 'Failed to check Gemini Live API status');
        }
    }
    
    async toggleRecording() {
        if (!this.voiceEnabled) {
            this.showStatusAlert('warning', 'Gemini Live API not configured');
            return;
        }
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                await this.processAudioRecording(audioBlob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordBtn.classList.add('recording');
            this.recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
            this.recordBtn.title = 'Stop recording';
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showStatusAlert('error', 'Failed to start recording. Please check microphone permissions.');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            this.recordBtn.classList.remove('recording');
            this.recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            this.recordBtn.title = 'Record voice message';
        }
    }
    
    async processAudioRecording(audioBlob) {
        try {
            this.showStatusAlert('🎤 Processing voice message...', 'info');
            
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            
            const response = await fetch('/api/voice/live-conversation', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (data.audio) {
                    // Play the audio response
                    const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
                    audio.play();
                    
                    // Add the message to chat
                    this.addMessage(data.message, 'assistant');
                    this.showStatusAlert('🎤 Voice message processed successfully!', 'success');
                } else {
                    // Add text response without audio
                    this.addMessage(data.message || 'Voice processed but no audio response available.', 'assistant');
                    this.showStatusAlert('💬 Voice converted to text successfully!', 'success');
                }
            } else {
                if (data.fallback) {
                    this.showStatusAlert('⚠️ Voice features temporarily unavailable. Please use text chat.', 'warning');
                } else {
                    this.showStatusAlert(`❌ Voice processing failed: ${data.error || 'Unknown error'}`, 'error');
                }
            }
        } catch (error) {
            console.error('Voice processing error:', error);
            this.showStatusAlert('❌ Voice processing failed. Please try again.', 'error');
        }
    }
    
    async speakLastMessage() {
        try {
            const messages = this.messagesArea.querySelectorAll('.message');
            if (messages.length === 0) return;
            
            const lastAssistantMessage = Array.from(messages).reverse().find(msg => 
                msg.classList.contains('assistant')
            );
            
            if (!lastAssistantMessage) {
                this.showStatusAlert('💬 No assistant message to speak', 'info');
                return;
            }
            
            const messageText = lastAssistantMessage.querySelector('.message-text').textContent;
            await this.speakText(messageText);
            
        } catch (error) {
            console.error('Error speaking last message:', error);
            this.showStatusAlert('❌ Failed to speak message', 'error');
        }
    }

    async speakText(text) {
        try {
            this.showStatusAlert('🔊 Converting text to speech...', 'info');
            
            const response = await fetch('/api/voice/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (data.audio) {
                    // Play the audio
                    const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
                    audio.play();
                    this.showStatusAlert('🔊 Playing audio response...', 'success');
                } else {
                    this.showStatusAlert('💬 Text-to-speech is available but audio generation is temporarily disabled', 'info');
                }
            } else {
                this.showStatusAlert(`❌ Text-to-speech failed: ${data.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error speaking text:', error);
            this.showStatusAlert('❌ Failed to convert text to speech', 'error');
        }
    }
    
    async sendVoiceMessage(text) {
        try {
            const response = await fetch('/api/voice/chat-async', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    history: this.getConversationHistory()
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.audio) {
                // Play the audio response
                const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
                audio.play();
                
                // Add the message to chat
                this.addMessage(text, 'user');
                this.addMessage('Voice response generated', 'assistant');
                
                return true;
            } else {
                console.error('Voice chat failed:', data.error);
                return false;
            }
        } catch (error) {
            console.error('Error sending voice message:', error);
            return false;
        }
    }
    
    getConversationHistory() {
        // Get conversation history for context
        const messages = [];
        const messageElements = this.messagesArea.querySelectorAll('.message');
        
        messageElements.forEach(element => {
            const text = element.querySelector('.message-text')?.textContent || '';
            const isUser = element.classList.contains('user-message');
            
            if (text.trim()) {
                messages.push({
                    role: isUser ? 'user' : 'assistant',
                    content: text.trim()
                });
            }
        });
        
        return messages.slice(-10); // Keep last 10 messages for context
    }
}

// Make calendar functions globally accessible for Zobo to use
window.ZoboCalendar = {
    scheduleEvent: async (summary, startTime, endTime, description = '', location = '') => {
        const app = document.chatApp;
        if (app) {
            return await app.scheduleEvent(summary, startTime, endTime, description, location);
        }
        return null;
    },
    
    getFreeSlots: async (durationMinutes = 60, days = 7) => {
        const app = document.chatApp;
        if (app) {
            return await app.getFreeTimeSlots(durationMinutes, days);
        }
        return [];
    },
    
    getEvents: async (days = 7) => {
        const app = document.chatApp;
        if (app) {
            return await app.getCalendarEvents(days);
        }
        return [];
    }
};

// Initialize chat application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ChatApp();
    document.chatApp = app; // Make globally accessible
});
