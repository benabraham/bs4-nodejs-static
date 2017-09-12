// load everything
var gulp = require('gulp');

var browserSync = require('browser-sync').create();
var del = require('del');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var twig = require('gulp-twig');
var fs = require('fs');
var surge = require('gulp-surge');

// Now define some tasks

// a task to delete all css files in dist folder
gulp.task('css:clean', function(){
    return del([
        'dist/*.css',
        'dist/*.map'
    ], { force: true });
});

// CSS compilation (also deletes css files first using previously defined task)
gulp.task('css:compile', ['css:clean'], function(){
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
gulp.task('html:clean', function(){
    return del('dist/**/*.html', { force: true });
});

// HTML compilation from templates
gulp.task('html:compile', ['html:clean'], function(){
    return gulp.src('src/templates/**/[^_]*.twig')
    // compile twig templates to html files
        .pipe(twig({ data: JSON.parse(fs.readFileSync('src/templates/data.json')) })) // import from data.json
        .pipe(gulp.dest('./dist/')) // where to put compiled html
        .on('end', function(){ // after compilation finishes…
            browserSync.reload() // … tell Browsersync to reload
        });
});

gulp.task('static:clean', function(){
    return del([
        'dist/**/*', // delete all files from src
        '!dist/**/*.html', // except html files
        '!dist/**/*.css', // css and
        '!dist/**/*.map' // and sourcemaps
    ], { force: true });
});

// copy everything static folder
gulp.task('static:copy', ['static:clean'], function(){
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest('dist'))
        .on('end', function(){ // after copying finishes…
            browserSync.reload() // … tell Browsersync to reload
        });
});

// build everything
gulp.task('build', ['css:compile', 'html:compile', 'static:copy']);

// development with automatic refreshing
gulp.task('develop', ['build'], function(){
    browserSync.init({ // initalize Browsersync
        // set what files be served
        server: {
            baseDir: 'dist', // serve from this folder
            serveStaticOptions: {
                // trying a extension when one isn't specified:
                // effectively means that http://localhost:3000/another-page shows another-page.html
                extensions: ['html']
            }
        }
    });
    gulp.watch('src/scss/**/*', ['css:compile']); // watch for changes in scss
    gulp.watch('src/templates/**/*', ['html:compile']); // watch for changes in templates
    gulp.watch('src/static/**/*', ['static:copy']); // watch for changes in static files
});

// deployment to surge.sh
gulp.task('deploy', ['build'], function(){
    return surge({
        project: 'dist',
        domain: 'https://my-first-website.surge.sh'
    })
});

// set develop as a default task (gulp runs this when you don't specify a task)
gulp.task('default', ['develop']);
