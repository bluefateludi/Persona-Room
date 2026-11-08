import test from 'node:test';
import assert from 'node:assert/strict';
import { clearSegment, findPath, getObstacles, isWalkable, nearestWalkable, pathToExhibit } from './navigation.ts';
const exhibit = (id, kind, position, scale = [1, 1, 1]) => ({ id, kind, position, scale, rotation: [0, 0, 0], label: id });
const figure = exhibit('figure', 'model', [0, 0, 0]);
const archive = exhibit('archive', 'archive', [-3, 0, -2]);
const obstacles = getObstacles([figure, archive], {});
function assertSafe(start, path, blockers) {
  assert.ok(path && path.length, 'a path must exist');
  let previous = start;
  for (const point of path) { assert.ok(clearSegment(previous, point, blockers), `unsafe segment ${previous} → ${point}`); previous = point; }
}
test('walks around the central display instead of cutting through it', () => {
  const start = [-3, 0], goal = [3, 0];
  const path = findPath(start, goal, obstacles);
  assert.ok(path.length > 1);
  assertSafe(start, path, obstacles);
  assert.deepEqual(path.at(-1), goal);
});
test('allows a direct walk on open ground and refuses walls, plinths and off-floor targets', () => {
  assert.deepEqual(findPath([-3, 3], [3, 3], obstacles), [[3, 3]]);
  for (const goal of [[0, 0], [0, -4], [8, 3], [NaN, 1]]) assert.equal(findPath([-3, 3], goal, obstacles), null);
});
test('approaches furniture from reachable space without entering its footprint', () => {
  const start = [3, 2];
  assertSafe(start, pathToExhibit(start, archive, {}, obstacles), obstacles);
});
test('uses saved layouts and scaled footprints; can recover after furniture covers the actor', () => {
  const scaled = exhibit('figure', 'model', [0, 0, 0], [1.5, 1, 1.5]);
  const moved = getObstacles([scaled], { figure: { position: [3, 0, 2], rotation: [0, 1, 0] } });
  assert.ok(isWalkable([0, 0], moved));
  assert.equal(isWalkable([3, 2], moved), false);
  const recovered = nearestWalkable([3, 2], moved);
  assert.ok(recovered && isWalkable(recovered, moved));
  assertSafe([-3, 2], findPath([-3, 2], [6, 2], moved), moved);
});
test('unreachable routes return null and never cross a barrier', () => {
  const wall = Array.from({ length: 15 }, (_, i) => ({ center: [0, -4 + i], radius: 0.65 }));
  assert.equal(findPath([-3, 2], [3, 2], wall), null);
});
test('segment checks prevent diagonal corner cutting', () => {
  const blocker = [{ center: [0, 0], radius: 1 }];
  assert.ok(isWalkable([-1.01, 0], blocker));
  assert.ok(isWalkable([0, 1.01], blocker));
  assert.equal(clearSegment([-1.01, 0], [0, 1.01], blocker), false);
});
