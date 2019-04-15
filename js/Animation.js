class Animation {
  constructor(entity, transitions, frames) {
    this.entity = entity;
    this.frame = 0;
    this.frames = frames;
    this.transitions = transitions;
  }

  getEntity() {
    return this.entity;
  }

  // Step animation one frame;
  step() {
    this.frame += 1;
    let dx = 0;
    let dy = 0;
    let dz = 0;
    if (this.transitions.x !== undefined) {
      dx = this.transitions.x.evaluate(this.frame / this.frames) - this.entity.getCenter().getX();
    }
    if (this.transitions.y !== undefined) {
      dy = this.transitions.y.evaluate(this.frame / this.frames) - this.entity.getCenter().getY();
    }
    if (this.transitions.z !== undefined) {
      dz = this.transitions.z.evaluate(this.frame / this.frames) - this.entity.getCenter().getZ();
    }
    this.entity.translate(dx, dy, dz);
  }

  isFinished() {
    return this.frame === this.frames;
  }
}

class TransitionLinear {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  evaluate(t) {
    return this.start + (this.end - this.start) * t;
  }
}

class TransitionQuadraticBezier {
  constructor(p0, p1, p2) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
  }

  evaluate(t) {
    return (1 - t) * (1 - t) * this.p0 + 2 * (1 - t) * t * this.p1 + t * t * this.p2;
  }
}

export { Animation, TransitionLinear, TransitionQuadraticBezier };
