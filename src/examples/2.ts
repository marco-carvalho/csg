import * as THREE from "three";
import { ThreeCSG } from "../threeCSG";

const group = new THREE.Group();

const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 8));
const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3));
sphereMesh.position.x = 2;
sphereMesh.position.y = 2;
sphereMesh.position.z = 2;

const CSG = [
    new ThreeCSG(sphereMesh),
    new ThreeCSG(boxMesh)
];

let result = CSG[0].union(CSG[1]).toMesh(new THREE.MeshLambertMaterial());
result.position.x = 8;
result.position.y = 0;
group.add(result);

result = CSG[1].subtract(CSG[0]).toMesh(new THREE.MeshLambertMaterial());
result.position.x = 0;
result.position.y = -2;
group.add(result);

result = CSG[0].intersect(CSG[1]).toMesh(new THREE.MeshLambertMaterial());
result.position.x = -6;
result.position.y = 0;
group.add(result);

export default group;
