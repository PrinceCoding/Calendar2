// Calendar App
(function() {
  const calEl = document.getElementById('calendar');
  const yearEl = document.getElementById('year');
  const now = new Date();
  const CURRENT_YEAR = now.getFullYear();
  const TODAY_DATE = now.getDate();
  const TODAY_MONTH = now.getMonth();
  let shownYear = CURRENT_YEAR;

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let monthViewIndex = null;
  const monthToggleBtn = document.getElementById('monthToggleBtn');
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Events data (initialized early for calendar rendering)
  // Start with empty - will be loaded from Firebase when authenticated
  let events = [];
  let eventsLoaded = false; // Track if Firebase data has been loaded
  let selectedCalendarDate = null;

  function renderCalendar(year) {
    calEl.innerHTML = '';
    yearEl.textContent = `Calendar ${year}`;

    // Get calendar settings
    const weekStart = parseInt(localStorage.getItem('calendarWeekStart') || '0');
    const showWeekNumbers = localStorage.getItem('calendarShowWeekNumbers') === 'true';
    const highlightWeekends = localStorage.getItem('calendarHighlightWeekends') !== 'false';
    const showToday = localStorage.getItem('calendarShowToday') !== 'false';

    // Reorder DAYS array based on week start
    let orderedDays = [...DAYS];
    if (weekStart > 0) {
      orderedDays = [...DAYS.slice(weekStart), ...DAYS.slice(0, weekStart)];
    }

    MONTHS.forEach((m, i) => {
      if (monthViewIndex !== null && monthViewIndex !== i) return;
      const box = document.createElement('div');
      box.className = 'month';
      box.innerHTML = `<h2 data-month="${i}" style="cursor:pointer">${m}</h2>`;

      const w = document.createElement('div');
      w.className = 'weekdays';
      
      // Add week number header if enabled
      if (showWeekNumbers) {
        w.innerHTML += '<div style="font-weight:bold;font-size:0.7rem;">Wk</div>';
      }
      
      orderedDays.forEach((d, idx) => {
        const isWeekend = highlightWeekends && ((idx + weekStart) % 7 === 0 || (idx + weekStart) % 7 === 6);
        const style = isWeekend ? 'color:var(--accent);font-weight:600;' : '';
        w.innerHTML += `<div style="${style}">${d}</div>`;
      });

      const g = document.createElement('div');
      g.className = 'days';
      g.style.gridTemplateColumns = showWeekNumbers ? 'repeat(8, 1fr)' : 'repeat(7, 1fr)';
      
      const first = new Date(year, i, 1).getDay();
      const total = new Date(year, i + 1, 0).getDate();
      
      // Adjust first day based on week start
      let adjustedFirst = (first - weekStart + 7) % 7;

      // Add week number for first week if enabled
      if (showWeekNumbers) {
        const firstDate = new Date(year, i, 1);
        const weekNum = getWeekNumber(firstDate);
        g.innerHTML += `<div style="font-size:0.7rem;color:var(--muted);display:flex;align-items:center;justify-content:center;">${weekNum}</div>`;
      }

      for (let j = 0; j < adjustedFirst; j++) g.innerHTML += '<div></div>';
      
      for (let d = 1; d <= total; d++) {
        // Add week number at start of each week
        if (showWeekNumbers && (adjustedFirst + d - 1) % 7 === 0 && d > 1) {
          const currentDate = new Date(year, i, d);
          const weekNum = getWeekNumber(currentDate);
          g.innerHTML += `<div style="font-size:0.7rem;color:var(--muted);display:flex;align-items:center;justify-content:center;">${weekNum}</div>`;
        }
        
        const isToday = d === TODAY_DATE && i === TODAY_MONTH && year === CURRENT_YEAR;
        const shouldShowToday = showToday && isToday;
        const dateStr = `${year}-${String(i + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const hasEvent = events.some(e => e.date === dateStr);
        const dotHtml = hasEvent ? '<span class="event-dot"></span>' : '';
        
        // Check if it's a weekend
        const dayOfWeek = new Date(year, i, d).getDay();
        const isWeekend = highlightWeekends && (dayOfWeek === 0 || dayOfWeek === 6);
        const weekendClass = isWeekend ? 'weekend-day' : '';
        
        g.innerHTML += `<div class="${shouldShowToday ? 'today' : ''} ${weekendClass}" data-date="${dateStr}" style="cursor:pointer">${d}${dotHtml}</div>`;
      }

      box.append(w, g);
      calEl.appendChild(box);
    });

    // Add click handlers to dates for event viewing
    calEl.querySelectorAll('.days div[data-date]').forEach(dayEl => {
      dayEl.onclick = (e) => {
        const dateStr = e.currentTarget.dataset.date;
        if (!dateStr) return;
        selectedCalendarDate = dateStr;
        const eventDateInput = document.getElementById('eventDateInput');
        if (eventDateInput) eventDateInput.value = dateStr;
        if (window.renderEvents) window.renderEvents(dateStr);
        
        // Show events widget if hidden
        const eventsWidget = document.getElementById('floatingEvents');
        if (eventsWidget && eventsWidget.style.display === 'none') {
          if (window.updateEventsVisibility) window.updateEventsVisibility(true);
        }
      };
    });
  }

  // Helper function to get week number
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Expose renderCalendar globally
  window.renderCalendar = renderCalendar;

  // Initial render
  renderCalendar(shownYear);

  // Month view toggle
  if (monthToggleBtn) {
    monthToggleBtn.onclick = () => {
      if (monthViewIndex === null) {
        monthViewIndex = TODAY_MONTH;
        monthToggleBtn.textContent = '📅 Year View';
        yearEl.textContent = `${MONTHS[monthViewIndex]} ${shownYear}`;
      } else {
        monthViewIndex = null;
        monthToggleBtn.textContent = '📅 Month View';
        yearEl.textContent = `Calendar ${shownYear}`;
      }
      renderCalendar(shownYear);
    };
  }

  // Click on month name to switch to month view
  calEl.addEventListener('click', (e) => {
    const h = e.target.closest('h2[data-month]');
    if (!h) return;
    monthViewIndex = Number(h.dataset.month);
    monthToggleBtn.textContent = '📅 Year View';
    yearEl.textContent = `${MONTHS[monthViewIndex]} ${shownYear}`;
    renderCalendar(shownYear);
  });

  // Navigation buttons
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const todayBtn = document.getElementById('todayBtn');

  if (prevBtn) {
    prevBtn.onclick = () => {
      shownYear--;
      renderCalendar(shownYear);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      shownYear++;
      renderCalendar(shownYear);
    };
  }

  if (todayBtn) {
    todayBtn.onclick = () => {
      shownYear = CURRENT_YEAR;
      monthViewIndex = null;
      monthToggleBtn.textContent = '📅 Month View';
      renderCalendar(shownYear);
    };
  }

  // Settings button handler
  const calendarSettingsBtn = document.getElementById('calendarSettingsBtn');
  if (calendarSettingsBtn) {
    calendarSettingsBtn.onclick = () => {
      const settingsPage = document.getElementById('settingsPage');
      if (settingsPage) {
        settingsPage.style.display = 'block';
        // Switch to calendar settings
        const calendarSettings = document.getElementById('calendarAppSettings');
        if (calendarSettings && window.showAppSettings) {
          window.showAppSettings('calendar');
        }
      }
    };
  }

  // Close button handler
  const closeCalendarBtn = document.getElementById('closeCalendarBtn');
  if (closeCalendarBtn) {
    closeCalendarBtn.onclick = () => {
      if (window.updateCalendarVisibility) {
        window.updateCalendarVisibility(false);
      }
    };
  }

  // Expose events array and related functions globally for Firebase integration
  window.calendarEvents = events;
  window.selectedCalendarDate = selectedCalendarDate;
  window.eventsLoaded = eventsLoaded;

  // Function to update events from external source (like Firebase)
  window.updateCalendarEvents = function(newEvents) {
    events = newEvents || [];
    window.calendarEvents = events;
    renderCalendar(shownYear);
  };

  // Function to mark events as loaded
  window.setEventsLoaded = function(loaded) {
    eventsLoaded = loaded;
    window.eventsLoaded = eventsLoaded;
  };

  // Calendar visibility function
  const floatingCalendar = document.getElementById('floatingCalendar');
  const toggleCalendarApp = document.getElementById('toggleCalendarApp');

  function updateCalendarVisibility(visible) {
    if (!floatingCalendar) return;
    floatingCalendar.style.display = visible ? 'flex' : 'none';
    if (visible && window.bringToFront) window.bringToFront(floatingCalendar);
    if (toggleCalendarApp) toggleCalendarApp.classList.toggle('active', !!visible);
    if (window.saveCurrentCanvas) window.saveCurrentCanvas();
  }
  window.updateCalendarVisibility = updateCalendarVisibility;

  // Initialize visibility from storage
  const CALENDAR_VIS_KEY = 'show_floating_calendar';
  const savedVis = localStorage.getItem(CALENDAR_VIS_KEY);
  if (savedVis === 'true') {
    updateCalendarVisibility(true);
  }

})();
