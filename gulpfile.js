// First load everything…
var gulp = require("gulp");

var browserSync = require("browser-sync").create();
var del = require("del");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var postcss = require("gulp-postcss");
var uncss = require("postcss-uncss");
var csso = require("gulp-csso");
var twig = require("gulp-twig");
var fs = require("fs");
var surge = require("gulp-surge");

// … now we can define tasks

// HTML compilation from templates
gulp.task(
    "html:compile",
    gulp.series(
        function htmlCleanup() {
            // Delete all HTML files in dist folder
            return del("dist/**/*.html", { force: true });
        },
        function twigCompile() {
            // compile twig templates to html files
            return gulp
                .src("src/templates/**/[^_]*.twig")
                .pipe(twig({ data: JSON.parse(fs.readFileSync("src/templates/data.json")) })) // import from data.json
                .pipe(gulp.dest("./dist/")) // where to put compiled html
                .on("end", function() {
                    // after compilation finishes…
                    browserSync.reload(); // … tell Browsersync to reload
                });
        }
    )
);

// CSS compilation
gulp.task(
    "css:compile",
    gulp.series(
        function cssCleanup() {
            // Delete all CSS files in dist folder
            return del(["dist/*.css", "dist/*.map"], { force: true });
        },
        function compileCss() {
            return gulp
                .src("src/scss/index.scss") // this is the source of for compilation
                .pipe(sourcemaps.init()) // initalizes a sourcemap
                .pipe(sass().on("error", sass.logError)) // compile SCSS to CSS and also tell us about a problem if happens
                .pipe(
                    postcss([
                        require("autoprefixer"), // automatically adds vendor prefixes if needed
                        // see browserslist in package.json for included browsers
                        // Official Bootstrap browser support policy:
                        // https://getbootstrap.com/docs/4.1/getting-started/browsers-devices/#supported-browsers
                        require("postcss-flexbugs-fixes") // fixes flex bugs if possible: see https://github.com/philipwalton/flexbugs
                    ])
                )
                .pipe(csso()) // compresses CSS
                .pipe(sourcemaps.write("./")) // writes the sourcemap
                .pipe(gulp.dest("./dist")) // destination of the resulting CSS
                .pipe(browserSync.stream()); // tell browsersync to reload CSS (injects compiled CSS)
        }
    )
);

// Copy all files from /src/static/ to /dist/static/
gulp.task(
    "static:copy",
    gulp.series(
        function staticCleanup() {
            // Static files cleanup
            return del(
                [
                    "dist/**/*", // delete all files from /src/
                    "!dist/**/*.html", // except HTML files
                    "!dist/**/*.css", // CSS and
                    "!dist/**/*.map" // and sourcemaps
                ],
                { force: true }
            );
        },
        function staticCopy() {
            return gulp
                .src("src/static/**/*")
                .pipe(gulp.dest("dist"))
                .on("end", function() {
                    // after copying finishes…
                    browserSync.reload(); // … tell Browsersync to reload
                });
        }
    )
);

// Development with automatic refreshing
gulp.task(
    "develop",
    gulp.series(gulp.parallel("html:compile", "css:compile", "static:copy"), function startBrowsersync() {
        browserSync.init({
            // initalize Browsersync
            // set what files be served
            server: {
                baseDir: "dist", // serve from this folder
                serveStaticOptions: {
                    // trying an extension when one isn't specified:
                    // effectively means that http://localhost:3000/another-page
                    // shows file named another-page.html
                    extensions: ["html"]
                }
            }
        });
        gulp.watch("src/scss/**/*", gulp.series("css:compile")); // watch for changes in SCSS
        gulp.watch("src/templates/**/*", gulp.series("html:compile")); // watch for changes in templates
        gulp.watch("src/static/**/*", gulp.series("static:copy")); // watch for changes in static files
    })
);

// Build everything for production
gulp.task(
    "build",
    gulp.series(
        "html:compile", // first compile HTML
        gulp.parallel("css:compile", "static:copy"),
        // remove CSS that isn’t used in generated HTML files
        function useUncss() {
            return gulp.src("dist/index.css").pipe(
                postcss([
                    uncss({
                        html: ["dist/**/*.html"],
                        media: ["print"], // process additional media queries
                        ignore: [] // provide a list of selectors that should not be removed by UnCSS
                    })
                ])
            );
        }
    )
);

// Deploy to surge.sh
gulp.task(
    "deploy",
    gulp.series("build", function surgeDeploy() {
        return surge({
            project: "dist",
            // change to your domain
            domain: "https://my-first-website.surge.sh"
            // note 1: URL must end .surge.sh if you haven’t bought yours and configured DNS
            // note 2: https for custom domains is a paid feature
        });
    })
);

// Set develop as a default task (Gulp runs this when you don't specify a task)
gulp.task("default", gulp.series("develop"));
