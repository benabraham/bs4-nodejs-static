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
        .pipe(postcss([autoprefixer( // supported browsers (from Bootstrap 4 beta: https://github.com/twbs/bootstrap/blob/v4-dev/build/postcss.config.js)
            //
            // Official browser support policy:
            // https://v4-alpha.getbootstrap.com/getting-started/browsers-devices/#supported-browsers
            //
            'Chrome >= 45', // Exact version number here is kinda arbitrary
            'Firefox ESR',
            // Note: Edge versions in Autoprefixer & Can I Use refer to the EdgeHTML rendering engine version,
            // NOT the Edge app version shown in Edge's "About" screen.
            // For example, at the time of writing, Edge 20 on an up-to-date system uses EdgeHTML 12.
            // See also https://github.com/Fyrd/caniuse/issues/1928
            'Edge >= 12',
            'Explorer >= 10',
            // Out of leniency, we prefix these 1 version further back than the official policy.
            'iOS >= 9',
            'Safari >= 9',
            // The following remain NOT officially supported, but we're lenient and include their prefixes to avoid severely breaking in them.
            'Android >= 4.4',
            'Opera >= 30'
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
