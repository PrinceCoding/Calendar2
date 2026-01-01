// =========================
// APP STORE - Full-Featured App Marketplace
// =========================

(function() {
  'use strict';

  // Available Apps Catalog
  const APP_CATALOG = [
    {
      id: 'calendar',
      name: 'Calendar',
      icon: '📆',
      category: 'Productivity',
      description: 'Full year calendar view with month and year navigation. Track dates and plan your schedule.',
      longDescription: 'A beautiful calendar app with full year view, month view toggle, and today button. Navigate through years and months to plan your schedule effectively. Features customizable week start day, weekend highlighting, and holiday support.',
      version: '2.0',
      size: '1.2 MB',
      rating: 4.8,
      reviews: 1523,
      screenshots: ['📅', '🗓️', '📆'],
      developer: 'Calendar Suite Inc.',
      preinstalled: true
    },
    {
      id: 'clock',
      name: 'Analog Clock',
      icon: '🕐',
      category: 'Utilities',
      description: 'Beautiful analog clock with live time display and customizable appearance.',
      longDescription: 'A stunning analog clock widget that displays real-time with smooth animations. Features customizable clock faces, 12/24 hour format, date display, and multiple color themes. Perfect for keeping track of time while working.',
      version: '1.8',
      size: '0.8 MB',
      rating: 4.7,
      reviews: 2341,
      screenshots: ['🕒', '⏰', '🕐'],
      developer: 'Time Tools Co.',
      preinstalled: true
    },
    {
      id: 'pomodoro',
      name: 'Pomodoro Timer',
      icon: '🍅',
      category: 'Productivity',
      description: 'Focus timer with customizable work and break intervals. Boost your productivity.',
      longDescription: 'The ultimate productivity tool using the Pomodoro Technique. Set custom focus duration, short breaks, and long breaks. Features auto-start, sound notifications, desktop alerts, and session tracking. Perfect for staying focused and avoiding burnout.',
      version: '2.5',
      size: '1.5 MB',
      rating: 4.9,
      reviews: 5672,
      screenshots: ['⏱️', '🍅', '⏳'],
      developer: 'Focus Apps Ltd.',
      popular: true,
      preinstalled: true
    },
    {
      id: 'todo',
      name: 'To-Do List',
      icon: '✅',
      category: 'Productivity',
      description: 'Simple and effective task management. Never forget important tasks again.',
      longDescription: 'Manage your tasks efficiently with this powerful to-do list app. Features include task priorities, completion tracking, auto-sort, and cloud sync across devices. Clean, intuitive interface makes task management a breeze.',
      version: '1.9',
      size: '1.1 MB',
      rating: 4.6,
      reviews: 3421,
      screenshots: ['✓', '📝', '✅'],
      developer: 'Task Master Pro',
      preinstalled: true
    },
    {
      id: 'countdown',
      name: 'Countdown',
      icon: '⏰',
      category: 'Utilities',
      description: 'Track important events and deadlines with beautiful countdown timers.',
      longDescription: 'Create unlimited countdown timers for birthdays, anniversaries, deadlines, and special events. Features live countdown display, emoji support, color coding, and cloud sync. Never miss an important date again!',
      version: '1.6',
      size: '0.9 MB',
      rating: 4.5,
      reviews: 1892,
      screenshots: ['⏰', '⏳', '⌛'],
      developer: 'Event Tracker Inc.',
      preinstalled: true
    },
    {
      id: 'events',
      name: 'Events',
      icon: '📅',
      category: 'Productivity',
      description: 'Comprehensive event management with date filtering and cloud sync.',
      longDescription: 'Professional event management app with date-based organization. Add events with descriptions, filter by date, view all or specific dates. Features cloud sync, past event archiving, and multiple sorting options.',
      version: '2.1',
      size: '1.3 MB',
      rating: 4.7,
      reviews: 2156,
      screenshots: ['📅', '🎉', '📆'],
      developer: 'Calendar Suite Inc.',
      preinstalled: true
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: '🔢',
      category: 'Utilities',
      description: 'Scientific calculator with history and customizable themes.',
      longDescription: 'A powerful calculator app with scientific mode, calculation history, and customizable themes. Features decimal place control, thousands separator, button sounds, and history management. Perfect for quick calculations and complex math.',
      version: '1.7',
      size: '0.7 MB',
      rating: 4.8,
      reviews: 4523,
      screenshots: ['🧮', '🔢', '➗'],
      developer: 'Math Tools Pro',
      popular: true,
      preinstalled: true
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: '📝',
      category: 'Productivity',
      description: 'Rich text editor with formatting tools and cloud sync.',
      longDescription: 'Full-featured notes app with rich text formatting. Bold, italic, underline, and lists. Customizable fonts, sizes, and line heights. Auto-save with cloud sync keeps your notes safe across all devices.',
      version: '2.2',
      size: '1.4 MB',
      rating: 4.9,
      reviews: 6234,
      screenshots: ['📝', '✏️', '📄'],
      developer: 'Note Masters Ltd.',
      featured: true,
      preinstalled: true
    },
    {
      id: 'webBrowser',
      name: 'Web Browser',
      icon: '🌐',
      category: 'Internet',
      description: 'Browse the web with bookmarks, history, and security features.',
      longDescription: 'Full-featured web browser with navigation controls, bookmark management, and security settings. Features home page customization, multiple search engines, zoom control, and popular sites shortcuts. Browse safely with iframe sandboxing.',
      version: '2.3',
      size: '2.1 MB',
      rating: 4.4,
      reviews: 3892,
      screenshots: ['🌐', '🔍', '🔖'],
      developer: 'Web Tools Inc.',
      preinstalled: true
    },
    {
      id: 'canvasManager',
      name: 'Canvas Manager',
      icon: '📑',
      category: 'Productivity',
      description: 'Manage multiple workspaces with custom layouts and widget arrangements.',
      longDescription: 'Create and manage multiple canvas workspaces. Each canvas can have different widget layouts and configurations. Perfect for organizing work, personal, and project-specific setups. Features canvas renaming, deletion, and instant switching.',
      version: '2.4',
      size: '1.6 MB',
      rating: 4.9,
      reviews: 2567,
      screenshots: ['📑', '🖼️', '📊'],
      developer: 'Workspace Pro',
      featured: true,
      preinstalled: true
    },
    {
      id: 'ambientSounds',
      name: 'Ambient Sounds',
      icon: '🎵',
      category: 'Lifestyle',
      description: 'Relaxing ambient sounds for focus and relaxation. Mix multiple sounds.',
      longDescription: 'Create your perfect ambient soundscape with rain, thunder, wind, forest, ocean, fire, café, and white noise. Mix multiple sounds, adjust individual volumes, and use random mix for instant ambiance. Perfect for focus, relaxation, and sleep.',
      version: '1.5',
      size: '3.2 MB',
      rating: 5.0,
      reviews: 8912,
      screenshots: ['🎵', '🌧️', '🌊'],
      developer: 'Sound Therapy Co.',
      popular: true,
      featured: true,
      preinstalled: true
    }
  ];

  // Installed Apps State (synced with cloud)
  // Initialize with preinstalled apps immediately
  let installedApps = APP_CATALOG.filter(app => app.preinstalled).map(app => app.id);
  let isLoadingInstalled = false;

  // UI Elements
  let appStoreWidget = null;
  let appList = null;
  let searchInput = null;
  let categoryFilter = null;
  let appDetailView = null;
  let storeMainView = null;

  // Initialize App Store
  function initAppStore() {
    console.log('[APP STORE] Initializing...');
    
    // Create app store widget if it doesn't exist
    createAppStoreWidget();
    
    // Load installed apps from cloud
    loadInstalledApps();
    
    // Setup realtime sync listener
    setupFirebaseListener();
    
    console.log('[APP STORE] Initialized successfully');
  }

  // Create App Store Widget HTML
  function createAppStoreWidget() {
    if (document.getElementById('appStore')) {
      console.log('[APP STORE] Widget already exists');
      return;
    }

    const widget = document.createElement('div');
    widget.id = 'appStore';
    widget.className = 'app-store';
    widget.style.display = 'none';
    
    widget.innerHTML = `
      <button id="closeAppStoreBtn" class="close-widget-btn" title="Close App Store">✕</button>
      <button id="appStoreSettingsBtn" class="settings-btn" title="App Store Settings">⚙️</button>
      <div class="resize-handle"></div>
      
      <!-- Main Store View -->
      <div id="storeMainView" class="store-main-view">
        <div class="store-header">
          <div class="store-title-section">
            <h1 class="store-title">🛍️ App Store</h1>
          </div>
          <div class="store-search">
            <input type="text" id="storeSearchInput" class="store-search-input" placeholder="🔍 Search apps..." />
          </div>
        </div>
        
        <div class="store-filters">
          <button class="store-filter-btn active" data-category="all">All</button>
          <button class="store-filter-btn" data-category="featured">Featured</button>
          <button class="store-filter-btn" data-category="popular">Popular</button>
          <button class="store-filter-btn" data-category="Productivity">Productivity</button>
          <button class="store-filter-btn" data-category="Utilities">Utilities</button>
          <button class="store-filter-btn" data-category="Lifestyle">Lifestyle</button>
          <button class="store-filter-btn" data-category="Internet">Internet</button>
        </div>
        
        <div id="storeAppList" class="store-app-list">
          <!-- Apps will be rendered here -->
        </div>
      </div>
      
      <!-- App Detail View -->
      <div id="appDetailView" class="app-detail-view" style="display: none;">
        <button id="backToStoreBtn" class="back-btn">‹ App Store</button>
        <div id="appDetailContent" class="app-detail-content">
          <!-- App details will be rendered here -->
        </div>
      </div>
    `;
    
    const canvasWorkspace = document.getElementById('canvasWorkspace');
    if (canvasWorkspace) {
      canvasWorkspace.appendChild(widget);
    } else {
      document.body.appendChild(widget);
    }
    
    appStoreWidget = widget;
    
    // Expose widget globally
    window.appStoreWidget = widget;
    
    // Setup UI elements
    appList = document.getElementById('storeAppList');
    searchInput = document.getElementById('storeSearchInput');
    storeMainView = document.getElementById('storeMainView');
    appDetailView = document.getElementById('appDetailView');
    
    // Setup event listeners
    setupEventListeners();
    
    // Make draggable and resizable (like other widgets)
    if (window.makeDraggable) {
      window.makeDraggable(widget, '.store-title-section', 'appStore');
    }
    if (window.makeResizable) {
      window.makeResizable(widget, 'appStore');
    }
    
    // Add to allWidgets array for touch handling and bring-to-front
    if (window.addAppStoreToWidgets) {
      window.addAppStoreToWidgets();
    }
    
    // Render initial app list
    renderAppList();
    
    console.log('[APP STORE] Widget created');
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Close button
    const closeBtn = document.getElementById('closeAppStoreBtn');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        if (window.updateAppStoreVisibility) {
          window.updateAppStoreVisibility(false);
        }
      };
    }
    
    // Settings button
    const settingsBtn = document.getElementById('appStoreSettingsBtn');
    if (settingsBtn) {
      settingsBtn.onclick = (e) => {
        e.stopPropagation();
        // Open global settings and navigate to App Store section
        const settingsPage = document.getElementById('settingsPage');
        if (settingsPage) {
          settingsPage.style.display = 'block';
        }
        // Navigate to App Store settings
        if (window.WidgetSettings && window.WidgetSettings.showAppSettings) {
          window.WidgetSettings.showAppSettings('appStore');
        }
      };
    }
    
    // Back button
    const backBtn = document.getElementById('backToStoreBtn');
    if (backBtn) {
      backBtn.onclick = () => {
        showMainView();
      };
    }
    
    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderAppList();
      });
    }
    
    // Category filters
    const filterBtns = document.querySelectorAll('.store-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAppList();
      });
    });
  }

  // Render App List
  function renderAppList() {
    if (!appList) return;
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const activeFilter = document.querySelector('.store-filter-btn.active');
    const category = activeFilter ? activeFilter.dataset.category : 'all';
    
    // Filter apps
    let filteredApps = APP_CATALOG.filter(app => {
      const matchesSearch = !searchTerm || 
        app.name.toLowerCase().includes(searchTerm) ||
        app.description.toLowerCase().includes(searchTerm) ||
        app.category.toLowerCase().includes(searchTerm);
      
      const matchesCategory = category === 'all' || 
        (category === 'featured' && app.featured) ||
        (category === 'popular' && app.popular) ||
        app.category === category;
      
      return matchesSearch && matchesCategory;
    });
    
    // Sort: Featured first, then by rating
    filteredApps.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
    
    // Render apps
    appList.innerHTML = '';
    
    if (filteredApps.length === 0) {
      appList.innerHTML = `
        <div class="store-empty">
          <div class="store-empty-icon">🔍</div>
          <div class="store-empty-text">No apps found</div>
          <div class="store-empty-subtext">Try a different search or category</div>
        </div>
      `;
      return;
    }
    
    filteredApps.forEach(app => {
      const isInstalled = installedApps.includes(app.id);
      const badge = app.featured ? '<span class="app-badge featured">Featured</span>' : 
                   app.popular ? '<span class="app-badge popular">Popular</span>' : '';
      
      const appCard = document.createElement('div');
      appCard.className = 'store-app-card';
      appCard.innerHTML = `
        <div class="app-card-icon">${app.icon}</div>
        <div class="app-card-info">
          <div class="app-card-header">
            <div class="app-card-name">${app.name}</div>
            ${badge}
          </div>
          <div class="app-card-category">${app.category}</div>
          <div class="app-card-description">${app.description}</div>
          <div class="app-card-footer">
            <div class="app-card-rating">
              <span class="rating-stars">${renderStars(app.rating)}</span>
              <span class="rating-text">${app.rating} (${formatNumber(app.reviews)})</span>
            </div>
            <div class="app-card-meta">
              <span>${app.size}</span>
            </div>
          </div>
        </div>
        <button class="app-card-action ${isInstalled ? 'installed' : ''}" 
                data-app-id="${app.id}">
          ${isInstalled ? '✓ Installed' : 'GET'}
        </button>
      `;
      
      // Click card to view details
      appCard.addEventListener('click', (e) => {
        if (!e.target.classList.contains('app-card-action')) {
          showAppDetail(app.id);
        }
      });
      
      // Install/Uninstall button
      const actionBtn = appCard.querySelector('.app-card-action');
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isInstalled) {
          uninstallApp(app.id);
        } else {
          installApp(app.id);
        }
      });
      
      appList.appendChild(appCard);
    });
  }

  // Show App Detail
  function showAppDetail(appId) {
    const app = APP_CATALOG.find(a => a.id === appId);
    if (!app) return;
    
    const isInstalled = installedApps.includes(app.id);
    
    const detailContent = document.getElementById('appDetailContent');
    if (!detailContent) return;
    
    detailContent.innerHTML = `
      <div class="app-detail-header">
        <div class="app-detail-icon">${app.icon}</div>
        <div class="app-detail-title-section">
          <h2 class="app-detail-title">${app.name}</h2>
          <div class="app-detail-developer">${app.developer}</div>
          <div class="app-detail-category">${app.category}</div>
        </div>
      </div>
      
      <div class="app-detail-actions">
        <button class="app-detail-install-btn ${isInstalled ? 'installed' : ''}" 
                id="appDetailInstallBtn">
          ${isInstalled ? '✓ Installed' : 'GET'}
        </button>
      </div>
      
      <div class="app-detail-stats">
        <div class="app-stat">
          <div class="app-stat-value">${formatNumber(app.reviews)}</div>
          <div class="app-stat-label">Reviews</div>
        </div>
        <div class="app-stat">
          <div class="app-stat-value">${renderStars(app.rating)}<br>${app.rating}</div>
          <div class="app-stat-label">Rating</div>
        </div>
        <div class="app-stat">
          <div class="app-stat-value">${app.size}</div>
          <div class="app-stat-label">Size</div>
        </div>
        <div class="app-stat">
          <div class="app-stat-value">v${app.version}</div>
          <div class="app-stat-label">Version</div>
        </div>
      </div>
      
      <div class="app-detail-screenshots">
        ${app.screenshots.map(s => `<div class="app-screenshot">${s}</div>`).join('')}
      </div>
      
      <div class="app-detail-section">
        <h3>About</h3>
        <p>${app.longDescription}</p>
      </div>
      
      <div class="app-detail-section">
        <h3>Information</h3>
        <div class="app-info-list">
          <div class="app-info-item">
            <span class="app-info-label">Developer</span>
            <span class="app-info-value">${app.developer}</span>
          </div>
          <div class="app-info-item">
            <span class="app-info-label">Category</span>
            <span class="app-info-value">${app.category}</span>
          </div>
          <div class="app-info-item">
            <span class="app-info-label">Version</span>
            <span class="app-info-value">${app.version}</span>
          </div>
          <div class="app-info-item">
            <span class="app-info-label">Size</span>
            <span class="app-info-value">${app.size}</span>
          </div>
        </div>
      </div>
    `;
    
    // Setup install button
    const installBtn = document.getElementById('appDetailInstallBtn');
    if (installBtn) {
      installBtn.onclick = () => {
        if (isInstalled) {
          uninstallApp(app.id);
        } else {
          installApp(app.id);
        }
        // Refresh detail view
        setTimeout(() => showAppDetail(app.id), 100);
      };
    }
    
    // Show detail view
    storeMainView.style.display = 'none';
    appDetailView.style.display = 'block';
  }

  // Show Main View
  function showMainView() {
    storeMainView.style.display = 'block';
    appDetailView.style.display = 'none';
    renderAppList(); // Refresh in case install status changed
  }

  // Install App
  function installApp(appId) {
    const app = APP_CATALOG.find(a => a.id === appId);
    if (!app) {
      console.error('[APP STORE] App not found:', appId);
      return;
    }
    
    if (installedApps.includes(appId)) {
      console.log('[APP STORE] App already installed:', appId);
      return;
    }
    
    console.log('[APP STORE] Installing app:', app.name);
    
    // Add to installed apps
    installedApps.push(appId);
    
    // Save to cloud and localStorage
    saveInstalledApps();
    localStorage.setItem('installedApps', JSON.stringify(installedApps));
    
    // Dynamically load the app
    if (window.loadApp) {
      window.loadApp(appId);
    }
    
    // Update UI
    renderAppList();
    updateAppDrawer();
    
    // Refresh settings app list
    if (window.refreshSettingsAppList) {
      window.refreshSettingsAppList();
    }
    
    // Show success notification
    showNotification(`✓ ${app.name} installed successfully`);
  }

  // Uninstall App
  function uninstallApp(appId) {
    const app = APP_CATALOG.find(a => a.id === appId);
    if (!app) {
      console.error('[APP STORE] App not found:', appId);
      return;
    }
    
    // Don't allow uninstalling preinstalled apps
    if (app.preinstalled) {
      showNotification(`⚠️ ${app.name} is a system app and cannot be uninstalled`);
      return;
    }
    
    if (!installedApps.includes(appId)) {
      console.log('[APP STORE] App not installed:', appId);
      return;
    }
    
    console.log('[APP STORE] Uninstalling app:', app.name);
    
    // Remove from installed apps
    installedApps = installedApps.filter(id => id !== appId);
    
    // Dynamically unload the app
    if (window.unloadApp) {
      window.unloadApp(appId);
    }
    
    // Save to cloud and localStorage
    saveInstalledApps();
    localStorage.setItem('installedApps', JSON.stringify(installedApps));
    
    // Update UI
    renderAppList();
    updateAppDrawer();
    
    // Refresh settings app list
    if (window.refreshSettingsAppList) {
      window.refreshSettingsAppList();
    }
    
    // Show success notification
    showNotification(`${app.name} uninstalled`);
  }

  // Load Installed Apps from Cloud
  async function loadInstalledApps() {
    try {
      isLoadingInstalled = true;
      
      // Check if user is authenticated
      if (!window.auth || !window.auth.currentUser) {
        console.log('[APP STORE] Not authenticated - using default apps');
        // Default installed apps
        installedApps = APP_CATALOG.filter(app => app.preinstalled).map(app => app.id);
        isLoadingInstalled = false;
        updateAppDrawer();
        renderAppList();
        return;
      }
      
      // Load from localStorage cache first (instant)
      const cached = localStorage.getItem('installed_apps_cache');
      if (cached) {
        try {
          installedApps = JSON.parse(cached);
          console.log('[APP STORE] Loaded from cache:', installedApps.length, 'apps');
          updateAppDrawer();
          renderAppList();
        } catch (e) {
          console.error('[APP STORE] Cache parse error:', e);
        }
      }
      
      // Firebase will update via realtime listener
      
    } catch (error) {
      console.error('[APP STORE] Error loading installed apps:', error);
      installedApps = APP_CATALOG.filter(app => app.preinstalled).map(app => app.id);
      isLoadingInstalled = false;
      updateAppDrawer();
      renderAppList();
    }
  }

  // Save Installed Apps to Cloud
  async function saveInstalledApps() {
    try {
      // Save to localStorage cache (instant)
      localStorage.setItem('installed_apps_cache', JSON.stringify(installedApps));
      
      // Require authentication for cloud save
      if (!window.auth || !window.auth.currentUser) {
        console.warn('[APP STORE] Not authenticated - saved to cache only');
        return;
      }
      
      if (!window.db || !window.doc || !window.setDoc || !window.serverTimestamp) {
        console.error('[APP STORE] Firebase not initialized');
        return;
      }
      
      const userId = window.auth.currentUser.uid;
      const deviceId = window.deviceId || 'unknown';
      
      console.log('[APP STORE] Saving', installedApps.length, 'installed apps to Firebase');
      
      const ref = window.doc(window.db, 'user_installed_apps', userId);
      await window.setDoc(ref, {
        apps: installedApps,
        by: deviceId,
        updatedAt: window.serverTimestamp()
      });
      
      console.log('[APP STORE] ✅ Successfully saved to Firebase');
    } catch (error) {
      console.error('[APP STORE] ❌ Failed to save to Firebase:', error);
    }
  }

  // Setup Firebase Realtime Listener
  function setupFirebaseListener() {
    // Wait for Firebase to be ready
    const checkFirebase = setInterval(() => {
      if (window.auth && window.db && window.onSnapshot && window.doc) {
        clearInterval(checkFirebase);
        
        // Listen for auth state
        if (window.auth.onAuthStateChanged) {
          window.auth.onAuthStateChanged(user => {
            if (user) {
              console.log('[APP STORE] User authenticated, setting up listener');
              const ref = window.doc(window.db, 'user_installed_apps', user.uid);
              
              window.onSnapshot(ref, (snapshot) => {
                if (snapshot.exists()) {
                  const data = snapshot.data();
                  console.log('[APP STORE] Received update from Firebase:', data);
                  
                  if (Array.isArray(data.apps)) {
                    installedApps = data.apps;
                    isLoadingInstalled = false;
                    
                    // Update cache
                    localStorage.setItem('installed_apps_cache', JSON.stringify(installedApps));
                    
                    // Update UI
                    updateAppDrawer();
                    renderAppList();
                    
                    // Refresh settings app list
                    if (window.refreshSettingsAppList) {
                      window.refreshSettingsAppList();
                    }
                    
                    console.log('[APP STORE] Loaded', installedApps.length, 'apps from Firebase');
                  }
                } else {
                  console.log('[APP STORE] No cloud data, initializing defaults');
                  installedApps = APP_CATALOG.filter(app => app.preinstalled).map(app => app.id);
                  isLoadingInstalled = false;
                  saveInstalledApps();
                  updateAppDrawer();
                  renderAppList();
                  
                  // Refresh settings app list
                  if (window.refreshSettingsAppList) {
                    window.refreshSettingsAppList();
                  }
                }
              }, (error) => {
                console.error('[APP STORE] Snapshot error:', error);
              });
            } else {
              console.log('[APP STORE] User logged out');
              installedApps = APP_CATALOG.filter(app => app.preinstalled).map(app => app.id);
              isLoadingInstalled = false;
              updateAppDrawer();
              renderAppList();
              
              // Refresh settings app list
              if (window.refreshSettingsAppList) {
                window.refreshSettingsAppList();
              }
            }
          });
        }
      }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(() => clearInterval(checkFirebase), 10000);
  }

  // Update App Drawer to show only installed apps
  function updateAppDrawer() {
    const appDrawer = document.getElementById('appDrawer');
    if (!appDrawer) return;
    
    const appListContainer = appDrawer.querySelector('.app-list');
    if (!appListContainer) return;
    
    console.log('[APP STORE] Updating app drawer with', installedApps.length, 'installed apps');
    
    // Clear existing apps
    appListContainer.innerHTML = '';
    
    // Add App Store first
    const appStoreItem = createAppDrawerItem({
      id: 'appStore',
      icon: '🛍️',
      name: 'App Store',
      description: 'Download apps'
    }, true); // Always show as installed
    appListContainer.appendChild(appStoreItem);
    
    // Add installed apps
    installedApps.forEach(appId => {
      const app = APP_CATALOG.find(a => a.id === appId);
      if (app) {
        const item = createAppDrawerItem(app, true);
        appListContainer.appendChild(item);
      }
    });
    
    // Add "Get More Apps" button
    const getMoreBtn = document.createElement('div');
    getMoreBtn.className = 'app-item get-more-apps';
    getMoreBtn.innerHTML = `
      <div class="app-icon">➕</div>
      <div class="app-info">
        <div class="app-name">Get More Apps</div>
        <div class="app-desc">Browse App Store</div>
      </div>
    `;
    getMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.updateAppStoreVisibility) {
        window.updateAppStoreVisibility(true);
      }
      // Close app drawer
      const drawer = document.getElementById('appDrawer');
      if (drawer) drawer.style.display = 'none';
    });
    appListContainer.appendChild(getMoreBtn);
    
    // Sync toggle button states after a brief delay
    setTimeout(syncToggleStates, 100);
  }

  // Sync toggle button states with actual widget visibility
  function syncToggleStates() {
    installedApps.forEach(appId => {
      const toggleBtn = document.getElementById(`toggle${getAppName(appId)}App`);
      if (toggleBtn) {
        const widgetId = getWidgetId(appId);
        const widget = document.getElementById(widgetId);
        if (widget) {
          const isVisible = widget.style.display !== 'none';
          toggleBtn.classList.toggle('active', isVisible);
        }
      }
    });
    
    // Also sync App Store toggle
    const appStoreToggle = document.getElementById('toggleAppStoreApp');
    if (appStoreToggle) {
      const appStoreWidget = document.getElementById('appStore');
      if (appStoreWidget) {
        const isVisible = appStoreWidget.style.display !== 'none';
        appStoreToggle.classList.toggle('active', isVisible);
      }
    }
  }

  // Create App Drawer Item
  function createAppDrawerItem(app, isInstalled) {
    const item = document.createElement('div');
    item.className = 'app-item';
    item.dataset.app = app.id;
    
    item.innerHTML = `
      <div class="app-icon">${app.icon}</div>
      <div class="app-info">
        <div class="app-name">${app.name}</div>
        <div class="app-desc">${app.description}</div>
      </div>
      <div class="app-toggle ${isInstalled ? 'active' : ''}" id="toggle${getAppName(app.id)}App"></div>
    `;
    
    // Toggle button functionality
    const toggleBtn = item.querySelector('.app-toggle');
    if (toggleBtn && app.id !== 'appStore') {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Get widget ID and element
        const widgetId = getWidgetId(app.id);
        const widget = document.getElementById(widgetId);
        
        if (!widget) {
          console.warn('[APP STORE] Widget not found:', widgetId);
          return;
        }
        
        // Check current visibility
        const isVisible = widget.style.display !== 'none';
        
        // Toggle visibility using the update function
        const updateFunc = window[`update${getAppName(app.id)}Visibility`];
        if (updateFunc) {
          updateFunc(!isVisible);
          
          // Update toggle button state
          setTimeout(() => {
            const newIsVisible = widget.style.display !== 'none';
            toggleBtn.classList.toggle('active', newIsVisible);
          }, 50);
        } else {
          console.warn('[APP STORE] Update function not found:', `update${getAppName(app.id)}Visibility`);
        }
      });
    } else if (app.id === 'appStore') {
      // App Store toggle
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.updateAppStoreVisibility) {
          const widget = document.getElementById('appStore');
          const isVisible = widget && widget.style.display !== 'none';
          window.updateAppStoreVisibility(!isVisible);
          
          // Update toggle button state
          setTimeout(() => {
            const newIsVisible = widget && widget.style.display !== 'none';
            toggleBtn.classList.toggle('active', newIsVisible);
          }, 50);
        }
      });
    }
    
    return item;
  }

  // Helper Functions
  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '⭐';
    }
    if (hasHalfStar) {
      stars += '⭐';
    }
    
    return stars;
  }

  function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getAppName(appId) {
    // Map app IDs to their proper names used in function/toggle IDs
    const mapping = {
      'calendar': 'Calendar',
      'clock': 'Clock',
      'pomodoro': 'Pomo',
      'todo': 'Todo',
      'countdown': 'Countdown',
      'events': 'Events',
      'calculator': 'Calculator',
      'notes': 'Notes',
      'webBrowser': 'WebBrowser',
      'canvasManager': 'CanvasManager',
      'ambientSounds': 'Ambient'
    };
    return mapping[appId] || capitalize(appId);
  }

  function getWidgetId(appId) {
    const mapping = {
      'calendar': 'floatingCalendar',
      'clock': 'analogClock',
      'pomodoro': 'floatingPomo',
      'todo': 'floatingTodo',
      'countdown': 'floatingCountdown',
      'events': 'floatingEvents',
      'calculator': 'floatingCalculator',
      'notes': 'floatingNotes',
      'webBrowser': 'floatingWebBrowser',
      'canvasManager': 'canvasManager',
      'ambientSounds': 'floatingAmbient'
    };
    return mapping[appId] || appId;
  }

  function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'app-store-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Expose global functions
  window.updateAppStoreVisibility = function(visible) {
    const widget = document.getElementById('appStore');
    if (!widget) return;
    
    widget.style.display = visible ? 'flex' : 'none';
    
    const toggleBtn = document.getElementById('toggleAppStoreApp');
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', visible);
    }
    
    if (window.saveCurrentCanvas) {
      window.saveCurrentCanvas();
    }
  };

  // Expose sync function for external use
  window.syncAppStoreToggleStates = syncToggleStates;

  // Expose function to get installed apps
  window.getInstalledApps = function() {
    return installedApps;
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppStore);
  } else {
    initAppStore();
  }

})();
