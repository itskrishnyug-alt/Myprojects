'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const iconSpan = darkModeToggle.querySelector('.icon');

    // Check for saved user preference in local storage
    const savedDarkMode = localStorage.getItem('darkMode');

    // Check system preference if no saved preference exists
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Initialize dark mode state
    if (savedDarkMode === 'enabled' || (savedDarkMode === null && systemPrefersDark)) {
        body.classList.add('dark-mode');
        updateToggleIcon(true);
    } else {
        updateToggleIcon(false);
    }

    // Toggle Dark Mode
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');

        // Update local storage
        if (isDarkMode) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }

        // Update Icon
        updateToggleIcon(isDarkMode);
    });

    /**
     * Updates the toggle button icon based on the current mode
     * @param {boolean} isDark - True if dark mode is active
     */
    function updateToggleIcon(isDark) {
        if (isDark) {
            iconSpan.textContent = '☀️'; // Sun icon for switching back to light mode
        } else {
            iconSpan.textContent = '🌓'; // Moon icon for switching to dark mode
        }
    }
});
