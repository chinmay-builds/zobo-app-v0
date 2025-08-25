# Zobo - Your AI Friend

A friendly AI chat application with voice capabilities, calendar integration, and Google Sign-In authentication.

## Features

- 💬 **AI Chat**: Powered by Moonshot AI and Gemini Live APIs
- 🎤 **Voice Interaction**: Record voice messages and hear AI responses
- 📅 **Calendar Integration**: Schedule events and check availability
- 📁 **File Uploads**: Connect files to your conversations
- 🔐 **Google Sign-In**: Optional authentication with Google accounts
- 🎨 **Modern UI**: Clean, responsive chat interface

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   Copy `.env` and configure your API keys:
   ```bash
   MOONSHOT_API_KEY=your-moonshot-api-key
   GEMINI_API_KEY=your-gemini-api-key
   GOOGLE_CLIENT_ID=your-google-client-id  # Optional for Google Sign-In
   SESSION_SECRET=your-session-secret
   ```

3. **Run the Application**:
   ```bash
   python app.py
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:8000`

## Authentication

### Google Sign-In (Optional)

Zobo supports optional Google Sign-In authentication. Users can:
- Sign in with their Google account to see their name and avatar
- Use all features without signing in (guest mode)
- Sign out at any time

**Setup Instructions**: See `google_signin_setup.md` for detailed configuration steps.

**Privacy**: Only basic profile information (name, email, picture) is accessed. No Google access tokens are stored client-side.

## Setup Guides

- 📝 **Google Sign-In**: `google_signin_setup.md`
- 🎤 **Voice API**: `voice_setup.md`
- 📅 **Calendar Integration**: Use `setup_google_calendar.py`

## Security Features

- 🔒 Secure session management
- 🛡️ Backend OAuth token verification
- 🚫 No client-side token storage
- ✅ Optional authentication (doesn't break guest access)

## License

This project is open source. Please check individual API terms of service for Moonshot AI and Google services.