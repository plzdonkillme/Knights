/* eslint-disable class-methods-use-this */

class MapObject {
  constructor(props) {
    this.player = null;
    this.tile = null;
  }

  setTile(tile) {
    this.tile = tile;
  }

  getTile() {
    return this.tile;
  }

  getX() {
    return this.tile.getX();
  }

  getY() {
    return this.tile.getY();
  }

  getH() {
    return this.tile.getH();
  }

  getPlayer() {
    return this.player;
  }

  toJSON() {
    return {
      type: this.typeString(),
    };
  }

  typeString() {
    throw Error('Unimplemented');
  }
}

class Shard extends MapObject {
}

class BlueShard extends Shard {
  typeString() {
    return 'bs';
  }
}

class RedShard extends Shard {
  typeString() {
    return 'rs';
  }
}

class YellowShard extends Shard {
  typeString() {
    return 'ys';
  }
}


class Vessel extends MapObject {
  constructor(props) {
    super(props);
    this.player = props.player;
    this.movement = 4;
    this.jump = 1;
    this.range = 1;
  }

  toJSON() {
    const json = super.toJSON();
    json.player = this.player;
    return json;
  }

  transfer(tile) {
    const target = tile.getMapObject();
    const cls = target.consumeShard(this.getShard());
    const newObj = new cls(target.toJSON(), tile);
    const origObj = new WhiteVessel(this.toJSON(), this.tile);
  }

  attack(tiles) {
    tiles.map(t => t.getMapObject()).filter(m => m !== null).forEach(m => m.attackedBy(this));
  }

  move(tile) {
    const mO = tile.getMapObject();
    if (mO === null) {
      this.tile.unsetMapObject();
      tile.setMapObject(this);
      this.tile = tile;
    } else if (mO instanceof Shard) {
      const cls = this.consumeShard(mO);
      const newObj = new cls(this.toJSON(), tile);
      this.tile.unsetMapObject();
    }
  }

  getShard() {
    return null;
  }

  getMoveableTargets() {
    let queue = new Set([this.tile]);
    let nextQueue;
    const paths = new Map();
    paths.set(this.tile, [this.tile]);
    const pathsToDelete = new Set([this.tile]);
    for (let i = 0; i < this.movement; i += 1) {
      nextQueue = new Set();
      queue.forEach((tile) => { /* eslint-disable-line no-loop-func */
        tile.getNeighbors().forEach((nextTile) => {
          if (paths.get(nextTile) === undefined
            && this.canMoveThrough(tile, nextTile)
          ) {
            nextQueue.add(nextTile);
            paths.set(nextTile, paths.get(tile).concat(nextTile));
            if (!this.canMoveTo(nextTile)) {
              pathsToDelete.add(nextTile);
            }
          }
        });
      });
      queue = nextQueue;
    }
    pathsToDelete.forEach(tile => paths.delete(tile));
    return paths;
  }

  canMoveThrough(tile, nextTile) {
    if (Math.abs(nextTile.getH() - tile.getH()) > this.jump) {
      return false;
    }
    const mO = nextTile.getMapObject();
    if (mO === null || mO instanceof Shard || mO.getPlayer() === this.player) {
      return true;
    }
    return false;
  }

  canMoveTo(tile) {
    const mO = tile.getMapObject();
    if (mO === null || mO instanceof Shard) {
      return true;
    }
    return false;
  }

  getTransferableTargets(mapObjects) {
    if (this.getShard() === null) {
      return [];
    }
    return mapObjects.filter(m => m !== this && m.getShard !== null);
  }

  getAttackableTargets() {
    let queue = new Set([this.tile]);
    let nextQueue;
    const visited = new Set([this.tile]);
    for (let i = 0; i < this.range; i += 1) {
      nextQueue = new Set();
      queue.forEach((tile) => { /* eslint-disable-line no-loop-func */
        tile.getNeighbors().forEach((nextTile) => {
          if (!visited.has(nextTile)) {
            nextQueue.add(nextTile);
            visited.add(nextTile);
          }
        });
      });
      queue = nextQueue;
    }
    const attackableTargets = [];
    visited.forEach((tile) => {
      const mO = tile.getMapObject();
      if (mO !== null && mO !== this) {
        attackableTargets.push([tile]);
      }
    });
    return attackableTargets;
  }
}

