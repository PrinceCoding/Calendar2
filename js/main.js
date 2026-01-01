// =========================
// CORE APPLICATION LOGIC
// =========================

// Settings and UI Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsPage = document.getElementById('settingsPage');
const closeSettings = document.getElementById('closeSettings');
const notesEditor = document.getElementById('notesEditor');
const toolButtons = document.querySelectorAll('.notes-tools button');

// =========================
// DATE/TIME
// =========================
function updateTime() {
  const d = new Date();
  const dtText = document.getElementById('dtText');
  if(dtText) {
    dtText.textContent = d.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' }) + ' • ' + d.toLocaleTimeString();
  }
}

updateTime();
setInterval(updateTime, 1000);

// =========================
// NOTES FORMATTING TOOLS
// =========================
toolButtons.forEach(b => b.onclick = () => {
  document.execCommand(b.dataset.cmd);
  updateToolStates();
});

function updateToolStates() {
  toolButtons.forEach(btn => {
    const cmd = btn.dataset.cmd;
    try {
      const isActive = document.queryCommandState(cmd);
      btn.classList.toggle('active', isActive);
    } catch (e) {}
  });
}

document.addEventListener('selectionchange', () => {
  if (document.activeElement === notesEditor) {
    updateToolStates();
  }
});

// =========================
// FONT SIZE CONTROLS
// =========================
const fontButtons = document.querySelectorAll('.font-btn');
fontButtons.forEach(btn => {
  btn.onclick = () => {
    const size = btn.dataset.size;
    document.documentElement.style.fontSize = size + '%';
    localStorage.setItem('fontSize', size);
  };
});

const savedFontSize = localStorage.getItem('fontSize');
if (savedFontSize) {
  document.documentElement.style.fontSize = savedFontSize + '%';
}

// =========================
// SETTINGS PAGE
// =========================
settingsBtn.onclick = () => { settingsPage.style.display = 'block'; };
closeSettings.onclick = (e) => { e.stopPropagation(); settingsPage.style.display = 'none'; };

settingsPage.addEventListener('click', (e) => {
  if (e.target === settingsPage) {
    settingsPage.style.display = 'none';
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && settingsPage.style.display === 'block') {
    settingsPage.style.display = 'none';
  }
});

// =========================
// DEVICE ID
// =========================
const DEVICE_ID_KEY = 'device_id';
let deviceId = localStorage.getItem(DEVICE_ID_KEY);
if (!deviceId) {
  deviceId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}
window.deviceId = deviceId;

// =========================
// POMODORO LOGIC
// =========================
let defaultPomoMinutes = 60;
let defaultBreakMinutes = 5;
let defaultLongBreakMinutes = 15;
let isBreakMode = false;
let isLongBreak = false;
let secs = defaultPomoMinutes * 60;
let timer = null;
let anchorStartMs = null;
let anchorRemaining = null;
let isApplyingRemote = false;

const pomoDurationInput = document.getElementById('pomoFocusDuration');
if (pomoDurationInput) {
  pomoDurationInput.value = defaultPomoMinutes;
}

function updatePomoDisplay() {
  const minStr = String(Math.floor(secs/60)).padStart(2,'0');
  const secStr = String(secs%60).padStart(2,'0');
  const timeText = `${minStr}:${secStr}`;
  const pt = document.getElementById('pomoTime');
  const fpt = document.getElementById('floatingPomoTime');
  const pomoMode = document.getElementById('pomoMode');
  const progressCircle = document.getElementById('pomoProgressCircle');
  
  if(pt) pt.textContent = timeText;
  if(fpt) fpt.textContent = timeText;
  if(pomoMode) pomoMode.textContent = isLongBreak ? 'Long Break' : (isBreakMode ? 'Break' : 'Focus');
  
  // Update progress circle
  let totalSecs;
  if (isLongBreak) {
    totalSecs = defaultLongBreakMinutes * 60;
  } else {
    totalSecs = isBreakMode ? (defaultBreakMinutes * 60) : (defaultPomoMinutes * 60);
  }
  const progress = (secs / totalSecs) * 100;
  const circumference = 2 * Math.PI * 75;
  const offset = circumference - (progress / 100) * circumference;
  
  if(progressCircle) {
    progressCircle.style.strokeDashoffset = offset;
  }
}

function setStartButtons(running) {
  const ps = document.getElementById('pomoStart');
  const fps = document.getElementById('floatingPomoStart');
  if (ps) ps.textContent = running ? '⏸' : '▶';
  if (fps) fps.textContent = running ? '⏸' : '▶';
}

async function syncToCloud(runningFlag, extra = {}) {
  try {
    if (!window.auth || !window.auth.currentUser) {
      console.log('[POMO] ⏸ Not syncing - user not authenticated');
      return;
    }
    if (!window.db || !window.doc || !window.setDoc || !window.serverTimestamp) {
      console.log('[POMO] ⏸ Not syncing - Firebase not ready');
      return;
    }
    const ref = window.doc(window.db, 'user_pomodoro', window.auth.currentUser.uid);
    await window.setDoc(ref, Object.assign({
      duration: defaultPomoMinutes,
      running: !!runningFlag,
      by: deviceId,
      updatedAt: window.serverTimestamp()
    }, extra), { merge: true });
    console.log('[POMO] ✅ Synced to cloud:', { running: runningFlag, ...extra });
  } catch (err) {
    console.error('[POMO] ❌ Cloud sync failed:', err);
  }
}

function clearLocalTimer() {
  if (timer) { clearInterval(timer); timer = null; }
}

