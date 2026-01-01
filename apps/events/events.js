// Events App
(function() {
  const eventsList = document.getElementById('eventsList');
  const eventDateInput = document.getElementById('eventDateInput');
  const eventTextInput = document.getElementById('eventTextInput');
  const eventAddBtn = document.getElementById('eventAddBtn');
  const selectedDateBadge = document.getElementById('selectedDateBadge');
  const showAllEventsBtn = document.getElementById('showAllEventsBtn');

  function renderEvents(filterDate = null) {
    if (!eventsList) return;
    eventsList.innerHTML = '';
    
    // Get events from calendar app
    const events = window.calendarEvents || [];
    const eventsLoaded = window.eventsLoaded || false;
    
    // Show loading state if not loaded yet and user is authenticated
    if (!eventsLoaded && window.auth && auth.currentUser) {
      eventsList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);">Loading events from cloud...</div>';
      return;
    }
    
    // Filter events by date if specified
    const filteredEvents = filterDate 
      ? events.filter(e => e.date === filterDate)
      : events;

    // Sort events by date (newest first)
    filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredEvents.forEach((event) => {
      const actualIndex = events.findIndex(e => e.id === event.id);
      const item = document.createElement('div');
      item.className = 'event-item';
      const dateObj = new Date(event.date + 'T00:00:00');
      const dateStr = dateObj.toLocaleDateString(undefined, { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      item.innerHTML = `
        <div class="event-date-badge">${dateStr}</div>
        <div class="event-text">${event.text}</div>
        <button class="event-delete" data-index="${actualIndex}">✕</button>
      `;
      eventsList.appendChild(item);
    });

    // Event listeners
    eventsList.querySelectorAll('.event-delete').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = Number(e.currentTarget.dataset.index);
        const events = window.calendarEvents || [];
        events.splice(idx, 1);
        window.updateCalendarEvents(events);
        renderEvents(window.selectedCalendarDate);
        if (window.renderCalendar) window.renderCalendar(new Date().getFullYear());
        syncEventsToCloud();
      };
    });

    // Update selected date badge and show all button
    if (selectedDateBadge) {
      if (filterDate) {
        const dateObj = new Date(filterDate + 'T00:00:00');
        selectedDateBadge.textContent = '📆 ' + dateObj.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric' 
        });
        selectedDateBadge.style.display = 'inline-block';
        if (showAllEventsBtn) showAllEventsBtn.style.display = 'inline-block';
      } else {
        selectedDateBadge.textContent = '';
        selectedDateBadge.style.display = 'none';
        if (showAllEventsBtn) showAllEventsBtn.style.display = 'none';
      }
    }
  }
  window.renderEvents = renderEvents;

  function addEvent() {
    if (!eventDateInput || !eventTextInput) return;
    const date = eventDateInput.value;
    const text = eventTextInput.value.trim();
    if (!date || !text) return;
    
    const events = window.calendarEvents || [];
    events.push({ 
      date, 
      text, 
      id: Date.now() + Math.random() 
    });
    window.updateCalendarEvents(events);
    
    eventTextInput.value = '';
    // Keep current filter (if any) after adding
    renderEvents(window.selectedCalendarDate);
    if (window.renderCalendar) window.renderCalendar(new Date().getFullYear());
    syncEventsToCloud();
  }

  async function syncEventsToCloud() {
    try {
      const events = window.calendarEvents || [];
      console.log('[EVENTS] syncEventsToCloud called, events count:', events.length);
      
      // Require authentication for data operations
      if (!window.auth || !auth.currentUser || !window.db || !window.doc || !window.setDoc || !window.serverTimestamp) {
        console.warn('[EVENTS] Not authenticated - data not saved');
        return;
      }
      
      // Get deviceId from global scope or localStorage
      const deviceId = window.deviceId || localStorage.getItem('device_id') || 'unknown';
      console.log('[EVENTS] Syncing', events.length, 'events to Firebase...');
      
      const ref = doc(db, 'user_events', auth.currentUser.uid);
      await setDoc(ref, {
        items: events,
        by: deviceId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('[EVENTS] ✓ Successfully synced to Firebase');
    } catch (err) {
      console.error('[EVENTS] Cloud sync failed:', err);
      console.error('[EVENTS] Error details:', err.message, err.code);
    }
  }

  window.applyRemoteEvents = (data) => {
    try {
      if (!data) {
        console.log('[EVENTS] No data received');
        if (window.setEventsLoaded) window.setEventsLoaded(true);
        renderEvents(window.selectedCalendarDate);
        if (window.renderCalendar) window.renderCalendar(new Date().getFullYear());
        return;
      }
      console.log('[EVENTS] Received data:', data);
      // Don't skip if from same device - we need to load on page refresh
      // if (data.by && data.by === deviceId) return;
      if (Array.isArray(data.items)) {
        if (window.updateCalendarEvents) window.updateCalendarEvents(data.items);
        if (window.setEventsLoaded) window.setEventsLoaded(true);
        console.log('[EVENTS] Loaded', data.items.length, 'events from Firebase');
        // Preserve current filter when receiving remote updates
        renderEvents(window.selectedCalendarDate);
        if (window.renderCalendar) window.renderCalendar(new Date().getFullYear());
      } else {
        console.warn('[EVENTS] data.items is not an array:', data.items);
        if (window.setEventsLoaded) window.setEventsLoaded(true);
        renderEvents(window.selectedCalendarDate);
        if (window.renderCalendar) window.renderCalendar(new Date().getFullYear());
      }
    } catch (e) {
      console.error('[EVENTS] applyRemoteEvents error:', e);
      if (window.setEventsLoaded) window.setEventsLoaded(true);
      renderEvents(window.selectedCalendarDate);
      if (window.renderCalendar) window.renderCalendar(new Date().getFullYear());
    }
  };

  if (eventAddBtn) eventAddBtn.onclick = addEvent;
  if (eventTextInput) {
    eventTextInput.onkeypress = (e) => {
      if (e.key === 'Enter') addEvent();
    };
  }

  // Show all events button
  if (showAllEventsBtn) {
    showAllEventsBtn.onclick = () => {
      renderEvents(null);
    };
  }

  // Events widget close button
  const closeEventsBtn = document.getElementById('closeEventsBtn');
  if (closeEventsBtn) {
    closeEventsBtn.onclick = () => {
      if (window.updateEventsVisibility) {
        window.updateEventsVisibility(false);
      }
    };
  }

  // Events widget settings button
  const eventsSettingsBtn = document.getElementById('eventsSettingsBtn');
  if (eventsSettingsBtn) {
    eventsSettingsBtn.onclick = () => {
      const settingsPage = document.getElementById('settingsPage');
      if (settingsPage) {
        settingsPage.style.display = 'block';
        if (window.showAppSettings) {
          window.showAppSettings('events');
        }
      }
    };
  }

  // Show all events initially (no filter)
  renderEvents(null);

  // Events visibility function
  const floatingEvents = document.getElementById('floatingEvents');
  const toggleEventsApp = document.getElementById('toggleEventsApp');

  function updateEventsVisibility(visible) {
    if (!floatingEvents) return;
    floatingEvents.style.display = visible ? 'flex' : 'none';
    if (visible && window.bringToFront) window.bringToFront(floatingEvents);
    if (toggleEventsApp) toggleEventsApp.classList.toggle('active', !!visible);
    if (window.saveCurrentCanvas) window.saveCurrentCanvas();
  }
  window.updateEventsVisibility = updateEventsVisibility;

  // Initialize visibility from storage
  const EVENTS_VIS_KEY = 'show_floating_events';
  const savedVis = localStorage.getItem(EVENTS_VIS_KEY);
  if (savedVis === 'true') {
    updateEventsVisibility(true);
  }

  // Expose to dynamic island
  window.updateDynamicEvents = function() {
    const events = window.calendarEvents || [];
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter(e => e.date === today);
    const dynamicIslandAdditional = document.getElementById('dynamicIslandAdditional');
    
    if (todayEvents.length > 0 && dynamicIslandAdditional) {
      dynamicIslandAdditional.style.display = 'inline-flex';
      dynamicIslandAdditional.innerHTML = `📅 ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} today`;
      dynamicIslandAdditional.onclick = () => {
        updateEventsVisibility(true);
        if (window.renderEvents) window.renderEvents(today);
      };
    } else if (dynamicIslandAdditional) {
      dynamicIslandAdditional.style.display = 'none';
    }
  };

})();
