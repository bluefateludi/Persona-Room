import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Mesh } from "three";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import type { Point } from "./navigation";

/** Move on the floor; project the same world-space feet into the Spine overlay. */
export function CompanionProjection({ position, route, element, onArrive, onFacing }: {
  position: RefObject<Point>;
  route: Point[];
  element: RefObject<HTMLDivElement | null>;
  onArrive: () => void;
  onFacing: (facing: 'left' | 'right') => void;
}) {
  const shadow = useRef<Mesh>(null);
  const world = useMemo(() => new Vector3(), []);
  const screen = useMemo(() => new Vector3(), []);
  const ahead = useMemo(() => new Vector3(), []);
  const waypoint = useRef(0);
  const facing = useRef<'left' | 'right'>('right');
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => { waypoint.current = 0; invalidate(); }, [route, invalidate]);
  useEffect(() => {
    const resume = () => invalidate();
    document.addEventListener('visibilitychange', resume);
    return () => document.removeEventListener('visibilitychange', resume);
  }, [invalidate]);
  useFrame(({ camera, size }, delta) => {
    const host = element.current;
    if (!host) return;
    const current = position.current;
    const target = route[waypoint.current];
    if (target && !document.hidden) {
      // Clamp the timestep so switching tabs never teleports the companion.
      let budget = Math.min(delta, 0.05) * 1.5;
      const oldX = current[0], oldZ = current[1];
      while (budget > 0 && waypoint.current < route.length) {
        const next = route[waypoint.current];
        const dx = next[0] - current[0], dz = next[1] - current[1];
        const length = Math.hypot(dx, dz);
        if (length <= budget) { current[0] = next[0]; current[1] = next[1]; budget -= length; waypoint.current++; }
        else { current[0] += dx / length * budget; current[1] += dz / length * budget; budget = 0; }
      }
      screen.set(oldX, 0.04, oldZ).project(camera);
      ahead.set(current[0], 0.04, current[1]).project(camera);
      const dx = ahead.x - screen.x;
      if (Math.abs(dx) > 0.00001) {
        const nextFacing = dx < 0 ? 'left' : 'right';
        if (nextFacing !== facing.current) { facing.current = nextFacing; onFacing(nextFacing); }
      }
      if (waypoint.current === route.length) onArrive();
      invalidate();
    }
    shadow.current?.position.set(current[0], 0.025, current[1]);
    world.set(current[0], 0.04, current[1]);
    screen.copy(world).project(camera);
    host.dataset.position = current.map(n => n.toFixed(3)).join(',');
    host.style.visibility = screen.z > 1 || screen.z < -1 ? "hidden" : "visible";
    host.style.left = `${(screen.x * 0.5 + 0.5) * size.width}px`;
    host.style.top = `${(-screen.y * 0.5 + 0.5) * size.height}px`;
    host.style.transform = `translate(-50%, -94%) scale(${Math.min(1.8, Math.max(0.34, 6 / world.distanceTo(camera.position)))})`;
  });
  return <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.65, 1]} raycast={() => {}}>
    <circleGeometry args={[0.3, 32]} />
    <meshBasicMaterial color="#253e43" transparent opacity={0.22} depthWrite={false} />
  </mesh>;
}
