// Wakeword detection and voice chat for Zobo
const WAKEWORDS = ["hey zobo", "zobo"];
let isWakewordActive = false;
let isListeningForWakeword = false;

// Use browser SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

// Start continuous listening for wakeword
function startWakewordListener() {
  if (!recognition) {
    console.warn('Speech recognition not supported in this browser');
    return;
  }
  if (isListeningForWakeword) {
    console.log('Wakeword listener already active');
    return;
  }
  
  isListeningForWakeword = true;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    if (!isListeningForWakeword) return;
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript.toLowerCase())
      .join(' ');
    if (WAKEWORDS.some(word => transcript.includes(word))) {
      triggerVoiceInteraction();
      stopWakewordListener();
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    // Handle specific errors more gracefully
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      console.warn('Microphone permission denied. Please allow microphone access to use wakeword.');
      stopWakewordListener();
      return;
    }
    // Only restart for certain error types and if still supposed to be listening
    if (isListeningForWakeword && ['network', 'audio-capture'].includes(event.error)) {
      setTimeout(() => {
        if (isListeningForWakeword) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }
      }, 1000);
    }
  };

  recognition.onend = () => {
    if (isListeningForWakeword) {
      setTimeout(() => {
        if (isListeningForWakeword) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition on end:', e);
            // If we can't restart, stop listening
            stopWakewordListener();
          }
        }
      }, 100);
    }
  };

  try {
    recognition.start();
  } catch (e) {
    console.error('Failed to start recognition:', e);
    stopWakewordListener();
  }
}

// Stop listening for wakeword
function stopWakewordListener() {
  isListeningForWakeword = false;
  try { recognition.stop(); } catch (e) { }
}

// Handles voice chat after wakeword
function triggerVoiceInteraction() {
  // Prompt user to speak, start a new recognition instance
  if (!recognition) return;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const speech = event.results[0][0].transcript;
    sendVoiceMessageToZobo(speech);
  };

  recognition.onend = () => {
    startWakewordListener(); // resume wakeword detection after interaction
  };

  recognition.start();
}

// Send user's voice message to backend (modify URL as needed)
function sendVoiceMessageToZobo(message) {
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message, voice: true })
  })
  .then(res => res.json())
  .then(data => {
    playZoboTTS(data.response);
  });
}

// Use browser or Google TTS
function playZoboTTS(text) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    // Try to select Google WaveNet voice if available
    const waveNetVoice = speechSynthesis.getVoices().find(v => v.name && v.name.toLowerCase().includes('wavenet'));
    if (waveNetVoice) utter.voice = waveNetVoice;
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  } else {
    // Optionally fallback to backend-generated audio
  }
}

// Toggle button for wakeword listening
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('wakewordToggleBtn');
  if (toggleBtn && recognition) {
    // Update button text based on current state
    function updateButtonText() {
      toggleBtn.textContent = isListeningForWakeword ? "Disable Wakeword" : "Enable Wakeword";
    }
    
    toggleBtn.addEventListener('click', function() {
      if (!isListeningForWakeword) {
        startWakewordListener();
        updateButtonText();
      } else {
        stopWakewordListener();
        updateButtonText();
      }
    });
    
    // Initial button text
    updateButtonText();
  } else if (toggleBtn && !recognition) {
    toggleBtn.textContent = "Voice Not Supported";
    toggleBtn.disabled = true;
  }
});