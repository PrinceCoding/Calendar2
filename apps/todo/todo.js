// Todo List Widget
// Note: This file no longer handles data storage - all data is managed via Firebase in index.html
(function() {
  'use strict';

  const floatingTodo = document.getElementById('floatingTodo');

  // Export for main script (minimal widget info only)
  window.TodoWidget = {
    element: floatingTodo
  };
})();
