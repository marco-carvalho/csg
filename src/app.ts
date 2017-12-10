import * as THREE from "three";
import group from "./examples/2";

const renderer = new THREE.WebGLRenderer();
const light = new THREE.DirectionalLight();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene = new THREE.Scene();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
light.position.set(1, 1, 1);
camera.position.set(0, 15, 30);
camera.lookAt(scene.position);
scene.add(light);
scene.add(camera);

scene.add(group);

function animate(): void {
    requestAnimationFrame(animate);
    group.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();
