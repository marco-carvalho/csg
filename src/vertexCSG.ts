import * as THREE from "three";

export class VertexCSG {
    private x;
    private y;
    private z;
    private normal;
    private uv;

    constructor(x?, y?, z?, normal?, uv?) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.normal = normal || new THREE.Vector3();
        this.uv = uv || new THREE.Vector2();
    }

    public clone() {
        return new VertexCSG(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
    }

    public add(vertex) {
        this.x += vertex.x;
        this.y += vertex.y;
        this.z += vertex.z;
        return this;
    }

    public subtract(vertex) {
        this.x -= vertex.x;
        this.y -= vertex.y;
        this.z -= vertex.z;
        return this;
    }

    public multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    public cross(vertex) {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        this.x = y * vertex.z - z * vertex.y;
        this.y = z * vertex.x - x * vertex.z;
        this.z = x * vertex.y - y * vertex.x;

        return this;
    }

    public normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

        this.x /= length;
        this.y /= length;
        this.z /= length;

        return this;
    }

    public dot(vertex) {
        return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;
    }

    public lerp(a, t) {
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

    public interpolate(other, t) {
        return this.clone().lerp(other, t);
    }

    public applyMatrix4(m) {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        const e = m.elements;

        this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
        this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
        this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

        return this;
    }
}
