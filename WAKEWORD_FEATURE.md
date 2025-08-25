# Wakeword/Voice Chat Feature

## Overview

The wakeword feature enables hands-free, voice-based interaction with Zobo using speech recognition. Users can activate voice chat by saying specific wakewords and have natural conversations with Zobo using their voice.

## Features

### Wakeword Detection
- **Supported wakewords**: "Hey Zobo" or "Zobo"
- **Continuous listening**: When enabled, Zobo continuously listens for wakewords in the background
- **Privacy-first**: No audio data is sent to servers until a wakeword is detected

### Voice Chat
- **Speech-to-text**: Your voice is converted to text using the browser's built-in speech recognition
- **Text-to-speech**: Zobo's responses are spoken back using browser speech synthesis
- **Natural conversation**: Seamless voice interaction that feels like talking to a friend

## How to Use

### Enabling Wakeword Listening
1. Click the **microphone-alt button** (🎤) in the header to toggle wakeword listening
2. When enabled, the button will show "Disable Wakeword"
3. When disabled, the button will show "Enable Wakeword"

### Voice Interaction
1. **Enable wakeword listening** using the toggle button
2. **Say the wakeword**: "Hey Zobo" or just "Zobo"
3. **Wait for the prompt**: Zobo will start listening for your message
4. **Speak your message**: Ask your question or make your request
5. **Listen to the response**: Zobo will respond with voice

### Example Conversation
```
You: "Hey Zobo"
[Zobo starts listening]
You: "What's the weather like today?"
Zobo: "I'd be happy to help with weather information, but I don't have access to real-time weather data..."
```

## Browser Compatibility

### Required Browser Features
- **Speech Recognition API**: Chrome, Edge, Safari (limited)
- **Speech Synthesis API**: All modern browsers
- **Microphone access**: Requires user permission

### Best Performance
- **Recommended**: Chrome or Edge browsers
- **Internet connection**: Required for speech recognition accuracy
- **Quiet environment**: Better recognition in low-noise environments

## Privacy and Security

### Data Handling
- **No constant recording**: Audio is only processed when wakewords are detected
- **Browser-based processing**: Speech recognition happens in your browser
- **No audio storage**: Voice data is not stored or logged
- **Local processing**: Wakeword detection uses browser APIs

### Permissions
- **Microphone access**: Required for wakeword detection and voice input
- **User control**: Can be disabled at any time using the toggle button
- **Transparent operation**: Clear visual indicators when listening is active

## Technical Details

### Speech Recognition
- Uses browser's native Speech Recognition API (Web Speech API)
- Supports English (US) language recognition
- Continuous listening mode for wakeword detection
- Single-shot mode for voice messages

### Text-to-Speech
- Uses browser's Speech Synthesis API
- Attempts to use Google WaveNet voices when available
- Falls back to default system voices
- Supports natural-sounding speech output

### Integration
- Seamlessly integrates with existing chat functionality
- Voice messages are processed through the same backend API
- Responses are both displayed as text and spoken aloud

## Troubleshooting

### Common Issues

**Wakeword not detected:**
- Ensure microphone permission is granted
- Speak clearly and at normal volume
- Try saying "Hey Zobo" instead of just "Zobo"
- Check browser compatibility

**No voice response:**
- Check if browser supports speech synthesis
- Verify audio output is not muted
- Try refreshing the page

**Speech recognition errors:**
- Check internet connection
- Ensure microphone is working properly
- Try speaking more slowly and clearly
- Check browser console for error messages

### Browser Permissions
1. **Chrome/Edge**: Click the microphone icon in the address bar
2. **Firefox**: Click the microphone icon in the address bar
3. **Safari**: Go to Safari > Preferences > Websites > Microphone

## Accessibility Benefits

- **Hands-free operation**: Ideal for users with mobility limitations
- **Eyes-free interaction**: Can use Zobo without looking at the screen
- **Multitasking support**: Continue other activities while chatting
- **Natural interaction**: More intuitive than typing for some users

## Future Enhancements

- Custom wakeword configuration
- Voice activity detection improvements
- Offline wakeword detection
- Multi-language support
- Voice command shortcuts

## Support

If you experience issues with the wakeword feature:

1. **Check browser compatibility** and ensure you're using a supported browser
2. **Verify microphone permissions** are granted for the website
3. **Test in a quiet environment** for better recognition accuracy
4. **Check the browser console** for any error messages
5. **Try refreshing the page** to reset the speech recognition

For additional help, please refer to the main application documentation or contact support.