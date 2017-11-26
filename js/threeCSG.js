const EPSILON = 0.0001;
const COPLANAR = 0;
const FRONT = 1;
const BACK = 2;
const SPANNING = 3;

window.ThreeCSG = class ThreeCSG {
    constructor(geometry) {
        let face;
        let vertex;
        let faceVertexUvs;
        let uvs;
        let polygon;
        const polygons = [];
        let tree;

        if (geometry instanceof THREE.Geometry) {
            this.matrix = new THREE.Matrix4;
        } else if (geometry instanceof THREE.Mesh) {
            // #todo: add hierarchy support
            geometry.updateMatrix();
            this.matrix = geometry.matrix.clone();
            geometry = geometry.geometry;
        } else if (geometry instanceof NodeCSG) {
            this.tree = geometry;
            this.matrix = new THREE.Matrix4;
            return this;
        } else {
            throw 'ThreeCSG: Given geometry is unsupported';
        }

        for (let i = 0; i < geometry.faces.length; i++) {
            face = geometry.faces[i];
            faceVertexUvs = geometry.faceVertexUvs[0][i];
            polygon = new PolygonCSG;

            if (face instanceof THREE.Face3) {
                vertex = geometry.vertices[face.a];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.b];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.c];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);
            } else if (typeof THREE.Face4) {
                vertex = geometry.vertices[face.a];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.b];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.c];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.d];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[3].x, faceVertexUvs[3].y) : null;
                vertex = new VertexCSG(vertex.x, vertex.y, vertex.z, face.vertexNormals[3], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);
            } else {
                throw `Invalid face type at index ${i}`;
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

window.PolygonCSG = class PolygonCSG {
    constructor(vertices, normal, w) {
        if (!(vertices instanceof Array)) {
            vertices = [];
        }

        this.vertices = vertices;
        if (vertices.length > 0) {
            this.calculateProperties();
        } else {
            this.normal = this.w = undefined;
        }
    }

    calculateProperties() {
        const a = this.vertices[0];
        const b = this.vertices[1];
        const c = this.vertices[2];

        this.normal = b.clone().subtract(a).cross(
            c.clone().subtract(a)
        ).normalize();

        this.w = this.normal.clone().dot(a);

        return this;
    }

    clone() {
        const polygon = new PolygonCSG;

        for (let i = 0; i < this.vertices.length; i++) {
            polygon.vertices.push(this.vertices[i].clone());
        }
        polygon.calculateProperties();

        return polygon;
    }

    flip() {
        const vertices = [];

        this.normal.multiplyScalar(-1);
        this.w *= -1;

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            vertices.push(this.vertices[i]);
        }
        this.vertices = vertices;

        return this;
    }

    classifyVertex(vertex) {
        const side_value = this.normal.dot(vertex) - this.w;

        if (side_value < -EPSILON) {
            return BACK;
        } else if (side_value > EPSILON) {
            return FRONT;
        } else {
            return COPLANAR;
        }
    }

    classifySide(polygon) {
        let vertex;
        let classification;
        let num_positive = 0;
        let num_negative = 0;

        for (let i = 0; i < polygon.vertices.length; i++) {
            vertex = polygon.vertices[i];
            classification = this.classifyVertex(vertex);
            if (classification === FRONT) {
                num_positive++;
            } else if (classification === BACK) {
                num_negative++;
            }
        }

        if (num_positive > 0 && num_negative === 0) {
            return FRONT;
        } else if (num_positive === 0 && num_negative > 0) {
            return BACK;
        } else if (num_positive === 0 && num_negative === 0) {
            return COPLANAR;
        } else {
            return SPANNING;
        }
    }

    splitPolygon(polygon, coplanar_front, coplanar_back, front, back) {
        const classification = this.classifySide(polygon);

        if (classification === COPLANAR) {

            (this.normal.dot(polygon.normal) > 0 ? coplanar_front : coplanar_back).push(polygon);

        } else if (classification === FRONT) {

            front.push(polygon);

        } else if (classification === BACK) {

            back.push(polygon);

        } else {
            let ti;
            let tj;
            let vi;
            let vj;
            let t;
            let v;
            const f = [];
            const b = [];

            for (let i = 0; i < polygon.vertices.length; i++) {

                let j = (i + 1) % polygon.vertices.length;
                vi = polygon.vertices[i];
                vj = polygon.vertices[j];
                ti = this.classifyVertex(vi);
                tj = this.classifyVertex(vj);

                if (ti != BACK) f.push(vi);
                if (ti != FRONT) b.push(vi);
                if ((ti | tj) === SPANNING) {
                    t = (this.w - this.normal.dot(vi)) / this.normal.dot(vj.clone().subtract(vi));
                    v = vi.interpolate(vj, t);
                    f.push(v);
                    b.push(v);
                }
            }

            if (f.length >= 3) front.push(new PolygonCSG(f).calculateProperties());
            if (b.length >= 3) back.push(new PolygonCSG(b).calculateProperties());
        }
    }
};

