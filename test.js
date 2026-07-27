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

if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}
