# App Store - Full Documentation

## Overview
A fully-functional app store seamlessly integrated into Calendar2, designed like iOS App Store and Google Play Store. The app store is cloud-based using Firebase, with installed apps synced across all devices. **The App Store itself is a widget** - draggable, resizable, and behaves exactly like other apps.

## Features

### 🛍️ Core Features
- **Widget Integration**: App Store is a full widget with drag, resize, close, and settings buttons
- **Cloud-Based Storage**: All installed apps synced via Firebase Firestore
- **Real-Time Sync**: Changes sync instantly across all logged-in devices
- **App Discovery**: Browse featured, popular, and categorized apps
- **Smart Search**: Search by app name, description, or category
- **Detailed App Pages**: View ratings, reviews, screenshots, and full descriptions
- **One-Click Install/Uninstall**: Easy app management
- **Dynamic App Drawer**: Shows only installed apps + App Store itself

### 🎨 Widget Behavior
The App Store behaves exactly like other widgets:
- **Draggable**: Drag by title section (not search bar)
- **Resizable**: Resize from corner handle
- **Close Button**: ✕ appears on hover (visible on touch for 3s)
- **Settings Button**: ⚙️ opens global settings
- **Bring to Front**: Click to bring widget forward
- **Canvas Integration**: Saves position and visibility state

### 📱 App Catalog
The store includes 11 pre-configured apps:

#### Productivity
1. **Calendar** (📆) - Full year calendar view with month/year navigation
2. **Pomodoro Timer** (🍅) - Focus timer with customizable intervals (Featured & Popular)
3. **To-Do List** (✅) - Task management with priorities
4. **Events** (📅) - Event tracking with date filtering
5. **Notes** (📝) - Rich text editor with cloud sync (Featured)
6. **Canvas Manager** (📑) - Multiple workspace management (Featured)

#### Utilities
7. **Analog Clock** (🕐) - Beautiful live clock display
8. **Calculator** (🔢) - Scientific calculator (Popular)
9. **Countdown** (⏰) - Event countdown timers

#### Internet
10. **Web Browser** (🌐) - Full-featured web browsing

#### Lifestyle
11. **Ambient Sounds** (🎵) - Focus & relaxation soundscapes (Featured & Popular)

### 🎨 UI/UX Features
- **Modern Design**: iOS App Store-inspired interface
- **Smooth Animations**: Fluid transitions and hover effects
- **Responsive**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Adapts to current theme
- **Badge System**: Featured and Popular app badges
- **Star Ratings**: Visual rating display
- **Category Filters**: All, Featured, Popular, Productivity, Utilities, Lifestyle, Internet

### 🔐 Cloud Sync
- **Firebase Integration**: Real-time database synchronization
- **User Authentication**: Per-user app installations
- **Cross-Device Sync**: Install on one device, see on all devices
- **Offline Support**: Local cache for instant loading
- **Conflict Resolution**: Last-write-wins strategy

## How It Works

### Installation Flow
1. User opens App Store from app drawer (🛍️)
2. Browses apps by category, search, or featured/popular
3. Clicks app card to view details
4. Clicks "GET" button to install
5. App is added to Firebase and local cache
6. App drawer updates to show new app
7. User can toggle app visibility from drawer

### Uninstallation Flow
1. User clicks installed app in store
2. Clicks "✓ Installed" button
3. Confirms uninstall
4. App is removed from Firebase and cache
5. App widget is hidden
6. App drawer updates to remove app

### App Drawer Integration
- **Dynamic Loading**: Only shows installed apps
- **App Store Always Visible**: App Store itself is always available
- **Get More Apps Button**: Quick access to store
- **Toggle Controls**: Show/hide individual apps

## Technical Architecture

### Files Structure
```
/apps/app-store.js         - Main app store logic
/css/app-store.css         - App store styling
/index.html                - Integration points
```

### Key Functions

#### App Store (app-store.js)
- `initAppStore()` - Initialize the app store system
- `renderAppList()` - Render filtered app cards
- `showAppDetail(appId)` - Display app details
- `installApp(appId)` - Install an app
- `uninstallApp(appId)` - Uninstall an app
- `updateAppDrawer()` - Sync drawer with installed apps
- `saveInstalledApps()` - Save to Firebase
- `loadInstalledApps()` - Load from Firebase
- `setupFirebaseListener()` - Real-time sync

### Data Structure

