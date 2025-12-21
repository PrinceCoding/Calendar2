/* =========================
   CANVAS MANAGER
   Multi-canvas workspace management
   ========================= */

// Constants
const CANVASES_STORAGE_KEY = 'app_canvases_data';

// State
let canvases = {};
let activeCanvasId = null;

// Initialize canvas manager
function initializeCanvasManager() {
  loadCanvasesFromStorage();
  
  console.log('After loadCanvasesFromStorage - activeCanvasId:', activeCanvasId);
  
  // Create default canvas if none exist
  if (Object.keys(canvases).length === 0) {
    const defaultCanvas = createCanvas('Canvas 1');
    defaultCanvas.visibility = { canvasManager: true }; // Canvas manager visible by default
    activeCanvasId = defaultCanvas.id;
    saveCanvasesToStorage();
  } else if (!activeCanvasId || !canvases[activeCanvasId]) {
    // Set first canvas as active only if no active canvas was loaded
    activeCanvasId = Object.keys(canvases)[0];
    console.log('No active canvas found, setting to first:', activeCanvasId);
  } else {
    console.log('Keeping loaded activeCanvasId:', activeCanvasId);
  }
  
  renderCanvasTabs();
  loadActiveCanvasState();
  setupEventListeners();
  updateCanvasNameDisplay();
}

// Create a new canvas
function createCanvas(name) {
  const id = 'canvas_' + Date.now();
  const canvas = {
    id: id,
    name: name || `Canvas ${Object.keys(canvases).length + 1}`,
    positions: {},
    visibility: { canvasManager: true }, // Canvas manager visible by default
    scrollLeft: 0,
    scrollTop: 0,
    createdAt: Date.now()
  };
  canvases[id] = canvas;
  return canvas;
}

// Add new canvas
function addNewCanvas() {
  const newCanvas = createCanvas();
  activeCanvasId = newCanvas.id;
  saveCanvasesToStorage();
  renderCanvasTabs();
  loadActiveCanvasState();
}

// Switch to a canvas
function switchToCanvas(canvasId) {
  if (canvasId === activeCanvasId) return;
  
  // Save current canvas state before switching
  saveActiveCanvasState();
  
  // Switch to new canvas
  activeCanvasId = canvasId;
  saveCanvasesToStorage(); // Save the new active canvas
  renderCanvasTabs();
  loadActiveCanvasState();
  updateCanvasNameDisplay();
}

// Delete a canvas - rewritten from scratch
function deleteCanvas(canvasId) {
  // Find all canvas IDs
  const allCanvasIds = Object.keys(canvases);
  
  // Check if this canvas exists
  if (!canvases[canvasId]) {
    return;
  }
  
  // Determine if we're deleting the active canvas
  const isDeletingActive = (canvasId === activeCanvasId);
  
  // Remove the canvas from our data
  delete canvases[canvasId];
  
  // Handle the case where we deleted the last canvas
  const remainingCanvasIds = Object.keys(canvases);
  if (remainingCanvasIds.length === 0) {
    // Create a fresh canvas
    const freshCanvas = createCanvas('Canvas 1');
    canvases[freshCanvas.id] = freshCanvas;
    activeCanvasId = freshCanvas.id;
  } else if (isDeletingActive) {
    // We deleted the active canvas, switch to the first remaining one
    activeCanvasId = remainingCanvasIds[0];
  }
  
  // Persist changes to localStorage
  saveCanvasesToStorage();
  
  // Re-render the tabs UI
  renderCanvasTabs();
  
  // Load the state of the now-active canvas
  loadActiveCanvasState();
}

// Rename a canvas
function renameCanvas(canvasId, newName) {
  if (!newName || !newName.trim()) return;
  canvases[canvasId].name = newName.trim();
  saveCanvasesToStorage();
  renderCanvasTabs();
  updateCanvasNameDisplay();
}

