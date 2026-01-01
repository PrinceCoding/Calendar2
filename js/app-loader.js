// =========================
// DYNAMIC APP LOADER
// Only loads code for installed/enabled apps
// =========================

(function() {
  'use strict';

  // App templates - HTML structure for each app
  const APP_TEMPLATES = {
    clock: () => `
      <div class="analog-clock glass-card hidden" id="analogClock">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('analogClock')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    `,
    
    pomodoro: () => `
      <div class="floating-pomo glass-card hidden" id="floatingPomo">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingPomo')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6 flex flex-col items-center gap-4">
          <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <i data-lucide="timer" class="w-6 h-6"></i>
            <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-purple-600 to-pink-600">Pomodoro Timer</h3>
          </div>
          <div id="pomoDisplay" class="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">25:00</div>
          <div class="flex gap-2">
            <button id="pomoStart" class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <div class="flex items-center gap-2">
                <i data-lucide="play" class="w-5 h-5"></i>
                <span>Start</span>
              </div>
            </button>
            <button id="pomoReset" class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <div class="flex items-center gap-2">
                <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
                <span>Reset</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    `,

    'ambient-sounds': () => `
      <div class="floating-ambient glass-card hidden" id="floatingAmbient">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingAmbient')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400">
            <i data-lucide="music" class="w-6 h-6"></i>
            <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-blue-600 to-purple-600">Ambient Sounds</h3>
          </div>
          <div id="soundsGrid" class="grid grid-cols-2 gap-3"></div>
        </div>
      </div>
    `,

    todo: () => `
      <div class="floating-todo glass-card hidden" id="floatingTodo">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingTodo')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6 flex flex-col h-full">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
              <i data-lucide="check-square" class="w-6 h-6"></i>
              <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-green-600 to-emerald-600">To-Do List</h3>
            </div>
          </div>
          <div class="flex gap-2 mb-4">
            <input type="text" id="todoInput" placeholder="Add a new task..." class="flex-1 px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200" />
            <button onclick="addTodo()" class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <i data-lucide="plus" class="w-5 h-5"></i>
            </button>
          </div>
          <div id="todoList" class="flex-1 overflow-y-auto space-y-2"></div>
        </div>
      </div>
    `,

    countdown: () => `
      <div class="floating-countdown glass-card hidden" id="floatingCountdown">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingCountdown')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-6 text-orange-600 dark:text-orange-400">
            <i data-lucide="clock" class="w-6 h-6"></i>
            <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-orange-600 to-red-600">Countdown</h3>
          </div>
          <div id="countdownList" class="space-y-3"></div>
          <button onclick="addCountdown()" class="mt-4 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-center justify-center gap-2">
              <i data-lucide="plus" class="w-5 h-5"></i>
              <span>Add Countdown</span>
            </div>
          </button>
        </div>
      </div>
    `,

    calculator: () => `
      <div class="floating-calculator glass-card hidden" id="floatingCalculator">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingCalculator')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
            <i data-lucide="calculator" class="w-6 h-6"></i>
            <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-indigo-600 to-purple-600">Calculator</h3>
          </div>
          <input type="text" id="calcDisplay" readonly class="w-full px-4 py-6 mb-4 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-right text-2xl font-mono" value="0" />
          <div id="calcButtons" class="grid grid-cols-4 gap-2"></div>
        </div>
      </div>
    `,

    events: () => `
      <div class="floating-events glass-card hidden" id="floatingEvents">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingEvents')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6 flex flex-col h-full">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 text-pink-600 dark:text-pink-400">
              <i data-lucide="calendar-days" class="w-6 h-6"></i>
              <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-pink-600 to-rose-600">Events</h3>
            </div>
          </div>
          <div class="space-y-3 mb-4">
            <input type="date" id="eventDate" class="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 transition-all duration-200" />
            <input type="text" id="eventTitle" placeholder="Event title..." class="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 transition-all duration-200" />
            <button onclick="addEvent()" class="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <div class="flex items-center justify-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Add Event</span>
              </div>
            </button>
          </div>
          <div id="eventsList" class="flex-1 overflow-y-auto space-y-2"></div>
        </div>
      </div>
    `,

    calendar: () => `
      <div class="floating-calendar glass-card hidden" id="floatingCalendar">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingCalendar')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <i data-lucide="calendar" class="w-6 h-6"></i>
              <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-cyan-600 to-blue-600">Calendar</h3>
            </div>
            <div class="flex gap-2">
              <button id="prevYear" class="px-3 py-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg transition-all duration-200">
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
              </button>
              <span id="currentYear" class="px-4 py-2 font-bold text-lg">2026</span>
              <button id="nextYear" class="px-3 py-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg transition-all duration-200">
                <i data-lucide="chevron-right" class="w-5 h-5"></i>
              </button>
            </div>
          </div>
          <div id="calendarGrid" class="grid grid-cols-3 gap-4"></div>
        </div>
      </div>
    `,

    notes: () => `
      <div class="floating-notes glass-card hidden" id="floatingNotes">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingNotes')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6 flex flex-col h-full">
          <div class="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
            <i data-lucide="sticky-note" class="w-6 h-6"></i>
            <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-amber-600 to-yellow-600">Notes</h3>
          </div>
          <textarea id="notesText" placeholder="Write your notes here..." class="flex-1 px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all duration-200 resize-none"></textarea>
        </div>
      </div>
    `,

    'web-browser': () => `
      <div class="floating-web-browser glass-card hidden" id="floatingWebBrowser">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('floatingWebBrowser')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6 flex flex-col h-full">
          <div class="flex items-center gap-2 mb-4 text-violet-600 dark:text-violet-400">
            <i data-lucide="globe" class="w-6 h-6"></i>
            <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-violet-600 to-purple-600">Web Browser</h3>
          </div>
          <div class="flex gap-2 mb-4">
            <input type="url" id="browserUrl" placeholder="Enter URL..." class="flex-1 px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 transition-all duration-200" />
            <button onclick="loadUrl()" class="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
          </div>
          <iframe id="browserFrame" class="flex-1 w-full rounded-lg border border-gray-200 dark:border-gray-700"></iframe>
        </div>
      </div>
    `,

    'canvas-manager': () => `
      <div class="canvas-manager glass-card hidden" id="canvasManager">
        <button class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-10" onclick="closeWidget('canvasManager')">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-6 text-emerald-600 dark:text-emerald-400">
            <i data-lucide="layout-grid" class="w-6 h-6"></i>
            <h3 class="text-xl font-bold gradient-text bg-gradient-to-r from-emerald-600 to-teal-600">Canvas Manager</h3>
          </div>
          <div id="canvasManagerContent"></div>
        </div>
      </div>
    `
  };

  // Load app dynamically
  window.loadApp = function(appId) {
    // Check if already loaded
    if (document.querySelector(`#${getAppElementId(appId)}`)) {
      return; // Already loaded
    }

    // Get template
    const template = APP_TEMPLATES[appId];
    if (!template) {
      console.warn(`No template found for app: ${appId}`);
      return;
    }

    // Insert HTML
    const container = document.getElementById('canvasWorkspace');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = template();
    container.appendChild(tempDiv.firstElementChild);

    // Reinitialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Load app-specific JS
    loadAppScript(appId);

    console.log(`✅ Loaded app: ${appId}`);
  };

  // Unload app when uninstalled
  window.unloadApp = function(appId) {
    const elementId = getAppElementId(appId);
    const element = document.getElementById(elementId);
    if (element) {
      element.remove();
      console.log(`🗑️ Unloaded app: ${appId}`);
    }
  };

  // Helper to get element ID from app ID
  function getAppElementId(appId) {
    const idMap = {
      'clock': 'analogClock',
      'pomodoro': 'floatingPomo',
      'ambient-sounds': 'floatingAmbient',
      'todo': 'floatingTodo',
      'countdown': 'floatingCountdown',
      'calculator': 'floatingCalculator',
      'events': 'floatingEvents',
      'calendar': 'floatingCalendar',
      'notes': 'floatingNotes',
      'web-browser': 'floatingWebBrowser',
      'canvas-manager': 'canvasManager'
    };
    return idMap[appId] || appId;
  }

  // Load app-specific JavaScript
  function loadAppScript(appId) {
    const scriptPath = `apps/${appId}/${appId}.js`;
    
    // Check if already loaded
    if (document.querySelector(`script[src="${scriptPath}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = scriptPath;
    script.async = true;
    script.onerror = () => console.warn(`Could not load script for ${appId}`);
    document.body.appendChild(script);
  }

  // Initialize - load apps from localStorage
  window.addEventListener('DOMContentLoaded', () => {
    // Get installed apps from localStorage
    const installedApps = JSON.parse(localStorage.getItem('installedApps') || '[]');
    
    // Default preinstalled apps if none set
    const defaultApps = ['clock', 'pomodoro', 'todo', 'calendar', 'notes'];
    const appsToLoad = installedApps.length > 0 ? installedApps : defaultApps;
    
    // Load each installed app
    appsToLoad.forEach(appId => {
      loadApp(appId);
    });

    console.log(`📦 Loaded ${appsToLoad.length} apps`);
  });

})();
