/**
 * Tech Search Modules Integration Test
 * 
 * This file tests the integration between all the modular components of
 * the tech search system. It verifies that they interact properly.
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.group('Tech Search Modules Integration Test');
  
  // Test 1: Verify all modules are loaded
  console.log('1. Checking module availability:');
  const modules = [
    { name: 'TechSearchCore', obj: window.TechSearchCore },
    { name: 'TechSearchAnimations', obj: window.TechSearchAnimations },
    { name: 'TechSearchKeyboardNavigation', obj: window.TechSearchKeyboardNavigation },
    { name: 'TechSearchHistory', obj: window.TechSearchHistory },
    { name: 'TechSettings', obj: window.TechSettings }
  ];
  
  let allLoaded = true;
  modules.forEach(module => {
    const loaded = !!module.obj;
    console.log(`  - ${module.name}: ${loaded ? '✅ Loaded' : '❌ Not Loaded'}`);
    if (!loaded) allLoaded = false;
  });
  
  if (!allLoaded) {
    console.error('❌ Some modules failed to load. Check script paths and loading order.');
    console.groupEnd();
    return;
  }
  
  console.log('✅ All modules loaded successfully!');
  
  // Test 2: Verify API consistency
  console.log('\n2. Checking module APIs:');
  
  // Each module should have an init method
  let apiConsistent = true;
  modules.forEach(module => {
    const hasInit = typeof module.obj.init === 'function';
    console.log(`  - ${module.name}.init: ${hasInit ? '✅ Available' : '❌ Missing'}`);
    if (!hasInit) apiConsistent = false;
  });
  
  if (!apiConsistent) {
    console.error('❌ Some modules have inconsistent APIs.');
    console.groupEnd();
    return;
  }
  
  console.log('✅ All module APIs are consistent!');
  
  // Test 3: Verify DOM elements required by modules
  console.log('\n3. Checking required DOM elements:');
  
  const domElements = [
    { name: 'Search Input', selector: '#c-search-input, .c-search-overlay__input', required: true },
    { name: 'Results Container', selector: '.c-search-results__list', required: false },
    { name: 'Status Element', selector: '#c-search-status', required: false },
    { name: 'Settings Panel', selector: '.c-tech-settings-panel', required: false }
  ];
  
  let requiredElementsMissing = false;
  domElements.forEach(element => {
    const el = document.querySelector(element.selector);
    console.log(`  - ${element.name}: ${el ? '✅ Found' : (element.required ? '❌ Missing (Required)' : '⚠️ Missing (Optional)')}`);
    if (!el && element.required) requiredElementsMissing = true;
  });
  
  if (requiredElementsMissing) {
    console.warn('⚠️ Some required DOM elements are missing.');
  } else {
    console.log('✅ All required DOM elements are present!');
  }
  
  // Test 4: Verify event handling between modules
  console.log('\n4. Testing inter-module communication:');
  
  // Initialize the theme from settings and verify it propagates
  try {
    if (window.TechSettings && window.TechSettings.applyTechTheme) {
      const testTheme = 'neon';
      window.TechSettings.applyTechTheme(testTheme);
      
      // Verify theme was applied
      const elements = document.querySelectorAll('[data-tech-theme]');
      let themeApplied = false;
      if (elements.length > 0) {
        themeApplied = Array.from(elements).some(el => el.getAttribute('data-tech-theme') === testTheme);
      }
      
      console.log(`  - Theme propagation: ${themeApplied ? '✅ Working' : '❌ Failed'}`);
    } else {
      console.log('  - Theme propagation: ⚠️ Test skipped (API not available)');
    }
  } catch (e) {
    console.error('  - Theme propagation: ❌ Error:', e);
  }
  
  // Test search functionality if available
  try {
    const searchInput = document.querySelector('#c-search-input, .c-search-overlay__input');
    if (searchInput && window.TechSearchCore && window.TechSearchCore.performSearch) {
      console.log('  - Search functionality: ✅ Available to test');
      // Note: We don't actually trigger a search to avoid side effects
    } else {
      console.log('  - Search functionality: ⚠️ Test skipped (elements or API not available)');
    }
  } catch (e) {
    console.error('  - Search functionality: ❌ Error:', e);
  }
  
  // Test keyboard navigation if available
  try {
    if (window.TechSearchKeyboardNavigation && window.TechSearchKeyboardNavigation.handleKeyDown) {
      console.log('  - Keyboard navigation: ✅ Available to test');
    } else {
      console.log('  - Keyboard navigation: ⚠️ Test skipped (API not available)');
    }
  } catch (e) {
    console.error('  - Keyboard navigation: ❌ Error:', e);
  }
  
  console.log('\n✅ Integration test completed!');
  console.groupEnd();
});