function startLocalDisplayFromAnchor(remainAtStart, startedAtMs) {
  clearLocalTimer();
  anchorRemaining = remainAtStart;
  anchorStartMs = startedAtMs;
  setStartButtons(true);
  const tick = () => {
    const elapsed = Math.floor((Date.now() - anchorStartMs) / 1000);
    const left = Math.max(0, Math.round(anchorRemaining - elapsed));
    secs = left;
    updatePomoDisplay();
    if (left <= 0) {
      clearLocalTimer();
      setStartButtons(false);
    }
  };
  tick();
  timer = setInterval(tick, 1000);
}

function togglePomo() {
  console.log('[POMO] Toggle clicked, timer active:', !!timer);
  if (timer) {
    clearLocalTimer();
    setStartButtons(false);
    console.log('[POMO] ⏸ Paused at', secs, 'seconds');
    syncToCloud(false, { remaining: secs, startedAt: null, isBreak: isBreakMode, isLongBreak: isLongBreak });
    return;
  }
  const remainAtStart = secs;
  const startedNow = Date.now();
  startLocalDisplayFromAnchor(remainAtStart, startedNow);
  console.log('[POMO] ▶ Started with', remainAtStart, 'seconds remaining');
  syncToCloud(true, { remaining: remainAtStart, startedAt: startedNow, isBreak: isBreakMode, isLongBreak: isLongBreak });
}

function resetPomo() {
  console.log('[POMO] ⟳ Reset to', defaultPomoMinutes, 'minutes');
  clearLocalTimer();
  if (isLongBreak) {
    secs = defaultLongBreakMinutes * 60;
  } else {
    secs = isBreakMode ? (defaultBreakMinutes * 60) : (defaultPomoMinutes * 60);
  }
  updatePomoDisplay();
  setStartButtons(false);
  syncToCloud(false, { remaining: secs, startedAt: null, isBreak: isBreakMode, isLongBreak: isLongBreak });
}

function toggleBreakMode(newMode) {
  if (newMode === 'focus') {
    isBreakMode = false;
    isLongBreak = false;
    secs = defaultPomoMinutes * 60;
  } else if (newMode === 'break') {
    isBreakMode = true;
    isLongBreak = false;
    secs = defaultBreakMinutes * 60;
  } else if (newMode === 'longbreak') {
    isBreakMode = true;
    isLongBreak = true;
    secs = defaultLongBreakMinutes * 60;
  } else {
    isBreakMode = !isBreakMode;
    isLongBreak = false;
    secs = isBreakMode ? (defaultBreakMinutes * 60) : (defaultPomoMinutes * 60);
  }
  
  console.log('[POMO] Switching to', isLongBreak ? 'long break' : (isBreakMode ? 'break' : 'focus'), 'mode');
  clearLocalTimer();
  updatePomoDisplay();
  setStartButtons(false);
  
  const focusBtn = document.getElementById('pomoFocusBtn');
  const breakBtn = document.getElementById('pomoBreakBtn');
  const longBreakBtn = document.getElementById('pomoLongBreakBtn');
  if (focusBtn && breakBtn && longBreakBtn) {
    focusBtn.classList.remove('active');
    breakBtn.classList.remove('active');
    longBreakBtn.classList.remove('active');
    
    if (isLongBreak) {
      longBreakBtn.classList.add('active');
    } else if (isBreakMode) {
      breakBtn.classList.add('active');
    } else {
      focusBtn.classList.add('active');
    }
  }
  
  syncToCloud(false, { remaining: secs, startedAt: null, isBreak: isBreakMode, isLongBreak: isLongBreak });
}

window.resetPomoTimer = function(newDuration) {
  if (newDuration) {
    defaultPomoMinutes = newDuration;
  }
  resetPomo();
  const pomoInput = document.getElementById('pomoFocusDuration');
  if (pomoInput) {
    pomoInput.value = defaultPomoMinutes;
  }
};

if (pomoDurationInput) {
  pomoDurationInput.onchange = () => {
    const val = Math.max(1, Number(pomoDurationInput.value) || 60);
    console.log('[POMO] Duration changed to', val, 'minutes');
    defaultPomoMinutes = val;
    secs = val * 60;
    updatePomoDisplay();
    clearLocalTimer();
    setStartButtons(false);
    syncToCloud(false, { remaining: secs, startedAt: null });
  };
}

const pomoStartBtn = document.getElementById('pomoStart');
const floatingPomoStartBtn = document.getElementById('floatingPomoStart');
const pomoResetBtn = document.getElementById('pomoReset');
const floatingPomoResetBtn = document.getElementById('floatingPomoReset');
const pomoFocusBtn = document.getElementById('pomoFocusBtn');
const pomoBreakBtn = document.getElementById('pomoBreakBtn');
const pomoLongBreakBtn = document.getElementById('pomoLongBreakBtn');

if (pomoFocusBtn) {
  pomoFocusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBreakMode('focus');
  });
}
if (pomoBreakBtn) {
  pomoBreakBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBreakMode('break');
  });
}
if (pomoLongBreakBtn) {
  pomoLongBreakBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBreakMode('longbreak');
  });
}

