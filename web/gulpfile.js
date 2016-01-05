require('babel/register')({
    stage: 0
});

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    newer = require('gulp-newer'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    del = require('del'),
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    webpackDevServer = require('webpack-dev-server'),
    eslint = require('gulp-eslint'),
    exec = require('child_process').exec,
    Restartable = require('restartable-process');

// build configuration
var DEV_WEBPACK_PORT = 3001;
var DEV_APP_PORT = 3000;

var webpackConfig = process.env.NODE_ENV === 'production' ? require('./webpack.production') : require('./webpack.dev');
var webpackStatsOptions = 
{
    colors: true,
    version: false,
    hash: false,
    assets: false,
    children: false,
    chunks: false,
    modules: false
};

var args = [];
if (process.env.NODE_ENV !== 'production') {
    args.push('--debug');
}
args.push('index.js');
var node = new Restartable('node',args);

gulp.task('jquery-scripts', function() {
    return gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/materialize-css/dist/js/materialize.min.js'
    ])
        .pipe(newer('public/vendor-jquery.js'))
        .pipe(concat('vendor-jquery.js'))
        .pipe(gulp.dest('public'));
});

gulp.task('webpack', function(callback) {
    webpack(webpackConfig, function(err,stats) {
        if (err) {
            callback(new gutil.PluginError("webpack",err));
            return;
        }
        gutil.log("[webpack]",stats.toString(webpackStatsOptions));
        callback();
    });
});

gulp.task('webpack-dev-server',['server'], function(callback) {
    // runs the webpack dev server which proxies the app and requests
    // for assets
    var compiler = webpack(webpackConfig);
    var server = new webpackDevServer(compiler, {
        proxy: { 
            '*': {
                target: 'http://127.0.0.1:'+DEV_APP_PORT,
                secure: false
            }
        },
        publicPath: '/',
        hot:true,
        stats: webpackStatsOptions
    });
    server.listen(DEV_WEBPACK_PORT,'0.0.0.0',function() {
        callback();
    });
});

gulp.task('server',function(callback) {
    node.restart(callback);
});

gulp.task('lint', function() {
    return gulp.src('lib/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('images', function() {
    return gulp.src('assets/img/**/*')
        .pipe(newer('public/img'))
        .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
        .pipe(gulp.dest('public/img'));
});

gulp.task('html',function() {
    return gulp.src('assets/html/**/*')
        .pipe(newer('public'))
        .pipe(gulp.dest('public'));
});

gulp.task('tests',['lint'], function() {
    return gulp.src(['test/**/*.js'])
    .pipe(mocha({
        reporter: 'spec',
        require: ['./test/mocha-babel']
    })).on('error', function(e) {
        console.warn(e.toString());
        this.emit('end');
    });
});

gulp.task('clean', function(cb) {
    del([
        'public/**',
        'persist/**'
    ],function() {
        fs.mkdir('public',cb);
    });
});

gulp.task('build-common',['jquery-scripts','images','html','lint']);

// external tasks
gulp.task('build',['build-common','webpack']);
gulp.task('testsw',['tests'], function() {
    gulp.watch(['lib/**/*.js','test/**/*.js'],['tests']);
});
gulp.task('serverw', ['build-common','webpack-dev-server'],function() {
    gulp.watch('assets/img/**/*',['images']);
    gulp.watch('lib/**/*.js',['lint']);
    gulp.watch(['lib/**/*.js'],['server']);
});
gulp.task('default',['serverw']);
