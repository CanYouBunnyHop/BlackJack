alert('import Vector2.js');
export default class Vector2 {
    constructor(_x, _y) { this.x = _x; this.y = _y; }
    add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
    subtract(other) { return new Vector2(this.x - other.x, this.y - other.y); }
    scale(factor) { return new Vector2(this.x * factor, this.y * factor); }
    dot(other) { return this.x * other.x + this.y * other.y; }
    static zero = new Vector2(0,0);
}
