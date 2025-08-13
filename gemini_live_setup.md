# Gemini Live API Setup Guide

This guide will help you set up the official Gemini Live API for Zobo's real-time voice interactions.

## What is Gemini Live API?

The [Gemini Live API](https://ai.google.dev/gemini-api/docs/live) enables low-latency, real-time voice and video interactions with Gemini. It processes continuous streams of audio, video, or text to deliver immediate, human-like spoken responses, creating a natural conversational experience.

## Key Features

- **Real-time voice conversations**: Bidirectional audio streaming
- **Native audio models**: Most natural and realistic-sounding speech
- **Voice Activity Detection**: Automatic detection of speech
- **Tool use and function calling**: Integrate with external tools
- **Session management**: Long-running conversations
- **Ephemeral tokens**: Secure client-side authentication

## Prerequisites

1. **Google AI Studio Account**: Access to [Google AI Studio](https://aistudio.google.com/)
2. **Python Environment**: Python 3.7+ with async support
3. **API Key**: Get your Gemini API key from Google AI Studio

## Step 1: Get Your API Key

1. **Visit Google AI Studio**: Go to [https://aistudi/](https://aistudio.google.com/)o.google.com
2. **Create API Key**: 
   - Click on "Get API key" in the top right
   - Create a new API key or use an existing one
   - Copy the API key for use in your application

## Step 2: Install Dependencies

```bash
pip install google-genai websockets asyncio
```

## Step 3: Configure Environment Variables

Set your Gemini API key as an environment variable:

```bash
# Gemini Live API Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Existing configuration
MOONSHOT_API_KEY=your-moonshot-api-key
SESSION_SECRET=your-session-secret
```

## Step 4: Choose Your Model

Gemini Live API offers two types of models:

### Native Audio Models (Recommended)
- **Model**: `gemini-2.5-flash-preview-native-audio-dialog`
- **Features**: 
  - Most natural and realistic-sounding speech
  - Better multilingual performance
  - Affective (emotion-aware) dialogue
  - Proactive audio (model can decide to ignore or respond)
  - "Thinking" capabilities

### Half-Cascade Models
- **Model**: `gemini-live-2.5-flash-preview`
- **Features**:
  - Better performance and reliability in production
  - Enhanced tool use and function calling
  - More stable for production environments

## Step 5: Audio Format Requirements

The Gemini Live API requires specific audio formats:

### Input Audio (Your Voice)
- **Format**: 16-bit PCM
- **Sample Rate**: 16kHz
- **Channels**: Mono
- **Encoding**: Linear16

### Output Audio (Gemini's Voice)
- **Format**: 24kHz sample rate
- **Channels**: Mono
- **Encoding**: PCM

## Step 6: Implementation Approaches

### Option 1: Server-to-Server (Recommended for Production)
Your backend connects to the Live API using WebSockets. Your client sends stream data to your server, which forwards it to the Live API.

### Option 2: Client-to-Server (Better Performance)
Your frontend connects directly to the Live API using WebSockets, bypassing your backend.

**Note**: For production environments, use ephemeral tokens instead of standard API keys for client-to-server implementations.

## Step 7: Test the Setup

1. **Start the application**:
   ```bash
   python app.py
   ```

2. **Check Live API status**:
   - Open the application in your browser
   - Click the microphone icon in the header
   - You should see "Gemini Live API is ready!" if configured correctly

## Voice Features Available

### Real-time Voice Conversation
- **Live Chat**: Have natural voice conversations with Zobo
- **Bidirectional Audio**: Speak and hear responses in real-time
- **Voice Activity Detection**: Automatic speech detection
- **Natural Responses**: Human-like voice with emotion awareness

### Text-to-Speech
- **Speak Button**: Click the volume icon to hear Zobo's responses
- **Native Audio**: Uses Gemini's most natural-sounding voice
- **Emotion Awareness**: Voice reflects the emotional context

### Advanced Features
- **Session Management**: Maintain conversation context
- **Tool Integration**: Use with calendar, files, and other tools
- **Multilingual Support**: Support for multiple languages
- **Proactive Audio**: Model can decide when to respond

## Example Usage

### Basic Live Conversation
```python
import asyncio
from google import genai
from google.genai import types

client = genai.Client(api_key="your-api-key")

async def live_conversation():
    config = {
        "response_modalities": ["AUDIO"],
        "system_instruction": "You are Zobo, a helpful AI assistant.",
    }
    
    async with client.aio.live.connect(
        model="gemini-2.5-flash-preview-native-audio-dialog", 
        config=config
    ) as session:
        
        # Send audio input
        await session.send_realtime_input(
            audio=types.Blob(data=audio_data, mime_type="audio/pcm;rate=16000")
        )
        
        # Receive audio response
        async for response in session.receive():
            if response.data is not None:
                # Process audio response
                process_audio(response.data)
```

## Troubleshooting

### Common Issues

1. **"Gemini Live API not configured"**:
   - Check that `GEMINI_API_KEY` is set correctly
   - Verify your API key is valid in Google AI Studio
   - Ensure you have access to the Live API (may require approval)

2. **"Failed to start recording"**:
   - Check microphone permissions in your browser
   - Ensure audio format matches requirements (16kHz, 16-bit PCM, mono)
   - Verify WebSocket connection is established

3. **"No audio response received"**:
   - Check that the model is available and accessible
   - Verify your API key has Live API permissions
   - Ensure proper async handling in your implementation

### Audio Format Conversion

If you need to convert audio to the required format:

```python
import librosa
import soundfile as sf
import io

def convert_audio_to_pcm(audio_file_path):
    # Load audio and convert to 16kHz
    y, sr = librosa.load(audio_file_path, sr=16000)
    
    # Convert to 16-bit PCM
    buffer = io.BytesIO()
    sf.write(buffer, y, sr, format='RAW', subtype='PCM_16')
    buffer.seek(0)
    
    return buffer.read()
```

## Cost Considerations

- **Live API**: Pricing varies by model and usage
- **Audio Processing**: Additional costs for audio conversion if needed
- **WebSocket Connections**: Minimal connection costs

Check the [Gemini API pricing page](https://ai.google.dev/pricing) for current rates.

## Security Best Practices

1. **Use Ephemeral Tokens**: For client-to-server implementations
2. **Secure API Keys**: Never expose API keys in client-side code
3. **Rate Limiting**: Implement proper rate limiting for production
4. **Audio Privacy**: Ensure audio data is handled securely

## Advanced Configuration

### Custom System Prompts
```python
config = {
    "response_modalities": ["AUDIO"],
    "system_instruction": "You are Zobo, a friendly AI assistant. Speak naturally and conversationally.",
}
```

### Tool Integration
```python
config = {
    "response_modalities": ["AUDIO"],
    "system_instruction": "You are Zobo. You can access calendar and files.",
    "tools": [calendar_tool, file_tool]
}
```

### Session Management
```python
# For long-running conversations
session_id = "user_123_conversation"
async with client.aio.live.connect(
    model=model, 
    config=config,
    session_id=session_id
) as session:
    # Session maintains context across interactions
```

## Support and Resources

- **Official Documentation**: [Gemini Live API Docs](https://ai.google.dev/gemini-api/docs/live)
- **Google AI Studio**: [https://aistudio.google.com/](https://aistudio.google.com/)
- **Example Applications**: Check the official cookbook for complete examples
- **Community**: Join the [Google AI Forum](https://ai.google.dev/community)

## Next Steps

1. **Implement WebSocket Connection**: Set up real-time audio streaming
2. **Add Audio Processing**: Convert audio to required formats
3. **Integrate with Tools**: Connect calendar, files, and other features
4. **Add Session Management**: Maintain conversation context
5. **Implement Ephemeral Tokens**: For secure client-side authentication

The Gemini Live API provides the most advanced voice interaction capabilities available, enabling truly natural conversations with your AI assistant! 