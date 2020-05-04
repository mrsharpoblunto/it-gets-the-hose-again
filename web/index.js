/*
 * @format
 */

// try and use a prebuilt version if possible
if (process.env.NODE_ENV === 'production') {
  require('./lib/server/app');
} else {
  // build with babel on the fly in dev
  require('@babel/register');

  // tidy up babels default stacktrace rendering
  process.on('uncaughtException', function (err) {
    if (err._babel && err instanceof SyntaxError) {
      console.error(err.message + '\n' + err.codeFrame);
    } else {
      console.error(err.stack);
    }
    process.exit(1);
  });

  require('./src/server/app');
}
