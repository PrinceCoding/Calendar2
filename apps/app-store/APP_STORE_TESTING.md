# App Store Testing Guide

## Test Scenarios

### 1. Initial Load Tests

#### Test 1.1: App Store Widget Creation
- **Action**: Load the page
- **Expected**: App Store widget is created but hidden
- **Check Console**: Should see "[APP STORE] Initializing..." and "[APP STORE] Initialized successfully"

#### Test 1.2: Default Apps in Drawer
- **Action**: Click ▦ button to open app drawer
- **Expected**: 
  - App Store (🛍️) appears first
  - Only pre-installed apps visible (Calendar by default)
  - "Get More Apps" button at bottom
- **Check**: App drawer should NOT show all 11 apps initially

#### Test 1.3: Cached Apps Load
- **Action**: Refresh page after installing apps
- **Expected**: Installed apps load instantly from localStorage cache
- **Check**: No delay before apps appear in drawer

### 2. App Browsing Tests

#### Test 2.1: Open App Store
- **Action**: Click "App Store" or "Get More Apps" in drawer
- **Expected**: 
  - App Store widget opens and becomes visible
  - Shows all 11 apps in catalog
  - "All" filter is active by default

#### Test 2.2: Category Filtering
- **Action**: Click different category filters
- **Test Each**:
  - All → Shows all 11 apps
  - Featured → Shows 3 featured apps (Notes, Canvas Manager, Ambient Sounds)
  - Popular → Shows 3 popular apps (Pomodoro, Calculator, Ambient Sounds)
  - Productivity → Shows 6 productivity apps
  - Utilities → Shows 3 utility apps
  - Lifestyle → Shows 1 lifestyle app
  - Internet → Shows 1 internet app

#### Test 2.3: Search Functionality
- **Action**: Type in search box
- **Test Cases**:
  - "pomo" → Shows Pomodoro Timer
  - "calc" → Shows Calculator
  - "note" → Shows Notes
  - "sound" → Shows Ambient Sounds
  - "xyz123" → Shows "No apps found" message
- **Expected**: Instant filtering, no delay

#### Test 2.4: App Cards Display
- **Check Each Card Has**:
  - App icon (emoji)
  - App name
  - Category label
  - Description (2 lines max)
  - Star rating
  - Review count
  - File size
  - GET or ✓ Installed button
  - Featured/Popular badge (if applicable)

### 3. App Installation Tests

#### Test 3.1: Install from Card
- **Action**: Click "GET" on Pomodoro Timer card
- **Expected**:
  1. Button changes to "✓ Installed"
  2. Success notification appears: "✓ Pomodoro Timer installed successfully"
  3. App appears in drawer
  4. App is saved to Firebase (check console)
  5. App is saved to localStorage cache

#### Test 3.2: Install from Detail Page
- **Action**: Click app card → Click "GET" on detail page
- **Expected**: Same as Test 3.1

#### Test 3.3: Multiple Installations
- **Action**: Install 5 different apps one by one
- **Expected**:
  - Each app appears in drawer in order
  - All apps show "✓ Installed"
  - No duplicates in drawer
  - Firebase updates for each installation

#### Test 3.4: Already Installed
- **Action**: Try to click "✓ Installed" button
- **Expected**: Nothing happens (button is disabled/different behavior)

### 4. App Detail View Tests

#### Test 4.1: Navigate to Detail
- **Action**: Click any app card
- **Expected**:
  - Main store view hides
  - Detail view shows
  - Back button appears: "‹ App Store"
  - App icon (large)
  - App name, developer, category
  - Install button
  - Stats (Reviews, Rating, Size, Version)
  - Screenshots (3 emoji icons)
  - About section with long description
  - Information section with metadata

#### Test 4.2: Navigate Back
- **Action**: Click "‹ App Store" button
- **Expected**:
  - Detail view hides
  - Main store view shows
  - Previous search/filter state preserved

#### Test 4.3: Install from Detail
- **Action**: Install app from detail page
- **Expected**:
  - Install button updates
  - Can navigate back to see updated state in list

### 5. App Uninstallation Tests

#### Test 5.1: Uninstall Non-System App
- **Action**: Click installed Pomodoro app → Click "✓ Installed" → Confirm
- **Expected**:
  1. Confirmation dialog appears
  2. After confirm: App disappears from drawer
  3. Button changes back to "GET"
  4. Notification: "Pomodoro Timer uninstalled"
  5. Firebase updated
  6. Widget hides if currently visible

#### Test 5.2: Uninstall System App
- **Action**: Try to uninstall Calendar (preinstalled: true)
- **Expected**: 
  - Warning notification: "⚠️ Calendar is a system app and cannot be uninstalled"
  - App remains installed

#### Test 5.3: Uninstall and Reinstall
- **Action**: Uninstall app, then install again
- **Expected**: Works smoothly both ways, no errors

### 6. Cloud Sync Tests

#### Test 6.1: Not Logged In
- **Action**: Use app store without logging in
- **Expected**:
  - Can install/uninstall apps
  - Changes saved to localStorage only
  - Console warns: "Not authenticated - saved to cache only"
  - Default apps (preinstalled) show on fresh load

