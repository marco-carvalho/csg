import * as THREE from "three";
import { ThreeCSG } from "../threeCSG";

const group = new THREE.Group();

const sphere = new THREE.SphereGeometry(2, 32, 8);
const sphereMesh = new THREE.Mesh(sphere);
sphereMesh.position.x = 2;
sphereMesh.position.y = 2;
sphereMesh.position.z = 2;
const sphereCSG = new ThreeCSG(sphereMesh);

const box = new THREE.BoxGeometry(3, 3, 3);
const boxMesh = new THREE.Mesh(box);
const boxCSG = new ThreeCSG(boxMesh);

let result = sphereCSG.union(boxCSG).toMesh(new THREE.MeshLambertMaterial());
result.position.x = 8;
result.position.y = 0;
group.add(result);

result = boxCSG.subtract(sphereCSG).toMesh(new THREE.MeshLambertMaterial());
result.position.x = 0;
result.position.y = -2;
group.add(result);

result = sphereCSG.intersect(boxCSG).toMesh(new THREE.MeshLambertMaterial());
result.position.x = -6;
result.position.y = 0;
group.add(result);

export default group;
