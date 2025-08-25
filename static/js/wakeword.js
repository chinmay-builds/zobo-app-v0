// Wakeword detection and voice chat for Zobo
const WAKEWORDS = ["hey zobo", "zobo"];
let isWakewordActive = false;
let isListeningForWakeword = false;

// Use browser SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

// Start continuous listening for wakeword
function startWakewordListener() {
  if (!recognition) return;
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
    // Optionally restart recognition
    if (isListeningForWakeword) recognition.start();
  };

  recognition.onend = () => {
    if (isListeningForWakeword) recognition.start();
  };

  recognition.start();
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
    toggleBtn.addEventListener('click', function() {
      if (!isListeningForWakeword) {
        startWakewordListener();
        this.textContent = "Disable Wakeword";
      } else {
        stopWakewordListener();
        this.textContent = "Enable Wakeword";
      }
    });
  }
});