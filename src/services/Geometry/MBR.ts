import { Matrix } from './Matrix';
import { Vector } from './Vector';

export class MBR {
  min: Vector;
  max: Vector;

  constructor(...points: Vector[]) {
    // MBR for a variable number of points
    this.min = new Vector(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    this.max = new Vector(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

    for (const p of points) {
      this.add(p);
    }
  }

  valid() {
    // Whether this is a valid MBR
    return this.min.x <= this.max.x && this.min.y <= this.max.y;
  }

  size() {
    // Size of this box
    return new Vector(this.max.x - this.min.x, this.max.y - this.min.y);
  }

  center() {
    // Center of the box
    return this.min.add(this.max).scale(0.5);
  }

  add(p: Vector) {
    // Adds a new point to this MBR
    this.min.x = Math.min(p.x, this.min.x);
    this.min.y = Math.min(p.y, this.min.y);
    this.max.x = Math.max(p.x, this.max.x);
    this.max.y = Math.max(p.y, this.max.y);
  }

  contains(p: Vector, r = 0) {
    // Whether MBR contains a point / circle
    return p.x + r >= this.min.x && p.y + r >= this.min.y && p.x - r < this.max.x && p.y - r < this.max.y;
  }

  pointDist(p: Vector) {
    // Distance from box to point
    const dx = Math.max(this.min.x - p.x, 0, p.x - this.max.x);
    const dy = Math.max(this.min.y - p.y, 0, p.y - this.max.y);
    return Math.sqrt(dx * dx + dy * dy);
  }

  intersects(other: MBR) {
    // Whether this MBR intersects another MBR
    const minx = Math.max(other.min.x, this.min.x);
    const maxx = Math.min(other.max.x, this.max.x);
    if (minx >= maxx) return false;
    const miny = Math.max(other.min.y, this.min.y);
    const maxy = Math.min(other.max.y, this.max.y);
    return miny < maxy;
  }

  intersection(other: MBR) {
    // Returns intersection with another MBR
    const ret = new MBR();
    ret.min.x = Math.max(other.min.x, this.min.x);
    ret.max.x = Math.min(other.max.x, this.max.x);
    ret.min.y = Math.max(other.min.y, this.min.y);
    ret.max.y = Math.min(other.max.y, this.max.y);
    return ret;
  }

  union(other: MBR) {
    // Returns union with another MBR
    const ret = new MBR();
    ret.min.x = Math.min(other.min.x, this.min.x);
    ret.max.x = Math.max(other.max.x, this.max.x);
    ret.min.y = Math.min(other.min.y, this.min.y);
    ret.max.y = Math.max(other.max.y, this.max.y);
    return ret;
  }

  transform(matrix: Matrix) {
    // Returns a new MBR transformed by matrix
    return new MBR(matrix.apply(this.min), matrix.apply(this.max));
  }
}