if (pomoStartBtn) {
  pomoStartBtn.onclick = (e) => {
    e.stopPropagation();
    togglePomo();
  };
  pomoStartBtn.style.pointerEvents = 'auto';
}
if (floatingPomoStartBtn) {
  floatingPomoStartBtn.onclick = (e) => {
    e.stopPropagation();
    togglePomo();
  };
  floatingPomoStartBtn.style.pointerEvents = 'auto';
}
if (pomoResetBtn) {
  pomoResetBtn.onclick = (e) => {
    e.stopPropagation();
    resetPomo();
  };
  pomoResetBtn.style.pointerEvents = 'auto';
}
if (floatingPomoResetBtn) {
  floatingPomoResetBtn.onclick = (e) => {
    e.stopPropagation();
    resetPomo();
  };
  floatingPomoResetBtn.style.pointerEvents = 'auto';
}

updatePomoDisplay();

window.applyRemoteState = (data) => {
  try {
    if (!data) return;
    
    console.log('[POMO] Applying remote state:', data);

    if (typeof data.duration === 'number' && data.duration > 0 && data.duration !== defaultPomoMinutes) {
      defaultPomoMinutes = data.duration;
      if (pomoDurationInput) pomoDurationInput.value = defaultPomoMinutes;
    }

    if (typeof data.isBreak === 'boolean') {
      isBreakMode = data.isBreak;
    }
    if (typeof data.isLongBreak === 'boolean') {
      isLongBreak = data.isLongBreak;
    }
    
    const focusBtn = document.getElementById('pomoFocusBtn');
    const breakBtn = document.getElementById('pomoBreakBtn');
    const longBreakBtn = document.getElementById('pomoLongBreakBtn');
    if (focusBtn && breakBtn && longBreakBtn) {
      focusBtn.classList.remove('active');
      breakBtn.classList.remove('active');
      longBreakBtn.classList.remove('active');
      
      if (isLongBreak) {
        longBreakBtn.classList.add('active');
      } else if (isBreakMode) {
        breakBtn.classList.add('active');
      } else {
        focusBtn.classList.add('active');
      }
    }

    const running = !!data.running;
    const remaining = (typeof data.remaining === 'number' && data.remaining >= 0)
      ? data.remaining
      : (typeof data.secs === 'number' ? data.secs : defaultPomoMinutes * 60);

    if (running && data.startedAt) {
      const startedAtMs = (typeof data.startedAt.toMillis === 'function')
        ? data.startedAt.toMillis()
        : (typeof data.startedAt === 'number' ? data.startedAt : Date.now());
      console.log('[POMO] Restoring running timer from', startedAtMs, 'with', remaining, 'seconds');
      startLocalDisplayFromAnchor(remaining, startedAtMs);
    } else if (running) {
      console.log('[POMO] Fallback: Starting timer with', remaining, 'seconds');
      startLocalDisplayFromAnchor(remaining, Date.now());
    } else {
      clearLocalTimer();
      secs = remaining;
      updatePomoDisplay();
      setStartButtons(false);
    }
  } catch (e) {
    console.error('[POMO] applyRemoteState error:', e);
  }
};

// =========================
// THEMES
// =========================
const themes = [
  { name: '🍎 macOS', class: '' },
  { name: '🌙 Dark', class: 'dark' },
  { name: '🌊 Ocean', class: 'theme-ocean' },
  { name: '🌲 Forest', class: 'theme-forest' },
  { name: '🌅 Solar', class: 'theme-solar' },
  { name: '💎 Glass', class: 'theme-glass' }
];

let themeIndex = parseInt(localStorage.getItem('selectedThemeIndex')) || 0;

const savedTheme = themes[themeIndex];
if (savedTheme) {
  document.body.classList.remove('dark','theme-ocean','theme-forest','theme-solar','theme-glass');
  if (savedTheme.class) document.body.classList.add(savedTheme.class);
  themeBtn.textContent = savedTheme.name;
}

themeBtn.onclick = () => {
  document.body.classList.remove('dark','theme-ocean','theme-forest','theme-solar','theme-glass');
  themeIndex = (themeIndex + 1) % themes.length;
  const t = themes[themeIndex];
  if (t.class) document.body.classList.add(t.class);
  themeBtn.textContent = t.name;
  localStorage.setItem('selectedThemeIndex', themeIndex.toString());
  console.log('Theme saved:', t.name);
};

// =========================
// APP LAUNCHER & DRAWER
// =========================
const appLauncherBtn = document.getElementById('appLauncherBtn');
const appDrawer = document.getElementById('appDrawer');
const toggleCalendarApp = document.getElementById('toggleCalendarApp');
const toggleClockApp = document.getElementById('toggleClockApp');
const togglePomoApp = document.getElementById('togglePomoApp');
const toggleTodoApp = document.getElementById('toggleTodoApp');
const toggleCountdownApp = document.getElementById('toggleCountdownApp');
const toggleEventsApp = document.getElementById('toggleEventsApp');
const toggleNotesApp = document.getElementById('toggleNotesApp');
const toggleWebBrowserApp = document.getElementById('toggleWebBrowserApp');
const toggleCanvasManagerApp = document.getElementById('toggleCanvasManagerApp');
const toggleAmbientApp = document.getElementById('toggleAmbientApp');
const toggleAppStoreApp = document.getElementById('toggleAppStoreApp');

if (appLauncherBtn) {
  appLauncherBtn.onclick = () => {
    if (appDrawer.style.display === 'block') {
      appDrawer.style.display = 'none';
    } else {
      appDrawer.style.display = 'block';
      
      if (window.syncAppStoreToggleStates) {
        setTimeout(window.syncAppStoreToggleStates, 50);
      }
    }
  };
}

if (appDrawer) {
  appDrawer.onclick = (e) => {
    if (e.target === appDrawer) {
      appDrawer.style.display = 'none';
    }
  };
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && appDrawer.style.display === 'block') {
    appDrawer.style.display = 'none';
  }
});

