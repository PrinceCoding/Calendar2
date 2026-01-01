# Konsta UI - Mobile Components Guide

Konsta UI is now integrated into your project! It provides mobile-first components built with Tailwind CSS.

## What is Konsta UI?

- **Mobile-first UI components** (iOS & Android styles)
- **Built with Tailwind CSS** (no custom CSS needed)
- **Touch-optimized** buttons, lists, cards, sheets
- **No JavaScript required** for basic components

## Available Components

### 1. **Bottom Sheet** (Mobile Drawer)
```html
<!-- Bottom Sheet for widgets -->
<div class="k-sheet k-sheet-opened">
  <div class="k-sheet-modal"></div>
  <div class="k-sheet-content">
    <div class="k-sheet-handle"></div>
    <div class="p-4">
      Your widget content here
    </div>
  </div>
</div>
```

### 2. **Touch-Optimized Buttons**
```html
<!-- iOS Style Button -->
<button class="k-button k-button-fill k-button-large k-button-rounded-full">
  <span>Add Task</span>
</button>

<!-- Android Material Button -->
<button class="k-button k-button-material k-button-raised">
  <span>Save</span>
</button>
```

### 3. **List with Swipe Actions**
```html
<div class="k-list k-list-inset">
  <div class="k-list-item">
    <div class="k-list-item-content">
      <div class="k-list-item-title">Todo Item</div>
      <div class="k-list-item-text">Description</div>
    </div>
  </div>
</div>
```

### 4. **Cards (Mobile-Optimized)**
```html
<div class="k-card k-card-outline">
  <div class="k-card-header">Card Title</div>
  <div class="k-card-content">
    Card content goes here
  </div>
</div>
```

### 5. **Navbar (Mobile Header)**
```html
<div class="k-navbar">
  <div class="k-navbar-bg"></div>
  <div class="k-navbar-inner">
    <div class="k-navbar-left">
      <button class="k-link k-navbar-back-link">
        <i data-lucide="chevron-left"></i>
      </button>
    </div>
    <div class="k-navbar-title">App Title</div>
  </div>
</div>
```

### 6. **FAB (Floating Action Button)**
```html
<button class="k-fab k-fab-right-bottom">
  <i data-lucide="plus"></i>
</button>
```

### 7. **Input Fields (Touch-Optimized)**
```html
<div class="k-list k-list-inset">
  <div class="k-list-item k-list-item-input">
    <div class="k-list-item-content k-list-item-content-input">
      <div class="k-list-item-input-wrap">
        <input type="text" placeholder="Enter task..." class="k-input">
      </div>
    </div>
  </div>
</div>
```

### 8. **Tabs (Bottom Navigation)**
```html
<div class="k-tabbar k-tabbar-labels">
  <a class="k-tabbar-link k-tabbar-link-active">
    <i data-lucide="home"></i>
    <span class="k-tabbar-link-text">Home</span>
  </a>
  <a class="k-tabbar-link">
    <i data-lucide="calendar"></i>
    <span class="k-tabbar-link-text">Calendar</span>
  </a>
</div>
```

### 9. **Toast Notifications**
```html
<div class="k-toast k-toast-center-bottom k-toast-opened">
  <div class="k-toast-content">
    Task completed!
  </div>
</div>
```

### 10. **Safe Area Support**
```html
<!-- Automatically handles iPhone notch/island -->
<div class="k-page safe-areas">
  <!-- Your content -->
</div>
```

## Theme Support

Konsta UI supports both iOS and Android styles:

```html
<!-- iOS Style (default) -->
<body class="k-ios">
  
<!-- Android Material Style -->
<body class="k-material-theme k-material">

<!-- Auto-detect -->
<script>
  if (/android/i.test(navigator.userAgent)) {
    document.body.classList.add('k-material-theme', 'k-material');
  } else {
    document.body.classList.add('k-ios');
  }
</script>
```

## Dark Mode

Works automatically with Tailwind's dark mode:

```html
<!-- Dark mode button -->
<button onclick="document.body.classList.toggle('dark')">
  Toggle Dark Mode
</button>
```

## Quick Start Examples

### Convert Todo Widget to Mobile-First:
```html
<div class="k-sheet k-sheet-opened">
  <div class="k-sheet-content">
    <div class="k-sheet-handle"></div>
    <div class="k-navbar">
      <div class="k-navbar-inner">
        <div class="k-navbar-title">To-Do List</div>
      </div>
    </div>
    
    <!-- Input -->
    <div class="k-list k-list-inset">
      <div class="k-list-item k-list-item-input">
        <div class="k-list-item-content k-list-item-content-input">
          <div class="k-list-item-input-wrap">
            <input type="text" placeholder="Add task..." class="k-input">
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tasks List -->
    <div class="k-list k-list-strong k-list-dividers">
      <div class="k-list-item">
        <div class="k-list-item-content">
          <div class="k-list-item-title">Buy groceries</div>
        </div>
      </div>
    </div>
    
    <!-- FAB -->
    <button class="k-fab k-fab-right-bottom">
      <i data-lucide="plus"></i>
    </button>
  </div>
</div>
```

## Best Practices

1. **Use `k-ios` or `k-material`** class on `<body>` for platform styling
2. **Add `safe-areas`** class for iPhone notch support
3. **Use `k-sheet`** for bottom drawer widgets
4. **Use `k-fab`** for primary actions
5. **Combine with Lucide icons** for consistent look

## Resources

- Official Docs: https://konstaui.com/
- Examples: https://konstaui.com/examples
- Components List: https://konstaui.com/components

## Next Steps

1. Add `k-ios` class to your `<body>` tag
2. Convert your widgets to use `k-sheet` components
3. Replace buttons with `k-button` for better touch targets
4. Add `k-fab` for quick actions
5. Use `k-list` for todo/event items

**Konsta UI is now ready to use!** All components work with your existing Tailwind setup. 🎨📱
