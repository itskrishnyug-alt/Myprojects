const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const requiredFiles = ['index.html', 'style.css', 'app.js'];

let allPassed = true;

// Check if files exist
console.log('Running File Existence Tests...');
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
console.log('\nRunning HTML Content Tests...');
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
console.log('\nRunning CSS Content Tests...');
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

// DOM tests for app.js
console.log('\nRunning DOM Tests for app.js...');
const jsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Strip out existing script tags to prevent them from running natively,
// we will inject the script manually so we can test it in isolation
const cleanHtml = indexHtmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

const dom = new JSDOM(cleanHtml, {
    runScripts: "dangerously",
    url: "http://localhost/"
});

const window = dom.window;
const document = window.document;

// Inject the app.js code
const scriptEl = document.createElement('script');
scriptEl.textContent = jsContent;
document.body.appendChild(scriptEl);

// Trigger DOMContentLoaded to initialize app.js
document.dispatchEvent(new window.Event('DOMContentLoaded'));

const toggleBtn = document.getElementById('dark-mode-toggle');
const body = document.body;

// 1. Check initial state
if (body.classList.contains('dark-mode')) {
    console.error('❌ DOM Test failed: Body should not have dark-mode class initially.');
    allPassed = false;
} else {
    console.log('✅ Initial state is correct (light mode).');
}

// 2. Click to enable dark mode
toggleBtn.dispatchEvent(new window.MouseEvent('click'));

if (!body.classList.contains('dark-mode')) {
    console.error('❌ DOM Test failed: Body should have dark-mode class after click.');
    allPassed = false;
} else {
    console.log('✅ Dark mode class added on click.');
}

if (window.localStorage.getItem('darkMode') !== 'enabled') {
    console.error(`❌ DOM Test failed: localStorage darkMode should be 'enabled', got '${window.localStorage.getItem('darkMode')}'.`);
    allPassed = false;
} else {
    console.log('✅ localStorage updated to enabled on click.');
}

// 3. Click again to disable dark mode
toggleBtn.dispatchEvent(new window.MouseEvent('click'));

if (body.classList.contains('dark-mode')) {
    console.error('❌ DOM Test failed: Body should not have dark-mode class after second click.');
    allPassed = false;
} else {
    console.log('✅ Dark mode class removed on second click.');
}

if (window.localStorage.getItem('darkMode') !== 'disabled') {
    console.error(`❌ DOM Test failed: localStorage darkMode should be 'disabled', got '${window.localStorage.getItem('darkMode')}'.`);
    allPassed = false;
} else {
    console.log('✅ localStorage updated to disabled on second click.');
}


if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}
