// Notes Widget
// Note: This file no longer handles notes content storage - all data is managed via Firebase in index.html
(function() {
  'use strict';

  const floatingNotes = document.getElementById('floatingNotes');
  const notesEditor = document.getElementById('notesEditor');
  const toolButtons = document.querySelectorAll('.notes-tools button[data-cmd]');

  // Rich text controls
  toolButtons.forEach(b => {
    b.onclick = (e) => {
      e.preventDefault();
      document.execCommand(b.dataset.cmd);
      updateToolStates();
    };
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

  // Notes content is now loaded and saved via Firebase in index.html
  // No localStorage usage here

  // Export for main script
  window.NotesWidget = {
    element: floatingNotes,
    getContent: () => notesEditor ? notesEditor.innerHTML : '',
    setContent: (html) => { if (notesEditor) notesEditor.innerHTML = html; }
  };
})();