window.VertexCSG = class VertexCSG {
    constructor(x, y, z, normal, uv) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.normal = normal || new THREE.Vector3;
        this.uv = uv || new THREE.Vector2;
    }

    clone() {
        return new VertexCSG(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
    }

    add(vertex) {
        this.x += vertex.x;
        this.y += vertex.y;
        this.z += vertex.z;
        return this;
    }

    subtract(vertex) {
        this.x -= vertex.x;
        this.y -= vertex.y;
        this.z -= vertex.z;
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    cross(vertex) {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        this.x = y * vertex.z - z * vertex.y;
        this.y = z * vertex.x - x * vertex.z;
        this.z = x * vertex.y - y * vertex.x;

        return this;
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

        this.x /= length;
        this.y /= length;
        this.z /= length;

        return this;
    }

    dot(vertex) {
        return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;
    }

    lerp(a, t) {
        this.add(
            a.clone().subtract(this).multiplyScalar(t)
        );

        this.normal.add(
            a.normal.clone().sub(this.normal).multiplyScalar(t)
        );

        this.uv.add(
            a.uv.clone().sub(this.uv).multiplyScalar(t)
        );

        return this;
    }

    interpolate(other, t) {
        return this.clone().lerp(other, t);
    }

    applyMatrix4(m) {
        this.x = m.elements[0] * this.x + m.elements[4] * this.y + m.elements[8] * this.z + m.elements[12];
        this.y = m.elements[1] * this.x + m.elements[5] * this.y + m.elements[9] * this.z + m.elements[13];
        this.z = m.elements[2] * this.x + m.elements[6] * this.y + m.elements[10] * this.z + m.elements[14];

        return this;
    }
};

window.NodeCSG = class NodeCSG {
    constructor(polygons) {
        const front = [];
        const back = [];

        this.polygons = [];
        this.front = this.back = undefined;

        if (!(polygons instanceof Array) || polygons.length === 0) return;

        this.divider = polygons[0].clone();

        for (let i = 0; i < polygons.length; i++) {
            this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }

        if (front.length > 0) {
            this.front = new NodeCSG(front);
        }

        if (back.length > 0) {
            this.back = new NodeCSG(back);
        }
    }

    isConvex(polygons) {
        for (let i = 0; i < polygons.length; i++) {
            for (let j = 0; j < polygons.length; j++) {
                if (i !== j && polygons[i].classifySide(polygons[j]) !== BACK) {
                    return false;
                }
            }
        }
        return true;
    }

    build(polygons) {
        const front = [];
        const back = [];

        if (!this.divider) {
            this.divider = polygons[0].clone();
        }

        for (let i = 0; i < polygons.length; i++) {
            this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }

        if (front.length > 0) {
            if (!this.front) this.front = new NodeCSG();
            this.front.build(front);
        }

        if (back.length > 0) {
            if (!this.back) this.back = new NodeCSG();
            this.back.build(back);
        }
    }

    allPolygons() {
        let polygons = this.polygons.slice();
        if (this.front) polygons = polygons.concat(this.front.allPolygons());
        if (this.back) polygons = polygons.concat(this.back.allPolygons());
        return polygons;
    }

    clone() {
        const node = new NodeCSG();

        node.divider = this.divider.clone();
        node.polygons = this.polygons.map(polygon => polygon.clone());
        node.front = this.front && this.front.clone();
        node.back = this.back && this.back.clone();

        return node;
    }

    invert() {
        let temp;

        for (let i = 0; i < this.polygons.length; i++) {
            this.polygons[i].flip();
        }

        this.divider.flip();
        if (this.front) this.front.invert();
        if (this.back) this.back.invert();

        temp = this.front;
        this.front = this.back;
        this.back = temp;

        return this;
    }

    clipPolygons(polygons) {
        let front;
        let back;

        if (!this.divider) return polygons.slice();

        front = [], back = [];

        for (let i = 0; i < polygons.length; i++) {
            this.divider.splitPolygon(polygons[i], front, back, front, back);
        }

        if (this.front) front = this.front.clipPolygons(front);
        if (this.back) back = this.back.clipPolygons(back);
        else back = [];

        return front.concat(back);
    }

    clipTo(node) {
        this.polygons = node.clipPolygons(this.polygons);
        if (this.front) this.front.clipTo(node);
        if (this.back) this.back.clipTo(node);
    }
};