import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useMemo, type RefObject } from "react";
import type {
  FurnitureItem,
  FurnitureOverrides,
} from "../../../shared/src/contracts";
/** Project the companion into the app's existing DOM tree, avoiding extra React roots. */
export function CompanionProjection({
  item,
  overrides,
  element,
}: {
  item?: FurnitureItem;
  overrides: FurnitureOverrides;
  element: RefObject<HTMLDivElement | null>;
}) {
  const world = useMemo(() => new Vector3(), []);
  const screen = useMemo(() => new Vector3(), []);
  useFrame(({ camera, size }) => {
    const host = element.current;
    if (!host || !item) return;
    const position = overrides[item.id]?.position ?? item.position;
    world.set(position[0], position[1] + 0.8 * item.scale[1], position[2]);
    screen.copy(world).project(camera);
    host.style.visibility =
      screen.z > 1 || screen.z < -1 ? "hidden" : "visible";
    host.style.left = `${(screen.x * 0.5 + 0.5) * size.width}px`;
    host.style.top = `${(-screen.y * 0.5 + 0.5) * size.height}px`;
    host.style.transform = `translate(-50%, -50%) scale(${Math.min(1.8, 6 / world.distanceTo(camera.position))})`;
  });
  return null;
}
