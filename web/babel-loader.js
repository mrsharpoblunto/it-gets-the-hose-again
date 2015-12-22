var loader = require('babel-loader');

/**
 monkey patch and tidy up stack traces from syntax errors coming from Babel
 */
module.exports = function() {
    try {
        return loader.apply(this,[].slice.call(arguments));
    }
    catch (err) {
        if (err._babel && err instanceof SyntaxError) {
            throw new Error(err.message + '\n' + err.codeFrame);
        } else {
            throw err;
        }
    }
};
