This is a forked project from https://github.com/chandlerprall/ThreeCSG and kinda improved with the help of [TypeScript](https://www.typescriptlang.org/) and [Webpack](https://webpack.js.org/).

# Constructive Solid Geometry
Constructive solid geometry (CSG) is a technique used in solid modeling that allows a modeler to create a complex surface/object by using **Boolean operators** (union, intersection, difference) on solid objects called **primitives** (cuboids, cylinders, prisms, pyramids, spheres, cones). With these elementary operations, it is possible to create objects with high complexity starting from simple ones.

## Requirements:
`sudo apt install npm` or download [Node.js](https://nodejs.org/en/) and install NPM.

## Quickstart:
`git clone http://github.com/marco-carvalho/computer-graphics`
`cd computer-graphics/csg`
`npm i`
`npm run server`

## Configuration:
`npm run tsc`
Open `./src/app.ts` and alter from `import group from "./examples/1";` to `import group from "./examples/2";`