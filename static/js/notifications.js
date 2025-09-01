class NotificationManager {
    constructor() {
        this.permission = Notification.permission;
        this.init();
    }

    async init() {
        // Request notification permission on load
        await this.requestPermission();
        
        // Listen for service worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'PLAY_ALARM_SOUND') {
                    this.playAlarmSound();
                }
            });
        }
    }

    async requestPermission() {
        if ('Notification' in window && this.permission === 'default') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }
        return this.permission === 'granted';
    }

    showNotification(title, options = {}) {
        if (this.permission === 'granted') {
            const defaultOptions = {
                icon: '/static/icons/icon-192x192.png',
                badge: '/static/icons/icon-72x72.png',
                requireInteraction: true,
                tag: 'zobo-notification'
            };
            
            const notification = new Notification(title, { ...defaultOptions, ...options });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            return notification;
        } else {
            console.warn('Notification permission not granted');
            return null;
        }
    }

    showTimerNotification(name, remaining) {
        return this.showNotification(`Timer: ${name}`, {
            body: `${this.formatTime(remaining)} remaining`,
            tag: `timer-${name}`,
            silent: true
        });
    }

    showAlarmNotification(name, time) {
        return this.showNotification(`Alarm: ${name}`, {
            body: `Scheduled for ${time}`,
            tag: `alarm-${name}`,
            silent: true
        });
    }

    showTimerCompleteNotification(name) {
        return this.showNotification('Timer Complete!', {
            body: `${name} has finished`,
            tag: `timer-complete-${name}`,
            requireInteraction: true,
            actions: [
                { action: 'dismiss', title: 'Dismiss' },
                { action: 'snooze', title: 'Snooze 5min' }
            ]
        });
    }

    showAlarmRingingNotification(name) {
        return this.showNotification('Alarm Ringing!', {
            body: `${name} is going off`,
            tag: `alarm-ringing-${name}`,
            requireInteraction: true,
            actions: [
                { action: 'dismiss', title: 'Dismiss' },
                { action: 'snooze', title: 'Snooze 5min' }
            ]
        });
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    playAlarmSound() {
        // Create multiple audio contexts for better compatibility
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Generate alarm sound using Web Audio API
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create an alarm-like sound pattern
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.6);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.9);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 1.2);
        
        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1.2);
        
        // Repeat the sound 3 times
        setTimeout(() => this.playAlarmSound(), 1500);
        setTimeout(() => this.playAlarmSound(), 3000);
    }

    checkSupport() {
        const support = {
            notifications: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            audio: 'AudioContext' in window || 'webkitAudioContext' in window,
            vibrate: 'vibrate' in navigator
        };
        
        return support;
    }

    // Vibrate pattern for mobile devices
    vibrate(pattern = [200, 100, 200, 100, 200]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Show permission request dialog
    showPermissionDialog() {
        if (this.permission === 'default') {
            const dialog = document.createElement('div');
            dialog.className = 'alert alert-info alert-dismissible fade show';
            dialog.innerHTML = `
                <i class="fas fa-bell me-2"></i>
                <strong>Enable Notifications</strong><br>
                Allow notifications to receive timer and alarm alerts even when the app is closed.
                <button type="button" class="btn btn-sm btn-primary ms-2" onclick="notificationManager.requestPermission()">Allow</button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            const container = document.getElementById('statusAlert');
            if (container) {
                container.parentNode.insertBefore(dialog, container);
                setTimeout(() => dialog.remove(), 10000); // Auto-remove after 10 seconds
            }
        }
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// Show permission dialog on first visit
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        notificationManager.showPermissionDialog();
    }, 3000); // Show after 3 seconds
});

// Export for global use
window.notificationManager = notificationManager;