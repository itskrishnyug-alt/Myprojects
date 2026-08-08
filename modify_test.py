import sys

with open('test.js', 'r') as f:
    content = f.read()

# We want to replace the last if (allPassed) block with our new test block
old_block = """
if (allPassed) {
    console.log('\\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\\n❌ Some tests failed.');
    process.exit(1);
}
"""

new_block = """
// --- Functional Tests using JSDOM ---
console.log("\\n--- Starting Functional Tests ---");
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
    console.log('\\n🎉 All tests passed successfully!');
    process.exit(0);
} else {
    console.log('\\n❌ Some tests failed.');
    process.exit(1);
}
"""

if old_block.strip() in content:
    content = content.replace(old_block.strip(), new_block.strip())
    with open('test.js', 'w') as f:
        f.write(content)
    print("Successfully updated test.js")
else:
    print("Failed to find old block in test.js")
