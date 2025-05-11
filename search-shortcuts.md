---
layout: page
title: Search Keyboard Shortcuts
description: Learn all the keyboard shortcuts available for the search functionality.
permalink: /search-shortcuts/
---

# Search Keyboard Shortcuts
<button class="keyboard-shortcut-help-btn c-btn c-btn--tech c-btn--sm" aria-label="Show keyboard shortcuts">
  <span class="tech-key">?</span> Show Shortcuts Dialog
</button>

This page lists all the keyboard shortcuts available for the search functionality on this site.

## Global Shortcuts

These shortcuts work anywhere on the site:

| Shortcut | Description |
|----------|-------------|
| `/` | Focus the search box |
| `Alt + S` | Focus the search box (alternative) |
| `Esc` | Clear search and close results (when search is focused) |

## Search Results Navigation

When search results are displayed:

| Shortcut | Description |
|----------|-------------|
| `↑` | Navigate to previous search result |
| `↓` | Navigate to next search result |
| `Enter` | Open the currently selected result |
| `Esc` | Return focus to search input |

## Search Suggestions

When typing in the search box:

| Shortcut | Description |
|----------|-------------|
| `↑` | Navigate to previous suggestion |
| `↓` | Navigate to next suggestion |
| `Enter` | Apply the selected suggestion |
| `Esc` | Close suggestions |
| `Tab` | Close suggestions and continue |

## Accessibility Features

The search functionality includes several accessibility features:

- All interactive elements have proper ARIA attributes
- Search results and status are announced to screen readers
- Keyboard focus is visually indicated
- All functionality is available without using a mouse

## How to Use

1. Press `/` or `Alt+S` anywhere on the site to focus the search box
2. Begin typing to see search suggestions
3. Use arrow keys to navigate through suggestions and results
4. Press `Enter` to select a suggestion or result
5. Press `Esc` to clear the search or close results

<div class="tech-card">
  <div class="card-header">
    <h3>Try It Now</h3>
    <span class="card-decoration"></span>
  </div>
  <p>Press <kbd>/</kbd> to focus the search box and start searching!</p>
  <a href="/search/" class="c-btn c-btn--tech">Go to Search Page</a>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard shortcut demo functionality
    const demoElements = document.querySelectorAll('kbd');
    
    demoElements.forEach(element => {
      element.classList.add('tech-key');
    });
  });
</script>

<script src="/assets/js/tech-keyboard-shortcuts.js" defer></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize keyboard shortcuts module
    if (window.TechKeyboardShortcuts) {
      window.TechKeyboardShortcuts.init();
    }
    
    // Add keyboard shortcut help button functionality
    const helpBtn = document.querySelector('.keyboard-shortcut-help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', function() {
        if (window.TechKeyboardShortcuts) {
          window.TechKeyboardShortcuts.showShortcutsDialog();
        }
      });
    }
  });
</script>
