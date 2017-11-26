window.onload = () => {
    let renderer = new THREE.WebGLRenderer();
    let light = new THREE.DirectionalLight(0xffffff);
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    let scene = new THREE.Scene();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    light.position.set(1, 1, 1);
    camera.position.set(0, 5, 15);
    camera.lookAt(scene.position);
    scene.add(light);
    scene.add(camera);

    ////////////////////////////////////////////////////////////////////////////

    var group = new THREE.Group();

    // cube (mesh) subtract Sphere (mesh)
    cube_geometry = new THREE.CubeGeometry(3, 3, 3);
    cube_mesh = new THREE.Mesh(cube_geometry);
    cube_csg = new ThreeCSG(cube_mesh);
    sphere_geometry = new THREE.SphereGeometry(1.8, 32, 32);
    sphere_mesh = new THREE.Mesh(sphere_geometry);
    sphere_csg = new ThreeCSG(sphere_mesh);
    subtract_csg = cube_csg.subtract(sphere_csg);
    result = subtract_csg.toMesh(new THREE.MeshLambertMaterial());
    result.position.x = -8;
    group.add(result);

    // sphere (geometry) union Cube (geometry)
    sphere_geometry = new THREE.SphereGeometry(2, 16, 16);
    sphere_csg = new ThreeCSG(sphere_geometry);
    cube_geometry = new THREE.CubeGeometry(7, .5, 3);
    cube_csg = new ThreeCSG(cube_geometry);
    union_csg = sphere_csg.union(cube_csg);
    result = union_csg.toMesh(new THREE.MeshLambertMaterial());
    result.geometry.computeVertexNormals();
    group.add(result);

    // sphere (geometry) intersect Sphere (mesh)
    sphere_geometry_1 = new THREE.SphereGeometry(2, 64, 8);
    sphere_csg_1 = new ThreeCSG(sphere_geometry_1);
    sphere_geometry_2 = new THREE.SphereGeometry(2, 8, 32);
    sphere_mesh_2 = new THREE.Mesh(sphere_geometry_2);
    sphere_mesh_2.position.x = 2;
    sphere_csg_2 = new ThreeCSG(sphere_mesh_2);
    intersect_csg = sphere_csg_1.intersect(sphere_csg_2);
    result = intersect_csg.toMesh(new THREE.MeshLambertMaterial());
    result.position.x = 6;
    result.geometry.computeVertexNormals();
    group.add(result);

    scene.add(group);

    ////////////////////////////////////////////////////////////////////////////

    let animate = function () {
        requestAnimationFrame(animate);
        group.rotation.y += 0.01;
        renderer.render(scene, camera);
    };

    animate();
}