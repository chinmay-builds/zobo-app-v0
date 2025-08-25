# Known Issues and Troubleshooting Guide

This document describes common problems you might encounter with Zobo and provides troubleshooting steps for users and maintainers.

## Common Issues

### 1. Chat Functionality

#### "Moonshot API key not configured" Error
**Symptoms**: Chat messages fail with API key error
**Cause**: Missing or invalid MOONSHOT_API_KEY environment variable
**Solution**:
1. Get an API key from [Moonshot AI](https://platform.moonshot.ai/)
2. Set the environment variable: `export MOONSHOT_API_KEY=your-api-key`
3. Restart the application

#### "Message is too long" Error
**Symptoms**: Cannot send long messages
**Cause**: Messages over 2000 characters are rejected
**Solution**: 
- Break long messages into smaller parts
- Use file upload for large text content

#### Chat responses are slow or timeout
**Symptoms**: Long wait times or failed responses
**Cause**: API rate limits or network issues
**Solution**:
1. Check your internet connection
2. Verify API key is valid and has sufficient quota
3. Try again after a brief wait

### 2. Voice Features

#### "Gemini Live API not configured" Error
**Symptoms**: Voice buttons are disabled
**Cause**: Missing GEMINI_API_KEY environment variable
**Solution**:
1. Get an API key from [Google AI Studio](https://aistudio.google.com/)
2. Set the environment variable: `export GEMINI_API_KEY=your-api-key`
3. Restart the application

#### "Failed to start recording" Error
**Symptoms**: Recording doesn't work in browser
**Cause**: Microphone permissions not granted or hardware issues
**Solution**:
1. Grant microphone permission in browser
2. Check microphone is connected and working
3. Refresh page and try again
4. Check browser console for detailed errors

#### Voice responses are unclear or garbled
**Symptoms**: Poor audio quality in text-to-speech
**Cause**: Network issues or API limitations
**Solution**:
1. Check internet connection stability
2. Try different browser or device
3. Ensure speakers/headphones are working properly

### 3. Calendar Integration

#### "Calendar not connected" Error
**Symptoms**: Calendar features don't work
**Cause**: Google Calendar API not configured
**Solution**:
1. Follow the [calendar setup guide](calendar_demo.md)
2. Ensure service account credentials are properly configured
3. Check that Calendar API is enabled in Google Cloud Console

#### "Failed to schedule event" Error
**Symptoms**: Cannot create calendar events
**Cause**: Insufficient permissions or invalid calendar access
**Solution**:
1. Verify service account has Calendar write permissions
2. Check that the target calendar exists and is accessible
3. Ensure date/time formats are valid

#### Calendar events not appearing
**Symptoms**: Existing events not visible in chat context
**Cause**: Calendar sync issues or permission problems
**Solution**:
1. Refresh the page
2. Check calendar permissions
3. Verify calendar service account setup

### 4. File Upload Issues

#### "File type not supported" Error
**Symptoms**: Cannot upload certain file types
**Cause**: File extension not in allowed list
**Solution**: 
- Supported formats: .txt, .md, .py, .js, .html, .css, .json, .xml, .csv, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .jpg, .jpeg, .png, .gif, .svg, .log, .cfg, .conf, .ini
- Convert file to supported format if needed

#### "File too large" Error
**Symptoms**: Upload fails for large files
**Cause**: 10MB file size limit exceeded
**Solution**:
- Compress files if possible
- Break large documents into smaller parts
- Use cloud storage links instead of direct upload

#### "Failed to connect file" Error
**Symptoms**: File upload succeeds but connection fails
**Cause**: File processing error or invalid file content
**Solution**:
1. Ensure file is not corrupted
2. Try uploading a different file format
3. Check server logs for detailed error messages

### 5. Network and Connectivity

#### "Network error occurred" Messages
**Symptoms**: Various features fail with network errors
**Cause**: Internet connectivity issues or server problems
**Solution**:
1. Check internet connection
2. Try refreshing the page
3. Wait a few minutes and retry
4. Check if the server is running (for local deployments)

#### Slow response times
**Symptoms**: Long delays in chat responses or API calls
**Cause**: Network latency or API service issues
**Solution**:
1. Check network speed and stability
2. Try from different location/network
3. Monitor API service status pages

## Environment Setup Issues

### Missing Environment Variables
**Symptoms**: Features don't work or show "not configured" errors
**Required Variables**:
```bash
MOONSHOT_API_KEY=your-moonshot-api-key
GEMINI_API_KEY=your-gemini-api-key
SESSION_SECRET=your-secure-session-secret
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json  # For calendar
```

### Development vs Production Configuration
**Development**: Uses default values, may show warnings
**Production**: Requires all API keys and secure secrets
**Solution**: Follow setup guides for your specific deployment environment

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Browser Issues
- **Safari**: May have microphone permission issues
- **Firefox**: File upload progress may not display correctly
- **Older browsers**: Some ES6+ features may not work

## Performance Issues

### High Memory Usage
**Cause**: Large conversation history or many connected files
**Solution**:
1. Clear conversation history regularly
2. Remove old connected files
3. Refresh browser tab periodically

### Slow Page Load
**Cause**: Large static assets or slow server
**Solution**:
1. Clear browser cache
2. Check server resources
3. Optimize static asset delivery

## Security Considerations

### Default Secrets Warning
**Issue**: Using default SESSION_SECRET in production
**Risk**: Session hijacking vulnerability
**Solution**: Always set strong, unique secrets in production

### API Key Security
**Issue**: Exposed API keys in logs or client-side code
**Risk**: Unauthorized API usage
**Solution**:
1. Never log API keys
2. Use environment variables
3. Rotate keys regularly
4. Monitor API usage

## Getting Help

### Log Files
Check these locations for detailed error information:
- Browser Console (F12 → Console tab)
- Server logs (check your deployment platform)
- Application logs (if running locally)

### Reporting Issues
When reporting problems, include:
1. Error message (exact text)
2. Steps to reproduce
3. Browser and version
4. Operating system
5. Screenshot if applicable

### Support Resources
- [Voice Setup Guide](voice_setup.md)
- [Gemini Live Setup Guide](gemini_live_setup.md)
- [Calendar Setup Guide](calendar_demo.md)
- [Setup Complete Guide](SETUP_COMPLETE.md)

## Maintenance

### Regular Tasks
- Monitor API usage and quotas
- Rotate API keys periodically
- Clear old conversation data
- Update dependencies
- Review and update file upload limits

### Health Checks
- Test API endpoints regularly
- Verify calendar integration
- Check voice feature functionality
- Monitor file upload/download performance

---

*Last updated: December 2024*
*For technical support, please check the documentation or create an issue in the repository.*