// Update canvas name display in header
function updateCanvasNameDisplay() {
  const displayElement = document.getElementById('canvasNameDisplay');
  if (displayElement && activeCanvasId && canvases[activeCanvasId]) {
    displayElement.textContent = canvases[activeCanvasId].name;
  }
}

// Render canvas tabs - rewritten from scratch
function renderCanvasTabs() {
  const container = document.getElementById('canvasTabsContainer');
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Build a tab for each canvas
  Object.values(canvases).forEach(canvas => {
    // Create main tab element
    const tabElement = document.createElement('div');
    tabElement.className = 'canvas-tab';
    if (canvas.id === activeCanvasId) {
      tabElement.classList.add('active');
    }
    
    // Create name display
    const nameElement = document.createElement('span');
    nameElement.className = 'canvas-tab-name';
    nameElement.textContent = canvas.name;
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'canvas-tab-buttons';
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'canvas-delete-btn';
    deleteButton.innerHTML = '×';
    deleteButton.title = 'Delete Canvas';
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteCanvas(canvas.id);
    });
    
    // Create rename button
    const renameButton = document.createElement('button');
    renameButton.className = 'canvas-rename-btn';
    renameButton.innerHTML = '✎';
    renameButton.title = 'Rename Canvas';
    renameButton.type = 'button';
    renameButton.addEventListener('click', (event) => {
      event.stopPropagation();
      startRenaming(tabElement, canvas);
    });
    
    // Assemble buttons
    buttonsContainer.appendChild(deleteButton);
    buttonsContainer.appendChild(renameButton);
    
    // Assemble tab
    tabElement.appendChild(nameElement);
    tabElement.appendChild(buttonsContainer);
    
    // Add click handler to switch canvases
    tabElement.addEventListener('click', () => {
      switchToCanvas(canvas.id);
    });
    
    // Add to container
    container.appendChild(tabElement);
  });
  
  // Update canvas name display in header
  updateCanvasNameDisplay();
  
  // Add new canvas button
  const addBtn = document.createElement('button');
  addBtn.className = 'canvas-add-btn';
  addBtn.innerHTML = '+';
  addBtn.title = 'New Canvas';
  addBtn.onclick = addNewCanvas;
  container.appendChild(addBtn);
}

// Start renaming a canvas
function startRenaming(tabElement, canvas) {
  const nameSpan = tabElement.querySelector('.canvas-tab-name');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'canvas-tab-rename-input';
  input.value = canvas.name;
  
  nameSpan.replaceWith(input);
  input.focus();
  input.select();
  
  const finishRename = () => {
    const newName = input.value.trim();
    if (newName && newName !== canvas.name) {
      renameCanvas(canvas.id, newName);
    } else {
      renderCanvasTabs();
    }
  };
  
  input.onblur = finishRename;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      renderCanvasTabs();
    }
  };
}

// Save active canvas state
function saveActiveCanvasState() {
  if (!activeCanvasId || !canvases[activeCanvasId]) return;
  
  const canvas = canvases[activeCanvasId];
  
  // Save scroll position
  const workspace = document.getElementById('canvasWorkspace');
  if (workspace) {
    canvas.scrollLeft = workspace.scrollLeft;
    canvas.scrollTop = workspace.scrollTop;
  }
  
  // Save widget positions and visibility
  const widgets = [
    { el: document.getElementById('analogClock'), id: 'analogClock' },
    { el: document.getElementById('floatingPomo'), id: 'floatingPomo' },
    { el: document.getElementById('floatingTodo'), id: 'floatingTodo' },
    { el: document.getElementById('floatingEvents'), id: 'floatingEvents' },
    { el: document.getElementById('floatingCalculator'), id: 'floatingCalculator' },
    { el: document.getElementById('floatingCalendar'), id: 'floatingCalendar' },
    { el: document.getElementById('floatingNotes'), id: 'floatingNotes' },
    { el: document.getElementById('canvasManager'), id: 'canvasManager' }
  ];
  
  canvas.positions = {};
  canvas.visibility = {};
  
  widgets.forEach(({ el, id }) => {
    if (!el) return;
    
    // Save visibility
    canvas.visibility[id] = el.style.display !== 'none';
    
    // Save position if has been positioned
    if (el.style.left && el.style.top) {
      canvas.positions[id] = {
        left: el.style.left,
        top: el.style.top,
        width: el.style.width || '',
        height: el.style.height || ''
      };
    }
  });
  
  saveCanvasesToStorage();
}

