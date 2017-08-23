# A basic template to develop a website based on Bootstrap 4 

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

## Development

To develop with automatic compilation and browser refreshing run

```shell
gulp
```

And see the result on http://localhost:3000/


## Build

To build everything once (in `/dist/` folder) 

```shell
gulp build
```

## Templates

You can leverage power of [Twig.js](https://github.com/twigjs/twig.js/) templates (JavaScript impementation of Twig templating language).

Documentation for [Twig](https://twig.symfony.com/doc/2.x/templates.html).

_Warning: [Twig.js doesn't implement 100% of Twig](https://github.com/twigjs/twig.js/wiki/Implementation-Notes)._

If you need some data to be available in all templates, use `templates/data.json` for that.


## Static files

Only main CSS and it's sourcemap is generated.
 
All other folders and files are just copied from `/src/static/` directly to `/dist/` folder.


### Libraries

This website is made with Bootstrap 4 beta.
 
You can comment out components you don't need in `/src/index.scss`.

`/src/_custom-bootstrap-variables.scss` contains all BS variables, some are customized.

`/src/_base.scss` is for custom CSS, should you need any
 
See `gulpfile.js` for supported browsers.


### Design

Should work from 320px browser window width up.

`/assignment/` folder contains all source files

### Deployment

Upload everything in `/dist/` folder on a server.