// =========================
// WIDGET VISIBILITY
// =========================
const clock = document.getElementById('analogClock');
const closeClockBtn = document.getElementById('closeClockBtn');
const floatingPomo = document.getElementById('floatingPomo');
const closePomoBtn = document.getElementById('closePomoBtn');
const floatingTodo = document.getElementById('floatingTodo');
const closeTodoBtn = document.getElementById('closeTodoBtn');
const floatingCountdown = document.getElementById('floatingCountdown');
const closeCountdownBtn = document.getElementById('closeCountdownBtn');
const floatingEvents = document.getElementById('floatingEvents');
const closeEventsBtn = document.getElementById('closeEventsBtn');
const floatingCalendar = document.getElementById('floatingCalendar');
const closeCalendarBtn = document.getElementById('closeCalendarBtn');
const floatingNotes = document.getElementById('floatingNotes');
const closeNotesBtn = document.getElementById('closeNotesBtn');
const floatingWebBrowser = document.getElementById('floatingWebBrowser');
const closeWebBrowserBtn = document.getElementById('closeWebBrowserBtn');
const canvasManager = document.getElementById('canvasManager');
const closeCanvasManagerBtn = document.getElementById('closeCanvasManagerBtn');
const floatingAmbient = document.getElementById('floatingAmbient');
const closeAmbientBtn = document.getElementById('closeAmbientBtn');

const CLOCK_VIS_KEY = 'show_analog_clock';
const POMO_VIS_KEY = 'show_floating_pomo';
const TODO_VIS_KEY = 'show_floating_todo';
const COUNTDOWN_VIS_KEY = 'show_floating_countdown';
const EVENTS_VIS_KEY = 'show_floating_events';
const CALENDAR_VIS_KEY = 'show_floating_calendar';
const NOTES_VIS_KEY = 'show_floating_notes';
const WEB_BROWSER_VIS_KEY = 'show_web_browser';
const CANVAS_TABS_VIS_KEY = 'show_canvas_tabs';
const AMBIENT_VIS_KEY = 'show_ambient_sounds';

function updateCalendarVisibility(visible) {
  if (window.updateCalendarVisibility) {
    window.updateCalendarVisibility(visible);
  }
}

function updateClockVisibility(visible) {
  if (!clock) return;
  clock.style.display = visible ? 'block' : 'none';
  if (visible) bringToFront(clock);
  if (toggleClockApp) toggleClockApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}

function updatePomoVisibility(visible) {
  if (!floatingPomo) return;
  floatingPomo.style.display = visible ? 'block' : 'none';
  if (visible) bringToFront(floatingPomo);
  if (togglePomoApp) togglePomoApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}

function updateTodoVisibility(visible) {
  if (!floatingTodo) return;
  floatingTodo.style.display = visible ? 'flex' : 'none';
  if (visible) bringToFront(floatingTodo);
  if (toggleTodoApp) toggleTodoApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}

function updateCountdownVisibility(visible) {
  if (!floatingCountdown) return;
  floatingCountdown.style.display = visible ? 'flex' : 'none';
  if (visible) bringToFront(floatingCountdown);
  if (toggleCountdownApp) toggleCountdownApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}

function updateEventsVisibility(visible) {
  if (!floatingEvents) return;
  floatingEvents.style.display = visible ? 'flex' : 'none';
  if (visible) bringToFront(floatingEvents);
  if (toggleEventsApp) toggleEventsApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}
window.updateEventsVisibility = updateEventsVisibility;

function updateNotesVisibility(visible) {
  if (!floatingNotes) return;
  floatingNotes.style.display = visible ? 'flex' : 'none';
  if (visible) bringToFront(floatingNotes);
  if (toggleNotesApp) toggleNotesApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}
window.updateNotesVisibility = updateNotesVisibility;

function updateWebBrowserVisibility(visible) {
  if (!floatingWebBrowser) return;
  floatingWebBrowser.style.display = visible ? 'flex' : 'none';
  if (visible) bringToFront(floatingWebBrowser);
  if (toggleWebBrowserApp) toggleWebBrowserApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}
window.updateWebBrowserVisibility = updateWebBrowserVisibility;

function updateCanvasManagerVisibility(visible) {
  if (!canvasManager) return;
  canvasManager.style.display = visible ? 'flex' : 'none';
  if (visible) bringToFront(canvasManager);
  if (toggleCanvasManagerApp) toggleCanvasManagerApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}
window.updateCanvasManagerVisibility = updateCanvasManagerVisibility;

function updateAmbientVisibility(visible) {
  if (!floatingAmbient) return;
  floatingAmbient.style.display = visible ? 'flex' : 'none';
  if (visible) bringToFront(floatingAmbient);
  if (toggleAmbientApp) toggleAmbientApp.classList.toggle('active', !!visible);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}
window.updateAmbientVisibility = updateAmbientVisibility;

function updateAppStoreVisibility(visible) {
  const appStore = window.appStoreWidget || document.getElementById('appStore');
  if (!appStore) return;
  appStore.style.display = visible ? 'flex' : 'none';
  if (toggleAppStoreApp) toggleAppStoreApp.classList.toggle('active', !!visible);
  if (visible) bringToFront(appStore);
  if (window.saveCurrentCanvas) window.saveCurrentCanvas();
}
window.updateAppStoreVisibility = updateAppStoreVisibility;