// Load active canvas state
function loadActiveCanvasState() {
  if (!activeCanvasId || !canvases[activeCanvasId]) return;
  
  const canvas = canvases[activeCanvasId];
  
  // Restore scroll position
  const workspace = document.getElementById('canvasWorkspace');
  if (workspace) {
    workspace.scrollLeft = canvas.scrollLeft || 0;
    workspace.scrollTop = canvas.scrollTop || 0;
  }
  
  // Default positions for new canvases
  const defaultPositions = {
    analogClock: { left: '100px', top: '100px' },
    floatingPomo: { left: '250px', top: '100px' },
    floatingTodo: { left: '400px', top: '100px' },
    floatingCalculator: { left: '700px', top: '100px' },
    floatingEvents: { left: '400px', top: '250px' },
    floatingCalendar: { left: '50px', top: '50px' },
    floatingNotes: { left: '700px', top: '450px' },
    canvasManager: { left: '300px', top: '80px' }
  };
  
  // Default visibility (all hidden except canvas manager on new canvas)
  const defaultVisibility = {
    analogClock: false,
    floatingPomo: false,
    floatingTodo: false,
    floatingEvents: false,
    floatingCalculator: false,
    floatingCalendar: false,
    floatingNotes: false,
    canvasManager: true
  };
  
  // Widget configurations
  const widgets = [
    { el: document.getElementById('analogClock'), id: 'analogClock', display: 'block' },
    { el: document.getElementById('floatingPomo'), id: 'floatingPomo', display: 'block' },
    { el: document.getElementById('floatingTodo'), id: 'floatingTodo', display: 'flex' },
    { el: document.getElementById('floatingEvents'), id: 'floatingEvents', display: 'flex' },
    { el: document.getElementById('floatingCalculator'), id: 'floatingCalculator', display: 'flex' },
    { el: document.getElementById('floatingCalendar'), id: 'floatingCalendar', display: 'flex' },
    { el: document.getElementById('floatingNotes'), id: 'floatingNotes', display: 'flex' },
    { el: document.getElementById('canvasManager'), id: 'canvasManager', display: 'flex' }
  ];
  
  widgets.forEach(({ el, id, display }) => {
    if (!el) return;
    
    // Restore visibility
    const isVisible = canvas.visibility && canvas.visibility[id] !== undefined 
      ? canvas.visibility[id] 
      : defaultVisibility[id];
    
    el.style.display = isVisible ? display : 'none';
    
    // Update toggle button - proper mapping
    const toggleMap = {
      'analogClock': 'toggleClockApp',
      'floatingPomo': 'togglePomoApp',
      'floatingTodo': 'toggleTodoApp',
      'floatingEvents': 'toggleEventsApp',
      'floatingCalculator': 'toggleCalculatorApp',
      'floatingCalendar': 'toggleCalendarApp',
      'floatingNotes': 'toggleNotesApp',
      'canvasManager': 'toggleCanvasManagerApp'
    };
    
    const toggleBtnId = toggleMap[id];
    const toggleBtn = toggleBtnId ? document.getElementById(toggleBtnId) : null;
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', isVisible);
    }
    
    // Restore position
    const savedPos = canvas.positions && canvas.positions[id];
    const defaultPos = defaultPositions[id];
    
    if (savedPos && savedPos.left && savedPos.top) {
      el.style.left = savedPos.left;
      el.style.top = savedPos.top;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      if (savedPos.width) el.style.width = savedPos.width;
      if (savedPos.height) el.style.height = savedPos.height;
    } else if (defaultPos) {
      el.style.left = defaultPos.left;
      el.style.top = defaultPos.top;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.width = '';
      el.style.height = '';
    }
  });
}

