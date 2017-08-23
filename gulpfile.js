// load everything
var gulp = require('gulp');

var browserSync = require('browser-sync').create();
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var twig = require('gulp-twig');
var fs = require('fs');

// a task to delete all css files in dist folder
gulp.task('cssclean', function(){
    return gulp.src(['dist/*.css', 'dist/*.map'], { read: false }).pipe(clean());
});

// CSS compilation (also deletes css files first using previously defined task)
gulp.task('csscompile', ['cssclean'], function(){
    return gulp
        .src('src/scss/index.scss') // this is the source of for compilation
        .pipe(sass().on('error', sass.logError)) // compile sass to css and also tell us about a problem if happens
        .pipe(sourcemaps.init()) // initalizes a sourcemap
        .pipe(postcss([autoprefixer( // supported browsers (from Bootstrap 4 alpha 6)
            'Chrome >= 35',
            'Firefox >= 38',
            'Edge >= 12',
            'Explorer >= 10',
            'iOS >= 8',
            'Safari >= 8',
            'Android 2.3',
            'Android >= 4',
            'Opera >= 12'
        ), require('postcss-flexbugs-fixes')]))
        .pipe(csso()) // compresses CSS
        .pipe(sourcemaps.write('.')) // writes the sourcemap
        .pipe(gulp.dest('./dist')) // destination of the resulting css
        .pipe(browserSync.stream()); // tell browsersync to reload CSS (injects compiled CSS)
});

// delete all html files in dist folder
gulp.task('htmlclean', function(){
    return gulp.src(['dist/**/*.html'], { read: false }).pipe(clean());
});

// HTML compilation from templates
gulp.task('htmlcompile', ['htmlclean'], function(){
    return gulp.src('src/templates/**/*.twig')
    // compile twig templates to html files
        .pipe(twig({ data: JSON.parse(fs.readFileSync('src/templates/data.json')) })) // import from data.json
        .pipe(gulp.dest('./dist/')) // where to put compiled html
        .on('end', function(){ // after compilation finishes…
            browserSync.reload() // … tell Browsersync to reload
        });
});

// delete all files from src except css
gulp.task('staticclean', function(){
    return gulp.src([
        'dist/**/*',
        '!dist/**/*.html',
        '!dist/**/*.css',
        '!dist/**/*.map'
    ], { read: false }).pipe(clean());
});

// copy everything except scss from src folder
gulp.task('staticcopy', ['staticclean'], function(){
    return gulp.src(['src/static/**/*']).pipe(gulp.dest('dist'));
});

// build everything
gulp.task('build', ['csscompile', 'htmlcompile', 'staticcopy']);

// development with automatic refreshing
gulp.task('develop', ['build'], function(){
    browserSync.init({ // initalize Browsersync
        // set what files be served
        server: {
            baseDir: './dist/' // serve from this folder
        }
    });
    gulp.watch('src/scss/**/*', ['csscompile']); // watch for changes in scss
    gulp.watch('src/templates/**/*', ['htmlcompile']); // watch for changes in templates
    gulp.watch(['src/static/**/*'], ['staticcopy']); // watch for changes in static files
});

// set develop as a default task (gulp runs this when you don't specify a task)
gulp.task('default', ['develop']);
