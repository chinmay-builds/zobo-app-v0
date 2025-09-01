class TimerManager {
    constructor() {
        this.timers = new Map();
        this.alarms = new Map();
        this.stopwatches = new Map();
        this.serviceWorker = null;
        this.voiceCommands = this.initVoiceCommands();
        this.init();
    }

    async init() {
        // Get service worker registration
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                this.serviceWorker = registration.active;
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', event => {
                    this.handleServiceWorkerMessage(event.data);
                });
            } catch (error) {
                console.error('Service worker not ready:', error);
            }
        }

        this.initEventListeners();
        this.loadSavedState();
        this.updateDisplays();
    }

    initEventListeners() {
        // Timer controls
        document.getElementById('startTimerBtn')?.addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimerBtn')?.addEventListener('click', () => this.pauseTimer());
        document.getElementById('stopTimerBtn')?.addEventListener('click', () => this.stopTimer());

        // Alarm controls
        document.getElementById('setAlarmBtn')?.addEventListener('click', () => this.setAlarm());

        // Stopwatch controls
        document.getElementById('startStopwatchBtn')?.addEventListener('click', () => this.startStopwatch());
        document.getElementById('pauseStopwatchBtn')?.addEventListener('click', () => this.pauseStopwatch());
        document.getElementById('resetStopwatchBtn')?.addEventListener('click', () => this.resetStopwatch());

        // Auto-update displays
        setInterval(() => this.updateDisplays(), 1000);
    }

    // Timer Methods
    startTimer() {
        const hours = parseInt(document.getElementById('timerHours').value) || 0;
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        const name = document.getElementById('timerName').value || 'Timer';

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (totalSeconds <= 0) {
            alert('Please set a valid time');
            return;
        }

        const timerId = Date.now().toString();
        const timer = {
            id: timerId,
            name,
            duration: totalSeconds,
            remaining: totalSeconds,
            startTime: Date.now(),
            isPaused: false,
            intervalId: null
        };

        this.timers.set(timerId, timer);
        this.startTimerInterval(timer);
        this.saveState();
        this.updateTimerUI();
        this.updateTimersList();

        // Send to service worker
        this.sendToServiceWorker('START_TIMER', {
            id: timerId,
            duration: totalSeconds,
            name
        });

        // Show notification
        notificationManager.showTimerNotification(name, totalSeconds);
    }

    startTimerInterval(timer) {
        timer.intervalId = setInterval(() => {
            if (!timer.isPaused) {
                timer.remaining--;
                
                if (timer.remaining <= 0) {
                    this.completeTimer(timer.id);
                }
            }
        }, 1000);
    }

    pauseTimer(timerId) {
        const timer = Array.from(this.timers.values()).find(t => !t.isPaused);
        if (timer) {
            timer.isPaused = !timer.isPaused;
            this.updateTimerUI();
        }
    }

    stopTimer(timerId) {
        const timer = timerId ? this.timers.get(timerId) : Array.from(this.timers.values())[0];
        if (timer) {
            clearInterval(timer.intervalId);
            this.timers.delete(timer.id);
            this.sendToServiceWorker('STOP_TIMER', { id: timer.id });
            this.updateTimerUI();
            this.updateTimersList();
            this.saveState();
        }
    }

    completeTimer(timerId) {
        const timer = this.timers.get(timerId);
        if (timer) {
            clearInterval(timer.intervalId);
            this.timers.delete(timerId);
            
            // Show completion notification
            notificationManager.showTimerCompleteNotification(timer.name);
            notificationManager.vibrate([400, 200, 400]);
            
            this.updateTimerUI();
            this.updateTimersList();
            this.saveState();
        }
    }

    // Alarm Methods
    setAlarm() {
        const timeInput = document.getElementById('alarmTime').value;
        const name = document.getElementById('alarmName').value || 'Alarm';
        const repeat = document.getElementById('alarmRepeat').value;

        if (!timeInput) {
            alert('Please set an alarm time');
            return;
        }

        const alarmId = Date.now().toString();
        const alarmTime = new Date();
        const [hours, minutes] = timeInput.split(':');
        alarmTime.setHours(parseInt(hours));
        alarmTime.setMinutes(parseInt(minutes));
        alarmTime.setSeconds(0);

        // If alarm time has passed today, set for tomorrow (unless repeating)
        if (alarmTime <= new Date() && repeat === 'none') {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }

        const alarm = {
            id: alarmId,
            name,
            time: alarmTime,
            repeat,
            isActive: true
        };

        this.alarms.set(alarmId, alarm);
        this.saveState();
        this.updateAlarmsList();

        // Send to service worker
        this.sendToServiceWorker('START_ALARM', {
            id: alarmId,
            time: alarmTime.toISOString(),
            name,
            repeat
        });

        // Show notification
        notificationManager.showAlarmNotification(name, alarmTime.toLocaleTimeString());

        // Clear inputs
        document.getElementById('alarmTime').value = '';
        document.getElementById('alarmName').value = '';
        document.getElementById('alarmRepeat').value = 'none';
    }

    deleteAlarm(alarmId) {
        const alarm = this.alarms.get(alarmId);
        if (alarm) {
            this.alarms.delete(alarmId);
            this.sendToServiceWorker('STOP_ALARM', { id: alarmId });
            this.updateAlarmsList();
            this.saveState();
        }
    }

    // Stopwatch Methods
    startStopwatch() {
        const name = document.getElementById('stopwatchName').value || 'Stopwatch';
        const stopwatchId = Date.now().toString();

        const stopwatch = {
            id: stopwatchId,
            name,
            startTime: Date.now(),
            pausedTime: 0,
            isPaused: false,
            laps: []
        };

        this.stopwatches.set(stopwatchId, stopwatch);
        this.saveState();
        this.updateStopwatchUI();

        // Send to service worker
        this.sendToServiceWorker('START_STOPWATCH', {
            id: stopwatchId,
            name
        });
    }

    pauseStopwatch() {
        const stopwatch = Array.from(this.stopwatches.values()).find(s => !s.isPaused);
        if (stopwatch) {
            if (stopwatch.isPaused) {
                // Resume
                stopwatch.startTime = Date.now() - stopwatch.pausedTime;
                stopwatch.isPaused = false;
            } else {
                // Pause
                stopwatch.pausedTime = Date.now() - stopwatch.startTime;
                stopwatch.isPaused = true;
            }
            this.updateStopwatchUI();
            this.saveState();
        }
    }

    resetStopwatch() {
        const stopwatch = Array.from(this.stopwatches.values())[0];
        if (stopwatch) {
            this.stopwatches.delete(stopwatch.id);
            this.sendToServiceWorker('STOP_STOPWATCH', { id: stopwatch.id });
            this.updateStopwatchUI();
            this.updateLapsList();
            this.saveState();
        }
    }

    addLap() {
        const stopwatch = Array.from(this.stopwatches.values()).find(s => !s.isPaused);
        if (stopwatch) {
            const lapTime = Date.now() - stopwatch.startTime;
            stopwatch.laps.push(lapTime);
            this.updateLapsList();
            this.saveState();
        }
    }

    // UI Update Methods
    updateDisplays() {
        this.updateTimerDisplay();
        this.updateStopwatchDisplay();
    }

    updateTimerDisplay() {
        const display = document.getElementById('timerDisplay');
        const timer = Array.from(this.timers.values())[0];
        
        if (timer && display) {
            const remaining = Math.max(0, timer.remaining);
            display.textContent = this.formatTime(remaining);
        } else if (display) {
            display.textContent = '00:00';
        }
    }

    updateStopwatchDisplay() {
        const display = document.getElementById('stopwatchDisplay');
        const stopwatch = Array.from(this.stopwatches.values())[0];
        
        if (stopwatch && display) {
            const elapsed = stopwatch.isPaused ? 
                stopwatch.pausedTime : 
                Date.now() - stopwatch.startTime;
            display.textContent = this.formatStopwatchTime(elapsed);
        } else if (display) {
            display.textContent = '00:00:00';
        }
    }

    updateTimerUI() {
        const hasActiveTimer = this.timers.size > 0;
        const startBtn = document.getElementById('startTimerBtn');
        const pauseBtn = document.getElementById('pauseTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');

        if (startBtn) startBtn.classList.toggle('d-none', hasActiveTimer);
        if (pauseBtn) pauseBtn.classList.toggle('d-none', !hasActiveTimer);
        if (stopBtn) stopBtn.classList.toggle('d-none', !hasActiveTimer);
    }

    updateStopwatchUI() {
        const hasActiveStopwatch = this.stopwatches.size > 0;
        const startBtn = document.getElementById('startStopwatchBtn');
        const pauseBtn = document.getElementById('pauseStopwatchBtn');
        const resetBtn = document.getElementById('resetStopwatchBtn');

        if (startBtn) startBtn.classList.toggle('d-none', hasActiveStopwatch);
        if (pauseBtn) pauseBtn.classList.toggle('d-none', !hasActiveStopwatch);
        if (resetBtn) resetBtn.classList.toggle('d-none', !hasActiveStopwatch);
    }

    updateTimersList() {
        const list = document.getElementById('timerList');
        if (!list) return;

        list.innerHTML = '';
        this.timers.forEach(timer => {
            const item = document.createElement('div');
            item.className = 'timer-item mb-2';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${timer.name}</strong><br>
                        <small>${this.formatTime(timer.remaining)} remaining</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="timerManager.stopTimer('${timer.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    updateAlarmsList() {
        const list = document.getElementById('alarmList');
        if (!list) return;

        list.innerHTML = '';
        this.alarms.forEach(alarm => {
            const item = document.createElement('div');
            item.className = 'alarm-item mb-2';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${alarm.name}</strong><br>
                        <small>${alarm.time.toLocaleTimeString()} ${alarm.repeat !== 'none' ? `(${alarm.repeat})` : ''}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="timerManager.deleteAlarm('${alarm.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    updateLapsList() {
        const list = document.getElementById('lapsList');
        if (!list) return;

        const stopwatch = Array.from(this.stopwatches.values())[0];
        list.innerHTML = '';
        
        if (stopwatch && stopwatch.laps.length > 0) {
            stopwatch.laps.forEach((lapTime, index) => {
                const item = document.createElement('div');
                item.className = 'lap-item';
                item.innerHTML = `Lap ${index + 1}: ${this.formatStopwatchTime(lapTime)}`;
                list.appendChild(item);
            });
        }
    }

    // Utility Methods
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

    formatStopwatchTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const ms = Math.floor((milliseconds % 1000) / 10);
        const s = seconds % 60;
        const m = minutes % 60;
        
        return `${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }

    // Service Worker Communication
    sendToServiceWorker(type, payload) {
        if (this.serviceWorker) {
            this.serviceWorker.postMessage({ type, payload });
        } else if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type, payload });
        }
    }

    handleServiceWorkerMessage(data) {
        switch (data.type) {
            case 'TIMER_UPDATE':
                this.handleTimerUpdate(data.payload);
                break;
            case 'STOPWATCH_UPDATE':
                this.handleStopwatchUpdate(data.payload);
                break;
            case 'PLAY_ALARM_SOUND':
                notificationManager.playAlarmSound();
                break;
        }
    }

    handleTimerUpdate(payload) {
        const timer = this.timers.get(payload.id);
        if (timer) {
            timer.remaining = payload.remaining;
            this.updateTimersList();
        }
    }

    handleStopwatchUpdate(payload) {
        // Update stopwatch display from service worker
        this.updateStopwatchDisplay();
    }

    // State Management
    saveState() {
        const state = {
            timers: Array.from(this.timers.entries()),
            alarms: Array.from(this.alarms.entries()),
            stopwatches: Array.from(this.stopwatches.entries())
        };
        localStorage.setItem('zoboTimerState', JSON.stringify(state));
    }

    loadSavedState() {
        try {
            const saved = localStorage.getItem('zoboTimerState');
            if (saved) {
                const state = JSON.parse(saved);
                
                // Restore timers
                state.timers?.forEach(([id, timer]) => {
                    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
                    timer.remaining = Math.max(0, timer.duration - elapsed);
                    
                    if (timer.remaining > 0) {
                        this.timers.set(id, timer);
                        this.startTimerInterval(timer);
                    }
                });
                
                // Restore alarms
                state.alarms?.forEach(([id, alarm]) => {
                    alarm.time = new Date(alarm.time);
                    this.alarms.set(id, alarm);
                });
                
                // Restore stopwatches
                state.stopwatches?.forEach(([id, stopwatch]) => {
                    this.stopwatches.set(id, stopwatch);
                });
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }

    // Voice Commands Integration
    initVoiceCommands() {
        return {
            // Timer commands
            'set timer': this.processTimerCommand.bind(this),
            'start timer': this.processTimerCommand.bind(this),
            'create timer': this.processTimerCommand.bind(this),
            'stop timer': this.stopAllTimers.bind(this),
            'pause timer': () => this.pauseTimer(),
            'cancel timer': this.stopAllTimers.bind(this),
            
            // Alarm commands
            'set alarm': this.processAlarmCommand.bind(this),
            'create alarm': this.processAlarmCommand.bind(this),
            'wake me up': this.processAlarmCommand.bind(this),
            'delete alarm': this.deleteAllAlarms.bind(this),
            'cancel alarm': this.deleteAllAlarms.bind(this),
            
            // Stopwatch commands
            'start stopwatch': () => this.startStopwatch(),
            'stop stopwatch': () => this.resetStopwatch(),
            'reset stopwatch': () => this.resetStopwatch(),
            'pause stopwatch': () => this.pauseStopwatch()
        };
    }

    processVoiceCommand(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // Check for timer/alarm/stopwatch commands
        for (const [command, handler] of Object.entries(this.voiceCommands)) {
            if (lowerTranscript.includes(command)) {
                console.log(`Executing voice command: ${command}`);
                const result = handler(lowerTranscript);
                return result || `${command} executed`;
            }
        }
        
        return null; // No timer command found
    }

    processTimerCommand(transcript) {
        const timePatterns = [
            /(?:for\s+)?(\d+)\s*(?:hour|hours|hr|hrs|h)\s*(?:and\s+)?(\d+)?\s*(?:minute|minutes|min|mins|m)?/i,
            /(?:for\s+)?(\d+)\s*(?:minute|minutes|min|mins|m)\s*(?:and\s+)?(\d+)?\s*(?:second|seconds|sec|secs|s)?/i,
            /(?:for\s+)?(\d+)\s*(?:second|seconds|sec|secs|s)/i,
            /(?:for\s+)?(\d+):(\d+):(\d+)/i, // HH:MM:SS
            /(?:for\s+)?(\d+):(\d+)/i // MM:SS
        ];

        let hours = 0, minutes = 0, seconds = 0;
        let name = 'Voice Timer';

        for (const pattern of timePatterns) {
            const match = transcript.match(pattern);
            if (match) {
                if (pattern.source.includes('hour')) {
                    hours = parseInt(match[1]) || 0;
                    minutes = parseInt(match[2]) || 0;
                } else if (pattern.source.includes('minute')) {
                    minutes = parseInt(match[1]) || 0;
                    seconds = parseInt(match[2]) || 0;
                } else if (pattern.source.includes('second')) {
                    seconds = parseInt(match[1]) || 0;
                } else if (match[3]) {
                    // HH:MM:SS format
                    hours = parseInt(match[1]) || 0;
                    minutes = parseInt(match[2]) || 0;
                    seconds = parseInt(match[3]) || 0;
                } else if (match[2]) {
                    // MM:SS format
                    minutes = parseInt(match[1]) || 0;
                    seconds = parseInt(match[2]) || 0;
                }
                break;
            }
        }

        // Extract timer name if specified
        const nameMatch = transcript.match(/(?:timer\s+(?:for\s+|named\s+|called\s+))([^0-9]+?)(?:\s+for\s+|\s+\d|$)/i);
        if (nameMatch) {
            name = nameMatch[1].trim();
        }

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (totalSeconds > 0) {
            // Set the UI values and start timer
            document.getElementById('timerHours').value = hours;
            document.getElementById('timerMinutes').value = minutes;
            document.getElementById('timerSeconds').value = seconds;
            document.getElementById('timerName').value = name;
            
            this.startTimer();
            
            const timeString = this.formatTime(totalSeconds);
            return `Timer set for ${timeString} with name "${name}"`;
        }
        
        return 'Please specify a valid time for the timer';
    }

    processAlarmCommand(transcript) {
        const timePatterns = [
            /(?:at\s+)?(\d{1,2}):(\d{2})\s*(am|pm)?/i,
            /(?:at\s+)?(\d{1,2})\s*(am|pm)/i,
            /(?:in\s+)?(\d+)\s*(?:minute|minutes|min|mins)/i,
            /(?:in\s+)?(\d+)\s*(?:hour|hours|hr|hrs)/i
        ];

        let alarmTime = new Date();
        let name = 'Voice Alarm';
        let repeat = 'none';

        // Check for repeat patterns
        if (transcript.includes('daily') || transcript.includes('every day')) {
            repeat = 'daily';
        } else if (transcript.includes('weekdays') || transcript.includes('work days')) {
            repeat = 'weekdays';
        } else if (transcript.includes('weekly') || transcript.includes('every week')) {
            repeat = 'weekly';
        }

        for (const pattern of timePatterns) {
            const match = transcript.match(pattern);
            if (match) {
                if (pattern.source.includes(':')) {
                    // Time format like "7:30 am"
                    let hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]) || 0;
                    const ampm = match[3]?.toLowerCase();
                    
                    if (ampm === 'pm' && hours !== 12) hours += 12;
                    if (ampm === 'am' && hours === 12) hours = 0;
                    
                    alarmTime.setHours(hours, minutes, 0, 0);
                    
                    // If time has passed today, set for tomorrow
                    if (alarmTime <= new Date()) {
                        alarmTime.setDate(alarmTime.getDate() + 1);
                    }
                } else if (match[2]) {
                    // Hour format like "7 pm"
                    let hours = parseInt(match[1]);
                    const ampm = match[2].toLowerCase();
                    
                    if (ampm === 'pm' && hours !== 12) hours += 12;
                    if (ampm === 'am' && hours === 12) hours = 0;
                    
                    alarmTime.setHours(hours, 0, 0, 0);
                    
                    if (alarmTime <= new Date()) {
                        alarmTime.setDate(alarmTime.getDate() + 1);
                    }
                } else if (pattern.source.includes('minute')) {
                    // Relative time in minutes
                    const minutes = parseInt(match[1]);
                    alarmTime = new Date(Date.now() + minutes * 60 * 1000);
                } else if (pattern.source.includes('hour')) {
                    // Relative time in hours
                    const hours = parseInt(match[1]);
                    alarmTime = new Date(Date.now() + hours * 60 * 60 * 1000);
                }
                break;
            }
        }

        // Extract alarm name if specified
        const nameMatch = transcript.match(/(?:alarm\s+(?:for\s+|named\s+|called\s+))([^0-9]+?)(?:\s+at\s+|\s+in\s+|\s+\d|$)/i);
        if (nameMatch) {
            name = nameMatch[1].trim();
        }

        // Set the UI values and create alarm
        const timeString = `${alarmTime.getHours().toString().padStart(2, '0')}:${alarmTime.getMinutes().toString().padStart(2, '0')}`;
        document.getElementById('alarmTime').value = timeString;
        document.getElementById('alarmName').value = name;
        document.getElementById('alarmRepeat').value = repeat;
        
        this.setAlarm();
        
        return `Alarm set for ${alarmTime.toLocaleTimeString()} with name "${name}"`;
    }

    stopAllTimers() {
        const timerIds = Array.from(this.timers.keys());
        timerIds.forEach(id => this.stopTimer(id));
        return `Stopped ${timerIds.length} timer(s)`;
    }

    deleteAllAlarms() {
        const alarmIds = Array.from(this.alarms.keys());
        alarmIds.forEach(id => this.deleteAlarm(id));
        return `Deleted ${alarmIds.length} alarm(s)`;
    }
}

// Initialize timer manager
const timerManager = new TimerManager();

// Export for global use
window.timerManager = timerManager;