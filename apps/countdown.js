// Countdown Widget
(function() {
  'use strict';

  const floatingCountdown = document.getElementById('floatingCountdown');
  
  // State
  let countdowns = [];
  let countdownsLoaded = false;
  let countdownUpdateInterval = null;
  
  // Get DOM elements
  const countdownTitleInput = document.getElementById('countdownTitleInput');
  const countdownDateInput = document.getElementById('countdownDateInput');
  const countdownAddBtn = document.getElementById('countdownAddBtn');
  const countdownList = document.getElementById('countdownList');
  
  // Set minimum date to today to prevent past dates
  if (countdownDateInput) {
    const today = new Date().toISOString().split('T')[0];
    countdownDateInput.min = today;
  }

  // Calculate time difference
  function getTimeRemaining(targetDate) {
    const now = new Date();
    const target = new Date(targetDate + 'T00:00:00');
    const diff = target - now;
    
    if (diff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { expired: false, days, hours, minutes, seconds };
  }

  // Render countdowns to DOM
  function renderCountdowns() {
    if (!countdownList) {
      console.error('[COUNTDOWN] countdownList element not found');
      return;
    }
    
    console.log('[COUNTDOWN] Rendering', countdowns.length, 'countdowns');
    countdownList.innerHTML = '';
    
    // Show loading state if waiting for Firebase
    if (!countdownsLoaded && window.auth && window.auth.currentUser) {
      countdownList.innerHTML = '<div class="countdown-empty"><div class="countdown-empty-icon">☁️</div>Syncing from cloud...</div>';
      return;
    }
    
    // Show empty state if no countdowns
    if (countdowns.length === 0) {
      const isLoggedIn = window.auth && window.auth.currentUser;
      const message = isLoggedIn 
        ? 'No countdowns yet. Add one above!' 
        : 'No countdowns yet. Sign in to sync across devices!';
      countdownList.innerHTML = `<div class="countdown-empty"><div class="countdown-empty-icon">⏰</div>${message}</div>`;
      return;
    }
    
    // Sort countdowns by date (closest first)
    const sortedCountdowns = [...countdowns].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Render each countdown
    sortedCountdowns.forEach((countdown) => {
      const item = document.createElement('div');
      item.className = 'countdown-item';
      
      const timeRemaining = getTimeRemaining(countdown.date);
      if (timeRemaining.expired) {
        item.classList.add('countdown-item-expired');
      }
      
      // Header with title and delete button
      const header = document.createElement('div');
      header.className = 'countdown-item-header';
      
      const title = document.createElement('div');
      title.className = 'countdown-item-title';
      title.textContent = countdown.title;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'countdown-item-delete';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCountdown(countdown.id);
      });
      
      header.appendChild(title);
      header.appendChild(deleteBtn);
      
      // Date display
      const dateDiv = document.createElement('div');
      dateDiv.className = 'countdown-item-date';
      const dateObj = new Date(countdown.date);
      dateDiv.textContent = dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Time blocks
      const timeDiv = document.createElement('div');
      timeDiv.className = 'countdown-item-time';
      
      if (timeRemaining.expired) {
        timeDiv.innerHTML = '<div class="countdown-time-block" style="flex:1;"><span class="countdown-time-value">Expired</span><span class="countdown-time-label">Event Passed</span></div>';
      } else {
        // Only show relevant time blocks
        if (timeRemaining.days > 0) {
          const daysBlock = document.createElement('div');
          daysBlock.className = 'countdown-time-block';
          daysBlock.innerHTML = `<span class="countdown-time-value">${timeRemaining.days}</span><span class="countdown-time-label">Days</span>`;
          timeDiv.appendChild(daysBlock);
        }
        
        if (timeRemaining.days > 0 || timeRemaining.hours > 0) {
          const hoursBlock = document.createElement('div');
          hoursBlock.className = 'countdown-time-block';
          hoursBlock.innerHTML = `<span class="countdown-time-value">${timeRemaining.hours}</span><span class="countdown-time-label">Hours</span>`;
          timeDiv.appendChild(hoursBlock);
        }
        
        if (timeRemaining.days === 0) {
          const minsBlock = document.createElement('div');
          minsBlock.className = 'countdown-time-block';
          minsBlock.innerHTML = `<span class="countdown-time-value">${timeRemaining.minutes}</span><span class="countdown-time-label">Mins</span>`;
          timeDiv.appendChild(minsBlock);
          
          const secsBlock = document.createElement('div');
          secsBlock.className = 'countdown-time-block';
          secsBlock.innerHTML = `<span class="countdown-time-value">${timeRemaining.seconds}</span><span class="countdown-time-label">Secs</span>`;
          timeDiv.appendChild(secsBlock);
        }
      }
      
      item.appendChild(header);
      item.appendChild(dateDiv);
      item.appendChild(timeDiv);
      countdownList.appendChild(item);
    });
  }

  // Add new countdown
  function addCountdown() {
    if (!countdownTitleInput || !countdownDateInput) return;
    
    const title = countdownTitleInput.value.trim();
    const date = countdownDateInput.value;
    
    if (!title) {
      alert('Please enter an event name');
      countdownTitleInput.focus();
      return;
    }
    
    if (!date) {
      alert('Please select a date');
      countdownDateInput.focus();
      return;
    }
    
    // Check if user is authenticated for cloud sync
    if (!window.auth || !window.auth.currentUser) {
      alert('Please sign in to save countdowns to the cloud');
      return;
    }
    
    console.log('[COUNTDOWN] Adding new countdown:', title, date);
    
    const newCountdown = {
      title: title,
      date: date,
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    
    countdowns.push(newCountdown);
    countdownTitleInput.value = '';
    countdownDateInput.value = '';
    
    console.log('[COUNTDOWN] Total countdowns:', countdowns.length);
    renderCountdowns();
    saveCountdownsToFirebase();
  }

  // Delete countdown
  function deleteCountdown(id) {
    console.log('[COUNTDOWN] Deleting countdown:', id);
    countdowns = countdowns.filter(c => c.id !== id);
    
    renderCountdowns();
    saveCountdownsToFirebase();
  }

  // Save countdowns to Firebase
  async function saveCountdownsToFirebase() {
    try {
      // Verify authentication
      if (!window.auth || !window.auth.currentUser) {
        console.warn('[COUNTDOWN] Not authenticated, cannot save');
        return;
      }
      
      if (!window.db || !window.doc || !window.setDoc || !window.serverTimestamp) {
        console.error('[COUNTDOWN] Firebase not initialized');
        return;
      }
      
      const userId = window.auth.currentUser.uid;
      const deviceId = window.deviceId || 'unknown';
      
      console.log('[COUNTDOWN] ☁️ Saving', countdowns.length, 'countdowns to cloud for user:', userId);
      
      const countdownRef = window.doc(window.db, 'user_countdowns', userId);
      await window.setDoc(countdownRef, {
        items: countdowns,
        by: deviceId,
        updatedAt: window.serverTimestamp()
      });
      
      console.log('[COUNTDOWN] ✅ Successfully synced to cloud');
    } catch (error) {
      console.error('[COUNTDOWN] ❌ Failed to save to Firebase:', error);
      console.error('[COUNTDOWN] Error code:', error.code);
      console.error('[COUNTDOWN] Error message:', error.message);
    }
  }

  // Load countdowns from Firebase (called by Firebase listener)
  function loadCountdownsFromFirebase(data) {
    try {
      console.log('[COUNTDOWN] ☁️ Loading data from cloud:', data);
      
      if (!data) {
        console.log('[COUNTDOWN] No cloud data found, starting fresh');
        countdowns = [];
        countdownsLoaded = true;
        renderCountdowns();
        return;
      }
      
      if (Array.isArray(data.items)) {
        countdowns = data.items;
        console.log('[COUNTDOWN] ✅ Synced', countdowns.length, 'countdowns from cloud');
      } else {
        console.warn('[COUNTDOWN] Invalid data format, starting fresh');
        countdowns = [];
      }
      
      countdownsLoaded = true;
      renderCountdowns();
    } catch (error) {
      console.error('[COUNTDOWN] ❌ Error syncing from cloud:', error);
      countdowns = [];
      countdownsLoaded = true;
      renderCountdowns();
    }
  }

  // Set up event listeners
  if (countdownAddBtn) {
    countdownAddBtn.addEventListener('click', addCountdown);
    console.log('[COUNTDOWN] Add button listener attached');
  }

  if (countdownTitleInput) {
    countdownTitleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addCountdown();
      }
    });
  }

  if (countdownDateInput) {
    countdownDateInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addCountdown();
      }
    });
  }

  // Update countdowns every second
  countdownUpdateInterval = setInterval(() => {
    if (countdowns.length > 0 && floatingCountdown && floatingCountdown.style.display !== 'none') {
      renderCountdowns();
    }
  }, 1000);

  // Initial render
  console.log('[COUNTDOWN] Initial render');
  renderCountdowns();

  // Export for main script
  window.CountdownWidget = {
    element: floatingCountdown,
    loadFromFirebase: loadCountdownsFromFirebase
  };
  
  // Expose function for Firebase listener
  window.applyRemoteCountdowns = loadCountdownsFromFirebase;
})();