// Load canvases from localStorage
function loadCanvasesFromStorage() {
  try {
    const saved = localStorage.getItem(CANVASES_STORAGE_KEY);
    if (saved) {
      canvases = JSON.parse(saved);
    }
    // Load the last active canvas ID
    const savedActiveId = localStorage.getItem('activeCanvasId');
    console.log('Loading from storage - savedActiveId:', savedActiveId);
    console.log('Available canvases:', Object.keys(canvases));
    if (savedActiveId && canvases[savedActiveId]) {
      activeCanvasId = savedActiveId;
      console.log('Set activeCanvasId to:', activeCanvasId);
    } else {
      console.log('No valid saved active canvas');
    }
  } catch (e) {
    console.error('Failed to load canvases:', e);
    canvases = {};
  }
}

// Save canvases to localStorage
function saveCanvasesToStorage() {
  try {
    localStorage.setItem(CANVASES_STORAGE_KEY, JSON.stringify(canvases));
    // Save the active canvas ID
    if (activeCanvasId) {
      localStorage.setItem('activeCanvasId', activeCanvasId);
    }
  } catch (e) {
    console.error('Failed to save canvases:', e);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Auto-save on widget changes (this will be called by main app)
  window.saveCurrentCanvas = saveActiveCanvasState;
  
  // Setup canvas switcher in dynamic island
  setupCanvasSwitcher();
}

// Setup canvas switcher dropdown
function setupCanvasSwitcher() {
  const switcher = document.getElementById('canvasSwitcher');
  const dropdown = document.getElementById('canvasDropdown');
  
  if (!switcher || !dropdown) return;
  
  // Toggle dropdown on click
  switcher.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = switcher.classList.contains('active');
    
    if (isActive) {
      closeCanvasDropdown();
    } else {
      openCanvasDropdown();
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      closeCanvasDropdown();
    }
  });
}

// Open canvas dropdown
function openCanvasDropdown() {
  const switcher = document.getElementById('canvasSwitcher');
  const dropdown = document.getElementById('canvasDropdown');
  
  if (!switcher || !dropdown) return;
  
  // Populate dropdown with canvas list
  dropdown.innerHTML = '';
  
  Object.values(canvases).forEach(canvas => {
    const item = document.createElement('button');
    item.className = 'canvas-dropdown-item';
    if (canvas.id === activeCanvasId) {
      item.classList.add('active');
      item.innerHTML = `<span>✓</span><span>${canvas.name}</span>`;
    } else {
      item.innerHTML = `<span style="opacity:0">✓</span><span>${canvas.name}</span>`;
    }
    
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      switchToCanvas(canvas.id);
      closeCanvasDropdown();
    });
    
    dropdown.appendChild(item);
  });
  
  // Add "New Canvas" button
  const addItem = document.createElement('button');
  addItem.className = 'canvas-dropdown-item add-new';
  addItem.innerHTML = '<span>+</span><span>New Canvas</span>';
  addItem.addEventListener('click', (e) => {
    e.stopPropagation();
    addNewCanvas();
    closeCanvasDropdown();
  });
  dropdown.appendChild(addItem);
  
  // Show dropdown
  switcher.classList.add('active');
  dropdown.classList.add('show');
}

// Close canvas dropdown
function closeCanvasDropdown() {
  const switcher = document.getElementById('canvasSwitcher');
  const dropdown = document.getElementById('canvasDropdown');
  
  if (!switcher || !dropdown) return;
  
  switcher.classList.remove('active');
  dropdown.classList.remove('show');
}

// Expose to window
window.initializeCanvasManager = initializeCanvasManager;
window.saveCurrentCanvas = saveActiveCanvasState;