// App toggle click handlers
if (toggleCalendarApp) {
  toggleCalendarApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingCalendar && floatingCalendar.style.display !== 'none';
    updateCalendarVisibility(!isVisible);
  };
}

if (toggleClockApp) {
  toggleClockApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = clock && clock.style.display !== 'none';
    updateClockVisibility(!isVisible);
  };
}
if (togglePomoApp) {
  togglePomoApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingPomo && floatingPomo.style.display !== 'none';
    updatePomoVisibility(!isVisible);
  };
}
if (toggleTodoApp) {
  toggleTodoApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingTodo && floatingTodo.style.display !== 'none';
    updateTodoVisibility(!isVisible);
  };
}
if (toggleCountdownApp) {
  toggleCountdownApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingCountdown && floatingCountdown.style.display !== 'none';
    updateCountdownVisibility(!isVisible);
  };
}
if (toggleEventsApp) {
  toggleEventsApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingEvents && floatingEvents.style.display !== 'none';
    updateEventsVisibility(!isVisible);
  };
}
if (toggleNotesApp) {
  toggleNotesApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingNotes && floatingNotes.style.display !== 'none';
    updateNotesVisibility(!isVisible);
  };
}
if (toggleWebBrowserApp) {
  toggleWebBrowserApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingWebBrowser && floatingWebBrowser.style.display !== 'none';
    updateWebBrowserVisibility(!isVisible);
  };
}
if (toggleCanvasManagerApp) {
  toggleCanvasManagerApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = canvasManager && canvasManager.style.display !== 'none';
    updateCanvasManagerVisibility(!isVisible);
  };
}
if (toggleAmbientApp) {
  toggleAmbientApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingAmbient && floatingAmbient.style.display !== 'none';
    updateAmbientVisibility(!isVisible);
  };
}
if (toggleAppStoreApp) {
  toggleAppStoreApp.onclick = (e) => {
    e.stopPropagation();
    const appStore = window.appStoreWidget || document.getElementById('appStore');
    const isVisible = appStore && appStore.style.display !== 'none';
    updateAppStoreVisibility(!isVisible);
  };
}

// Close button handlers
if (closeCalendarBtn) closeCalendarBtn.onclick = (e) => { e.stopPropagation(); updateCalendarVisibility(false); };
if (closeClockBtn) closeClockBtn.onclick = (e) => { e.stopPropagation(); updateClockVisibility(false); };
if (closePomoBtn) closePomoBtn.onclick = (e) => { e.stopPropagation(); updatePomoVisibility(false); };
if (closeTodoBtn) closeTodoBtn.onclick = (e) => { e.stopPropagation(); updateTodoVisibility(false); };
if (closeCountdownBtn) closeCountdownBtn.onclick = (e) => { e.stopPropagation(); updateCountdownVisibility(false); };
if (closeEventsBtn) closeEventsBtn.onclick = (e) => { e.stopPropagation(); updateEventsVisibility(false); };
if (closeNotesBtn) closeNotesBtn.onclick = (e) => { e.stopPropagation(); updateNotesVisibility(false); };
if (closeWebBrowserBtn) closeWebBrowserBtn.onclick = (e) => { e.stopPropagation(); updateWebBrowserVisibility(false); };
if (closeCanvasManagerBtn) closeCanvasManagerBtn.onclick = (e) => { e.stopPropagation(); updateCanvasManagerVisibility(false); };
if (closeAmbientBtn) closeAmbientBtn.onclick = (e) => { e.stopPropagation(); updateAmbientVisibility(false); };

// =========================
// CALCULATOR WIDGET
// =========================
const floatingCalculator = document.getElementById('floatingCalculator');
const calcDisplay = document.getElementById('calcDisplay');
const calcButtons = document.querySelectorAll('.calc-btn');
const closeCalculatorBtn = document.getElementById('closeCalculatorBtn');
const toggleCalculatorApp = document.getElementById('toggleCalculatorApp');
const CALCULATOR_VIS_KEY = 'show_calculator';

let calcExpression = '';
let calcResult = '0';

function updateCalculatorVisibility(visible) {
  if (!floatingCalculator) return;
  floatingCalculator.style.display = visible ? 'flex' : 'none';
  if (visible) bringToFront(floatingCalculator);
  localStorage.setItem(CALCULATOR_VIS_KEY, String(visible));
  if (toggleCalculatorApp) toggleCalculatorApp.classList.toggle('active', !!visible);
}

function updateCalcDisplay(value) {
  if (calcDisplay) calcDisplay.textContent = value;
}

function handleCalculatorInput(input) {
  if (input === 'C') {
    calcExpression = '';
    calcResult = '0';
    updateCalcDisplay('0');
  } else if (input === '=') {
    try {
      const expr = calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      const result = eval(expr);
      calcResult = result.toString();
      updateCalcDisplay(calcResult);
      calcExpression = calcResult;
    } catch (e) {
      updateCalcDisplay('Error');
      calcExpression = '';
      calcResult = '0';
    }
  } else {
    if (calcExpression === '0' || calcExpression === calcResult) {
      calcExpression = input;
    } else {
      calcExpression += input;
    }
    updateCalcDisplay(calcExpression);
  }
}

calcButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const value = btn.dataset.calc;
    if (value) handleCalculatorInput(value);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
    return;
  }
  
  if (floatingCalculator.style.display !== 'flex') return;
  const key = e.key;
  if (/[0-9\+\-\*\/\.\(\)]/.test(key)) {
    e.preventDefault();
    handleCalculatorInput(key);
  } else if (key === 'Enter') {
    e.preventDefault();
    handleCalculatorInput('=');
  } else if (key === 'Escape' || key === 'Backspace') {
    e.preventDefault();
    handleCalculatorInput('C');
  }
});

