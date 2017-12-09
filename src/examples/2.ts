import * as THREE from "three";
import {ThreeCSG} from "../threeCSG";

const group = new THREE.Group();

const sphere = new ThreeCSG(new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32)));
const box = new ThreeCSG(new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3)));

const obj1 = box.union(sphere);
let result = obj1.toMesh(new THREE.MeshLambertMaterial());
result.position.x = -5;
result.position.y = 0;
group.add(result);

const obj2 = box.subtract(sphere);
result = obj2.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 0;
result.position.y = 0;
group.add(result);

const obj3 = box.intersect(sphere);
result = obj3.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 5;
result.position.y = 0;
group.add(result);

export default group;
