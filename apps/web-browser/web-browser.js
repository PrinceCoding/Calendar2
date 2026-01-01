/* =========================
   WEB BROWSER WIDGET
   Full-featured web browser on canvas
   ========================= */

(function() {
  'use strict';

  const floatingWebBrowser = document.getElementById('floatingWebBrowser');
  const browserUrlInput = document.getElementById('browserUrlInput');
  const browserGoBtn = document.getElementById('browserGoBtn');
  const browserBackBtn = document.getElementById('browserBackBtn');
  const browserForwardBtn = document.getElementById('browserForwardBtn');
  const browserRefreshBtn = document.getElementById('browserRefreshBtn');
  const browserHomeBtn = document.getElementById('browserHomeBtn');
  const browserBookmarkBtn = document.getElementById('browserBookmarkBtn');
  const browserNewTabBtn = document.getElementById('browserNewTabBtn');
  const browserIframe = document.getElementById('browserIframe');
  const browserBookmarks = document.getElementById('browserBookmarks');
  const browserErrorOverlay = document.getElementById('browserErrorOverlay');
  const browserErrorMessage = document.getElementById('browserErrorMessage');
  const browserOpenNewTabError = document.getElementById('browserOpenNewTabError');
  const browserTryAgain = document.getElementById('browserTryAgain');
  const quickLinksToggle = document.getElementById('quickLinksToggle');
  const quickLinksList = document.getElementById('quickLinksList');

  const BROWSER_URL_KEY = 'webBrowserUrl';
  const BROWSER_HISTORY_KEY = 'webBrowserHistory';
  const BROWSER_BOOKMARKS_KEY = 'webBrowserBookmarks';
  const BROWSER_HOME_KEY = 'webBrowserHomePage';
  const MAX_HISTORY = 50;

  let historyStack = [];
  let historyIndex = -1;
  let currentUrl = '';

  // Load saved URL on init
  function initWebBrowser() {
    loadHistory();
    const savedUrl = localStorage.getItem(BROWSER_URL_KEY);
    if (savedUrl) {
      browserUrlInput.value = savedUrl;
      loadUrl(savedUrl, false);
    } else {
      // Load default homepage
      const defaultHome = localStorage.getItem(BROWSER_HOME_KEY) || 'https://en.wikipedia.org';
      browserUrlInput.value = defaultHome;
      loadUrl(defaultHome, false);
    }
    renderBookmarks();
    updateNavigationButtons();
    setupIframeErrorDetection();
  }



  function hideErrorOverlay() {
    if (browserErrorOverlay) {
      browserErrorOverlay.style.display = 'none';
    }
  }

  function showErrorOverlay(message) {
    if (browserErrorOverlay && browserErrorMessage) {
      browserErrorMessage.textContent = message;
      browserErrorOverlay.style.display = 'flex';
    }
  }

  function setupIframeErrorDetection() {
    if (!browserIframe) return;

    // Only detect actual load errors
    browserIframe.addEventListener('error', () => {
      showErrorOverlay('Failed to load the page. The site may be down or blocking access.');
    });
  }

  // Load URL into iframe
  function loadUrl(url, addToHistory = true) {
    if (!url) return;
    
    let finalUrl = url.trim();
    
    // Check if it's a search query or URL
    if (!finalUrl.match(/^https?:\/\//i) && !finalUrl.includes('.')) {
      // It's a search query
      const searchEngine = localStorage.getItem('browserSearchEngine') || 'google';
      const searchUrls = {
        google: 'https://www.google.com/search?q=',
        bing: 'https://www.bing.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q='
      };
      finalUrl = searchUrls[searchEngine] + encodeURIComponent(finalUrl);
    } else if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      // Clear any previous errors
      hideErrorOverlay();
      
      browserIframe.src = finalUrl;
      browserUrlInput.value = finalUrl;
      localStorage.setItem(BROWSER_URL_KEY, finalUrl);
      currentUrl = finalUrl;
      
      if (addToHistory) {
        addToHistoryStack(finalUrl);
      }
      
      // Show loading state
      browserIframe.style.opacity = '0.5';
      
      browserIframe.onload = () => {
        browserIframe.style.opacity = '1';
        updateNavigationButtons();
        hideErrorOverlay();
      };
      
    } catch (error) {
      console.error('Error loading URL:', error);
      showErrorOverlay('Invalid URL. Please enter a valid web address.');
      browserIframe.style.opacity = '1';
    }
  }

  // Open current URL in new tab
  function openInNewTab(url = null) {
    const urlToOpen = url || currentUrl || browserUrlInput.value.trim();
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }
  }

  // Navigation history management
  function addToHistoryStack(url) {
    // Remove any forward history when navigating to a new page
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex = historyStack.length - 1;
    
    // Also save to localStorage history
    saveToHistory(url);
    updateNavigationButtons();
  }

  function saveToHistory(url) {
    let history = getHistory();
    history = history.filter(item => item !== url);
    history.unshift(url);
    history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(BROWSER_HISTORY_KEY, JSON.stringify(history));
  }

  function loadHistory() {
    const history = getHistory();
    historyStack = history.slice(0, 10); // Load last 10 pages
    historyIndex = 0;
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(BROWSER_HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function clearHistory() {
    localStorage.removeItem(BROWSER_HISTORY_KEY);
    historyStack = [];
    historyIndex = -1;
    updateNavigationButtons();
  }

  function updateNavigationButtons() {
    if (browserBackBtn) {
      browserBackBtn.disabled = historyIndex <= 0;
    }
    if (browserForwardBtn) {
      browserForwardBtn.disabled = historyIndex >= historyStack.length - 1;
    }
  }

  // Bookmarks management
  function getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(BROWSER_BOOKMARKS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveBookmarks(bookmarks) {
    localStorage.setItem(BROWSER_BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }

  function addBookmark() {
    const url = browserUrlInput.value.trim();
    if (!url) return;
    
    let bookmarks = getBookmarks();
    
    // Silently ignore if already bookmarked (no blocking dialogs)
    if (bookmarks.find(b => b.url === url)) {
      return;
    }

    // Auto-generate a title from the URL hostname
    let title = '';
    try {
      title = new URL(url).hostname;
    } catch {
      title = url;
    }

    bookmarks.unshift({ title, url, date: Date.now() });
    saveBookmarks(bookmarks);
    renderBookmarks();
  }

  function removeBookmark(url) {
    let bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(b => b.url !== url);
    saveBookmarks(bookmarks);
    renderBookmarks();
  }

  function clearAllBookmarks() {
    if (confirm('Clear all bookmarks?')) {
      localStorage.removeItem(BROWSER_BOOKMARKS_KEY);
      renderBookmarks();
    }
  }

  function renderBookmarks() {
    if (!browserBookmarks) return;
    
    const showBookmarks = localStorage.getItem('browserShowBookmarks') !== 'false';
    browserBookmarks.style.display = showBookmarks ? 'flex' : 'none';
    
    const bookmarks = getBookmarks();
    browserBookmarks.innerHTML = '';
    
    if (bookmarks.length === 0) {
      browserBookmarks.innerHTML = '<div style="padding:0.5rem;color:var(--muted);font-size:0.75rem;">No bookmarks yet</div>';
      return;
    }
    
    bookmarks.forEach(bookmark => {
      const item = document.createElement('div');
      item.className = 'bookmark-item';
      item.innerHTML = `
        <span class="bookmark-title" title="${bookmark.url}">${bookmark.title}</span>
        <button class="bookmark-remove" title="Remove">\u2715</button>
      `;
      
      item.querySelector('.bookmark-title').onclick = () => {
        loadUrl(bookmark.url);
      };
      
      item.querySelector('.bookmark-remove').onclick = (e) => {
        e.stopPropagation();
        removeBookmark(bookmark.url);
      };
      
      browserBookmarks.appendChild(item);
    });
  }

  // Button handlers
  if (browserGoBtn) {
    browserGoBtn.onclick = () => {
      const url = browserUrlInput.value.trim();
      if (url) {
        loadUrl(url);
      }
    };
  }

  if (browserUrlInput) {
    browserUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const url = browserUrlInput.value.trim();
        if (url) {
          loadUrl(url);
        }
      }
    });
  }

  if (browserBackBtn) {
    browserBackBtn.onclick = () => {
      if (historyIndex > 0) {
        historyIndex--;
        const url = historyStack[historyIndex];
        loadUrl(url, false);
      }
    };
  }

  if (browserForwardBtn) {
    browserForwardBtn.onclick = () => {
      if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        const url = historyStack[historyIndex];
        loadUrl(url, false);
      }
    };
  }

  if (browserRefreshBtn) {
    browserRefreshBtn.onclick = () => {
      if (browserIframe.src) {
        browserIframe.src = browserIframe.src;
      }
    };
  }

  if (browserHomeBtn) {
    browserHomeBtn.onclick = () => {
      const homePage = localStorage.getItem(BROWSER_HOME_KEY) || 'https://wikipedia.org';
      loadUrl(homePage);
    };
  }

  if (browserBookmarkBtn) {
    browserBookmarkBtn.onclick = addBookmark;
  }

  // Spawn another in-canvas browser instance when clicking the ↗ button
  if (browserNewTabBtn) {
    browserNewTabBtn.onclick = () => spawnNewWebBrowserInstance(browserUrlInput?.value?.trim() || currentUrl || '');
  }

  if (browserOpenNewTabError) {
    browserOpenNewTabError.onclick = () => {
      openInNewTab();
      hideErrorOverlay();
    };
  }

  if (browserTryAgain) {
    browserTryAgain.onclick = () => {
      const url = browserUrlInput.value.trim();
      if (url) {
        hideErrorOverlay();
        loadUrl(url, false);
      }
    };
  }

  // Quick Links functionality
  if (quickLinksToggle) {
    quickLinksToggle.onclick = () => {
      const isVisible = quickLinksList.style.display !== 'none';
      quickLinksList.style.display = isVisible ? 'none' : 'flex';
      localStorage.setItem('browserQuickLinksVisible', !isVisible);
    };
    
    // Restore visibility state
    const quickLinksVisible = localStorage.getItem('browserQuickLinksVisible') === 'true';
    if (quickLinksVisible) {
      quickLinksList.style.display = 'flex';
    }
  }

  if (quickLinksList) {
    quickLinksList.addEventListener('click', (e) => {
      const link = e.target.closest('.quick-link');
      if (link) {
        e.preventDefault();
        const url = link.getAttribute('data-url');
        if (url) {
          loadUrl(url);
        }
      }
    });
  }

  // Initialize on load
  initWebBrowser();

  // Export functions for settings
  window.WebBrowserWidget = {
    element: floatingWebBrowser,
    getHistory: getHistory,
    clearHistory: clearHistory,
    clearAllBookmarks: clearAllBookmarks,
    renderBookmarks: renderBookmarks,
    loadUrl: loadUrl,
    getCurrentUrl: () => localStorage.getItem(BROWSER_URL_KEY) || ''
  };

  // =========================
  // Additional Instances Support
  // =========================
  let browserInstanceCounter = 1;

  function spawnNewWebBrowserInstance(initialUrl) {
    try {
      const workspace = document.getElementById('canvasWorkspace') || document.body;
      const id = `floatingWebBrowser-${++browserInstanceCounter}`;

      const el = document.createElement('div');
      el.className = 'floating-web-browser';
      el.id = id;
      el.style.left = '960px';
      el.style.top = (120 + (browserInstanceCounter * 20)) + 'px';
      el.style.display = 'flex';
      el.innerHTML = `
        <button class="close-widget-btn" title="Close Browser">✕</button>
        <button class="settings-btn" title="Browser Settings">⚙️</button>
        <div class="resize-handle"></div>
        <div class="browser-header">🌐 Web Browser</div>
        <div class="browser-toolbar">
          <button class="browser-nav-btn" title="Back" disabled>←</button>
          <button class="browser-nav-btn" title="Forward" disabled>→</button>
          <button class="browser-nav-btn" title="Refresh">↻</button>
          <button class="browser-nav-btn" title="Home">🏠</button>
          <input type="text" placeholder="Enter URL or search..." class="browser-url-input">
          <button class="browser-go-btn" title="Go">Go</button>
          <button class="browser-nav-btn" title="New Instance">↗</button>
        </div>
        <div class="browser-content">
          <iframe class="browser-iframe" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-modals allow-downloads" allowfullscreen></iframe>
          <div class="browser-error-overlay" style="display:none;">
            <div class="browser-error-content">
              <div class="browser-error-icon">🧱</div>
              <h3>Page load blocked or failed</h3>
              <p id="${id}-errorMessage">This site may block embedding or failed to load.</p>
              <div class="browser-error-actions">
                <button class="browser-error-btn" data-action="open">Open in new tab</button>
                <button class="browser-error-btn" data-action="retry">Try again</button>
              </div>
            </div>
          </div>
        </div>
      `;

      workspace.appendChild(el);

      // Make draggable/resizable
      if (window.makeDraggable) makeDraggable(el, '.browser-header', id);
      if (window.makeResizable) makeResizable(el, id);
      
      // Add interaction handlers to bring to front
      if (window.addWidgetInteractionHandlers) {
        window.addWidgetInteractionHandlers(el);
      }

      // Wire up instance-specific behavior
      initBrowserInstance(el, initialUrl);
      return el;
    } catch (e) {
      console.error('Failed to spawn web browser instance', e);
    }
  }

  function initBrowserInstance(root, initialUrl) {
    const urlInput = root.querySelector('.browser-url-input');
    const goBtn = root.querySelector('.browser-go-btn');
    const iframe = root.querySelector('.browser-iframe');
    const backBtn = root.querySelector('.browser-nav-btn[title="Back"]');
    const fwdBtn = root.querySelector('.browser-nav-btn[title="Forward"]');
    const refreshBtn = root.querySelector('.browser-nav-btn[title="Refresh"]');
    const homeBtn = root.querySelector('.browser-nav-btn[title="Home"]');
    const newInstBtn = root.querySelector('.browser-nav-btn[title="New Instance"]');
    const closeBtn = root.querySelector('.close-widget-btn');
    const errorOverlay = root.querySelector('.browser-error-overlay');
    const errorOpen = root.querySelector('.browser-error-btn[data-action="open"]');
    const errorRetry = root.querySelector('.browser-error-btn[data-action="retry"]');

    let hist = [];
    let idx = -1;

    function setNavState() {
      if (backBtn) backBtn.disabled = idx <= 0;
      if (fwdBtn) fwdBtn.disabled = idx >= hist.length - 1;
    }

    function hideErr() { if (errorOverlay) errorOverlay.style.display = 'none'; }
    function showErr(msg) {
      if (!errorOverlay) return;
      const msgEl = root.querySelector(`#${root.id}-errorMessage`);
      if (msgEl) msgEl.textContent = msg;
      errorOverlay.style.display = 'flex';
    }

    function navigate(url, addHist = true) {
      if (!url) return;
      let finalUrl = url.trim();
      if (!finalUrl.match(/^https?:\/\//i) && !finalUrl.includes('.')) {
        const searchEngine = localStorage.getItem('browserSearchEngine') || 'google';
        const searchUrls = { google: 'https://www.google.com/search?q=', bing: 'https://www.bing.com/search?q=', duckduckgo: 'https://duckduckgo.com/?q=' };
        finalUrl = searchUrls[searchEngine] + encodeURIComponent(finalUrl);
      } else if (!finalUrl.match(/^https?:\/\//i)) {
        finalUrl = 'https://' + finalUrl;
      }

      hideErr();
      try {
        iframe.style.opacity = '0.5';
        iframe.src = finalUrl;
        if (urlInput) urlInput.value = finalUrl;
        if (addHist) {
          hist = hist.slice(0, idx + 1);
          hist.push(finalUrl);
          idx = hist.length - 1;
        }
        setNavState();
      } catch (e) {
        console.error('Instance load error', e);
        iframe.style.opacity = '1';
        showErr('Invalid URL. Please enter a valid web address.');
      }
    }

    iframe.addEventListener('load', () => { iframe.style.opacity = '1'; hideErr(); setNavState(); });
    iframe.addEventListener('error', () => showErr('Failed to load or embedding blocked.'));

    if (goBtn) goBtn.onclick = () => navigate(urlInput.value);
    if (urlInput) urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(urlInput.value); });
    if (backBtn) backBtn.onclick = () => { if (idx > 0) { idx--; navigate(hist[idx], false); } };
    if (fwdBtn) fwdBtn.onclick = () => { if (idx < hist.length - 1) { idx++; navigate(hist[idx], false); } };
    if (refreshBtn) refreshBtn.onclick = () => { if (iframe.src) iframe.src = iframe.src; };
    if (homeBtn) homeBtn.onclick = () => { const home = localStorage.getItem(BROWSER_HOME_KEY) || 'https://en.wikipedia.org'; navigate(home); };
    if (newInstBtn) newInstBtn.onclick = () => spawnNewWebBrowserInstance(urlInput?.value || '');
    if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); root.remove(); };
    if (errorOpen) errorOpen.onclick = () => window.open(urlInput?.value || iframe?.src || '', '_blank');
    if (errorRetry) errorRetry.onclick = () => navigate(urlInput?.value || iframe?.src || '', false);

    // initial URL
    navigate(initialUrl || (localStorage.getItem(BROWSER_HOME_KEY) || 'https://en.wikipedia.org'), false);
  }
})();
