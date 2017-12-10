import * as THREE from "three";
import { ThreeCSG } from "../threeCSG";

const group = new THREE.Group();

const sphereMesh = [
    new THREE.Mesh(new THREE.SphereGeometry(1, 32, 8)),
    new THREE.Mesh(new THREE.SphereGeometry(1, 8, 32))
];

sphereMesh[1].position.x = 3;

const sphereCSG = [
    new ThreeCSG(sphereMesh[0]),
    new ThreeCSG(sphereMesh[1])
];

const intersectCSG = sphereCSG[0].intersect(sphereCSG[1]);
const result = intersectCSG.toMesh(new THREE.MeshLambertMaterial());
result.position.x = 0;
result.position.y = 0;
group.add(result);

export default group;
