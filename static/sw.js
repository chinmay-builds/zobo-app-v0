const CACHE_NAME = 'zobo-v1';
const urlsToCache = [
  '/',
  '/static/css/style.css',
  '/static/js/chat.js',
  '/static/js/wakeword.js',
  '/static/js/timer.js',
  '/static/js/notifications.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for timers and alarms
self.addEventListener('sync', event => {
  if (event.tag === 'timer-sync') {
    event.waitUntil(syncTimers());
  } else if (event.tag === 'alarm-sync') {
    event.waitUntil(syncAlarms());
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'START_TIMER':
        handleStartTimer(event.data.payload);
        break;
      case 'START_ALARM':
        handleStartAlarm(event.data.payload);
        break;
      case 'START_STOPWATCH':
        handleStartStopwatch(event.data.payload);
        break;
      case 'STOP_TIMER':
        handleStopTimer(event.data.payload);
        break;
      case 'STOP_ALARM':
        handleStopAlarm(event.data.payload);
        break;
      case 'STOP_STOPWATCH':
        handleStopStopwatch(event.data.payload);
        break;
      case 'REQUEST_NOTIFICATION_PERMISSION':
        requestNotificationPermission();
        break;
    }
  }
});

// Timer management
const activeTimers = new Map();
const activeAlarms = new Map();
const activeStopwatches = new Map();

function handleStartTimer(payload) {
  const { id, duration, name } = payload;
  const endTime = Date.now() + (duration * 1000);
  
  activeTimers.set(id, {
    id,
    name: name || 'Timer',
    endTime,
    duration,
    intervalId: setInterval(() => {
      const remaining = endTime - Date.now();
      
      if (remaining <= 0) {
        clearInterval(activeTimers.get(id).intervalId);
        activeTimers.delete(id);
        showNotification('Timer Complete', {
          body: `${name || 'Timer'} has finished!`,
          icon: '/static/icons/icon-192x192.png',
          badge: '/static/icons/icon-72x72.png',
          tag: `timer-${id}`,
          requireInteraction: true,
          actions: [
            { action: 'dismiss', title: 'Dismiss' },
            { action: 'snooze', title: 'Snooze 5min' }
          ]
        });
        playAlarmSound();
      } else {
        // Send progress update to main thread
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'TIMER_UPDATE',
              payload: { id, remaining: Math.ceil(remaining / 1000) }
            });
          });
        });
      }
    }, 1000)
  });
}

function handleStartAlarm(payload) {
  const { id, time, name, repeat } = payload;
  const now = new Date();
  const alarmTime = new Date(time);
  
  // If alarm time has passed today, set for tomorrow (unless it's a one-time alarm)
  if (alarmTime <= now && !repeat) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }
  
  const timeUntilAlarm = alarmTime.getTime() - Date.now();
  
  activeAlarms.set(id, {
    id,
    name: name || 'Alarm',
    time: alarmTime,
    repeat,
    timeoutId: setTimeout(() => {
      showNotification('Alarm', {
        body: `${name || 'Alarm'} is ringing!`,
        icon: '/static/icons/icon-192x192.png',
        badge: '/static/icons/icon-72x72.png',
        tag: `alarm-${id}`,
        requireInteraction: true,
        actions: [
          { action: 'dismiss', title: 'Dismiss' },
          { action: 'snooze', title: 'Snooze 5min' }
        ]
      });
      playAlarmSound();
      
      // Handle repeat alarms
      if (repeat && repeat !== 'none') {
        scheduleNextRepeat(id, alarmTime, repeat, name);
      } else {
        activeAlarms.delete(id);
      }
    }, timeUntilAlarm)
  });
}

function handleStartStopwatch(payload) {
  const { id, name } = payload;
  const startTime = Date.now();
  
  activeStopwatches.set(id, {
    id,
    name: name || 'Stopwatch',
    startTime,
    pausedTime: 0,
    isPaused: false,
    intervalId: setInterval(() => {
      const stopwatch = activeStopwatches.get(id);
      if (stopwatch && !stopwatch.isPaused) {
        const elapsed = Date.now() - stopwatch.startTime - stopwatch.pausedTime;
        
        // Send progress update to main thread
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'STOPWATCH_UPDATE',
              payload: { id, elapsed: Math.floor(elapsed / 1000) }
            });
          });
        });
      }
    }, 100)
  });
}

function handleStopTimer(payload) {
  const { id } = payload;
  const timer = activeTimers.get(id);
  if (timer) {
    clearInterval(timer.intervalId);
    activeTimers.delete(id);
  }
}

function handleStopAlarm(payload) {
  const { id } = payload;
  const alarm = activeAlarms.get(id);
  if (alarm) {
    clearTimeout(alarm.timeoutId);
    activeAlarms.delete(id);
  }
}

function handleStopStopwatch(payload) {
  const { id } = payload;
  const stopwatch = activeStopwatches.get(id);
  if (stopwatch) {
    clearInterval(stopwatch.intervalId);
    activeStopwatches.delete(id);
  }
}

function scheduleNextRepeat(id, currentTime, repeat, name) {
  const nextAlarmTime = new Date(currentTime);
  
  switch (repeat) {
    case 'daily':
      nextAlarmTime.setDate(nextAlarmTime.getDate() + 1);
      break;
    case 'weekdays':
      const day = nextAlarmTime.getDay();
      if (day === 5) { // Friday
        nextAlarmTime.setDate(nextAlarmTime.getDate() + 3); // Skip to Monday
      } else if (day === 6) { // Saturday
        nextAlarmTime.setDate(nextAlarmTime.getDate() + 2); // Skip to Monday
      } else {
        nextAlarmTime.setDate(nextAlarmTime.getDate() + 1);
      }
      break;
    case 'weekly':
      nextAlarmTime.setDate(nextAlarmTime.getDate() + 7);
      break;
  }
  
  handleStartAlarm({ id, time: nextAlarmTime.toISOString(), name, repeat });
}

function showNotification(title, options) {
  if (Notification.permission === 'granted') {
    self.registration.showNotification(title, options);
  }
}

function requestNotificationPermission() {
  if ('Notification' in self && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'snooze') {
    // Handle snooze action
    const tag = event.notification.tag;
    if (tag.startsWith('timer-')) {
      const timerId = tag.replace('timer-', '');
      handleStartTimer({ id: `${timerId}-snooze`, duration: 300, name: 'Snoozed Timer' });
    } else if (tag.startsWith('alarm-')) {
      const alarmId = tag.replace('alarm-', '');
      const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);
      handleStartAlarm({ id: `${alarmId}-snooze`, time: snoozeTime.toISOString(), name: 'Snoozed Alarm' });
    }
  } else {
    // Open the app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Audio handling for alarms
function playAlarmSound() {
  // This will be implemented with Web Audio API in the main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PLAY_ALARM_SOUND'
      });
    });
  });
}

// Background sync functions
async function syncTimers() {
  // Sync timer state with server if needed
  console.log('Syncing timers...');
}

async function syncAlarms() {
  // Sync alarm state with server if needed
  console.log('Syncing alarms...');
}