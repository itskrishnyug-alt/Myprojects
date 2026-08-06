const fs = require('fs');
const path = require('path');

const requiredFiles = ['index.html', 'style.css', 'app.js'];

let allPassed = true;

/**
 * Helper to check for required items in content
 * @param {string[]} items - Array of strings to look for
 * @param {string} content - The content to search within
 * @param {string} description - Description for the log messages
 */
function checkItems(items, content, description) {
    items.forEach(item => {
        if (!content.includes(item)) {
            console.error(`❌ Missing ${description}: ${item}`);
            allPassed = false;
        } else {
            console.log(`✅ Found ${description}: ${item}`);
        }
    });
}

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

checkItems(requiredHtmlElements, indexHtmlContent, 'element in index.html');

// Basic content checks for style.css
const styleCssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

const requiredCssClasses = [
    'body.dark-mode',
    'display: grid',
    'display: flex'
];

checkItems(requiredCssClasses, styleCssContent, 'class/property in style.css');

if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}
