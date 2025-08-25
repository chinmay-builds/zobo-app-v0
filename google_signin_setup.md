# Google Sign-In Setup Guide for Zobo

This guide will help you set up Google Sign-In authentication for the Zobo chat application.

## Overview

Zobo now supports optional Google Sign-In authentication that allows users to:
- Sign in with their Google account
- See their name and avatar in the chat interface
- Maintain their session across browser sessions
- Sign out when needed

**Important**: Google Sign-In is optional - users can still use Zobo as guests without signing in.

## Prerequisites

1. A Google Cloud Platform account
2. Access to Google Cloud Console
3. A domain or localhost for testing

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Identity API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Identity and Access Management (IAM) API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Client ID

1. **Go to Credentials**:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"

2. **Configure OAuth consent screen** (if not already done):
   - Click "Configure consent screen"
   - Choose "External" for most use cases
   - Fill in the required information:
     - App name: "Zobo - Your AI Friend"
     - User support email: Your email
     - Developer contact information: Your email
   - Add authorized domains if deploying to production
   - Save and continue through the steps

3. **Create OAuth 2.0 Client ID**:
   - Select "Web application" as the application type
   - Give it a name like "Zobo Web Client"
   - Add authorized JavaScript origins:
     - For development: `http://localhost:8000`
     - For production: `https://yourdomain.com`
   - Authorized redirect URIs are not needed for this implementation
   - Click "Create"

4. **Copy your Client ID**:
   - Copy the generated Client ID (it looks like: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`)

## Step 3: Configure Zobo Application

1. **Update Environment Variables**:
   Add your Google Client ID to the `.env` file:
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
   ```

2. **Restart the Application**:
   ```bash
   python app.py
   ```

## Step 4: Test Google Sign-In

1. **Open Zobo in your browser**:
   - Navigate to `http://localhost:8000`
   - You should see a blue Google sign-in button in the header

2. **Test Sign-In Flow**:
   - Click the Google sign-in button
   - You should see the Google sign-in popup
   - Sign in with your Google account
   - After successful sign-in, you should see your name and avatar in the header

3. **Test Sign-Out**:
   - Click the sign-out button (arrow icon) next to your name
   - You should be signed out and see the Google sign-in button again

## Features

### What's Stored
- User's name and email (in Flask session only)
- User's profile picture URL
- Authentication status

### What's NOT Stored
- Google access tokens (for security)
- Any sensitive Google account information
- Authentication data in databases (session-based only)

### Security Features
- Backend token verification using Google's official libraries
- No client-side token storage
- Secure session management
- Token verification on every authentication request

## Troubleshooting

### Common Issues

1. **"Google Sign-In not configured" message**:
   - Check that `GOOGLE_CLIENT_ID` is set in your `.env` file
   - Ensure the Client ID is valid and not the placeholder text

2. **Sign-in popup blocked**:
   - Check browser popup blocker settings
   - Try clicking the sign-in button directly instead of using keyboard

3. **"Invalid token" errors**:
   - Verify the Client ID matches exactly what's in Google Cloud Console
   - Check that your domain is authorized in the OAuth consent screen

4. **CORS errors in production**:
   - Add your production domain to "Authorized JavaScript origins" in Google Cloud Console

### Testing with Different Accounts

- Use Chrome's incognito mode to test with different Google accounts
- Clear browser cache and cookies if experiencing authentication issues

## Privacy and Data Handling

### What We Access
- Basic profile information (name, email, profile picture)
- Email verification status

### What We Don't Access
- Google Calendar, Drive, or other Google services (unless explicitly configured separately)
- Contact lists or personal data beyond basic profile
- Any data requiring additional OAuth scopes

### Data Usage
- Profile information is used only to personalize the chat experience
- No data is shared with third parties
- User can sign out at any time to clear session data
- No persistent storage of authentication tokens

### User Rights
- Users can sign out at any time
- Authentication is completely optional
- All existing guest features remain available without signing in
- Users can revoke app access via their Google Account settings

## Production Deployment Notes

1. **Domain Configuration**:
   - Add your production domain to authorized JavaScript origins
   - Update redirect URIs if needed

2. **HTTPS Required**:
   - Google Sign-In requires HTTPS in production
   - Ensure SSL certificate is properly configured

3. **Environment Variables**:
   - Use secure secret management for production
   - Never commit the actual Client ID to version control

4. **Session Security**:
   - Use a strong, random `SESSION_SECRET` in production
   - Consider session timeout policies for enhanced security

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the Flask application logs for server errors
3. Verify Google Cloud Console configuration
4. Test with a fresh browser session

For additional help, refer to:
- [Google Identity Documentation](https://developers.google.com/identity)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)