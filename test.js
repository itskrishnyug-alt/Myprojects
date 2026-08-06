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

if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}
