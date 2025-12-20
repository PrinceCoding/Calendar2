// Pomodoro Timer Widget - Drag functionality only
// Main pomodoro logic is in index.html
(function() {
  'use strict';

  const floatingPomo = document.getElementById('floatingPomo');
  
  // Export for main script
  window.PomodoroWidget = {
    element: floatingPomo
  };
})();