#### Firebase Document
```javascript
{
  apps: ['calendar', 'pomodoro', 'todo', ...],
  by: 'device_xyz',
  updatedAt: Timestamp
}
```

#### App Catalog Entry
```javascript
{
  id: 'pomodoro',
  name: 'Pomodoro Timer',
  icon: '🍅',
  category: 'Productivity',
  description: 'Focus timer...',
  longDescription: 'Detailed description...',
  version: '2.5',
  size: '1.5 MB',
  rating: 4.9,
  reviews: 5672,
  screenshots: ['⏱️', '🍅', '⏳'],
  developer: 'Focus Apps Ltd.',
  popular: true,
  featured: false,
  preinstalled: false
}
```

## Usage Instructions

### For Users

#### Opening the App Store
1. Click **▦** (Apps button) in top-left corner
2. Find "App Store" 🛍️ in the app list
3. Click the toggle to open it
4. The App Store widget appears on your canvas

#### Using the App Store
1. **Browse Apps**: Use category filters (All, Featured, Popular, etc.)
2. **Search**: Type in the search bar to find specific apps
3. **View Details**: Click any app card for full information with screenshots
4. **Install**: Click "GET" button on app detail page
5. **Uninstall**: Click "✓ Installed" button and confirm

#### Moving & Resizing
- **Drag**: Click and drag the title "🛍️ App Store" (not the search bar)
- **Resize**: Drag the corner handle (⌟) to resize
- **Close**: Click ✕ button (appears on hover)
- **Settings**: Click ⚙️ button for global settings

### For Users (cont.)
5. **Use App**: Open from app drawer (▦ button)
6. **Uninstall**: Open App Store → Click app → Click "✓ Installed" → Confirm

### For Developers

#### Adding a New App
1. Add app entry to `APP_CATALOG` in `app-store.js`:
```javascript
{
  id: 'myApp',
  name: 'My App',
  icon: '🎯',
  category: 'Productivity',
  description: 'Short description',
  longDescription: 'Detailed description',
  version: '1.0',
  size: '1.0 MB',
  rating: 4.5,
  reviews: 100,
  screenshots: ['📱', '💻', '⌚'],
  developer: 'My Company',
  popular: false,
  featured: false,
  preinstalled: false
}
```

2. Create app widget and update function:
```javascript
window.updateMyAppVisibility = function(visible) {
  // Show/hide widget logic
};
```

3. Add to widget ID mapping in `getWidgetId()`:
```javascript
'myApp': 'floatingMyApp'
```

## Benefits

### For End Users
- ✅ Only see apps you want
- ✅ Try apps before committing
- ✅ Settings sync across devices
- ✅ Organized, clutter-free interface
- ✅ Easy app discovery

### For the Application
- ✅ Modular app architecture
- ✅ User-driven feature adoption
- ✅ Reduced initial complexity
- ✅ Better user engagement
- ✅ Professional app ecosystem

## Future Enhancements
- [ ] App ratings and reviews by users
- [ ] Auto-update notifications
- [ ] App usage statistics
- [ ] Recommended apps based on usage
- [ ] App bundles and collections
- [ ] In-app purchases/premium features
- [ ] Developer portal for submissions
- [ ] App update changelog
- [ ] Multiple screenshots/videos
- [ ] User-created apps

## Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance
- **Initial Load**: < 100ms (from cache)
- **Firebase Sync**: Real-time (< 1s)
- **Search**: Instant client-side filtering
- **Install/Uninstall**: < 500ms
- **Drawer Update**: Instant

## Security
- 🔒 User authentication required for cloud sync
- 🔒 Per-user app installations (isolated)
- 🔒 System apps cannot be uninstalled
- 🔒 Firebase security rules enforced
- 🔒 No sensitive data in app catalog

## Troubleshooting

### App Store not showing
- Check if `app-store.js` is loaded
- Check browser console for errors
- Verify Firebase initialization

### Apps not syncing
- Ensure user is logged in
- Check internet connection
- Verify Firebase rules allow read/write
- Check browser console for Firebase errors

### Installed apps not appearing in drawer
- Refresh the page
- Check `installed_apps_cache` in localStorage
- Verify app IDs match catalog

## Credits
Designed and developed as a full-featured app marketplace for Calendar2, inspired by iOS App Store and Google Play Store aesthetics and functionality.

---

**Version**: 1.0  
**Last Updated**: January 1, 2026  
**License**: Part of Calendar2 Application
