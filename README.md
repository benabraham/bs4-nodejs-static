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

## CSS (Sass preprocessor)

`index.css` is compiled from `src/scss/index.scss` by [Sass](http://sass-lang.com/).

In the case you don't know _Scss_ syntax or don't want to use it just type plain CSS in `src/scss/_base.scss`.


## HTML (Twig templates)

HTML is generated from [Twig.js](https://github.com/twigjs/twig.js/) templates (JavaScript impementation of Twig templating language) in `src/templates`.

You don't need to leverage the power of templates. You can just create plain HTML files with `*.twig` extension.  

Start templates that are not pages with `_`. Typically these are templates used for _include_ or _extend_.

Documentation for [Twig](https://twig.symfony.com/doc/2.x/templates.html).

_Warning: [Twig.js doesn't implement 100% of Twig](https://github.com/twigjs/twig.js/wiki/Implementation-Notes)._

If you need some data to be available in all templates, use `templates/data.json` for that.


## Static files (JavaScript, images, …)

Folders and files from `/src/static/` are just copied directly to `/dist/` folder.


### Libraries

This website is made with [Bootstrap 4 beta](https://getbootstrap.com/).
 
You can comment out components you don't need in `/src/index.scss`.

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
 