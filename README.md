## Intro
This is a simple project to make cartesian graphs from math functions and to format the functions along with their plot in an HTML5 canvas.  The project uses PixiJS for the canvas rendering functions and asset loading.

This is a combo frontend and small supporting TS-Node/Express based backend service for processing TeX strings into SVGs (the rendered TeX output).

Separating the SVG rendering to the backend was necessary to allow PixiJS's Assets management/loader class to load/parse the SVG, attempts at using the mathjax libs client side and rendering the SVG with Pixi's Graphics object directly didn't seem to account for the SVG containers scale.

### Install
`npm install`

### Run
`npm start`