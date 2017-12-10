import {BACK} from "./threeCSG";

export class NodeCSG {
    private polygons;
    private front;
    private back;
    private divider;

    constructor(polygons?) {
        const front = [];
        const back = [];

        this.polygons = [];
        this.front = this.back = undefined;

        if (!(polygons instanceof Array) || polygons.length === 0) {
            return;
        }

        this.divider = polygons[0].clone();

        for (const polygon of polygons) {
            this.divider.splitPolygon(polygon, this.polygons, this.polygons, front, back);
        }

        if (front.length > 0) {
            this.front = new NodeCSG(front);
        }

        if (back.length > 0) {
            this.back = new NodeCSG(back);
        }
    }

    public isConvex(polygons) {
        for (let i = 0; i < polygons.length; i++) {
            for (let j = 0; j < polygons.length; j++) {
                if (i !== j && polygons[i].classifySide(polygons[j]) !== BACK) {
                    return false;
                }
            }
        }
        return true;
    }

    public build(polygons) {
        const front = [];
        const back = [];

        if (!this.divider) {
            this.divider = polygons[0].clone();
        }

        for (const polygon of polygons) {
            this.divider.splitPolygon(polygon, this.polygons, this.polygons, front, back);
        }

        if (front.length > 0) {
            if (!this.front) {
                this.front = new NodeCSG();
            }
            this.front.build(front);
        }

        if (back.length > 0) {
            if (!this.back) {
                this.back = new NodeCSG();
            }
            this.back.build(back);
        }
    }

    public allPolygons() {
        let polygons = this.polygons.slice();
        if (this.front) {
            polygons = polygons.concat(this.front.allPolygons());
        }
        if (this.back) {
            polygons = polygons.concat(this.back.allPolygons());
        }
        return polygons;
    }

    public clone() {
        const node = new NodeCSG();

        node.divider = this.divider.clone();
        node.polygons = this.polygons.map((polygon) => {
            return polygon.clone();
        });
        node.front = this.front && this.front.clone();
        node.back = this.back && this.back.clone();

        return node;
    }

    public invert() {
        let temp;

        for (const polygon of this.polygons) {
            polygon.flip();
        }

        this.divider.flip();
        if (this.front) {
            this.front.invert();
        }
        if (this.back) {
            this.back.invert();
        }

        temp = this.front;
        this.front = this.back;
        this.back = temp;

        return this;
    }

    public clipPolygons(polygons) {
        let front;
        let back;

        if (!this.divider) {
            return polygons.slice();
        }

        front = [];
        back = [];

        for (const polygon of polygons) {
            this.divider.splitPolygon(polygon, front, back, front, back);
        }

        if (this.front) {
            front = this.front.clipPolygons(front);
        }

        back = this.back ? this.back.clipPolygons(back) : [];

        return front.concat(back);
    }

    public clipTo(node) {
        this.polygons = node.clipPolygons(this.polygons);
        if (this.front) {
            this.front.clipTo(node);
        }
        if (this.back) {
            this.back.clipTo(node);
        }
    }
}