if (toggleCalculatorApp) {
  toggleCalculatorApp.onclick = (e) => {
    e.stopPropagation();
    const isVisible = floatingCalculator && floatingCalculator.style.display !== 'none';
    updateCalculatorVisibility(!isVisible);
  };
}

if (closeCalculatorBtn) {
  closeCalculatorBtn.onclick = (e) => {
    e.stopPropagation();
    updateCalculatorVisibility(false);
  };
}

(function initCalculatorVisibility() {
  if (toggleCalculatorApp) {
    const savedCalc = localStorage.getItem(CALCULATOR_VIS_KEY);
    const showCalc = savedCalc === null ? false : savedCalc !== 'false';
    toggleCalculatorApp.classList.toggle('active', showCalc);
    if (showCalc) floatingCalculator.style.display = 'flex';
  }
})();

// =========================
// CANVAS WIDGET POSITIONING
// =========================
let highestZIndex = 1000;

function bringToFront(el) {
  if (!el) return;
  highestZIndex++;
  el.style.zIndex = highestZIndex;
}

function constrainWidgetToViewport(el) {
  if (!el) return;
  const minTop = 44;
  let left = parseFloat(el.style.left) || 0;
  let top = parseFloat(el.style.top) || 0;
  
  if (left < 0) left = 0;
  if (top < minTop) top = minTop;
  
  el.style.left = left + 'px';
  el.style.top = top + 'px';
}

function saveWidgetPosition(el, id) {
  if (window.saveCurrentCanvas) {
    window.saveCurrentCanvas();
  }
}

function restoreWidgetPosition(el, id) {
  // Positions are loaded via loadCanvasPositions
}

function adjustAllWidgetsToViewport() {
  const widgets = [
    { el: clock, id: 'analogClock' },
    { el: floatingPomo, id: 'floatingPomo' },
    { el: floatingTodo, id: 'floatingTodo' },
    { el: floatingEvents, id: 'floatingEvents' },
    { el: floatingCalculator, id: 'floatingCalculator' },
    { el: floatingCalendar, id: 'floatingCalendar' },
    { el: floatingNotes, id: 'floatingNotes' },
    { el: floatingWebBrowser, id: 'floatingWebBrowser' }
  ];
  
  widgets.forEach(({ el, id }) => {
    if (el && el.style.left && el.style.top) {
      constrainWidgetToViewport(el);
      saveWidgetPosition(el, id);
    }
  });
}

function makeDraggable(el, handleSelector = null, widgetId = null) {
  if (!el) return;
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  const getPoint = (evt) => {
    if (evt.touches && evt.touches.length) return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    return { x: evt.clientX, y: evt.clientY };
  };

  const startDrag = (e) => {
    if (handleSelector) {
      const handle = el.querySelector(handleSelector);
      if (!handle || !handle.contains(e.target)) return;
    }
    
    if (e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    
    bringToFront(el);
    
    isDragging = true;
    const p = getPoint(e);
    startX = p.x; startY = p.y;
    startLeft = el.offsetLeft; startTop = el.offsetTop;
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    
    el.classList.add('is-dragging');
    document.body.classList.add('dragging-active');
    
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
  };

  const moveDrag = (e) => {
    if (!isDragging) return;
    if (e.type === 'touchmove') {
      e.preventDefault();
    }
    const p = getPoint(e);
    el.style.left = startLeft + (p.x - startX) + 'px';
    el.style.top = startTop + (p.y - startY) + 'px';
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    
    el.classList.remove('is-dragging');
    document.body.classList.remove('dragging-active');
    
    constrainWidgetToViewport(el);
    if (widgetId) saveWidgetPosition(el, widgetId);
  };

  el.addEventListener('mousedown', startDrag);
  el.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('touchmove', moveDrag, { passive: false });
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);
}

function makeResizable(el, widgetId = null) {
  if (!el) return;
  const handle = el.querySelector('.resize-handle');
  if (!handle) return;

  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  const getPoint = (evt) => {
    if (evt.touches && evt.touches.length) return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    return { x: evt.clientX, y: evt.clientY };
  };

  const startResize = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isResizing = true;
    const p = getPoint(e);
    startX = p.x;
    startY = p.y;
    startWidth = el.offsetWidth;
    startHeight = el.offsetHeight;
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  };

  const moveResize = (e) => {
    if (!isResizing) return;
    e.preventDefault();
    const p = getPoint(e);
    const newWidth = Math.max(250, startWidth + (p.x - startX));
    const newHeight = Math.max(200, startHeight + (p.y - startY));
    el.style.width = newWidth + 'px';
    el.style.height = newHeight + 'px';
  };

  const endResize = () => {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    if (widgetId) saveWidgetPosition(el, widgetId);
  };

  handle.addEventListener('mousedown', startResize);
  handle.addEventListener('touchstart', startResize, { passive: false });
  window.addEventListener('mousemove', moveResize);
  window.addEventListener('touchmove', moveResize, { passive: false });
  window.addEventListener('mouseup', endResize);
  window.addEventListener('touchend', endResize);
}

window.makeDraggable = makeDraggable;
window.makeResizable = makeResizable;

