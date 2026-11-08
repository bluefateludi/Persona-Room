import type { FurnitureItem, FurnitureOverrides } from '../../../shared/src/contracts';

export type Point = [number, number]; // Floor coordinates: x, z.
export interface Obstacle { center: Point; radius: number }
const STEP = 0.3;
const LIMIT = 24;
const FLOOR_RADIUS = 7.15;
const BACK_WALL = -3.35;
export const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Conservative footprints include clearance for the companion, even after rotation. */
export function furnitureObstacle(item: FurnitureItem, overrides: FurnitureOverrides): Obstacle {
  const position = overrides[item.id]?.position ?? item.position;
  const radius = { model: 1.3, archive: 1.1, voice: 0.8, art: 0.9, companion: 0 }[item.kind];
  return { center: [position[0], position[2]], radius: radius * Math.max(Math.abs(item.scale[0]), Math.abs(item.scale[2])) + 0.28 };
}
export function getObstacles(items: FurnitureItem[], overrides: FurnitureOverrides): Obstacle[] {
  return [
    ...items.filter(item => item.kind !== 'companion').map(item => furnitureObstacle(item, overrides)),
    ...[-5, 5].map(x => ({ center: [x, -2.4] as Point, radius: 0.76 })),
  ];
}
export function isWalkable(point: Point, obstacles: Obstacle[]) {
  return point.every(Number.isFinite) && Math.hypot(...point) <= FLOOR_RADIUS && point[1] >= BACK_WALL &&
    obstacles.every(obstacle => distance(point, obstacle.center) > obstacle.radius);
}
export function clearSegment(a: Point, b: Point, obstacles: Obstacle[]) {
  if (!isWalkable(a, obstacles) || !isWalkable(b, obstacles)) return false;
  const dx = b[0] - a[0], dz = b[1] - a[1], length2 = dx * dx + dz * dz;
  return obstacles.every(({ center, radius }) => {
    const t = length2 ? Math.max(0, Math.min(1, ((center[0] - a[0]) * dx + (center[1] - a[1]) * dz) / length2)) : 0;
    return distance(center, [a[0] + t * dx, a[1] + t * dz]) > radius;
  });
}
function gridPoints() {
  const points: Point[] = [];
  for (let x = -LIMIT; x <= LIMIT; x++) for (let z = -LIMIT; z <= LIMIT; z++) points.push([x * STEP, z * STEP]);
  return points;
}
const GRID = gridPoints();
export function nearestWalkable(point: Point, obstacles: Obstacle[]): Point | null {
  if (isWalkable(point, obstacles)) return [...point];
  return GRID.filter(p => isWalkable(p, obstacles)).sort((a, b) => distance(a, point) - distance(b, point))[0] ?? null;
}

/** Grid A*, exact segment collision checks, then line-of-sight smoothing. Null means unreachable. */
export function findPath(start: Point, goal: Point, obstacles: Obstacle[]): Point[] | null {
  if (!isWalkable(start, obstacles) || !isWalkable(goal, obstacles)) return null;
  if (clearSegment(start, goal, obstacles)) return [goal];
  const startPoint = GRID.filter(p => clearSegment(start, p, obstacles)).sort((a, b) => distance(a, start) - distance(b, start))[0];
  if (!startPoint) return null;
  const key = (p: Point) => `${Math.round(p[0] / STEP)},${Math.round(p[1] / STEP)}`;
  const startKey = key(startPoint);
  const open = [{ point: startPoint, cost: distance(start, startPoint), score: distance(startPoint, goal) }];
  const costs = new Map([[startKey, open[0].cost]]);
  const parents = new Map<string, Point>();
  const closed = new Set<string>();
  while (open.length) {
    open.sort((a, b) => b.score - a.score);
    const current = open.pop()!;
    const id = key(current.point);
    if (closed.has(id)) continue;
    closed.add(id);
    if (clearSegment(current.point, goal, obstacles)) {
      const path: Point[] = [goal, current.point];
      let cursor = id;
      while (parents.has(cursor)) { const parent = parents.get(cursor)!; path.push(parent); cursor = key(parent); }
      path.push(start);
      path.reverse();
      const smooth: Point[] = [];
      let index = 0;
      while (index < path.length - 1) {
        let next = path.length - 1;
        while (next > index + 1 && !clearSegment(path[index], path[next], obstacles)) next--;
        smooth.push(path[next]); index = next;
      }
      return smooth;
    }
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const next: Point = [current.point[0] + dx * STEP, current.point[1] + dz * STEP];
      const nextKey = key(next);
      if (closed.has(nextKey) || !clearSegment(current.point, next, obstacles)) continue;
      const cost = current.cost + Math.hypot(dx, dz) * STEP;
      if (cost >= (costs.get(nextKey) ?? Infinity)) continue;
      costs.set(nextKey, cost); parents.set(nextKey, current.point);
      open.push({ point: next, cost, score: cost + distance(next, goal) });
    }
  }
  return null;
}
export function pathToExhibit(start: Point, item: FurnitureItem, overrides: FurnitureOverrides, obstacles: Obstacle[]) {
  const { center, radius } = furnitureObstacle(item, overrides);
  const candidates = Array.from({ length: 24 }, (_, i): Point => {
    const angle = i * Math.PI / 12;
    return [center[0] + Math.cos(angle) * (radius + 0.25), center[1] + Math.sin(angle) * (radius + 0.25)];
  }).filter(p => isWalkable(p, obstacles)).sort((a, b) => distance(a, start) - distance(b, start));
  for (const point of candidates) { const path = findPath(start, point, obstacles); if (path) return path; }
  return null;
}

/** Interaction reach is measured from the footprint edge, not the model's origin. */
export function nearbyExhibit(point: Point, items: FurnitureItem[], overrides: FurnitureOverrides, preferredId?: string): FurnitureItem | null {
  if (!isWalkable(point, getObstacles(items, overrides))) return null;
  const nearby = items.filter(item => item.kind !== 'companion').map(item => {
    const obstacle = furnitureObstacle(item, overrides);
    return { item, gap: distance(point, obstacle.center) - obstacle.radius };
  }).filter(candidate => candidate.gap >= 0 && candidate.gap <= 0.8).sort((a, b) => a.gap - b.gap);
  return nearby.find(candidate => candidate.item.id === preferredId)?.item ?? nearby[0]?.item ?? null;
}
