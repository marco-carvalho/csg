import {BACK} from "./threeCSG";

export class NodeCSG {
    constructor(polygons) {
        const front = [];
        const back = [];

        this.polygons = [];
        this.front = undefined;
        this.back = undefined;

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

    static isConvex(polygons) {
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

    allPolygons() {
        let polygons = this.polygons.slice();
        if (this.front) {
            polygons = polygons.concat(this.front.allPolygons());
        }
        if (this.back) {
            polygons = polygons.concat(this.back.allPolygons());
        }
        return polygons;
    }

    clone() {
        const node = new NodeCSG();

        node.divider = this.divider.clone();
        node.polygons = this.polygons.map((polygon) => polygon.clone());
        node.front = this.front && this.front.clone();
        node.back = this.back && this.back.clone();

        return node;
    }

    invert() {
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

        const temp = this.front;
        this.front = this.back;
        this.back = temp;

        return this;
    }

    clipPolygons(polygons) {
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

    clipTo(node) {
        this.polygons = node.clipPolygons(this.polygons);
        if (this.front) {
            this.front.clipTo(node);
        }
        if (this.back) {
            this.back.clipTo(node);
        }
    }
}
