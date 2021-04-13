// FIRST LOAD EVERYTHING NEEDED…
const { series, parallel, src, dest, watch } = require('gulp'),
    { readFileSync } = require('fs'),
    del = require('del'),
    sass = require('gulp-dart-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    flexbugsFixes = require('postcss-flexbugs-fixes'),
    uncss = require('postcss-uncss'),
    csso = require('gulp-csso'),
    nunjucks = require('gulp-nunjucks'),
    browserSync = require('browser-sync').create();

// DEFINE FUNCTIONS

// 1) functions to delete parts of generated files in dist folder

// delete all files
const allCleanup = () => del('dist/**/*');

// delete all HTML files
const htmlCleanup = () => del('dist/**/*.html');

// delete all CSS files and their sourcemaps
const cssCleanup = () => del('dist/*.{css,css.map}');

// delete static files
const staticCleanup = () => del(
    [
        'dist/**/*', // delete all files from /dist/
        '!dist/**/*.{html,css,css.map}', // except HTML, CSS and CSS map files
    ],
    { onlyFiles: true } // do not delete folders (would delete all folders otherwise)
);

// 2) functions that generate files

// compile Nunjucks templates to html files
const htmlCompile = () => src('src/templates/**/[^_]*.njk')
    // import data from data.json
    .pipe(nunjucks.compile(JSON.parse(String(readFileSync('src/data.json')))))
    .pipe(dest('./dist/')); // put compiled html into dist folder

// create and process CSS
const sassCompile = () => src('src/scss/index.scss') // this is the source of for compilation
    .pipe(sourcemaps.init()) // initalizes a sourcemap
    .pipe(sass.sync().on('error', sass.logError)) // compile SCSS to CSS and also tell us about a problem if happens
    .pipe(
        postcss([
            autoprefixer, // automatically adds vendor prefixes if needed
            // see browserslist in package.json for included browsers
            // Official Bootstrap browser support policy:
            // https://getbootstrap.com/docs/4.6/getting-started/browsers-devices/#supported-browsers
            flexbugsFixes, // fixes flex bugs if possible: see https://github.com/philipwalton/flexbugs
        ])
    )
    .pipe(csso()) // compresses CSS
    .pipe(sourcemaps.write('./')) // writes the sourcemap
    .pipe(dest('./dist')) // destination of the resulting CSS
    .pipe(browserSync.stream()); // tell browsersync to inject compiled CSS

// remove unused CSS (classes not used in generated HTML)
const removeUnusedCss = () => src('dist/index.css')
    .pipe(
        postcss([
            uncss({
                html: ['dist/**/*.html'],
                media: ['print'], // process additional media queries
                ignore: [], // provide a list of selectors that should not be removed by UnCSS
            }),
        ])
    )
    .pipe(dest('dist'));

// copy all files from /src/static/ to /dist/static/
const copyStatic = () => src('src/static/**/*').pipe(dest('dist'))

// 3) functions to watch and serve
// development with automatic refreshing after changes to CSS, templates or static files
const startBrowsersync = () => browserSync.init({ // initalize Browsersync
    // port: 8080, // set different port
    // open: false, // don’t open browser
    // ghostMode: false, // CLICKS, scrolls & form inputs on any device will not be mirrored to all others
    // reloadOnRestart: true, // reload each browser when Browsersync is restarted
    server: {
        baseDir: 'dist', // serve from this folder
        serveStaticOptions: {
            // trying an extension when one isn't specified:
            // effectively means that http://localhost:3000/another-page
            // shows file named another-page.html
            extensions: ['html'],
        },
    },
});

// a function to reload Browsersync
const reloadBrowserSync = (cb) => {
    browserSync.reload();
    cb();
};

// a function to watch for changes
const watchFiles = () => {
    // SCSS changed: run task to compile it again
    watch('src/scss/**/*', processCss);
    // templates or data file changed: run task to generate HTML again and reload
    watch(['src/templates/**/*', 'src/data.json'], series(processHtml, reloadBrowserSync));
    // static files changed: run task to copy them again and reload
    watch('src/static/**/*', series(processStatic, reloadBrowserSync));
}

// COMPOSE TASKS

const processHtml = series(htmlCleanup, htmlCompile);

const processCss = series(cssCleanup, sassCompile);

const processStatic = series(staticCleanup, copyStatic);

// EXPORT PUBLICLY AVAILABLE TASKS
// These tasks can be run with `npx gulp TASKNAME` on command line for example `npx gulp develop`.
// We use them in npm scripts with `gulp TASKNAME` (see package.json).

// development with automatic refreshing
exports.develop = series(
    allCleanup,
    parallel(htmlCompile, sassCompile, copyStatic),
    parallel(startBrowsersync, watchFiles)
);

// build everything for production
exports.build = series(
    allCleanup,
    htmlCompile,
    parallel(sassCompile, copyStatic),
    removeUnusedCss
);

// the default task runs when you run just `gulp`
exports.default = exports.develop;
