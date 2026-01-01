// Settings Manager - Global Settings Integration
(function() {
    'use strict';

    function initSettings() {
        // Navigation between main settings and app settings
        const mainSettingsView = document.getElementById('mainSettingsView');
        const appSettingsView = document.getElementById('appSettingsView');
        const appsListView = document.getElementById('appsListView');
        const backToSettings = document.getElementById('backToSettings');
        const backToSettingsFromApps = document.getElementById('backToSettingsFromApps');
        const showAppsListBtn = document.getElementById('showAppsListBtn');
        const settingsPage = document.getElementById('settingsPage');

        console.log('[Settings] Init - mainSettingsView:', mainSettingsView);
        console.log('[Settings] Init - appSettingsView:', appSettingsView);
        console.log('[Settings] Init - appsListView:', appsListView);

        // App name to settings detail mapping
        const appSettingsMap = {
            'clock': 'clockAppSettings',
            'pomodoro': 'pomodoroAppSettings',
            'todo': 'todoAppSettings',
            'countdown': 'countdownAppSettings',
            'calculator': 'calculatorAppSettings',
            'events': 'eventsAppSettings',
            'calendar': 'calendarAppSettings',
            'notes': 'notesAppSettings',
            'webBrowser': 'webBrowserAppSettings',
            'canvasManager': 'canvasAppSettings',
            'ambientSounds': 'ambientAppSettings',
            'appStore': 'appStoreAppSettings'
        };

        // Function to show specific app settings
        function showAppSettings(appName) {
            console.log('[Settings] showAppSettings called for:', appName);
            
            // Hide main view and apps list view, show app settings view
            if (mainSettingsView) {
                mainSettingsView.style.display = 'none';
                console.log('[Settings] Main view hidden');
            }
            if (appsListView) {
                appsListView.style.display = 'none';
                console.log('[Settings] Apps list view hidden');
            }
            if (appSettingsView) {
                appSettingsView.style.display = 'block';
                console.log('[Settings] App settings view shown');
            }

            // Hide all app settings details
            Object.values(appSettingsMap).forEach(id => {
                const element = document.getElementById(id);
                if (element) element.style.display = 'none';
            });

            // Show the selected app settings
            const settingsId = appSettingsMap[appName];
            console.log('[Settings] Looking for settings:', settingsId);
            if (settingsId) {
                const element = document.getElementById(settingsId);
                console.log('[Settings] Settings element:', element);
                if (element) {
                    element.style.display = 'block';
                    console.log('[Settings] Settings displayed for:', appName);
                }
            }
        }

        // Back button handler
        if (backToSettings) {
            backToSettings.addEventListener('click', () => {
                if (appSettingsView) appSettingsView.style.display = 'none';
                if (appsListView) appsListView.style.display = 'block';
            });
        }

        // Show Apps List button handler
        if (showAppsListBtn) {
            showAppsListBtn.addEventListener('click', () => {
                if (mainSettingsView) mainSettingsView.style.display = 'none';
                if (appsListView) appsListView.style.display = 'block';
            });
        }

        // Back to Settings from Apps List handler
        if (backToSettingsFromApps) {
            backToSettingsFromApps.addEventListener('click', () => {
                if (appsListView) appsListView.style.display = 'none';
                if (mainSettingsView) mainSettingsView.style.display = 'block';
            });
        }

        // Function to populate settings app list with installed apps only
        async function populateSettingsAppList() {
            const settingsAppListContainer = document.getElementById('appsListContainer');
            if (!settingsAppListContainer) return;

            // App metadata for creating list items
            const appMetadata = {
                'clock': { icon: '🕒', name: 'Clock' },
                'pomodoro': { icon: '🍅', name: 'Pomodoro' },
                'todo': { icon: '✅', name: 'Todo' },
                'countdown': { icon: '⏰', name: 'Countdown' },
                'calculator': { icon: '🔢', name: 'Calculator' },
                'events': { icon: '📅', name: 'Events' },
                'calendar': { icon: '📆', name: 'Calendar' },
                'notes': { icon: '📝', name: 'Notes' },
                'webBrowser': { icon: '🌐', name: 'Web Browser' },
                'canvasManager': { icon: '📑', name: 'Canvas Manager' },
                'ambientSounds': { icon: '🎵', name: 'Ambient Sounds' },
                'appStore': { icon: '🛍️', name: 'App Store' }
            };

            // Get installed apps - prefer window.getInstalledApps for immediate data
            let installedApps = [];
            
            if (window.getInstalledApps) {
                installedApps = window.getInstalledApps();
                console.log('[Settings] Loaded', installedApps.length, 'apps from app store');
            } else if (window.auth && window.auth.currentUser && window.db && window.doc && window.getDoc) {
                // Fallback to Firebase if getInstalledApps not available
                try {
                    const userId = window.auth.currentUser.uid;
                    const ref = window.doc(window.db, 'user_installed_apps', userId);
                    const snapshot = await window.getDoc(ref);
                    
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        if (Array.isArray(data.apps)) {
                            installedApps = data.apps;
                            console.log('[Settings] Loaded', installedApps.length, 'apps from Firebase');
                        }
                    }
                } catch (error) {
                    console.error('[Settings] Error loading from Firebase:', error);
                }
            }

            // Always include appStore
            if (!installedApps.includes('appStore')) {
                installedApps.push('appStore');
            }

            // Clear existing items
            settingsAppListContainer.innerHTML = '';

            // Create items for installed apps only
            installedApps.forEach(appId => {
                const metadata = appMetadata[appId];
                if (!metadata) return;

                const item = document.createElement('div');
                item.className = 'settings-app-item';
                item.dataset.app = appId;
                item.innerHTML = `
                    <span class="settings-app-icon">${metadata.icon}</span>
                    <span class="settings-app-name">${metadata.name}</span>
                    <span class="settings-app-chevron">›</span>
                `;

                // Add click handler
                item.addEventListener('click', () => {
                    showAppSettings(appId);
                });

                settingsAppListContainer.appendChild(item);
            });

            console.log('[Settings] Populated app list with', installedApps.length, 'apps');
        }

        // Initial population
        populateSettingsAppList();

        // Expose function globally so app store can refresh it
        window.refreshSettingsAppList = populateSettingsAppList;

        // Settings app list click handlers (for items in appsListView)
        const appsListContainer = document.getElementById('appsListContainer');
        if (appsListContainer) {
            appsListContainer.addEventListener('click', (e) => {
                const item = e.target.closest('.settings-app-item');
                if (item && item.dataset.app) {
                    const appName = item.dataset.app;
                    console.log('[Settings] App item clicked:', appName);
                    showAppSettings(appName);
                }
            });
        }

        // Widget settings button handlers - open global settings to specific app
        function setupWidgetSettingsButton(buttonId, appName) {
            const button = document.getElementById(buttonId);
            if (!button) return;

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Open settings page
                if (settingsPage) {
                    settingsPage.style.display = 'block';
                }
                
                // Navigate to specific app settings
                showAppSettings(appName);
            });
        }

        // Setup all widget settings buttons
        setupWidgetSettingsButton('clockSettingsBtn', 'clock');
        setupWidgetSettingsButton('pomoSettingsBtn', 'pomodoro');
        setupWidgetSettingsButton('todoSettingsBtn', 'todo');
        setupWidgetSettingsButton('calculatorSettingsBtn', 'calculator');
        setupWidgetSettingsButton('eventsSettingsBtn', 'events');
        setupWidgetSettingsButton('calendarSettingsBtn', 'calendar');
        setupWidgetSettingsButton('notesSettingsBtn', 'notes');
        setupWidgetSettingsButton('webBrowserSettingsBtn', 'webBrowser');
        setupWidgetSettingsButton('canvasManagerSettingsBtn', 'canvas');

        // ===== CLOCK SETTINGS =====
        const clockShowSeconds = document.getElementById('clockShowSeconds');
        const clockShow24Hour = document.getElementById('clockShow24Hour');
        const clockSize = document.getElementById('clockSize');
        const clockColor = document.getElementById('clockColor');
        const clockShowDate = document.getElementById('clockShowDate');
        const analogClock = document.getElementById('analogClock');
        const secondHand = document.getElementById('secondHand');

        if (clockShowSeconds) {
            clockShowSeconds.checked = localStorage.getItem('clockShowSeconds') !== 'false';
            clockShowSeconds.addEventListener('change', () => {
                localStorage.setItem('clockShowSeconds', clockShowSeconds.checked);
                if (secondHand) {
                    secondHand.style.display = clockShowSeconds.checked ? 'block' : 'none';
                }
            });
            // Apply on load
            if (secondHand && !clockShowSeconds.checked) {
                secondHand.style.display = 'none';
            }
        }

        if (clockShow24Hour) {
            clockShow24Hour.checked = localStorage.getItem('clockShow24Hour') === 'true';
            clockShow24Hour.addEventListener('change', () => {
                localStorage.setItem('clockShow24Hour', clockShow24Hour.checked);
                // Trigger clock update if available
                if (window.ClockWidget && window.ClockWidget.update) {
                    window.ClockWidget.update();
                }
            });
        }

        if (clockSize) {
            const savedSize = localStorage.getItem('clockSize') || 'medium';
            clockSize.value = savedSize;
            applyClockSize(savedSize);
            
            clockSize.addEventListener('change', () => {
                localStorage.setItem('clockSize', clockSize.value);
                applyClockSize(clockSize.value);
            });
        }

        if (clockColor) {
            const savedColor = localStorage.getItem('clockColor') || 'default';
            clockColor.value = savedColor;
            applyClockColor(savedColor);
            
            clockColor.addEventListener('change', () => {
                localStorage.setItem('clockColor', clockColor.value);
                applyClockColor(clockColor.value);
            });
        }

        if (clockShowDate) {
            clockShowDate.checked = localStorage.getItem('clockShowDate') !== 'false';
            clockShowDate.addEventListener('change', () => {
                localStorage.setItem('clockShowDate', clockShowDate.checked);
            });
        }

        function applyClockSize(size) {
            if (!analogClock) return;
            analogClock.classList.remove('clock-small', 'clock-medium', 'clock-large');
            analogClock.classList.add(`clock-${size}`);
        }

        function applyClockColor(color) {
            if (!analogClock) return;
            analogClock.classList.remove('clock-default', 'clock-blue', 'clock-green', 'clock-red', 'clock-gold');
            analogClock.classList.add(`clock-${color}`);
        }

        // ===== POMODORO SETTINGS =====
        const pomoFocusDuration = document.getElementById('pomoFocusDuration');
        const pomoBreakDuration = document.getElementById('pomoBreakDuration');
        const pomoLongBreak = document.getElementById('pomoLongBreak');
        const pomoSessionsBeforeLongBreak = document.getElementById('pomoSessionsBeforeLongBreak');
        const pomoAutoStart = document.getElementById('pomoAutoStart');
        const pomoSound = document.getElementById('pomoSound');
        const pomoNotifications = document.getElementById('pomoNotifications');

        if (pomoFocusDuration) {
            const currentDuration = localStorage.getItem('pomo_duration_minutes') || 25;
            pomoFocusDuration.value = currentDuration;

            pomoFocusDuration.addEventListener('change', () => {
                const val = Math.max(1, Number(pomoFocusDuration.value) || 25);
                pomoFocusDuration.value = val;
                localStorage.setItem('pomo_duration_minutes', val);
                
                // Trigger timer reset if available
                if (window.resetPomoTimer) {
                    window.resetPomoTimer(val);
                }
            });
        }

        if (pomoBreakDuration) {
            pomoBreakDuration.value = localStorage.getItem('pomoBreakDuration') || 5;
            pomoBreakDuration.addEventListener('change', () => {
                const val = Math.max(1, Number(pomoBreakDuration.value) || 5);
                pomoBreakDuration.value = val;
                localStorage.setItem('pomoBreakDuration', val);
            });
        }

        if (pomoLongBreak) {
            pomoLongBreak.value = localStorage.getItem('pomoLongBreak') || 15;
            pomoLongBreak.addEventListener('change', () => {
                const val = Math.max(1, Number(pomoLongBreak.value) || 15);
                pomoLongBreak.value = val;
                localStorage.setItem('pomoLongBreak', val);
            });
        }

        if (pomoSessionsBeforeLongBreak) {
            pomoSessionsBeforeLongBreak.value = localStorage.getItem('pomoSessionsBeforeLongBreak') || 4;
            pomoSessionsBeforeLongBreak.addEventListener('change', () => {
                const val = Math.max(1, Number(pomoSessionsBeforeLongBreak.value) || 4);
                pomoSessionsBeforeLongBreak.value = val;
                localStorage.setItem('pomoSessionsBeforeLongBreak', val);
            });
        }

        if (pomoAutoStart) {
            pomoAutoStart.checked = localStorage.getItem('pomoAutoStart') === 'true';
            pomoAutoStart.addEventListener('change', () => {
                localStorage.setItem('pomoAutoStart', pomoAutoStart.checked);
            });
        }

        if (pomoSound) {
            pomoSound.checked = localStorage.getItem('pomoSound') !== 'false';
            pomoSound.addEventListener('change', () => {
                localStorage.setItem('pomoSound', pomoSound.checked);
            });
        }

        if (pomoNotifications) {
            pomoNotifications.checked = localStorage.getItem('pomoNotifications') !== 'false';
            pomoNotifications.addEventListener('change', () => {
                localStorage.setItem('pomoNotifications', pomoNotifications.checked);
                // Request notification permission if enabled
                if (pomoNotifications.checked && 'Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                }
            });
        }

        // ===== TODO SETTINGS =====
        const todoShowCompleted = document.getElementById('todoShowCompleted');
        const todoAutoSort = document.getElementById('todoAutoSort');
        const todoShowPriorityColors = document.getElementById('todoShowPriorityColors');
        const todoConfirmDelete = document.getElementById('todoConfirmDelete');
        const todoDefaultPriority = document.getElementById('todoDefaultPriority');
        const todoMaxTasks = document.getElementById('todoMaxTasks');
        const todoClearCompleted = document.getElementById('todoClearCompleted');

        if (todoShowCompleted) {
            todoShowCompleted.checked = localStorage.getItem('todoShowCompleted') !== 'false';
            todoShowCompleted.addEventListener('change', () => {
                localStorage.setItem('todoShowCompleted', todoShowCompleted.checked);
                if (window.TodoWidget && window.TodoWidget.render) {
                    window.TodoWidget.render();
                }
            });
        }

        if (todoAutoSort) {
            todoAutoSort.checked = localStorage.getItem('todoAutoSort') === 'true';
            todoAutoSort.addEventListener('change', () => {
                localStorage.setItem('todoAutoSort', todoAutoSort.checked);
                if (window.TodoWidget && window.TodoWidget.render) {
                    window.TodoWidget.render();
                }
            });
        }

        if (todoShowPriorityColors) {
            todoShowPriorityColors.checked = localStorage.getItem('todoShowPriorityColors') !== 'false';
            todoShowPriorityColors.addEventListener('change', () => {
                localStorage.setItem('todoShowPriorityColors', todoShowPriorityColors.checked);
                if (window.TodoWidget && window.TodoWidget.render) {
                    window.TodoWidget.render();
                }
            });
        }

        if (todoConfirmDelete) {
            todoConfirmDelete.checked = localStorage.getItem('todoConfirmDelete') !== 'false';
            todoConfirmDelete.addEventListener('change', () => {
                localStorage.setItem('todoConfirmDelete', todoConfirmDelete.checked);
            });
        }

        if (todoDefaultPriority) {
            todoDefaultPriority.value = localStorage.getItem('todoDefaultPriority') || 'medium';
            todoDefaultPriority.addEventListener('change', () => {
                localStorage.setItem('todoDefaultPriority', todoDefaultPriority.value);
            });
        }

        if (todoMaxTasks) {
            todoMaxTasks.value = localStorage.getItem('todoMaxTasks') || 50;
            todoMaxTasks.addEventListener('change', () => {
                const val = Math.max(5, Math.min(100, Number(todoMaxTasks.value) || 50));
                todoMaxTasks.value = val;
                localStorage.setItem('todoMaxTasks', val);
            });
        }

        if (todoClearCompleted) {
            todoClearCompleted.addEventListener('click', () => {
                const confirmClear = localStorage.getItem('todoConfirmDelete') !== 'false';
                if (confirmClear && !confirm('Clear all completed tasks?')) {
                    return;
                }
                // Use the global clearCompletedTodos function if available (defined in index.html)
                if (window.clearCompletedTodos) {
                    window.clearCompletedTodos();
                }
            });
        }

        // ===== CALCULATOR SETTINGS =====
        const calcScientificMode = document.getElementById('calcScientificMode');
        const calcDecimalPlaces = document.getElementById('calcDecimalPlaces');
        const calcThousandsSeparator = document.getElementById('calcThousandsSeparator');
        const calcButtonSound = document.getElementById('calcButtonSound');
        const calcHistorySize = document.getElementById('calcHistorySize');
        const calcTheme = document.getElementById('calcTheme');
        const calcClearHistory = document.getElementById('calcClearHistory');

        if (calcScientificMode) {
            calcScientificMode.checked = localStorage.getItem('calcScientificMode') === 'true';
            calcScientificMode.addEventListener('change', () => {
                localStorage.setItem('calcScientificMode', calcScientificMode.checked);
                const calc = document.getElementById('floatingCalculator');
                const sciButtons = document.querySelector('.calc-scientific-buttons');
                
                if (calc) {
                    calc.classList.toggle('scientific-mode', calcScientificMode.checked);
                }
                if (sciButtons) {
                    sciButtons.style.display = calcScientificMode.checked ? 'grid' : 'none';
                }
            });
            
            // Apply on load
            const calc = document.getElementById('floatingCalculator');
            const sciButtons = document.querySelector('.calc-scientific-buttons');
            if (calc && calcScientificMode.checked) {
                calc.classList.add('scientific-mode');
            }
            if (sciButtons && calcScientificMode.checked) {
                sciButtons.style.display = 'grid';
            }
        }

        if (calcDecimalPlaces) {
            calcDecimalPlaces.value = localStorage.getItem('calcDecimalPlaces') || 2;
            calcDecimalPlaces.addEventListener('change', () => {
                const val = Math.max(0, Math.min(10, Number(calcDecimalPlaces.value) || 2));
                calcDecimalPlaces.value = val;
                localStorage.setItem('calcDecimalPlaces', val);
            });
        }

        if (calcThousandsSeparator) {
            calcThousandsSeparator.checked = localStorage.getItem('calcThousandsSeparator') !== 'false';
            calcThousandsSeparator.addEventListener('change', () => {
                localStorage.setItem('calcThousandsSeparator', calcThousandsSeparator.checked);
            });
        }

        if (calcButtonSound) {
            calcButtonSound.checked = localStorage.getItem('calcButtonSound') === 'true';
            calcButtonSound.addEventListener('change', () => {
                localStorage.setItem('calcButtonSound', calcButtonSound.checked);
            });
        }

        if (calcHistorySize) {
            calcHistorySize.value = localStorage.getItem('calcHistorySize') || 20;
            calcHistorySize.addEventListener('change', () => {
                const val = Math.max(5, Math.min(100, Number(calcHistorySize.value) || 20));
                calcHistorySize.value = val;
                localStorage.setItem('calcHistorySize', val);
            });
        }

        if (calcTheme) {
            calcTheme.value = localStorage.getItem('calcTheme') || 'default';
            calcTheme.addEventListener('change', () => {
                localStorage.setItem('calcTheme', calcTheme.value);
                applyCalculatorTheme(calcTheme.value);
            });
            applyCalculatorTheme(calcTheme.value);
        }

        function applyCalculatorTheme(theme) {
            const calc = document.getElementById('floatingCalculator');
            if (!calc) return;
            calc.classList.remove('calc-default', 'calc-dark', 'calc-light', 'calc-colorful');
            calc.classList.add(`calc-${theme}`);
        }

        if (calcClearHistory) {
            calcClearHistory.addEventListener('click', () => {
                localStorage.removeItem('calculatorHistory');
            });
        }

        // ===== EVENTS SETTINGS =====
        const eventsShowPast = document.getElementById('eventsShowPast');
        const eventsNotifications = document.getElementById('eventsNotifications');
        const eventsReminderTime = document.getElementById('eventsReminderTime');
        const eventsCompactView = document.getElementById('eventsCompactView');
        const eventsDefaultView = document.getElementById('eventsDefaultView');
        const eventsSortOrder = document.getElementById('eventsSortOrder');

        if (eventsShowPast) {
            eventsShowPast.checked = localStorage.getItem('eventsShowPast') !== 'false';
            eventsShowPast.addEventListener('change', () => {
                localStorage.setItem('eventsShowPast', eventsShowPast.checked);
            });
        }

        if (eventsNotifications) {
            eventsNotifications.checked = localStorage.getItem('eventsNotifications') === 'true';
            eventsNotifications.addEventListener('change', () => {
                localStorage.setItem('eventsNotifications', eventsNotifications.checked);
                if (eventsNotifications.checked && 'Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                }
            });
        }

        if (eventsReminderTime) {
            eventsReminderTime.value = localStorage.getItem('eventsReminderTime') || '15';
            eventsReminderTime.addEventListener('change', () => {
                localStorage.setItem('eventsReminderTime', eventsReminderTime.value);
            });
        }

        if (eventsCompactView) {
            eventsCompactView.checked = localStorage.getItem('eventsCompactView') === 'true';
            eventsCompactView.addEventListener('change', () => {
                localStorage.setItem('eventsCompactView', eventsCompactView.checked);
            });
        }

        if (eventsDefaultView) {
            eventsDefaultView.value = localStorage.getItem('eventsDefaultView') || 'all';
            eventsDefaultView.addEventListener('change', () => {
                localStorage.setItem('eventsDefaultView', eventsDefaultView.value);
            });
        }

        if (eventsSortOrder) {
            eventsSortOrder.value = localStorage.getItem('eventsSortOrder') || 'date';
            eventsSortOrder.addEventListener('change', () => {
                localStorage.setItem('eventsSortOrder', eventsSortOrder.value);
            });
        }

        // ===== CALENDAR SETTINGS =====
        const calendarWeekStart = document.getElementById('calendarWeekStart');
        const calendarShowWeekNumbers = document.getElementById('calendarShowWeekNumbers');
        const calendarHighlightWeekends = document.getElementById('calendarHighlightWeekends');
        const calendarShowToday = document.getElementById('calendarShowToday');
        const calendarShowHolidays = document.getElementById('calendarShowHolidays');
        const calendarCompactView = document.getElementById('calendarCompactView');
        const calendarDefaultView = document.getElementById('calendarDefaultView');

        if (calendarWeekStart) {
            calendarWeekStart.value = localStorage.getItem('calendarWeekStart') || '0';
            calendarWeekStart.addEventListener('change', () => {
                localStorage.setItem('calendarWeekStart', calendarWeekStart.value);
                // Trigger calendar re-render
                if (window.renderCalendar && typeof shownYear !== 'undefined') {
                    window.renderCalendar(shownYear);
                } else if (window.renderCalendar) {
                    window.renderCalendar(new Date().getFullYear());
                }
            });
        }

        if (calendarShowWeekNumbers) {
            calendarShowWeekNumbers.checked = localStorage.getItem('calendarShowWeekNumbers') === 'true';
            calendarShowWeekNumbers.addEventListener('change', () => {
                localStorage.setItem('calendarShowWeekNumbers', calendarShowWeekNumbers.checked);
                if (window.renderCalendar && typeof shownYear !== 'undefined') {
                    window.renderCalendar(shownYear);
                } else if (window.renderCalendar) {
                    window.renderCalendar(new Date().getFullYear());
                }
            });
        }

        if (calendarHighlightWeekends) {
            calendarHighlightWeekends.checked = localStorage.getItem('calendarHighlightWeekends') !== 'false';
            calendarHighlightWeekends.addEventListener('change', () => {
                localStorage.setItem('calendarHighlightWeekends', calendarHighlightWeekends.checked);
                if (window.renderCalendar && typeof shownYear !== 'undefined') {
                    window.renderCalendar(shownYear);
                } else if (window.renderCalendar) {
                    window.renderCalendar(new Date().getFullYear());
                }
            });
        }

        if (calendarShowToday) {
            calendarShowToday.checked = localStorage.getItem('calendarShowToday') !== 'false';
            calendarShowToday.addEventListener('change', () => {
                localStorage.setItem('calendarShowToday', calendarShowToday.checked);
                if (window.renderCalendar && typeof shownYear !== 'undefined') {
                    window.renderCalendar(shownYear);
                } else if (window.renderCalendar) {
                    window.renderCalendar(new Date().getFullYear());
                }
            });
        }

        if (calendarShowHolidays) {
            calendarShowHolidays.checked = localStorage.getItem('calendarShowHolidays') !== 'false';
            calendarShowHolidays.addEventListener('change', () => {
                localStorage.setItem('calendarShowHolidays', calendarShowHolidays.checked);
                if (window.renderCalendar && typeof shownYear !== 'undefined') {
                    window.renderCalendar(shownYear);
                } else if (window.renderCalendar) {
                    window.renderCalendar(new Date().getFullYear());
                }
            });
        }

        if (calendarCompactView) {
            calendarCompactView.checked = localStorage.getItem('calendarCompactView') === 'true';
            calendarCompactView.addEventListener('change', () => {
                localStorage.setItem('calendarCompactView', calendarCompactView.checked);
                const calEl = document.getElementById('calendar');
                if (calEl) {
                    calEl.classList.toggle('compact-view', calendarCompactView.checked);
                }
            });
            // Apply on load
            const calEl = document.getElementById('calendar');
            if (calEl && calendarCompactView.checked) {
                calEl.classList.add('compact-view');
            }
        }

        if (calendarDefaultView) {
            calendarDefaultView.value = localStorage.getItem('calendarDefaultView') || 'month';
            calendarDefaultView.addEventListener('change', () => {
                localStorage.setItem('calendarDefaultView', calendarDefaultView.value);
            });
        }

        // ===== NOTES SETTINGS =====
        const notesFontSize = document.getElementById('notesFontSize');
        const notesFontFamily = document.getElementById('notesFontFamily');
        const notesLineHeight = document.getElementById('notesLineHeight');
        const notesWordWrap = document.getElementById('notesWordWrap');
        const notesAutoSave = document.getElementById('notesAutoSave');
        const notesSpellCheck = document.getElementById('notesSpellCheck');
        const notesAutoSaveInterval = document.getElementById('notesAutoSaveInterval');
        const notesEditor = document.getElementById('notesEditor');

        if (notesFontSize) {
            notesFontSize.value = localStorage.getItem('notesFontSize') || '14px';
            notesFontSize.addEventListener('change', () => {
                localStorage.setItem('notesFontSize', notesFontSize.value);
                if (notesEditor) {
                    notesEditor.style.fontSize = notesFontSize.value;
                }
            });
            // Apply on load
            if (notesEditor) {
                notesEditor.style.fontSize = notesFontSize.value;
            }
        }

        if (notesFontFamily) {
            notesFontFamily.value = localStorage.getItem('notesFontFamily') || 'system-ui';
            notesFontFamily.addEventListener('change', () => {
                localStorage.setItem('notesFontFamily', notesFontFamily.value);
                if (notesEditor) {
                    notesEditor.style.fontFamily = notesFontFamily.value;
                }
            });
            // Apply on load
            if (notesEditor) {
                notesEditor.style.fontFamily = notesFontFamily.value;
            }
        }

        if (notesLineHeight) {
            notesLineHeight.value = localStorage.getItem('notesLineHeight') || '1.8';
            notesLineHeight.addEventListener('change', () => {
                localStorage.setItem('notesLineHeight', notesLineHeight.value);
                if (notesEditor) {
                    notesEditor.style.lineHeight = notesLineHeight.value;
                }
            });
            // Apply on load
            if (notesEditor) {
                notesEditor.style.lineHeight = notesLineHeight.value;
            }
        }

        if (notesWordWrap) {
            notesWordWrap.checked = localStorage.getItem('notesWordWrap') !== 'false';
            notesWordWrap.addEventListener('change', () => {
                localStorage.setItem('notesWordWrap', notesWordWrap.checked);
                if (notesEditor) {
                    notesEditor.style.whiteSpace = notesWordWrap.checked ? 'pre-wrap' : 'pre';
                }
            });
            // Apply on load
            if (notesEditor) {
                notesEditor.style.whiteSpace = notesWordWrap.checked ? 'pre-wrap' : 'pre';
            }
        }

        if (notesAutoSave) {
            notesAutoSave.checked = localStorage.getItem('notesAutoSave') !== 'false';
            notesAutoSave.addEventListener('change', () => {
                localStorage.setItem('notesAutoSave', notesAutoSave.checked);
            });
        }

        if (notesSpellCheck) {
            notesSpellCheck.checked = localStorage.getItem('notesSpellCheck') !== 'false';
            notesSpellCheck.addEventListener('change', () => {
                localStorage.setItem('notesSpellCheck', notesSpellCheck.checked);
                if (notesEditor) {
                    notesEditor.spellcheck = notesSpellCheck.checked;
                }
            });
            // Apply on load
            if (notesEditor) {
                notesEditor.spellcheck = notesSpellCheck.checked;
            }
        }

        if (notesAutoSaveInterval) {
            notesAutoSaveInterval.value = localStorage.getItem('notesAutoSaveInterval') || 30;
            notesAutoSaveInterval.addEventListener('change', () => {
                const val = Math.max(5, Math.min(300, Number(notesAutoSaveInterval.value) || 30));
                notesAutoSaveInterval.value = val;
                localStorage.setItem('notesAutoSaveInterval', val);
            });
        }

        // ===== WEB BROWSER SETTINGS =====
        const browserHomePage = document.getElementById('browserHomePage');
        const browserZoom = document.getElementById('browserZoom');
        const browserSearchEngine = document.getElementById('browserSearchEngine');
        const browserAllowJS = document.getElementById('browserAllowJS');
        const browserAllowForms = document.getElementById('browserAllowForms');
        const browserAllowPopups = document.getElementById('browserAllowPopups');
        const browserShowBookmarks = document.getElementById('browserShowBookmarks');
        const browserClearHistory = document.getElementById('browserClearHistory');
        const browserClearBookmarks = document.getElementById('browserClearBookmarks');
        const browserIframe = document.getElementById('browserIframe');

        if (browserHomePage) {
            browserHomePage.value = localStorage.getItem('webBrowserHomePage') || 'https://wikipedia.org';
            browserHomePage.addEventListener('change', () => {
                localStorage.setItem('webBrowserHomePage', browserHomePage.value);
            });
        }

        if (browserZoom) {
            browserZoom.value = localStorage.getItem('browserZoom') || '1';
            browserZoom.addEventListener('change', () => {
                localStorage.setItem('browserZoom', browserZoom.value);
                if (browserIframe) {
                    browserIframe.style.transform = `scale(${browserZoom.value})`;
                    browserIframe.style.transformOrigin = 'top left';
                }
            });
            // Apply on load
            if (browserIframe) {
                browserIframe.style.transform = `scale(${browserZoom.value})`;
                browserIframe.style.transformOrigin = 'top left';
            }
        }

        if (browserSearchEngine) {
            browserSearchEngine.value = localStorage.getItem('browserSearchEngine') || 'google';
            browserSearchEngine.addEventListener('change', () => {
                localStorage.setItem('browserSearchEngine', browserSearchEngine.value);
            });
        }

        if (browserAllowJS) {
            browserAllowJS.checked = localStorage.getItem('browserAllowJS') !== 'false';
            browserAllowJS.addEventListener('change', () => {
                localStorage.setItem('browserAllowJS', browserAllowJS.checked);
                updateBrowserSandbox();
            });
        }

        if (browserAllowForms) {
            browserAllowForms.checked = localStorage.getItem('browserAllowForms') !== 'false';
            browserAllowForms.addEventListener('change', () => {
                localStorage.setItem('browserAllowForms', browserAllowForms.checked);
                updateBrowserSandbox();
            });
        }

        if (browserAllowPopups) {
            browserAllowPopups.checked = localStorage.getItem('browserAllowPopups') !== 'false';
            browserAllowPopups.addEventListener('change', () => {
                localStorage.setItem('browserAllowPopups', browserAllowPopups.checked);
                updateBrowserSandbox();
            });
        }

        if (browserShowBookmarks) {
            browserShowBookmarks.checked = localStorage.getItem('browserShowBookmarks') !== 'false';
            browserShowBookmarks.addEventListener('change', () => {
                localStorage.setItem('browserShowBookmarks', browserShowBookmarks.checked);
                if (window.WebBrowserWidget && window.WebBrowserWidget.renderBookmarks) {
                    window.WebBrowserWidget.renderBookmarks();
                }
            });
        }

        function updateBrowserSandbox() {
            if (!browserIframe) return;
            let sandbox = 'allow-same-origin allow-top-navigation allow-modals allow-downloads';
            if (browserAllowJS && browserAllowJS.checked) sandbox += ' allow-scripts';
            if (browserAllowForms && browserAllowForms.checked) sandbox += ' allow-forms';
            if (browserAllowPopups && browserAllowPopups.checked) sandbox += ' allow-popups';
            browserIframe.setAttribute('sandbox', sandbox);
        }

        // Apply sandbox on load
        updateBrowserSandbox();

        if (browserClearHistory) {
            browserClearHistory.addEventListener('click', () => {
                if (confirm('Clear all browsing history?')) {
                    if (window.WebBrowserWidget && window.WebBrowserWidget.clearHistory) {
                        window.WebBrowserWidget.clearHistory();
                        alert('History cleared.');
                    }
                }
            });
        }

        if (browserClearBookmarks) {
            browserClearBookmarks.addEventListener('click', () => {
                if (window.WebBrowserWidget && window.WebBrowserWidget.clearAllBookmarks) {
                    window.WebBrowserWidget.clearAllBookmarks();
                }
            });
        }

        // ===== CANVAS MANAGER SETTINGS =====
        const canvasMaxCount = document.getElementById('canvasMaxCount');
        const canvasBrushSize = document.getElementById('canvasBrushSize');
        const canvasShowGrid = document.getElementById('canvasShowGrid');
        const canvasGridSize = document.getElementById('canvasGridSize');
        const canvasAutoSave = document.getElementById('canvasAutoSave');
        const canvasAutoSaveInterval = document.getElementById('canvasAutoSaveInterval');
        const canvasShowHints = document.getElementById('canvasShowHints');
        const canvasExportAll = document.getElementById('canvasExportAll');
        const canvasImportData = document.getElementById('canvasImportData');

        if (canvasMaxCount) {
            canvasMaxCount.value = localStorage.getItem('canvasMaxCount') || 10;
            canvasMaxCount.addEventListener('change', () => {
                const val = Math.max(1, Math.min(20, Number(canvasMaxCount.value) || 10));
                canvasMaxCount.value = val;
                localStorage.setItem('canvasMaxCount', val);
            });
        }

        if (canvasBrushSize) {
            canvasBrushSize.value = localStorage.getItem('canvasBrushSize') || 2;
            canvasBrushSize.addEventListener('change', () => {
                const val = Math.max(1, Math.min(50, Number(canvasBrushSize.value) || 2));
                canvasBrushSize.value = val;
                localStorage.setItem('canvasBrushSize', val);
            });
        }

        if (canvasShowGrid) {
            canvasShowGrid.checked = localStorage.getItem('canvasShowGrid') === 'true';
            canvasShowGrid.addEventListener('change', () => {
                localStorage.setItem('canvasShowGrid', canvasShowGrid.checked);
            });
        }

        if (canvasGridSize) {
            canvasGridSize.value = localStorage.getItem('canvasGridSize') || 20;
            canvasGridSize.addEventListener('change', () => {
                const val = Math.max(10, Math.min(100, Number(canvasGridSize.value) || 20));
                canvasGridSize.value = val;
                localStorage.setItem('canvasGridSize', val);
            });
        }

        if (canvasAutoSave) {
            canvasAutoSave.checked = localStorage.getItem('canvasAutoSave') !== 'false';
            canvasAutoSave.addEventListener('change', () => {
                localStorage.setItem('canvasAutoSave', canvasAutoSave.checked);
            });
        }

        if (canvasAutoSaveInterval) {
            canvasAutoSaveInterval.value = localStorage.getItem('canvasAutoSaveInterval') || 60;
            canvasAutoSaveInterval.addEventListener('change', () => {
                const val = Math.max(10, Math.min(300, Number(canvasAutoSaveInterval.value) || 60));
                canvasAutoSaveInterval.value = val;
                localStorage.setItem('canvasAutoSaveInterval', val);
            });
        }

        if (canvasShowHints) {
            canvasShowHints.checked = localStorage.getItem('canvasShowHints') !== 'false';
            canvasShowHints.addEventListener('change', () => {
                localStorage.setItem('canvasShowHints', canvasShowHints.checked);
                const hint = document.getElementById('canvasHint');
                if (hint) {
                    hint.style.display = canvasShowHints.checked ? 'flex' : 'none';
                }
            });
            // Apply on load
            const hint = document.getElementById('canvasHint');
            if (hint && !canvasShowHints.checked) {
                hint.style.display = 'none';
            }
        }

        if (canvasExportAll) {
            canvasExportAll.addEventListener('click', () => {
                const canvases = JSON.parse(localStorage.getItem('canvases') || '[]');
                if (canvases.length === 0) {
                    alert('No canvases to export!');
                    return;
                }
                const dataStr = JSON.stringify(canvases, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `canvases-export-${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
            });
        }

        if (canvasImportData) {
            canvasImportData.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const data = JSON.parse(event.target.result);
                            if (Array.isArray(data)) {
                                localStorage.setItem('canvases', JSON.stringify(data));
                                alert(`Imported ${data.length} canvas(es)!`);
                                if (window.CanvasManager && window.CanvasManager.refresh) {
                                    window.CanvasManager.refresh();
                                }
                            } else {
                                alert('Invalid canvas data format!');
                            }
                        } catch (err) {
                            alert('Error importing canvases: ' + err.message);
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            });
        }

        // Export for external use
        window.WidgetSettings = {
            showAppSettings: showAppSettings,
            backToMain: () => {
                if (appSettingsView) appSettingsView.style.display = 'none';
                if (mainSettingsView) mainSettingsView.style.display = 'block';
            }
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSettings);
    } else {
        initSettings();
    }

})();