makeDraggable(clock, null, 'analogClock');
makeDraggable(floatingPomo, '.pomo-header', 'floatingPomo');
makeDraggable(floatingTodo, '.todo-header', 'floatingTodo');
makeDraggable(floatingCountdown, '.countdown-header', 'floatingCountdown');
makeDraggable(floatingEvents, '.events-header', 'floatingEvents');
makeDraggable(floatingCalculator, '.calc-header', 'floatingCalculator');
makeDraggable(floatingCalendar, '.calendar-header', 'floatingCalendar');
makeDraggable(floatingNotes, '.notes-header', 'floatingNotes');
makeDraggable(floatingWebBrowser, '.browser-header', 'floatingWebBrowser');
makeDraggable(canvasManager, '.canvas-manager-header', 'canvasManager');
makeDraggable(floatingAmbient, '.ambient-header', 'floatingAmbient');

makeResizable(floatingPomo, 'floatingPomo');
makeResizable(floatingTodo, 'floatingTodo');
makeResizable(floatingCountdown, 'floatingCountdown');
makeResizable(floatingEvents, 'floatingEvents');
makeResizable(floatingCalculator, 'floatingCalculator');
makeResizable(floatingCalendar, 'floatingCalendar');
makeResizable(floatingNotes, 'floatingNotes');
makeResizable(floatingWebBrowser, 'floatingWebBrowser');
makeResizable(canvasManager, 'canvasManager');
makeResizable(floatingAmbient, 'floatingAmbient');

const allWidgets = [clock, floatingPomo, floatingTodo, floatingCountdown, floatingEvents, floatingCalculator, floatingCalendar, floatingNotes, floatingWebBrowser, canvasManager, floatingAmbient];

window.addAppStoreToWidgets = function() {
  const appStore = window.appStoreWidget;
  if (appStore && !allWidgets.includes(appStore)) {
    allWidgets.push(appStore);
    window.addWidgetInteractionHandlers(appStore);
    console.log('[WIDGETS] App Store added to allWidgets with interaction handlers');
  }
};

window.addWidgetInteractionHandlers = function(widget) {
  if (!widget) return;
  
  widget.addEventListener('mousedown', (e) => {
    bringToFront(widget);
  });
  widget.addEventListener('click', (e) => {
    bringToFront(widget);
  });
  widget.addEventListener('focus', (e) => {
    bringToFront(widget);
  }, true);
  
  widget.addEventListener('touchstart', (e) => {
    bringToFront(widget);
    widget.classList.add('widget-touched');
    if (touchTimers.has(widget)) {
      clearTimeout(touchTimers.get(widget));
    }
    const timer = setTimeout(() => {
      widget.classList.remove('widget-touched');
      touchTimers.delete(widget);
    }, 3000);
    touchTimers.set(widget, timer);
  });
};

const touchTimers = new Map();

allWidgets.forEach(widget => {
  if (widget) {
    window.addWidgetInteractionHandlers(widget);
  }
});

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(adjustAllWidgetsToViewport, 200);
});

window.addEventListener('orientationchange', () => {
  setTimeout(adjustAllWidgetsToViewport, 300);
});

// =========================
// CANVAS PANNING
// =========================
const canvasWorkspace = document.getElementById('canvasWorkspace');
const canvasHint = document.getElementById('canvasHint');
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let scrollStartX = 0;
let scrollStartY = 0;
let spacePressed = false;

if (canvasHint) {
  setTimeout(() => {
    canvasHint.classList.add('hidden');
  }, 5000);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
    e.preventDefault();
    spacePressed = true;
    canvasWorkspace.style.cursor = 'grab';
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    spacePressed = false;
    canvasWorkspace.style.cursor = '';
    if (isPanning) {
      isPanning = false;
      canvasWorkspace.classList.remove('panning');
    }
  }
});

canvasWorkspace.addEventListener('mousedown', (e) => {
  if ((spacePressed && e.button === 0) || e.button === 1) {
    e.preventDefault();
    isPanning = true;
    canvasWorkspace.classList.add('panning');
    panStartX = e.clientX;
    panStartY = e.clientY;
    scrollStartX = canvasWorkspace.scrollLeft;
    scrollStartY = canvasWorkspace.scrollTop;
  }
});

window.addEventListener('mousemove', (e) => {
  if (isPanning) {
    const deltaX = panStartX - e.clientX;
    const deltaY = panStartY - e.clientY;
    canvasWorkspace.scrollLeft = scrollStartX + deltaX;
    canvasWorkspace.scrollTop = scrollStartY + deltaY;
  }
});

window.addEventListener('mouseup', () => {
  if (isPanning) {
    isPanning = false;
    canvasWorkspace.classList.remove('panning');
  }
});

// =========================
// ANALOG CLOCK
// =========================
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const clockDay = document.getElementById('clockDay');
const clockNum = document.getElementById('clockNum');

