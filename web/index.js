require('babel/register')({
    stage: 0,
    optional: ['runtime']
});

// tidy up babels default stacktrace rendering
process.on("uncaughtException",function(err) {
    if (err._babel && err instanceof SyntaxError) {
        console.error(err.message + "\n" + err.codeFrame);
    } else {
        console.error(err.stack);
    }
    process.exit(1);
});

require('./lib/app');
