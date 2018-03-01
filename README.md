# A basic template to develop a website based on Bootstrap 4

Includes:

- **Bootstrap 4**: build responsive, mobile-first projects on the web with the world's most popular front-end component library
- **Gulp 4**: task runner for running all of the following
- **Sass compilation**: leverage the power of the most popular CSS extension language
- **Sourcemaps** generation for easier Sass debugging
- **Browsersync**: automatically reloads (or injects in case of CSS), browsers' when you change files 
- **Autoprefixer**: parses CSS and adds vendor prefixes according to [caniuse.com]()
- **Flexbugs fixes**: automatically fixes some of the [flexbugs](https://github.com/philipwalton/flexbugs) 
- **CSSO**: CSS minifier with structural optimizations
- **Twig.js**: JavaScript implementation of the Twig PHP templating language
- **Surge.sh**: deploy static websites easily and for free


## First time installation

### Install latest [node.js](https://nodejs.org/)

### Install `gulp-cli` globally 

```shell
npm install -g gulp-cli
```

### Install all packages from `package.json` locally

```shell
npm install
```

_If you’re having errors in `node-gyp`, try [installing it globally](https://github.com/nodejs/node-gyp#installation)._


## Development

To develop with automatic compilation and browser refreshing run

```shell
gulp
```

And see the result on `http://localhost:3000/`


## Build

To build everything once (in `/dist/` folder) 

```shell
gulp build
```

## CSS (Sass preprocessor)

`index.css` is compiled from `src/scss/index.scss` by [Sass](http://sass-lang.com/).

You don't know _Scss_ syntax or don't want to use it? Just use plain CSS in `src/scss/_base.scss`.


## HTML (Twig templates)

HTML is generated from [Twig.js](https://github.com/twigjs/twig.js/) templates (JavaScript impementation of Twig templating language) in `src/templates`.

You don't need to leverage the power of templates. You can just create plain HTML files with `*.twig` extension.  

If you don't want a template to be turned into HTML file start it with `_`. Typically these are templates used for _include_ or _extend_.

Documentation for [Twig](https://twig.symfony.com/doc/2.x/templates.html).

_Warning: [Twig.js doesn't implement 100% of Twig](https://github.com/twigjs/twig.js/wiki/Implementation-Notes)._

If you need some data to be available in all templates, use `templates/data.json` for that.


## Static files (JavaScript, images, …)

Folders and files from `/src/static/` are simply copied directly to `/dist/` folder.


### Bootstrap

You can comment out Bootstrap components you don't need in `/src/index.scss`.

`/src/_custom-bootstrap-variables.scss` contains only customized Bootstrap variables.

See `gulpfile.js` for supported browsers.


### Deployment

Upload everything in `/dist/` folder to the server.

#### Surge.sh

You can use [surge.sh](https://surge.sh) free service for that.

1. Install surge client `npm install --global surge`.
1. Run `surge` manually once in `/dist`: you will create an account with surge.sh.
1. Set your own domain in `gulpfile.js` (replace `https://my-first-website.surge.sh`).
1. From now on run `gulp deploy` whenever you want to publish a new version.

If you want multiple people to be able to deploy to the same domain, run `surge --add mail.your.collaborator.used.to.register.with.surge@example.com` for each.
 
