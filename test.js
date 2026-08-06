const fs = require('fs');
const path = require('path');

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

// JSDOM test for updateToggleIcon in app.js
try {
    const { JSDOM } = require('jsdom');
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const script = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

    const dom = new JSDOM(html, { runScripts: 'dangerously', url: "http://localhost" });
    const window = dom.window;
    const document = window.document;

    // Mock localStorage if it's not available
    if (!window.localStorage) {
        window.localStorage = {
            getItem: function() { return null; },
            setItem: function() {},
        };
    }

    const scriptEl = document.createElement('script');
    scriptEl.textContent = script;
    document.body.appendChild(scriptEl);

    // Fire DOMContentLoaded
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    window.document.dispatchEvent(event);

    const toggleBtn = document.getElementById('dark-mode-toggle');
    const iconSpan = toggleBtn.querySelector('.icon');

    console.log('\n--- Testing updateToggleIcon ---');

    // Initial State (Light mode based on logic, null local storage, no prefers-color-scheme)
    if (iconSpan.textContent !== '🌓') {
        console.error(`❌ Initial icon should be '🌓', but got '${iconSpan.textContent}'`);
        allPassed = false;
    } else {
        console.log(`✅ Initial icon is correctly set to '🌓'`);
    }

    // After 1st click
    toggleBtn.click();
    if (iconSpan.textContent !== '☀️') {
        console.error(`❌ Icon after click should be '☀️', but got '${iconSpan.textContent}'`);
        allPassed = false;
    } else {
        console.log(`✅ Icon after click is correctly set to '☀️'`);
    }

    // After 2nd click
    toggleBtn.click();
    if (iconSpan.textContent !== '🌓') {
        console.error(`❌ Icon after second click should be '🌓', but got '${iconSpan.textContent}'`);
        allPassed = false;
    } else {
        console.log(`✅ Icon after second click is correctly set to '🌓'`);
    }

} catch (e) {
    console.error(`❌ JSDOM tests failed to execute: ${e.message}`);
    allPassed = false;
}

if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}
