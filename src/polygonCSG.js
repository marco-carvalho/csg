export class PolygonCSG {
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

        this.normal = b.clone().subtract(a).cross(c.clone().subtract(a)).normalize();

        this.w = this.normal.clone().dot(a);

        return this;
    }

    clone() {
        const polygon = new PolygonCSG();

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

        if (side_value < -0.0001) {
            return 2;
        } else if (side_value > 0.0001) {
            return 1;
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
            if (classification === 1) {
                num_positive++;
            } else if (classification === 2) {
                num_negative++;
            }
        }

        if (num_positive > 0 && num_negative === 0) {
            return 1;
        } else if (num_positive === 0 && num_negative > 0) {
            return 2;
        } else if (num_positive === 0 && num_negative === 0) {
            return 0;
        }
    }

    splitPolygon(polygon, coplanar_front, coplanar_back, front, back) {
        const classification = this.classifySide(polygon);

        if (classification === 0) {
            (this.normal.dot(polygon.normal) > 0 ? coplanar_front : coplanar_back).push(polygon);
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
                let j = (i + 1) % polygon.vertices.length;
                vi = polygon.vertices[i];
                vj = polygon.vertices[j];
                ti = this.classifyVertex(vi);
                tj = this.classifyVertex(vj);

                if (ti != 2) f.push(vi);
                if (ti != 1) b.push(vi);
                if ((ti | tj) === 3) {
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