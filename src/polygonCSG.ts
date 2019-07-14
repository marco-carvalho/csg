import { EPSILON, BACK, COPLANAR, FRONT, SPANNING } from "./threeCSG";

export class PolygonCSG {
    public vertices;
    public normal;
    public w;

    public constructor(vertices) {
        if (!(vertices instanceof Array)) {
            vertices = [];
        }

        this.vertices = vertices;
        if (vertices.length > 0) {
            this.calculateProperties();
        } else {
            this.normal = undefined;
            this.w = undefined;
        }
    }

    public calculateProperties(): this {
        const a = this.vertices[0];
        const b = this.vertices[1];
        const c = this.vertices[2];

        this.normal = b.clone().subtract(a).cross(c.clone().subtract(a)).normalize();

        this.w = this.normal.clone().dot(a);

        return this;
    }

    public clone(): PolygonCSG {
        const polygon = new PolygonCSG();

        for (const vertice of this.vertices) {
            polygon.vertices.push(vertice.clone());
        }
        polygon.calculateProperties();

        return polygon;
    }

    public flip(): this {
        const vertices = [];

        this.normal.multiplyScalar(-1);
        this.w *= -1;

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            vertices.push(this.vertices[i]);
        }
        this.vertices = vertices;

        return this;
    }

    public classifyVertex(vertex): 0 | 1 | 2 {
        const sideValue = this.normal.dot(vertex) - this.w;

        if (sideValue < -EPSILON) {
            return BACK;
        } else if (sideValue > EPSILON) {
            return FRONT;
        }
        return COPLANAR;
    }

    public classifySide(polygon): 0 | 1 | 2 | 3 {
        let classification;
        let numPositive = 0;
        let numNegative = 0;

        for (const vertice of polygon.vertices) {
            classification = this.classifyVertex(vertice);
            if (classification === FRONT) {
                numPositive++;
            } else if (classification === BACK) {
                numNegative++;
            }
        }

        if (numPositive > 0 && numNegative === 0) {
            return FRONT;
        } else if (numPositive === 0 && numNegative > 0) {
            return BACK;
        } else if (numPositive === 0 && numNegative === 0) {
            return COPLANAR;
        }
        return SPANNING;
    }

    public splitPolygon(polygon, coplanarFront, coplanarBack, front, back): void {
        const classification = this.classifySide(polygon);

        if (classification === COPLANAR) {
            (this.normal.dot(polygon.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
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
                const j = (i + 1) % polygon.vertices.length;
                vi = polygon.vertices[i];
                vj = polygon.vertices[j];
                ti = this.classifyVertex(vi);
                tj = this.classifyVertex(vj);

                if (ti !== BACK) {
                    f.push(vi);
                }
                if (ti !== FRONT) {
                    b.push(vi);
                }
                if ((ti | tj) === SPANNING) {
                    t = (this.w - this.normal.dot(vi)) / this.normal.dot(vj.clone().subtract(vi));
                    v = vi.interpolate(vj, t);
                    f.push(v);
                    b.push(v);
                }
            }

            if (f.length >= 3) {
                front.push(new PolygonCSG(f).calculateProperties());
            }
            if (b.length >= 3) {
                back.push(new PolygonCSG(b).calculateProperties());
            }
        }
    }
}
