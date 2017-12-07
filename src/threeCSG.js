import * as THREE from 'three';
import {NodeCSG} from './nodeCSG';
import {PolygonCSG} from './polygonCSG';
import {VertexCSG} from './vertexCSG';

export class ThreeCSG {
    constructor(geometry) {
        let face;
        let vertex;
        let faceVertexUvs;
        let uvs;
        let polygon;
        let polygons = [];
        let tree;

        if (geometry instanceof THREE.Mesh) {
            this.matrix = geometry.matrix.clone();
        } else if (geometry instanceof NodeCSG) {
            this.tree = geometry;
            return this;
        }

        for (let i = 0; i < geometry.geometry.faces.length; i++) {
            face = geometry.geometry.faces[i];
            faceVertexUvs = geometry.geometry.faceVertexUvs[0][i];
            polygon = new PolygonCSG();

            if (face instanceof THREE.Face3) {
                vertex = geometry.geometry.vertices[face.a];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.geometry.vertices[face.b];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.geometry.vertices[face.c];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);
            }

            polygon.calculateProperties();
            polygons.push(polygon);
        }

        this.tree = new NodeCSG(polygons);
    }

    subtract(other_tree) {
        let a = this.tree.clone();
        const b = other_tree.tree.clone();

        a.invert();
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a.invert();
        a = new ThreeCSG(a);
        a.matrix = this.matrix;
        return a;
    }

    union(other_tree) {
        let a = this.tree.clone();
        const b = other_tree.tree.clone();

        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a = new ThreeCSG(a);
        a.matrix = this.matrix;
        return a;
    }

    intersect(other_tree) {
        let a = this.tree.clone();
        const b = other_tree.tree.clone();

        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.build(b.allPolygons());
        a.invert();
        a = new ThreeCSG(a);
        a.matrix = this.matrix;
        return a;
    }

    toGeometry() {
        const matrix = new THREE.Matrix4().getInverse(this.matrix);
        const geometry = new THREE.Geometry();
        const polygons = this.tree.allPolygons();
        let polygon;
        const vertice_dict = {};
        let vertex_idx_a;
        let vertex_idx_b;
        let vertex_idx_c;
        let vertex;
        let face;
        let verticeUvs;

        for (let i = 0; i < polygons.length; i++) {
            polygon = polygons[i];
            for (let j = 2; j < polygon.vertices.length; j++) {
                verticeUvs = [];

                vertex = polygon.vertices[0];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);

                if (typeof vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] !== 'undefined') {
                    vertex_idx_a = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`];
                } else {
                    geometry.vertices.push(vertex);
                    vertex_idx_a = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] = geometry.vertices.length - 1;
                }

                vertex = polygon.vertices[j - 1];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);
                if (typeof vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] !== 'undefined') {
                    vertex_idx_b = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`];
                } else {
                    geometry.vertices.push(vertex);
                    vertex_idx_b = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] = geometry.vertices.length - 1;
                }

                vertex = polygon.vertices[j];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);
                if (typeof vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] !== 'undefined') {
                    vertex_idx_c = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`];
                } else {
                    geometry.vertices.push(vertex);
                    vertex_idx_c = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] = geometry.vertices.length - 1;
                }

                face = new THREE.Face3(
                    vertex_idx_a,
                    vertex_idx_b,
                    vertex_idx_c,
                    new THREE.Vector3(polygon.normal.x, polygon.normal.y, polygon.normal.z)
                );

                geometry.faces.push(face);
                geometry.faceVertexUvs[0].push(verticeUvs);
            }

        }
        return geometry;
    }

    toMesh(material) {
        const geometry = this.toGeometry();
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.setFromMatrixPosition(this.matrix);
        mesh.rotation.setFromRotationMatrix(this.matrix);

        return mesh;
    }
};