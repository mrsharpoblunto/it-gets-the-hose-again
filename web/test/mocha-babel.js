require('@babel/register')({
  'presets': [['@babel/preset-env',{ targets: { node: 'current' } }]]
});

if (!global.tidyStackTraces) {
    // tidy up babels default stacktrace rendering
    global.tidyStackTraces = function(err) {
        if (err._babel && err instanceof SyntaxError) {
            console.error(err.message + "\n" + err.codeFrame);
        } else {
            console.error(err.stack);
        }
        process.exit(1);
    }
    process.on("uncaughtException",tidyStackTraces);
}

// Ensure a DOM is present for React component tests
const jsdom = require('jsdom');
global.document = jsdom.jsdom('<!DOCTYPE html><html><body></body></html>');
global.window = document.defaultView;
global.window.location.href = 'http://localhost';
global.navigator = { userAgent: 'node.js' };
