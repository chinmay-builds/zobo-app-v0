#!/usr/bin/env python3
"""
PWA and Timer Functionality Test Script for Zobo App
"""

import json
import os
import sys

def test_manifest():
    """Test if manifest.json is valid"""
    print("🧪 Testing manifest.json...")
    try:
        with open('static/manifest.json', 'r') as f:
            manifest = json.load(f)
        
        required_fields = ['name', 'short_name', 'start_url', 'display', 'icons']
        for field in required_fields:
            if field not in manifest:
                print(f"❌ Missing required field: {field}")
                return False
        
        print(f"✅ Manifest valid with {len(manifest['icons'])} icons")
        return True
    except Exception as e:
        print(f"❌ Manifest error: {e}")
        return False

def test_service_worker():
    """Test if service worker exists and has basic structure"""
    print("🧪 Testing service worker...")
    try:
        with open('static/sw.js', 'r') as f:
            sw_content = f.read()
        
        required_events = ['install', 'activate', 'fetch', 'message', 'sync']
        missing_events = []
        
        for event in required_events:
            if f"addEventListener('{event}'" not in sw_content:
                missing_events.append(event)
        
        if missing_events:
            print(f"❌ Missing event listeners: {missing_events}")
            return False
        
        print("✅ Service worker has all required event listeners")
        return True
    except Exception as e:
        print(f"❌ Service worker error: {e}")
        return False

def test_timer_js():
    """Test if timer JavaScript is properly structured"""
    print("🧪 Testing timer.js...")
    try:
        with open('static/js/timer.js', 'r') as f:
            timer_content = f.read()
        
        required_classes = ['TimerManager']
        required_methods = ['startTimer', 'setAlarm', 'startStopwatch', 'processVoiceCommand']
        
        for cls in required_classes:
            if f"class {cls}" not in timer_content:
                print(f"❌ Missing class: {cls}")
                return False
        
        for method in required_methods:
            if f"{method}(" not in timer_content:
                print(f"❌ Missing method: {method}")
                return False
        
        print("✅ Timer functionality properly structured")
        return True
    except Exception as e:
        print(f"❌ Timer JS error: {e}")
        return False

def test_notifications_js():
    """Test if notifications JavaScript is properly structured"""
    print("🧪 Testing notifications.js...")
    try:
        with open('static/js/notifications.js', 'r') as f:
            notifications_content = f.read()
        
        required_classes = ['NotificationManager']
        required_methods = ['requestPermission', 'showNotification', 'playAlarmSound']
        
        for cls in required_classes:
            if f"class {cls}" not in notifications_content:
                print(f"❌ Missing class: {cls}")
                return False
        
        for method in required_methods:
            if f"{method}(" not in notifications_content:
                print(f"❌ Missing method: {method}")
                return False
        
        print("✅ Notification functionality properly structured")
        return True
    except Exception as e:
        print(f"❌ Notifications JS error: {e}")
        return False

def test_html_integration():
    """Test if HTML template includes all required elements"""
    print("🧪 Testing HTML template...")
    try:
        with open('templates/index.html', 'r') as f:
            html_content = f.read()
        
        required_elements = [
            'manifest.json',
            'timer.js',
            'notifications.js',
            'timerModal',
            'serviceWorker'
        ]
        
        missing_elements = []
        for element in required_elements:
            if element not in html_content:
                missing_elements.append(element)
        
        if missing_elements:
            print(f"❌ Missing HTML elements: {missing_elements}")
            return False
        
        print("✅ HTML template properly integrated")
        return True
    except Exception as e:
        print(f"❌ HTML template error: {e}")
        return False

def test_icons():
    """Test if icon files exist"""
    print("🧪 Testing PWA icons...")
    required_sizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512']
    missing_icons = []
    
    for size in required_sizes:
        icon_path = f"static/icons/icon-{size}.png"
        if not os.path.exists(icon_path):
            missing_icons.append(icon_path)
    
    if missing_icons:
        print(f"⚠️  Missing icon files: {missing_icons}")
        print("   (These are placeholder files - consider generating proper icons)")
    else:
        print("✅ All required icon files present")
    
    return len(missing_icons) == 0

def test_css_styles():
    """Test if CSS includes timer-specific styles"""
    print("🧪 Testing CSS styles...")
    try:
        with open('static/css/custom.css', 'r') as f:
            css_content = f.read()
        
        required_styles = [
            '.timer-display',
            '.timer-controls',
            '.alarm-controls',
            '.stopwatch-controls',
            '@media (max-width: 768px)'
        ]
        
        missing_styles = []
        for style in required_styles:
            if style not in css_content:
                missing_styles.append(style)
        
        if missing_styles:
            print(f"❌ Missing CSS styles: {missing_styles}")
            return False
        
        print("✅ CSS includes all timer-specific styles")
        return True
    except Exception as e:
        print(f"❌ CSS error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Zobo PWA & Timer Functionality Tests\n")
    
    # Change to the app directory
    if os.path.basename(os.getcwd()) != 'zobo-app-v0':
        if os.path.exists('zobo-app-v0'):
            os.chdir('zobo-app-v0')
        else:
            print("❌ Please run this script from the zobo-app-v0 directory")
            sys.exit(1)
    
    tests = [
        test_manifest,
        test_service_worker,
        test_timer_js,
        test_notifications_js,
        test_html_integration,
        test_icons,
        test_css_styles
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        print()
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print("="*50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your Zobo app is ready for PWA functionality.")
        print("\n📋 Next steps:")
        print("1. Start the Flask app: python app.py")
        print("2. Open in a mobile browser")
        print("3. Look for 'Add to Home Screen' prompt")
        print("4. Test timer/alarm functionality")
        print("5. Test background notifications")
    else:
        print("⚠️  Some tests failed. Please fix the issues above before testing.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())