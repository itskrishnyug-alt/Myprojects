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

// app.js tests using JSDOM
console.log('\n--- Running app.js functional tests ---');

const jsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

function setupDOM(localStorageData = {}, matchMediaResult = false) {
    const dom = new JSDOM(indexHtmlContent, { runScripts: "dangerously" });
    const window = dom.window;

    // Mock localStorage
    let storage = { ...localStorageData };
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: (key) => storage[key] || null,
            setItem: (key, value) => { storage[key] = String(value); },
            removeItem: (key) => { delete storage[key]; },
            clear: () => { storage = {}; }
        },
        writable: true
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
        value: query => ({
            matches: query === '(prefers-color-scheme: dark)' ? matchMediaResult : false
        }),
        writable: true
    });

    // Execute app.js
    const scriptEl = window.document.createElement("script");
    scriptEl.textContent = jsContent;
    window.document.body.appendChild(scriptEl);

    // Fire DOMContentLoaded
    const event = window.document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    window.document.dispatchEvent(event);

    return { window, document: window.document, storage };
}

function runTest(name, testFn) {
    try {
        testFn();
        console.log(`✅ ${name}`);
    } catch (e) {
        console.error(`❌ ${name}`);
        console.error(e.message);
        allPassed = false;
    }
}

// Test 1: Defaults to light mode if no saved pref and system prefers light
runTest('Defaults to light mode if no preference', () => {
    const { document } = setupDOM({}, false);
    const body = document.body;
    const toggleIcon = document.getElementById('dark-mode-toggle').querySelector('.icon');

    if (body.classList.contains('dark-mode')) throw new Error('Body should not have dark-mode class');
    if (toggleIcon.textContent !== '🌓') throw new Error('Icon should be moon');
});

// Test 2: Uses saved preference (dark)
runTest('Uses saved dark mode preference', () => {
    const { document } = setupDOM({ darkMode: 'enabled' }, false);
    const body = document.body;
    const toggleIcon = document.getElementById('dark-mode-toggle').querySelector('.icon');

    if (!body.classList.contains('dark-mode')) throw new Error('Body should have dark-mode class');
    if (toggleIcon.textContent !== '☀️') throw new Error('Icon should be sun');
});

// Test 3: Uses system preference if no saved pref
runTest('Uses system dark mode preference if no saved preference', () => {
    const { document } = setupDOM({}, true);
    const body = document.body;
    const toggleIcon = document.getElementById('dark-mode-toggle').querySelector('.icon');

    if (!body.classList.contains('dark-mode')) throw new Error('Body should have dark-mode class');
    if (toggleIcon.textContent !== '☀️') throw new Error('Icon should be sun');
});

// Test 4: Toggling mode updates class, icon, and localStorage
runTest('Toggling mode updates class, icon, and localStorage', () => {
    const { document, storage } = setupDOM({}, false);
    const body = document.body;
    const toggle = document.getElementById('dark-mode-toggle');
    const toggleIcon = toggle.querySelector('.icon');

    toggle.click();

    if (!body.classList.contains('dark-mode')) throw new Error('Body should have dark-mode class after click');
    if (toggleIcon.textContent !== '☀️') throw new Error('Icon should be sun after click');
    if (storage.darkMode !== 'enabled') throw new Error('localStorage should be enabled');

    toggle.click();

    if (body.classList.contains('dark-mode')) throw new Error('Body should not have dark-mode class after second click');
    if (toggleIcon.textContent !== '🌓') throw new Error('Icon should be moon after second click');
    if (storage.darkMode !== 'disabled') throw new Error('localStorage should be disabled');
});

if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}
