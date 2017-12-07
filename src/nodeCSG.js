export class NodeCSG {
    constructor(polygons) {
        const front = [];
        const back = [];

        this.polygons = [];
        this.front = this.back = undefined;

        if (!(polygons instanceof Array) || polygons.length === 0) {
          return;
        }

        this.divider = polygons[0].clone();

        for (let i = 0; i < polygons.length; i++) {
            this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }

        if (back.length > 0) {
            this.back = new NodeCSG(back);
        }
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

    clipPolygons(polygons) {
        let front;
        let back;

        if (!this.divider) {
          return polygons.slice();
        }

        front = [];
      	back = [];

        for (let i = 0; i < polygons.length; i++) {
            this.divider.splitPolygon(polygons[i], front, back, front, back);
        }

        if (this.front) {
          front = this.front.clipPolygons(front);
        }
        if (this.back) {
          back = this.back.clipPolygons(back);
        }
        else back = [];

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
};
