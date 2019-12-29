import * as THREE from "three";
import { ThreeCSG } from "../threeCSG";

const group = new THREE.Group();

const boxesMesh = [
    new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1)),
    new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1)),
    new THREE.Mesh(new THREE.BoxGeometry(1, 1, 3)),
    new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3))
];

const spheresMesh = [
    new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32))
];

const boxWithWidth = new ThreeCSG(boxesMesh[0]);
let result = boxWithWidth.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -8;
result.position.y = -8;
group.add(result);

const boxWithHeight = new ThreeCSG(boxesMesh[1]);
result = boxWithHeight.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -4;
result.position.y = -8;
group.add(result);

const boxWithHeightAndWidth = boxWithWidth.union(boxWithHeight);
result = boxWithHeightAndWidth.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -6;
result.position.y = -2;
group.add(result);

const boxWithDepth = new ThreeCSG(boxesMesh[2]);
result = boxWithDepth.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -2;
result.position.y = -2;
group.add(result);

const sphere = new ThreeCSG(spheresMesh[0]);
result = sphere.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 2;
result.position.y = -2;
group.add(result);

const box = new ThreeCSG(boxesMesh[3]);
result = box.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 6;
result.position.y = -2;
group.add(result);

const boxWithHeightAndWidthAndDepth = boxWithHeightAndWidth.union(boxWithDepth);
result = boxWithHeightAndWidthAndDepth.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -4;
result.position.y = 4;
group.add(result);

const spherePlusBox = sphere.intersect(box);
result = spherePlusBox.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 4;
result.position.y = 4;
group.add(result);

const final = spherePlusBox.subtract(boxWithHeightAndWidthAndDepth);
result = final.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 0;
result.position.y = 10;
group.add(result);

export default group;
