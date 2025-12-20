// Notes Widget
(function() {
  'use strict';

  const floatingNotes = document.getElementById('floatingNotes');
  const notesEditor = document.getElementById('notesEditor');
  const toolButtons = document.querySelectorAll('.notes-tools button[data-cmd]');

  const NOTES_KEY = 'calendar_notes_rich';

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

  // Load and save notes
  if (notesEditor) {
    notesEditor.innerHTML = localStorage.getItem(NOTES_KEY) || '';
    notesEditor.oninput = () => localStorage.setItem(NOTES_KEY, notesEditor.innerHTML);
  }

  // Export for main script
  window.NotesWidget = {
    element: floatingNotes,
    getContent: () => notesEditor.innerHTML,
    setContent: (html) => { notesEditor.innerHTML = html; }
  };
})();