class WhiteVessel extends Vessel {
  consumeShard(shard) {
    if (shard instanceof BlueShard) {
      return BlueVessel;
    } if (shard instanceof RedShard) {
      return RedVessel;
    } if (shard instanceof YellowShard) {
      return YellowVessel;
    }
  }

  typeString() {
    return 'w';
  }
}

class BlueVessel extends Vessel {
  constructor() {
    super(...arguments);
    this.range = 2;
  }

  typeString() {
    return 'b';
  }

  getShard() {
    return new BlueShard();
  }

  attackedBy(vessel) {
    if (vessel instanceof WhiteVessel) {
      const obj = new WhiteVessel(this.toJSON(), tile);
      return {
        key: this.getKey(),
        color: obj.getColor(),
      };
    }
  }
}

class RedVessel extends Vessel {
  typeString() {
    return 'r';
  }

  getShard() {
    return new RedShard();
  }

  attackedBy(vessel) {
    if (vessel instanceof WhiteVessel) {
      const obj = new WhiteVessel([this.player], this.tile, this.getKey());
      return {
        key: this.getKey(),
        color: obj.getColor(),
      };
    }
  }

  getAttackableTargets() {
    const dirs1 = ['left', 'right'];
    const dirs2 = ['top', 'down'];
    const tileSet = new Set();
    dirs1.forEach((dir) => {
      const t = this.tile[dir];
      if (t !== null) {
        if (t.getMapObject() !== null) {
          tileSet.add(t);
        }
        dirs2.forEach((dir2) => {
          const t2 = t[dir2];
          if (t2 !== null && t2.getMapObject() !== null) {
            tileSet.add(t2);
          }
        });
      }
    });
    dirs2.forEach((dir) => {
      const t = this.tile[dir];
      if (t !== null) {
        if (t.getMapObject() !== null) {
          tileSet.add(t);
        }
        dirs1.forEach((dir2) => {
          const t2 = t[dir2];
          if (t2 !== null && t2.getMapObject() !== null) {
            tileSet.add(t2);
          }
        });
      }
    });

    const tileArray = Array.from(tileSet);
    const tileKeys = tileArray.map(t => t.getKey());
    const objKeys = tileArray.map(t => t.getMapObject().getKey());
    const ret = [];
    ret.push(tileKeys.concat(objKeys));
    return ret;
  }
}

class YellowVessel extends Vessel {
  constructor() {
    super(...arguments);
    this.movement = 5;
  }

  typeString() {
    return 'y';
  }

  getShard() {
    return new YellowShard();
  }

  attackedBy(vessel) {
    if (vessel instanceof WhiteVessel) {
      const obj = new WhiteVessel([this.player], this.tile, this.getKey());
      return {
        key: this.getKey(),
        color: obj.getColor(),
      };
    }
  }
}

const MapObjectFactory = {
  map: {
    bs: BlueShard,
    rs: RedShard,
    ys: YellowShard,
    w: WhiteVessel,
    b: BlueVessel,
    r: RedVessel,
    y: YellowVessel,
  },
  create(json) {
    const MapObjectClass = this.map[json.type];
    return new MapObjectClass(json);
  },
  getJSON(propString) {
    const props = propString.trim().split('_');
    const json = {
      type: props[0],
    };
    if (props.length > 1) {
      json.player = props[1]; // eslint-disable-line prefer-destructuring
    }
    return json;
  },
  getPropString(json) {
    let propString = json.type;
    if (json.player !== undefined) {
      propString = `${propString}_${json.player}`;
    }
    const padding = ' '.repeat(3 - propString.length);
    return `${propString}${padding}`;
  },
  getPropStringWidth() {
    return 3;
  },
};

export {
  MapObjectFactory,
  BlueShard,
  RedShard,
  YellowShard,
  WhiteVessel,
  BlueVessel,
  RedVessel,
  YellowVessel,
};
