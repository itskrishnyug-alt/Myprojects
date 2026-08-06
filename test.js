const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const requiredFiles = ['index.html', 'style.css', 'app.js'];

let allPassed = true;

// Check if files exist
requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
        console.error(`❌ Missing required file: ${file}`);
        allPassed = false;
    } else {
        console.log(`✅ Found file: ${file}`);
    }
});

if (!allPassed) {
    process.exit(1);
}

// Basic content checks for index.html
const indexHtmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const requiredHtmlElements = [
    '<link rel="stylesheet" href="style.css">',
    '<script src="app.js"></script>',
    'id="dark-mode-toggle"',
    'id="device-specs"',
    'id="camera-modes"',
    'id="battery-health"',
    'id="ai-assistant"'
];

requiredHtmlElements.forEach(element => {
    if (!indexHtmlContent.includes(element)) {
        console.error(`❌ Missing element in index.html: ${element}`);
        allPassed = false;
    } else {
        console.log(`✅ Found element in index.html: ${element}`);
    }
});

// Basic content checks for style.css
const styleCssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

const requiredCssClasses = [
    'body.dark-mode',
    'display: grid',
    'display: flex'
];

requiredCssClasses.forEach(className => {
    if (!styleCssContent.includes(className)) {
        console.error(`❌ Missing class/property in style.css: ${className}`);
        allPassed = false;
    } else {
        console.log(`✅ Found class/property in style.css: ${className}`);
    }
});

// --- Functional Tests using JSDOM ---

console.log('\n--- Running Functional Tests ---');

function setupDOM(localStorageData = null, prefersDark = false) {
    const dom = new JSDOM(indexHtmlContent, {
        url: "http://localhost/",
        runScripts: "dangerously"
    });

    const window = dom.window;

    // Mock localStorage
    const storage = {};
    if (localStorageData !== null) {
        storage['darkMode'] = localStorageData;
    }

    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: (key) => storage[key] || null,
            setItem: (key, value) => { storage[key] = value; },
            removeItem: (key) => { delete storage[key]; },
            clear: () => { Object.keys(storage).forEach(key => delete storage[key]); }
        },
        writable: true
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
        value: query => ({
            matches: prefersDark && query === '(prefers-color-scheme: dark)',
        }),
        writable: true
    });

    // Load and execute app.js
    const appJsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = appJsContent;
    window.document.body.appendChild(scriptEl);

    return { window, dom, storage };
}

function runTest(testName, testFn) {
    try {
        testFn();
        console.log(`✅ ${testName}`);
    } catch (err) {
        console.error(`❌ ${testName}`);
        console.error(err);
        allPassed = false;
    }
}

// Test 1: Initialization when localStorage has 'enabled'
runTest('Initialization with localStorage = enabled', () => {
    const { window } = setupDOM('enabled');
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

    if (!window.document.body.classList.contains('dark-mode')) {
        throw new Error("Body should have 'dark-mode' class");
    }

    const icon = window.document.getElementById('dark-mode-toggle').querySelector('.icon').textContent;
    if (icon !== '☀️') {
        throw new Error(`Expected icon '☀️', but got '${icon}'`);
    }
});

// Test 2: Initialization when localStorage has 'disabled'
runTest('Initialization with localStorage = disabled', () => {
    const { window } = setupDOM('disabled');
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

    if (window.document.body.classList.contains('dark-mode')) {
        throw new Error("Body should not have 'dark-mode' class");
    }

    const icon = window.document.getElementById('dark-mode-toggle').querySelector('.icon').textContent;
    if (icon !== '🌓') {
        throw new Error(`Expected icon '🌓', but got '${icon}'`);
    }
});

// Test 3: Initialization when localStorage is empty, system prefers dark
runTest('Initialization with no localStorage, system prefers dark', () => {
    const { window } = setupDOM(null, true);
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

    if (!window.document.body.classList.contains('dark-mode')) {
        throw new Error("Body should have 'dark-mode' class due to system preference");
    }
});

// Test 4: Initialization when localStorage is empty, system prefers light
runTest('Initialization with no localStorage, system prefers light', () => {
    const { window } = setupDOM(null, false);
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

    if (window.document.body.classList.contains('dark-mode')) {
        throw new Error("Body should not have 'dark-mode' class due to system preference");
    }
});

// Test 5: Toggling dark mode via button click
runTest('Toggling dark mode via button click updates state and localStorage', () => {
    const { window, storage } = setupDOM(null, false); // Start in light mode
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

    const toggleBtn = window.document.getElementById('dark-mode-toggle');

    // First click -> enable dark mode
    toggleBtn.click();
    if (!window.document.body.classList.contains('dark-mode')) {
        throw new Error("Body should have 'dark-mode' class after first click");
    }
    if (storage['darkMode'] !== 'enabled') {
        throw new Error("localStorage['darkMode'] should be 'enabled'");
    }
    let icon = toggleBtn.querySelector('.icon').textContent;
    if (icon !== '☀️') {
        throw new Error(`Expected icon '☀️', but got '${icon}'`);
    }

    // Second click -> disable dark mode
    toggleBtn.click();
    if (window.document.body.classList.contains('dark-mode')) {
        throw new Error("Body should not have 'dark-mode' class after second click");
    }
    if (storage['darkMode'] !== 'disabled') {
        throw new Error("localStorage['darkMode'] should be 'disabled'");
    }
    icon = toggleBtn.querySelector('.icon').textContent;
    if (icon !== '🌓') {
        throw new Error(`Expected icon '🌓', but got '${icon}'`);
    }
});

if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}
