export class PolygonCSG {
    private vertices;
    private normal;
    private w;

    constructor(vertices?, normal?, w?) {
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

    public calculateProperties(): PolygonCSG {
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

    public flip(): PolygonCSG {
        const vertices = [];

        this.normal.multiplyScalar(-1);
        this.w *= -1;

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            vertices.push(this.vertices[i]);
        }
        this.vertices = vertices;

        return this;
    }

    public classifyVertex(vertex): 1 | 2 {
        const sideValue = this.normal.dot(vertex) - this.w;

        if (sideValue < -0.0001) {
            return 2;
        } else if (sideValue > 0.0001) {
            return 1;
        }
    }

    public classifySide(polygon): 0 | 1 | 2 {
        let classification;
        let numPositive = 0;
        let numNegative = 0;

        for (const vertice of polygon.vertices) {
            classification = this.classifyVertex(vertice);
            if (classification === 1) {
                numPositive++;
            } else if (classification === 2) {
                numNegative++;
            }
        }

        if (numPositive > 0 && numNegative === 0) {
            return 1;
        } else if (numPositive === 0 && numNegative > 0) {
            return 2;
        } else if (numPositive === 0 && numNegative === 0) {
            return 0;
        }
    }

    public splitPolygon(polygon, coplanarFront, coplanarBack, front, back): void {
        const classification = this.classifySide(polygon);

        if (classification === 0) {
            (this.normal.dot(polygon.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
        } else if (classification === 1) {
            front.push(polygon);
        } else if (classification === 2) {
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

                if (ti !== 2) {
                  f.push(vi);
                }
                if (ti !== 1) {
                  b.push(vi);
                }
                if ((ti | tj) === 3) {
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
