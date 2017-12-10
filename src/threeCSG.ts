import * as THREE from "three";
import {NodeCSG} from "./nodeCSG";
import {PolygonCSG} from "./polygonCSG";
import {VertexCSG} from "./vertexCSG";

export class ThreeCSG {
    private matrix;
    private tree;

    constructor(geometry) {
        let face;
        let vertex;
        let faceVertexUvs;
        let uvs;
        let polygon;
        const polygons = [];

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

    public subtract(otherTree: ThreeCSG): ThreeCSG {
        const a = this.tree.clone();
        const b = otherTree.tree.clone();

        a.invert();
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a.invert();

        const newTree = new ThreeCSG(a);
        newTree.matrix = this.matrix;
        return newTree;
    }

    public union(otherTree: ThreeCSG): ThreeCSG {
        const a = this.tree.clone();
        const b = otherTree.tree.clone();

        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());

        const newTree = new ThreeCSG(a);
        newTree.matrix = this.matrix;
        return newTree;
    }

    public intersect(otherTree: ThreeCSG): ThreeCSG {
        const a = this.tree.clone();
        const b = otherTree.tree.clone();

        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.build(b.allPolygons());
        a.invert();

        const newTree = new ThreeCSG(a);
        newTree.matrix = this.matrix;
        return newTree;
    }

    public toGeometry(): THREE.Geometry {
        const matrix = new THREE.Matrix4().getInverse(this.matrix);
        const geometry = new THREE.Geometry();
        const verticeDict = {};
        let vertexIdxA;
        let vertexIdxB;
        let vertexIdxC;
        let vertex;
        let face;
        let verticeUvs;

        for (const polygon of this.tree.allPolygons()) {
            for (let j = 2; j < polygon.vertices.length; j++) {
                verticeUvs = [];

                vertex = polygon.vertices[0];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);

                if (typeof verticeDict[`${vertex.x},${vertex.y},${vertex.z}`] !== "undefined") {
                    vertexIdxA = verticeDict[`${vertex.x},${vertex.y},${vertex.z}`];
                } else {
                    geometry.vertices.push(vertex);
                    vertexIdxA = verticeDict[`${vertex.x},${vertex.y},${vertex.z}`] = geometry.vertices.length - 1;
                }

                vertex = polygon.vertices[j - 1];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);
                if (typeof verticeDict[`${vertex.x},${vertex.y},${vertex.z}`] !== "undefined") {
                    vertexIdxB = verticeDict[`${vertex.x},${vertex.y},${vertex.z}`];
                } else {
                    geometry.vertices.push(vertex);
                    vertexIdxB = verticeDict[`${vertex.x},${vertex.y},${vertex.z}`] = geometry.vertices.length - 1;
                }

                vertex = polygon.vertices[j];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);
                if (typeof verticeDict[`${vertex.x},${vertex.y},${vertex.z}`] !== "undefined") {
                    vertexIdxC = verticeDict[`${vertex.x},${vertex.y},${vertex.z}`];
                } else {
                    geometry.vertices.push(vertex);
                    vertexIdxC = verticeDict[`${vertex.x},${vertex.y},${vertex.z}`] = geometry.vertices.length - 1;
                }

                face = new THREE.Face3(
                    vertexIdxA,
                    vertexIdxB,
                    vertexIdxC,
                    new THREE.Vector3(polygon.normal.x, polygon.normal.y, polygon.normal.z),
                );

                geometry.faces.push(face);
                geometry.faceVertexUvs[0].push(verticeUvs);
            }

        }
        return geometry;
    }

    public toMesh(material: THREE.MeshLambertMaterial): THREE.Mesh {
        const geometry = this.toGeometry();
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.setFromMatrixPosition(this.matrix);
        mesh.rotation.setFromRotationMatrix(this.matrix);

        return mesh;
    }
}