function updateAnalogClock() {
  const now = new Date();
  const sec = now.getSeconds();
  const min = now.getMinutes();
  const hr = now.getHours() % 12;

  if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${hr * 30 + min * 0.5}deg)`;
  if (minuteHand) minuteHand.style.transform = `translateX(-50%) rotate(${min * 6}deg)`;
  if (secondHand) secondHand.style.transform = `translateX(-50%) rotate(${sec * 6}deg)`;

  if (clockDay) clockDay.textContent = now.toLocaleDateString(undefined, { weekday: 'short' });
  if (clockNum) clockNum.textContent = now.getDate();
}

(function startClockTicks() {
  updateAnalogClock();
  const now = new Date();
  const msToNextSecond = 1000 - now.getMilliseconds();
  setTimeout(() => {
    updateAnalogClock();
    setInterval(updateAnalogClock, 1000);
  }, msToNextSecond);
})();

// =========================
// TODO LIST LOGIC
// =========================
let todos = [];
let todosLoaded = false;

const todoInput = document.getElementById('todoInput');
const todoAddBtn = document.getElementById('todoAddBtn');
const todoList = document.getElementById('todoList');

function renderTodos() {
  if (!todoList) {
    console.error('[TODO] todoList element not found');
    return;
  }
  
  console.log('[TODO] Rendering', todos.length, 'todos');
  todoList.innerHTML = '';
  
  if (!todosLoaded && window.auth && window.auth.currentUser) {
    todoList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.9rem;">⏳ Loading from cloud...</div>';
    return;
  }
  
  if (todos.length === 0) {
    todoList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.85rem;">No tasks yet. Add one above!</div>';
    return;
  }
  
  todos.forEach((todo, index) => {
    const item = document.createElement('div');
    item.className = 'todo-item';
    item.dataset.index = index;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed || false;
    checkbox.addEventListener('change', () => toggleTodo(index));
    
    const text = document.createElement('span');
    text.className = 'todo-text' + (todo.completed ? ' completed' : '');
    text.textContent = todo.text;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => deleteTodo(index));
    
    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(deleteBtn);
    todoList.appendChild(item);
  });
}

function addTodo() {
  if (!todoInput) return;
  
  const text = todoInput.value.trim();
  if (!text) {
    console.log('[TODO] Empty input, ignoring');
    return;
  }
  
  if (!window.auth || !window.auth.currentUser) {
    alert('Please log in to save todos');
    return;
  }
  
  console.log('[TODO] Adding new todo:', text);
  
  const newTodo = {
    text: text,
    completed: false,
    id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    createdAt: Date.now()
  };
  
  todos.push(newTodo);
  todoInput.value = '';
  
  console.log('[TODO] Total todos:', todos.length);
  renderTodos();
  saveTodosToFirebase();
}

function toggleTodo(index) {
  if (index < 0 || index >= todos.length) return;
  
  console.log('[TODO] Toggling todo at index', index);
  todos[index].completed = !todos[index].completed;
  
  renderTodos();
  saveTodosToFirebase();
}

function deleteTodo(index) {
  if (index < 0 || index >= todos.length) return;
  
  console.log('[TODO] Deleting todo at index', index);
  todos.splice(index, 1);
  
  renderTodos();
  saveTodosToFirebase();
}

async function saveTodosToFirebase() {
  try {
    if (!window.auth || !window.auth.currentUser) {
      console.warn('[TODO] Not authenticated, cannot save');
      return;
    }
    
    if (!window.db || !window.doc || !window.setDoc || !window.serverTimestamp) {
      console.error('[TODO] Firebase not initialized');
      return;
    }
    
    const userId = window.auth.currentUser.uid;
    const deviceId = window.deviceId || 'unknown';
    
    console.log('[TODO] Saving', todos.length, 'todos to Firebase for user:', userId);
    
    const todoRef = window.doc(window.db, 'user_todos', userId);
    await window.setDoc(todoRef, {
      items: todos,
      by: deviceId,
      updatedAt: window.serverTimestamp()
    });
    
    console.log('[TODO] ✅ Successfully saved to Firebase');
  } catch (error) {
    console.error('[TODO] ❌ Failed to save to Firebase:', error);
    console.error('[TODO] Error code:', error.code);
    console.error('[TODO] Error message:', error.message);
  }
}

function loadTodosFromFirebase(data) {
  try {
    console.log('[TODO] Loading data from Firebase:', data);
    
    if (!data) {
      console.log('[TODO] No data received from Firebase, using empty array');
      todos = [];
      todosLoaded = true;
      renderTodos();
      return;
    }
    
    if (Array.isArray(data.items)) {
      todos = data.items;
      console.log('[TODO] ✅ Loaded', todos.length, 'todos from Firebase');
    } else {
      console.warn('[TODO] data.items is not an array, using empty array');
      todos = [];
    }
    
    todosLoaded = true;
    renderTodos();
  } catch (error) {
    console.error('[TODO] ❌ Error loading from Firebase:', error);
    todos = [];
    todosLoaded = true;
    renderTodos();
  }
}

window.applyRemoteTodos = loadTodosFromFirebase;

window.clearCompletedTodos = function() {
  const remaining = todos.filter(t => !t.completed);
  todos = remaining;
  renderTodos();
  saveTodosToFirebase();
};

if (todoAddBtn) {
  todoAddBtn.addEventListener('click', addTodo);
  console.log('[TODO] Add button listener attached');
}

if (todoInput) {
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });
  console.log('[TODO] Input keypress listener attached');
}

console.log('[TODO] Initial render');
renderTodos();

// =========================
// EVENTS DATE INPUT
// =========================
const eventDateInput = document.getElementById('eventDateInput');
const eventTextInput = document.getElementById('eventTextInput');
const selectedDateBadge = document.getElementById('selectedDateBadge');
const showAllEventsBtn = document.getElementById('showAllEventsBtn');

if (eventDateInput) {
  const today = new Date();
  eventDateInput.value = today.toISOString().split('T')[0];
}

if (selectedDateBadge) {
  selectedDateBadge.onclick = () => {
    if (window.renderEvents) window.renderEvents(null);
  };
}
if (showAllEventsBtn) {
  showAllEventsBtn.onclick = () => {
    if (window.renderEvents) window.renderEvents(null);
  };
}
