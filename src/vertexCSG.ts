import * as THREE from "three";

export class VertexCSG {
    private x: number;
    private y: number;
    private z: number;
    private normal;
    private uv;

    constructor(x: number, y: number, z: number, normal, uv) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.normal = normal || new THREE.Vector3();
        this.uv = uv || new THREE.Vector2();
    }

    public clone(): VertexCSG {
        return new VertexCSG(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
    }

    public add(vertex): VertexCSG {
        this.x += vertex.x;
        this.y += vertex.y;
        this.z += vertex.z;
        return this;
    }

    public subtract(vertex): VertexCSG {
        this.x -= vertex.x;
        this.y -= vertex.y;
        this.z -= vertex.z;
        return this;
    }

    public multiplyScalar(scalar): VertexCSG {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    public cross(vertex): VertexCSG {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        this.x = y * vertex.z - z * vertex.y;
        this.y = z * vertex.x - x * vertex.z;
        this.z = x * vertex.y - y * vertex.x;
        return this;
    }

    public normalize(): VertexCSG {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        this.x /= length;
        this.y /= length;
        this.z /= length;
        return this;
    }

    public dot(vertex): number {
        return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;
    }

    public lerp(a, t): VertexCSG {
        this.add(a.clone().subtract(this).multiplyScalar(t));
        this.normal.add(a.normal.clone().sub(this.normal).multiplyScalar(t));
        this.uv.add(a.uv.clone().sub(this.uv).multiplyScalar(t));
        return this;
    }

    public interpolate(other, t): VertexCSG {
        return this.clone().lerp(other, t);
    }

    public applyMatrix4(m): VertexCSG {
        this.x = m.elements[0] * this.x + m.elements[4] * this.y + m.elements[8] * this.z + m.elements[12];
        this.y = m.elements[1] * this.x + m.elements[5] * this.y + m.elements[9] * this.z + m.elements[13];
        this.z = m.elements[2] * this.x + m.elements[6] * this.y + m.elements[10] * this.z + m.elements[14];
        return this;
    }
}
