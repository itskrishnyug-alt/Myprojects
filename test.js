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

function checkContent(content, requiredItems, fileName, itemType) {
    requiredItems.forEach(item => {
        if (!content.includes(item)) {
            console.error(`❌ Missing ${itemType} in ${fileName}: ${item}`);
            allPassed = false;
        } else {
            console.log(`✅ Found ${itemType} in ${fileName}: ${item}`);
        }
    });
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

checkContent(indexHtmlContent, requiredHtmlElements, 'index.html', 'element');

// Basic content checks for style.css
const styleCssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

const requiredCssClasses = [
    'body.dark-mode',
    'display: grid',
    'display: flex'
];

checkContent(styleCssContent, requiredCssClasses, 'style.css', 'class/property');

// --- Functional Tests using JSDOM ---
console.log("\n--- Starting Functional Tests ---");
try {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(indexHtmlContent, { url: "http://localhost/", runScripts: "dangerously" });
    const window = dom.window;
    const document = window.document;

    // Mock matchMedia
    window.matchMedia = window.matchMedia || function() {
        return {
            matches: false,
            addListener: function() {},
            removeListener: function() {}
        };
    };

    // Load app.js script
    const appJsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
    const script = document.createElement('script');
    script.textContent = appJsContent;
    document.body.appendChild(script);

    // Trigger DOMContentLoaded
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    window.document.dispatchEvent(event);

    const toggleBtn = document.getElementById('dark-mode-toggle');
    const iconSpan = toggleBtn.querySelector('.icon');

    // Test 1: Initial state (Light mode)
    if (iconSpan.textContent !== '🌓') {
        console.error(`❌ Test Failed: Expected initial icon to be '🌓', but got '${iconSpan.textContent}'`);
        allPassed = false;
    } else {
        console.log(`✅ Test Passed: Initial icon is correct ('🌓')`);
    }

    // Test 2: Toggle to dark mode
    toggleBtn.click();
    if (iconSpan.textContent !== '☀️') {
        console.error(`❌ Test Failed: Expected icon to be '☀️' after toggling to dark mode, but got '${iconSpan.textContent}'`);
        allPassed = false;
    } else {
        console.log(`✅ Test Passed: Icon updated to '☀️' after toggling to dark mode`);
    }

    // Test 3: Toggle back to light mode
    toggleBtn.click();
    if (iconSpan.textContent !== '🌓') {
        console.error(`❌ Test Failed: Expected icon to be '🌓' after toggling back to light mode, but got '${iconSpan.textContent}'`);
        allPassed = false;
    } else {
        console.log(`✅ Test Passed: Icon updated to '🌓' after toggling back to light mode`);
    }

} catch (error) {
    console.error(`❌ Functional tests failed with an error: ${error.message}`);
    allPassed = false;
}

if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}
