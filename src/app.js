import * as THREE from 'three';
import {ThreeCSG} from './threeCSG'

let renderer = new THREE.WebGLRenderer();
let light = new THREE.DirectionalLight();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
let scene = new THREE.Scene();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
light.position.set(1, 1, 1);
camera.position.set(0, 15, 30);
camera.lookAt(scene.position);
scene.add(light);
scene.add(camera);

////////////////////////////////////////////////////////////////////////////

let group = new THREE.Group();

let boxWithWidth = new ThreeCSG(new THREE.Mesh(new THREE.BoxGeometry(4, 1, 1)));
let result = boxWithWidth.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -8;
result.position.y = -8;
group.add(result);

let boxWithHeight = new ThreeCSG(new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1)));
result = boxWithHeight.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -4;
result.position.y = -8;
group.add(result);

let boxWithHeightAndWidth = boxWithWidth.union(boxWithHeight);
result = boxWithHeightAndWidth.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -6;
result.position.y = -2;
group.add(result);

let boxWithDepth = new ThreeCSG(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 4)));
result = boxWithDepth.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -2;
result.position.y = -2;
group.add(result);

let sphere = new ThreeCSG(new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32)));
result = sphere.toMesh(new THREE.MeshLambertMaterial({
  color: 0xff0000
}));
result.position.x = 2;
result.position.y = -2;
group.add(result);

let box = new ThreeCSG(new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3)));
result = box.toMesh(new THREE.MeshLambertMaterial({
  color: 0x00ff00
}));
result.position.x = 6;
result.position.y = -2;
group.add(result);

let boxWithHeightAndWidthAndDepth = boxWithHeightAndWidth.union(boxWithDepth);
result = boxWithHeightAndWidthAndDepth.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -4;
result.position.y = 4;
group.add(result);

let spherePlusBox = sphere.intersect(box);
result = spherePlusBox.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 4;
result.position.y = 4;
group.add(result);

let final = spherePlusBox.subtract(boxWithHeightAndWidthAndDepth);
result = final.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 0;
result.position.y = 10;
group.add(result);

scene.add(group);

////////////////////////////////////////////////////////////////////////////

let animate = function () {
    requestAnimationFrame(animate);
    group.rotation.y += 0.01;
    renderer.render(scene, camera);
};

animate();
