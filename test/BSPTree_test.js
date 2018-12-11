import BSPTree from '../js/BSPTree';
import { Point, Vector } from '../js/Vector';
import Face from '../js/Face';

describe('BSPTree', () => {
  describe('sortPoints', () => {
    const p0 = new Point(0, 0, 0);
    const n = new Vector(0, 0, 1);

    it('should properly sort points on the same plane', () => {
      const points = Point.createFromBuffer([
        1, 1, 0,
        1, -1, 0,
        -1, -1, 0,
        -1, 1, 0,
      ]);
      const expFrontPoints = Point.createFromBuffer([
        1, 1, 0,
        1, -1, 0,
        -1, -1, 0,
        -1, 1, 0,
      ]);
      const expBackPoints = Point.createFromBuffer([
        1, 1, 0,
        1, -1, 0,
        -1, -1, 0,
        -1, 1, 0,
      ]);
      const { frontPoints, backPoints } = BSPTree.sortPoints(points, p0, n);
      expect(Point.arrayEquals(frontPoints, expFrontPoints)).to.be.true;
      expect(Point.arrayEquals(backPoints, expBackPoints)).to.be.true;
    });

    it('should properly sort points in front', () => {
      const points = Point.createFromBuffer([
        1, 1, 1,
        1, -1, 1,
        -1, -1, 1,
        -1, 1, 1,
      ]);
      const expFrontPoints = Point.createFromBuffer([
        1, 1, 1,
        1, -1, 1,
        -1, -1, 1,
        -1, 1, 1,
      ]);
      const expBackPoints = Point.createFromBuffer([]);
      const { frontPoints, backPoints } = BSPTree.sortPoints(points, p0, n);
      expect(Point.arrayEquals(frontPoints, expFrontPoints)).to.be.true;
      expect(Point.arrayEquals(backPoints, expBackPoints)).to.be.true;
    });

    it('should properly sort points in back', () => {
      const points = Point.createFromBuffer([
        1, 1, -1,
        1, -1, -1,
        -1, -1, -1,
        -1, 1, -1,
      ]);
      const expFrontPoints = Point.createFromBuffer([]);
      const expBackPoints = Point.createFromBuffer([
        1, 1, -1,
        1, -1, -1,
        -1, -1, -1,
        -1, 1, -1,
      ]);
      const { frontPoints, backPoints } = BSPTree.sortPoints(points, p0, n);
      expect(Point.arrayEquals(frontPoints, expFrontPoints)).to.be.true;
      expect(Point.arrayEquals(backPoints, expBackPoints)).to.be.true;
    });

    it('should properly sort points in front, mid, and back', () => {
      const points = Point.createFromBuffer([
        1, 1, -1,
        1, 0, 0,
        1, 1, 1,
      ]);
      const expFrontPoints = Point.createFromBuffer([
        1, 1, 0,
        1, 0, 0,
        1, 1, 1,
      ]);
      const expBackPoints = Point.createFromBuffer([
        1, 1, 0,
        1, 1, -1,
        1, 0, 0,
      ]);
      const { frontPoints, backPoints } = BSPTree.sortPoints(points, p0, n);
      expect(Point.arrayEquals(frontPoints, expFrontPoints)).to.be.true;
      expect(Point.arrayEquals(backPoints, expBackPoints)).to.be.true;
    });
  });

  describe('sortFaces', () => {
    const p0 = new Point(0, 0, 0);
    const n = new Vector(0, 0, 1);

    it('should properly sort faces on same plane', () => {
      const face = Face.createFromBuffer([
        1, 1, 0,
        1, 0, 0,
        0, 0, 0,
      ]);
      const { frontFaces, backFaces, nodeFaces } = BSPTree.sortFaces([face], p0, n);
      expect(frontFaces).to.deep.equal([]);
      expect(backFaces).to.deep.equal([]);
      expect(nodeFaces).to.deep.equal([face]);
    });

    it('should properly sort faces in front', () => {
      const face = Face.createFromBuffer([
        1, 1, 1,
        1, 0, 1,
        0, 0, 1,
      ]);
      const { frontFaces, backFaces, nodeFaces } = BSPTree.sortFaces([face], p0, n);
      expect(frontFaces).to.deep.equal([face]);
      expect(backFaces).to.deep.equal([]);
      expect(nodeFaces).to.deep.equal([]);
    });

    it('should properly sort faces in back', () => {
      const face = Face.createFromBuffer([
        1, 1, -1,
        1, 0, -1,
        0, 0, -1,
      ]);
      const { frontFaces, backFaces, nodeFaces } = BSPTree.sortFaces([face], p0, n);
      expect(frontFaces).to.deep.equal([]);
      expect(backFaces).to.deep.equal([face]);
      expect(nodeFaces).to.deep.equal([]);
    });

    it('should properly split faces', () => {
      const face = Face.createFromBuffer([
        1, 1, -1,
        1, 0, 0,
        1, 1, 1,
      ]);
      const expFrontFace = Face.createFromBuffer([
        1, 1, 0,
        1, 0, 0,
        1, 1, 1,
      ]);
      const expBackFace = Face.createFromBuffer([
        1, 1, 0,
        1, 1, -1,
        1, 0, 0,
      ]);
      const { frontFaces, backFaces, nodeFaces } = BSPTree.sortFaces([face], p0, n);
      expect(Face.arrayEquals(frontFaces, [expFrontFace])).to.be.true;
      expect(Face.arrayEquals(backFaces, [expBackFace])).to.be.true;
      expect(nodeFaces).to.deep.equal([]);
    });
  });

  describe('addFaces', () => {
    const dir = new Vector(0, 0, 1);

    it('should properly add faces without splitting', () => {
      const faces = [
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 1, 0, 1, 1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      const bsp = new BSPTree(faces);
      const sortedFaces = [];
      const fn = face => sortedFaces.push(face);
      bsp.traverse(fn, dir);
      const expSortedFaces = [
        [0, 0, 1, 1, 0, 1, 0, 1, 1],
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      expect(Face.arrayEquals(sortedFaces, expSortedFaces)).to.be.true;
    });

    it('should properly add faces with splitting', () => {
      const faces = [
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      const bsp = new BSPTree(faces);
      const sortedFaces = [];
      const fn = face => sortedFaces.push(face);
      bsp.traverse(fn, dir);
      const expSortedFaces = [
        [0, 1, 0, 0, 1, 1, 0, -1, 1, 0, -1, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 1, -1, 0, 1, 0, 0, -1, 0, 0, -1, -1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      expect(Face.arrayEquals(sortedFaces, expSortedFaces)).to.be.true;
      const splitFaces = bsp.getSplitFacesMap();
      expect(Array.from(splitFaces.entries())).to.have.lengthOf(2);
    });
  });

  describe('removeFaces', () => {
    const dir = new Vector(0, 0, 1);

    it('should properly remove leaf', () => {
      const faces = [
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 1, 0, 1, 1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      let bsp = new BSPTree(faces);
      bsp = BSPTree.removeFaces(bsp, [faces[1]]);
      const sortedFaces = [];
      const fn = face => sortedFaces.push(face);
      bsp.traverse(fn, dir);
      const expSortedFaces = [
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      expect(Face.arrayEquals(sortedFaces, expSortedFaces)).to.be.true;
    });

    it('should properly remove single links', () => {
      const faces = [
        [0, 0, 1, 1, 0, 1, 0, 1, 1],
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      let bsp = new BSPTree(faces);
      bsp = BSPTree.removeFaces(bsp, [faces[1]]);
      const sortedFaces = [];
      const fn = face => sortedFaces.push(face);
      bsp.traverse(fn, dir);
      const expSortedFaces = [
        [0, 0, 1, 1, 0, 1, 0, 1, 1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      expect(Face.arrayEquals(sortedFaces, expSortedFaces)).to.be.true;
    });

    it('should properly redistribute', () => {
      const faces = [
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 1, 0, 1, 1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      let bsp = new BSPTree(faces);
      bsp = BSPTree.removeFaces(bsp, [faces[0]]);
      const sortedFaces = [];
      const fn = face => sortedFaces.push(face);
      bsp.traverse(fn, dir);
      const expSortedFaces = [
        [0, 0, 1, 1, 0, 1, 0, 1, 1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      expect(Face.arrayEquals(sortedFaces, expSortedFaces)).to.be.true;
    });

    it('should properly redistribute with splitting 1', () => {
      const faces = [
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      let bsp = new BSPTree(faces);
      bsp = BSPTree.removeFaces(bsp, [faces[1]]);
      const sortedFaces = [];
      const fn = face => sortedFaces.push(face);
      bsp.traverse(fn, dir);
      const expSortedFaces = [
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      expect(Face.arrayEquals(sortedFaces, expSortedFaces)).to.be.true;
      const splitFaces = bsp.getSplitFacesMap();
      expect(Array.from(splitFaces.entries())).to.have.lengthOf(0);
    });

    it('should properly redistribute with splitting 2', () => {
      const faces = [
        [0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      let bsp = new BSPTree(faces);
      bsp = BSPTree.removeFaces(bsp, [faces[0]]);
      const sortedFaces = [];
      const fn = face => sortedFaces.push(face);
      bsp.traverse(fn, dir);
      const expSortedFaces = [
        [0, 1, 0, 0, 1, 1, 0, -1, 1, 0, -1, 0],
        [0, 1, -1, 0, 1, 0, 0, -1, 0, 0, -1, -1],
        [0, 0, -1, 1, 0, -1, 0, 1, -1],
      ].map(buff => Face.createFromBuffer(buff));
      expect(Face.arrayEquals(sortedFaces, expSortedFaces)).to.be.true;
      const splitFaces = bsp.getSplitFacesMap();
      expect(Array.from(splitFaces.entries())).to.have.lengthOf(2);
    });
  });
});