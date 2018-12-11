import { Point, Vector } from './Vector';

class Viewport {
  /*
        p1 (origin)       p2
        --------------------
        |                  |
        |                  |
        |                  |
        --------------------
        p3                p4
     */
  constructor(p1, p2, p3, p4, d = -1) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.p4 = p4;
    this.d = d;
    this.calcVectors();

    this.mx = null;
    this.my = null;

    // this.rates = {
    //   r1: 0,
    //   r2: 0,
    //   t1: 0,
    //   t2: 0,
    //   t3: 0,
    // };
    // this.animation = null;
  }

  calcVectors() {
    this.basis1 = Vector.createFromPoints(this.p1, this.p2);
    this.basis1.normalize();
    this.basis2 = Vector.createFromPoints(this.p1, this.p3);
    this.basis2.normalize();
    this.unitNormal = this.basis2.cross(this.basis1);
    this.midpoint = this.p1.midpoint(this.p4, 0.5);
    if (this.d !== -1) {
      const xDist = this.unitNormal.x * this.d;
      const yDist = this.unitNormal.y * this.d;
      const zDist = this.unitNormal.z * this.d;
      this.p5 = this.midpoint.copy();
      this.p5.translate(-xDist, -yDist, -zDist);
    }
  }

  getNormal() {
    return this.unitNormal;
  }

  setMouse(x, y) {
    this.mx = x;
    this.my = y;
  }

  projectFace(face) {
    const points = face.getPoints();
    const visiblePoints = [];
    const mapping = [];
    const threshold = this.d === -1 ? 0 : this.d;
    let viewVector;
    let pointVector;
    let pz;
    let li;
    let lz;
    let ri;
    let rz;
    let midpoint;
    let projected;

    for (let i = 0; i < points.length; i += 1) {
      if (this.d !== -1) {
        viewVector = Vector.createFromPoints(this.p5, points[i]);
      } else {
        viewVector = Vector.createFromPoints(this.midpoint, points[i]);
      }
      pz = viewVector.dot(this.unitNormal);
      if (pz >= threshold) {
        if (this.d === -1) {
          pointVector = Vector.createFromPoints(this.p1, points[i]);
        } else {
          midpoint = this.p5.midpoint(points[i], this.d / pz);
          pointVector = Vector.createFromPoints(this.p1, midpoint);
        }
        projected = new Point(pointVector.dot(this.basis1), pointVector.dot(this.basis2), 0);
        visiblePoints.push(projected);
        mapping.push(i);
      } else {
        li = i === 0 ? points.length - 1 : i - 1;
        if (this.d !== -1) {
          viewVector = Vector.createFromPoints(this.p5, points[li]);
        } else {
          viewVector = Vector.createFromPoints(this.midpoint, points[li]);
        }
        lz = viewVector.dot(this.unitNormal);
        if (lz >= threshold) {
          midpoint = points[i].midpoint(points[li], (threshold - pz) / (lz - pz));
          pointVector = Vector.createFromPoints(this.p1, midpoint);
          projected = new Point(pointVector.dot(this.basis1), pointVector.dot(this.basis2), 0);
          visiblePoints.push(projected);
          mapping.push([li, i]);
        }
        ri = i === points.length - 1 ? 0 : i + 1;
        if (this.d !== -1) {
          viewVector = Vector.createFromPoints(this.p5, points[ri]);
        } else {
          viewVector = Vector.createFromPoints(this.midpoint, points[ri]);
        }
        rz = viewVector.dot(this.unitNormal);
        if (rz >= threshold) {
          midpoint = points[i].midpoint(points[ri], (threshold - pz) / (rz - pz));
          pointVector = Vector.createFromPoints(this.p1, midpoint);
          projected = new Point(pointVector.dot(this.basis1), pointVector.dot(this.basis2), 0);
          visiblePoints.push(projected);
          mapping.push([i, ri]);
        }
      }
    }
    return {
      visiblePoints,
      mapping,
    };
  }

  mouseInside(points) {
    if (this.mx === null && this.my === null) {
      return false;
    }
    let zPos = null;
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      const np = i === points.length - 1 ? points[0] : points[i + 1];
      const v1 = {
        x: np.getX() - p.getX(),
        y: np.getY() - p.getY(),
      };
      const v2 = {
        x: this.mx - p.getX(),
        y: this.my - p.getY(),
      };
      const cross = (v1.x * v2.y) - (v1.y * v2.x);
      if (zPos === null) {
        zPos = cross > 0;
      } else if ((cross > 0) !== zPos) {
        return false;
      }
    }
    return true;
  }

  // projectPoint(point) {
  //   let viewVector; let pointVector; let
  //     threshold;
  //   if (this.d !== -1) {
  //     viewVector = Vector.createFromPoints(this.p5, point);
  //     threshold = this.d;
  //   } else {
  //     viewVector = Vector.createFromPoints(this.midpoint, point);
  //     threshold = 0;
  //   }

  //   const pz = viewVector.dot(this.unitNormal);
  //   if (pz >= threshold) {
  //     if (this.d !== -1) {
  //       const midpoint = this.p5.midpoint(point, this.d / pz);
  //       pointVector = Vector.createFromPoints(this.p1, midpoint);
  //     } else {
  //       pointVector = Vector.createFromPoints(this.p1, point);
  //     }
  //     return new Point(pointVector.dot(this.basis1), pointVector.dot(this.basis2), 0);
  //   }
  //   return null;
  // }

  // translateAlongBasis(s1, s2, s3) {
  //   const xDist = this.basis1.x * s1 + this.basis2.x * s2 + this.unitNormal.x * s3;
  //   const yDist = this.basis1.y * s1 + this.basis2.y * s2 + this.unitNormal.y * s3;
  //   const zDist = this.basis1.z * s1 + this.basis2.z * s2 + this.unitNormal.z * s3;
  //   this.translate(xDist, yDist, zDist);
  // }

  // translate(x, y, z, calc = true) {
  //   this.p1.translate(x, y, z);
  //   this.p2.translate(x, y, z);
  //   this.p3.translate(x, y, z);
  //   this.p4.translate(x, y, z);
  //   if (calc) {
  //     this.calcVectors();
  //   }
  // }

  // rotateByBasis(theta1, theta2, theta3) {
  //   const xDist = this.midpoint.getX();
  //   const yDist = this.midpoint.getY();
  //   const zDist = this.midpoint.getZ();
  //   const rad1 = theta1 / 360 * Math.PI;
  //   const rad2 = theta2 / 360 * Math.PI;
  //   const rad3 = theta3 / 360 * Math.PI;

  //   this.translate(-xDist, -yDist, -zDist, false);
  //   this.p1.rotate(this.basis1, rad1);
  //   this.p1.rotate(this.basis2, rad2);
  //   this.p1.rotate(this.unitNormal, rad3);
  //   this.p2.rotate(this.basis1, rad1);
  //   this.p2.rotate(this.basis2, rad2);
  //   this.p2.rotate(this.unitNormal, rad3);
  //   this.p3.rotate(this.basis1, rad1);
  //   this.p3.rotate(this.basis2, rad2);
  //   this.p3.rotate(this.unitNormal, rad3);
  //   this.p4.rotate(this.basis1, rad1);
  //   this.p4.rotate(this.basis2, rad2);
  //   this.p4.rotate(this.unitNormal, rad3);
  //   this.translate(xDist, yDist, zDist, true);
  // }

  // updatePosition() {
  //   if (this.animation !== null) {
  //     if (this.animation.rate === null) {
  //       this.animation.rate = {
  //         x: (this.animation.endpoint.getX() - this.p1.getX()) / this.animation.frames,
  //         y: (this.animation.endpoint.getY() - this.p1.getY()) / this.animation.frames,
  //         z: (this.animation.endpoint.getZ() - this.p1.getZ()) / this.animation.frames,
  //       };
  //     }
  //     const dx = this.animation.rate.x;
  //     const dy = this.animation.rate.y;
  //     const dz = this.animation.rate.z;
  //     this.translate(dx, dy, dz);
  //     this.animation.frames -= 1;
  //     if (this.animation.frames === 0) {
  //       this.animation.resolve();
  //       this.animation = null;
  //     }
  //   } else {
  //     if (this.rates.r1 || this.rates.r2) {
  //       this.rotateByBasis(this.rates.r1, this.rates.r2, 0);
  //     }
  //     if (this.rates.t1 || this.rates.t2 || this.rates.t3) {
  //       this.translateAlongBasis(this.rates.t1, this.rates.t2, this.rates.t3);
  //     }
  //   }
  // }

  // updateRates(rates) {
  //   this.rates.r1 += (rates.r1 || 0);
  //   this.rates.r2 += (rates.r2 || 0);
  //   this.rates.t1 += (rates.t1 || 0);
  //   this.rates.t2 += (rates.t2 || 0);
  //   this.rates.t3 += (rates.t3 || 0);
  // }

  // mouseInside(points) {
  //   if (this.mx === null && this.my === null) {
  //     return false;
  //   }
  //   let zPos = null;
  //   for (let i = 0; i < points.length; i++) {
  //     const p = points[i];
  //     const np = i === points.length - 1 ? points[0] : points[i + 1];
  //     const v1 = {
  //       x: np.getX() - p.getX(),
  //       y: np.getY() - p.getY(),
  //     };
  //     const v2 = {
  //       x: this.mx - p.getX(),
  //       y: this.my - p.getY(),
  //     };
  //     const cross = (v1.x * v2.y) - (v1.y * v2.x);
  //     if (zPos === null) {
  //       zPos = cross > 0;
  //     } else if ((cross > 0) !== zPos) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // getViewDir(point, n) {
  //   let dot;
  //   if (this.d === -1) {
  //     dot = n.dot(this.unitNormal);
  //   } else {
  //     dot = n.dot(Vector.createFromPoints(this.p5, point));
  //   }
  //   return dot <= 0 ? 'towards' : 'away';
  // }

  // getCenteredP1(point, dist) {
  //   const px = point.getX() - dist * this.unitNormal.getX();
  //   const py = point.getY() - dist * this.unitNormal.getY();
  //   const pz = point.getZ() - dist * this.unitNormal.getZ();
  //   const dx = px - this.midpoint.getX();
  //   const dy = py - this.midpoint.getY();
  //   const dz = pz - this.midpoint.getZ();
  //   return new Point(this.p1.getX() + dx, this.p1.getY() + dy, this.p1.getZ() + dz);
  // }
}

export default Viewport;