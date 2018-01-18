// First load everything…
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

// … now we can define tasks


// Delete all CSS files in dist folder
gulp.task(
    'css:clean',
    gulp.series(function(){
        return del([
            'dist/*.css',
            'dist/*.map'
        ], { force: true });
    })
);


// CSS compilation (also deletes CSS files first using previously defined task)
gulp.task(
    'css:compile',
    gulp.series(
        'css:clean',
        function(){
            return gulp
                .src('src/scss/index.scss') // this is the source of for compilation
                .pipe(sourcemaps.init()) // initalizes a sourcemap
                .pipe(sass().on('error', sass.logError)) // compile SCSS to CSS and also tell us about a problem if happens
                .pipe(postcss([
                    autoprefixer( // automatically adds vendor prefixes if needed
                        // supported browsers (from Bootstrap 4 beta: see https://github.com/twbs/bootstrap/blob/v4-dev/package.json#L136-L147)
                        //
                        // Official browser support policy:
                        // https://getbootstrap.com/docs/4.0/getting-started/browsers-devices/#supported-browsers
                        //
                        "last 1 major version",
                        ">= 1%",
                        "Chrome >= 45", // Exact version number here is kinda arbitrary
                        "Firefox >= 38",
                        // Note: Edge versions in Autoprefixer & Can I Use refer to the EdgeHTML rendering engine version,
                        // NOT the Edge app version shown in Edge's "About" screen.
                        // For example, at the time of writing, Edge 20 on an up-to-date system uses EdgeHTML 12.
                        // See also https://github.com/Fyrd/caniuse/issues/1928
                        "Edge >= 12",
                        "Explorer >= 10",
                        // Out of leniency, we prefix these 1 version further back than the official policy.
                        "iOS >= 9",
                        "Safari >= 9",
                        // The following remain NOT officially supported, but we're lenient and include their prefixes to avoid severely breaking in them.
                        "Android >= 4.4",
                        "Opera >= 30"
                    ),
                    require('postcss-flexbugs-fixes') // fixes flex bugs if possible: see https://github.com/philipwalton/flexbugs
                ]))
                .pipe(csso()) // compresses CSS
                .pipe(sourcemaps.write('./')) // writes the sourcemap
                .pipe(gulp.dest('./dist')) // destination of the resulting CSS
                .pipe(browserSync.stream()); // tell browsersync to reload CSS (injects compiled CSS)
        }
    )
);


// Delete all HTML files in dist folder
gulp.task(
    'html:clean',
    gulp.series(function(){
        return del('dist/**/*.html', { force: true });
    })
);


// HTML compilation from templates
gulp.task(
    'html:compile',
    gulp.series(
        'html:clean',
        function(){
            return gulp.src('src/templates/**/[^_]*.twig')
            // compile twig templates to html files
                .pipe(twig({ data: JSON.parse(fs.readFileSync('src/templates/data.json')) })) // import from data.json
                .pipe(gulp.dest('./dist/')) // where to put compiled html
                .on('end', function(){ // after compilation finishes…
                    browserSync.reload() // … tell Browsersync to reload
                });
        }
    )
);


// Static files cleanup
gulp.task(
    'static:clean',
    gulp.series(function(){
        return del([
            'dist/**/*', // delete all files from /src/
            '!dist/**/*.html', // except HTML files
            '!dist/**/*.css', // CSS and
            '!dist/**/*.map' // and sourcemaps
        ], { force: true });
    })
);


// Copy all files from /src/static/ to /dist/static/
gulp.task(
    'static:copy',
    gulp.series(
        'static:clean',
        function(){
            return gulp.src('src/static/**/*')
                .pipe(gulp.dest('dist'))
                .on('end', function(){ // after copying finishes…
                    browserSync.reload() // … tell Browsersync to reload
                });
        }
    )
);


// Build everything
gulp.task('build', gulp.parallel('css:compile', 'html:compile', 'static:copy'));


// Development with automatic refreshing
gulp.task(
    'develop',
    gulp.series(
        'build',
        function(){
            browserSync.init({ // initalize Browsersync
                // set what files be served
                server: {
                    baseDir: 'dist', // serve from this folder
                    serveStaticOptions: {
                        // trying an extension when one isn't specified:
                        // effectively means that http://localhost:3000/another-page
                        // shows file named another-page.html
                        extensions: ['html']
                    }
                }
            });
            gulp.watch('src/scss/**/*', gulp.series('css:compile')); // watch for changes in SCSS
            gulp.watch('src/templates/**/*', gulp.series('html:compile')); // watch for changes in templates
            gulp.watch('src/static/**/*', gulp.series('static:copy')); // watch for changes in static files
        }
    )
);


// Deploy to surge.sh
gulp.task(
    'deploy',
    gulp.series(
        'build',
        function(){
            return surge({
                project: 'dist',
                // change to your domain
                domain: 'https://my-first-website.surge.sh'
                // note 1: URL must end .surge.sh if you haven’t bought yours and configured DNS
                // note 2: https for custom domains is a paid feature
            })
        }
    )
);


// Set develop as a default task (Gulp runs this when you don't specify a task)
gulp.task('default', gulp.series('develop'));
