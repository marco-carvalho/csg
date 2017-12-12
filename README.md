[simpleExample]:https://i.imgur.com/1rLiDz1.png
[bigExample]:https://i.imgur.com/v2qAHTu.png

This is a forked project from https://github.com/chandlerprall/ThreeCSG and kinda improved with the help of [Webpack](https://webpack.js.org/), [TypeScript](https://www.typescriptlang.org/) and [Pug](https://pugjs.org/api/getting-started.html).

# Constructive Solid Geometry

Constructive solid geometry (CSG) is a technique used in solid modeling that allows a modeler to create a complex surface/object by using **Boolean operators** (union, intersection, difference) on solid objects called **primitives** (cuboids, cylinders, prisms, pyramids, spheres, cones). With these elementary operations, it is possible to create objects with high complexity starting from simple ones.

In the image below, we have 3 examples.
*From the left to the right*:
1. **Intersection**: Portion common to both objects
2. **Difference**: Subtraction of one object from another
3. **Union**: Merger of two objects into one

![simpleExample]

In the image below, we have various examples represented by binary trees.
*From the left to the right, bottom to top*:
1. An box with width
2. An box with height
3. **Intersection**: Item1 with Item2
4. An box with depth
5. An sphere
6. An box
7. **Intersection**: Item3 with Item4
8. **Intersection**: Item5 with Item6
9. **Difference**: Item7 with Item8

![bigExample]

## Requirements:
`sudo apt install npm` or download [Node.js](https://nodejs.org/en/) and install NPM.

## Quickstart:
`git clone http://github.com/marco-carvalho/computer-graphics`

`cd computer-graphics/csg`

`npm i`

`npm run server`

## Configuration:

Open `./app.ts` and alter from `import group from "./src/examples/1";` to `import group from "./src/examples/2";`

# How it works:

1. Create a geometry (`let box = new THREE.BoxGeometry(3, 1, 1);`)
2. Use the geometry to create a mesh (`let boxMesh = new THREE.Mesh(box);`)
  1. Optionally, you can set the x/y/z of this mesh (`boxMesh.position.x = -8;`)
3. Use the mesh to create a instance of ThreeCSG (`let boxCSG = new ThreeCSG(boxMesh)`)
4. Use the instance of ThreeCSG to create an final geometry (`let result = boxCSG.subtract(sphereCSG).toMesh(new THREE.MeshLambertMaterial());`)
