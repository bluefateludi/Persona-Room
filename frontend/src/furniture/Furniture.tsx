import { Component, Suspense, type ReactNode } from "react";
import { Image } from "@react-three/drei";
import type {
  CharacterContent,
  FurnitureItem,
} from "../../../shared/src/contracts";
import { NormalizedModel } from "../character/Figurine";
import { SceneLabel } from "../scene/SceneLabel";
const cream = "#e8dfc9",
  gold = "#b99a56",
  ink = "#233d42";
export function Box({
  position = [0, 0, 0],
  size,
  color = cream,
}: {
  position?: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.65} />
    </mesh>
  );
}
class AssetBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function Furniture({
  item,
  character,
}: {
  item: FurnitureItem;
  character: CharacterContent;
}) {
  if (item.kind === "archive")
    return item.modelUrl ? (
      <AssetBoundary
        key={item.modelUrl}
        fallback={
          <Furniture
            item={{ ...item, modelUrl: undefined }}
            character={character}
          />
        }
      >
        <Suspense
          fallback={<Box position={[0, 0.7, 0]} size={[1.5, 1.4, 0.7]} />}
        >
          <NormalizedModel url={item.modelUrl} height={1.7} />
        </Suspense>
      </AssetBoundary>
    ) : (
      <group>
        <Box position={[0, 0.8, 0]} size={[1.7, 1.6, 0.65]} color={ink} />
        <Box position={[0, 1.64, 0]} size={[1.85, 0.12, 0.8]} />
        {[-0.48, 0, 0.48].map((x) => (
          <group key={x}>
            <Box position={[x, 0.85, 0.35]} size={[0.43, 1.3, 0.06]} />
            <Box
              position={[x, 1, 0.4]}
              size={[0.045, 0.25, 0.04]}
              color={gold}
            />
          </group>
        ))}
        <Box position={[0, 0.12, 0]} size={[1.85, 0.14, 0.8]} color={gold} />
        <SceneLabel position={[0, 1.95, 0]} text="02 / 岁月档案" />
      </group>
    );
  if (item.kind === "voice")
    return (
      <group>
        <Box position={[0, 0.65, 0]} size={[1.05, 1.3, 0.9]} color={ink} />
        <Box position={[0, 1.34, 0]} size={[1.2, 0.08, 1]} color={gold} />
        <mesh position={[0, 1.43, 0]}>
          <cylinderGeometry args={[0.39, 0.39, 0.06, 48]} />
          <meshStandardMaterial color="#111c22" />
        </mesh>
        <mesh position={[0, 1.48, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
          <meshStandardMaterial color={gold} />
        </mesh>
        <mesh position={[0.26, 1.7, -0.2]} rotation={[0, 0, -0.65]}>
          <coneGeometry args={[0.4, 0.7, 32, 1, true]} />
          <meshStandardMaterial color={gold} side={2} />
        </mesh>
        <SceneLabel position={[0, 2.2, 0]} text="03 / 听见黍" />
      </group>
    );
  if (item.kind === "art")
    return (
      <group>
        <Box position={[0, 1.75, 0]} size={[1.7, 2.8, 0.16]} color={gold} />
        <Box
          position={[0, 1.75, 0.1]}
          size={[1.57, 2.67, 0.06]}
          color={cream}
        />
        {character.artworks[0] && (
          <AssetBoundary
            key={character.artworks[0].imageUrl}
            fallback={
              <SceneLabel text="图片暂不可用" position={[0, 1.75, 0.2]} />
            }
          >
            <Suspense fallback={null}>
              <Image
                url={character.artworks[0].imageUrl}
                position={[0, 1.75, 0.15]}
                scale={[1.43, 2.5]}
                transparent
              />
            </Suspense>
          </AssetBoundary>
        )}
        <SceneLabel position={[0, 3.4, 0]} text="04 / 丹青留影" />
      </group>
    );
  if (item.kind === "companion")
    return (
      <group>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.08, 64]} />
          <meshStandardMaterial color={gold} />
        </mesh>
        <SceneLabel position={[0, 0.65, 0]} text="05 / 与黍相遇" />
      </group>
    );
  return null;
}
