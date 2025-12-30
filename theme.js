// Theme Switcher Functionality
(function() {
  'use strict';
  
  // Get theme from localStorage or default to 'light'
  const getTheme = () => {
    return localStorage.getItem('theme') || 'light';
  };
  
  // Set theme
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
  };
  
  // Update theme toggle icon
  const updateThemeIcon = (theme) => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) {
        if (theme === 'dark') {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
        } else {
          icon.classList.remove('fa-sun');
          icon.classList.add('fa-moon');
        }
      }
    }
  };
  
  // Initialize theme on page load
  const initTheme = () => {
    const theme = getTheme();
    setTheme(theme);
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
  
  // Make toggleTheme available globally
  window.toggleTheme = toggleTheme;
  window.getTheme = getTheme;
  window.setTheme = setTheme;
})();