#### Test 6.2: Login and Sync
- **Action**: Log in with account
- **Expected**:
  - Firebase listener activates
  - Any cloud apps load and merge with local
  - Console: "[APP STORE] User authenticated, setting up listener"

#### Test 6.3: Multi-Device Sync
- **Action**: 
  1. Login on Device A
  2. Install Pomodoro, Calculator, Notes
  3. Open same account on Device B
- **Expected**:
  - Device B shows same 3 apps installed
  - Real-time sync (appears within 1 second)

#### Test 6.4: Conflict Resolution
- **Action**:
  1. Device A installs App X
  2. Device B installs App Y
  3. Both sync
- **Expected**:
  - Both devices end up with App X and App Y
  - No apps lost

### 7. App Drawer Integration Tests

#### Test 7.1: Dynamic Drawer Update
- **Action**: Install app from store
- **Expected**: 
  - App drawer immediately shows new app
  - No page refresh needed

#### Test 7.2: Toggle App Visibility
- **Action**: Click toggle button on installed app in drawer
- **Expected**:
  - App widget shows/hides
  - Toggle button visual state updates

#### Test 7.3: App Store Always Visible
- **Action**: Check drawer after any changes
- **Expected**: App Store is always first item, cannot be removed

### 8. Performance Tests

#### Test 8.1: Search Performance
- **Action**: Type quickly in search box
- **Expected**: No lag, instant results

#### Test 8.2: Install Performance
- **Action**: Time installation process
- **Expected**: Complete in < 500ms

#### Test 8.3: Drawer Update Performance
- **Action**: Install app and measure drawer update time
- **Expected**: Instant (< 100ms)

#### Test 8.4: Firebase Sync Performance
- **Action**: Install app and check Firebase console
- **Expected**: Data appears in < 1 second

### 9. UI/UX Tests

#### Test 9.1: Responsive Design
- **Action**: Resize browser window
- **Test Breakpoints**:
  - Desktop (1920x1080) ✓
  - Tablet (768x1024) ✓
  - Mobile (375x667) ✓
- **Expected**: Layout adapts smoothly

#### Test 9.2: Dark Mode
- **Action**: Switch to dark theme
- **Expected**: App store colors adapt properly

#### Test 9.3: Hover Effects
- **Action**: Hover over app cards, buttons
- **Expected**: 
  - Cards lift on hover
  - Buttons change color
  - Smooth transitions

#### Test 9.4: Animations
- **Action**: Open store, install app, navigate
- **Expected**: Smooth 0.3s transitions

### 10. Error Handling Tests

#### Test 10.1: Firebase Connection Error
- **Action**: Disconnect internet, try to install
- **Expected**: 
  - Saves to localStorage
  - Console warns about Firebase
  - Still works locally

#### Test 10.2: Invalid App ID
- **Action**: Manually call `installApp('invalidid')`
- **Expected**: Console error, no crash

#### Test 10.3: Missing Widget Update Function
- **Action**: Install app with no update function
- **Expected**: Gracefully handles, no crash

### 11. Data Integrity Tests

#### Test 11.1: LocalStorage Cache
- **Action**: Install apps, check localStorage
- **Expected**: Key `installed_apps_cache` contains array of app IDs

#### Test 11.2: Firebase Document Structure
- **Action**: Install apps, check Firebase console
- **Expected**: Document at `user_installed_apps/{userId}`:
```javascript
{
  apps: ['calendar', 'pomodoro', ...],
  by: 'device_xyz',
  updatedAt: Timestamp
}
```

#### Test 11.3: No Data Corruption
- **Action**: Rapidly install/uninstall apps
- **Expected**: Clean state, no duplicate IDs

## Automated Test Checklist

Use this checklist for quick regression testing:

### Before Release
- [ ] App Store loads without errors
- [ ] All 11 apps appear in catalog
- [ ] Featured filter shows 3 apps
- [ ] Popular filter shows 3 apps
- [ ] Search works for all apps
- [ ] Install works from card and detail
- [ ] Uninstall works with confirmation
- [ ] System apps cannot be uninstalled
- [ ] Drawer updates in real-time
- [ ] Cloud sync works when logged in
- [ ] Offline mode works (localStorage)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Performance acceptable

### Quick Smoke Test (2 minutes)
1. Open app drawer → Click App Store
2. Install Pomodoro Timer
3. Check drawer shows Pomodoro
4. Open Pomodoro from drawer
5. Uninstall Pomodoro from store
6. Check drawer doesn't show Pomodoro
7. Try search for "calculator"
8. Install Calculator
9. Check Firebase console for updates

## Known Issues & Limitations

1. **App Size**: File sizes in catalog are estimates
2. **Reviews**: Review counts are static (future: real user reviews)
3. **Screenshots**: Currently emoji placeholders (future: real screenshots)
4. **Updates**: No auto-update mechanism yet
5. **Ratings**: Ratings are static (future: user ratings)

## Success Criteria

✅ All apps can be installed/uninstalled  
✅ App drawer reflects installed apps  
✅ Cloud sync works across devices  
✅ No data loss on refresh  
✅ Performance meets targets  
✅ No crashes or errors  
✅ Clean, professional UI  
✅ Responsive on all devices  

---

**Last Updated**: January 1, 2026  
**Version**: 1.0
