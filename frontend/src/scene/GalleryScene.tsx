import { SceneBoundary } from "./SceneBoundary";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  ContactShadows,
  useProgress,
} from "@react-three/drei";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type {
  GallerySceneProps,
  FurnitureItem,
  Vec3,
} from "../../../shared/src/contracts";
import { SceneLabel } from "./SceneLabel";
import { Figurine } from "../character/Figurine";
import { Box, Furniture } from "../furniture/Furniture";
type SceneProps = GallerySceneProps & { companion?: ReactNode };
function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 96]} />
        <meshStandardMaterial color="#d1c8b3" roughness={0.88} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[8, 8, 0.35, 96]} />
        <meshStandardMaterial color="#30494a" />
      </mesh>
      {[2.1, 5.9, 7.8].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
          <ringGeometry args={[r, r + 0.025, 128]} />
          <meshStandardMaterial color="#ad8b4c" />
        </mesh>
      ))}
      <Box position={[0, 2.5, -4.3]} size={[12, 5, 0.2]} color="#253e43" />
      {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((x) => (
        <Box
          key={x}
          position={[x, 2.4, -4.14]}
          size={[0.025, 4.3, 0.025]}
          color="#657166"
        />
      ))}
      <Box position={[0, 0.2, -4]} size={[12, 0.4, 0.5]} color="#b6a785" />
      <SceneLabel
        position={[-2.3, 3.7, -4.05]}
        text="岁 丰 · THE YEARS IN GRAIN"
        width={3.5}
        height={0.65}
      />
      {[-5, 5].map((x) => (
        <group key={x}>
          <Box
            position={[x, 0.35, -2.4]}
            size={[0.65, 0.7, 0.65]}
            color="#dbcfb4"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <group
              key={i}
              position={[x + (i - 2) * 0.09, 1, -2.4]}
              rotation={[0, 0, (i - 2) * 0.13]}
            >
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.015, 0.02, 1.1, 6]} />
                <meshStandardMaterial color="#9c995b" />
              </mesh>
              <mesh position={[0, 0.95, 0]} scale={[0.1, 0.32, 0.07]}>
                <sphereGeometry args={[1, 10, 10]} />
                <meshStandardMaterial color="#c4ab6a" />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
function CameraRig({
  focused,
  reset,
}: {
  focused: Vec3 | null;
  reset: number;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const invalidate = useThree((state) => state.invalidate);
  const desired = useRef(new Vector3(8, 6.8, 10));
  const target = useRef(new Vector3(0, 1, 0));
  const moving = useRef(true);
  useEffect(() => {
    const p = focused ?? [0, 0, 0];
    target.current.set(p[0], p[1] + 1.3, p[2]);
    desired.current.set(
      p[0] + (focused ? 1.8 : 8),
      p[1] + (focused ? 3 : 6.8),
      p[2] + (focused ? 5 : 10),
    );
    moving.current = true;
    invalidate();
  }, [focused?.[0], focused?.[1], focused?.[2], reset]);
  useFrame(({ camera }, delta) => {
    if (!moving.current || !controls.current) return;
    const t = 1 - Math.exp(-delta * 4);
    camera.position.lerp(desired.current, t);
    controls.current.target.lerp(target.current, t);
    controls.current.update();
    invalidate();
    if (camera.position.distanceTo(desired.current) < 0.02)
      moving.current = false;
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={3}
      maxDistance={17}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2.12}
      onStart={() => {
        moving.current = false;
      }}
    />
  );
}
function Exhibit({ item, props }: { item: FurnitureItem; props: SceneProps }) {
  const [hover, setHover] = useState(false);
  const override = props.furnitureOverrides[item.id];
  const selected = props.selection?.id === item.id;
  return (
    <group
      position={override?.position ?? item.position}
      rotation={override?.rotation ?? item.rotation}
      scale={item.scale}
      onClick={(e) => {
        e.stopPropagation();
        props.onSelect({ id: item.id, kind: item.kind });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
    >
      {item.kind === "model" ? (
        <group>
          <mesh position={[0, 0.23, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.15, 1.25, 0.46, 96]} />
            <meshStandardMaterial color="#efe7d6" roughness={0.36} />
          </mesh>
          <mesh position={[0, 0.47, 0]}>
            <cylinderGeometry args={[1.13, 1.13, 0.025, 96]} />
            <meshStandardMaterial
              color="#b99a56"
              metalness={0.55}
              roughness={0.3}
            />
          </mesh>
          <group position={[0, 0.49, 0]}>
            <Figurine character={props.character} />
          </group>
          <SceneLabel
            position={[0, 0.6, 1.35]}
            text={`${props.character.name}   ${props.character.id.toUpperCase()} / 001`}
            width={1.35}
            height={0.3}
            light
          />
        </group>
      ) : (
        <Furniture item={item} character={props.character} />
      )}
      {item.kind === "companion" && props.companion && (
        <Html
          center
          position={[0, 1.25, 0]}
          distanceFactor={6}
          zIndexRange={[10, 0]}
        >
          <div className="companion-anchor">{props.companion}</div>
        </Html>
      )}
      {(hover || selected) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <ringGeometry
            args={[
              item.kind === "model" ? 1.3 : 0.85,
              item.kind === "model" ? 1.34 : 0.9,
              64,
            ]}
          />
          <meshBasicMaterial color="#f2d58a" />
        </mesh>
      )}
    </group>
  );
}
function LoadingNotice() {
  const { active, progress } = useProgress();
  return active ? (
    <div className="loading-notice" role="status">
      展品载入中 · {Math.round(progress)}%
    </div>
  ) : null;
}
export function GalleryScene(props: SceneProps) {
  const [reset, setReset] = useState(0);
  const selected = props.exhibition.furniture.find(
    (x) => x.id === props.selection?.id,
  );
  const focused = selected
    ? (props.furnitureOverrides[selected.id]?.position ?? selected.position)
    : null;
  return (
    <section className="gallery-scene" aria-label="三维互动展厅">
      <SceneBoundary>
        <Canvas
          frameloop="demand"
          shadows
          dpr={[1, 1.6]}
          camera={{ position: [8, 6.8, 10], fov: 40 }}
          gl={{ antialias: true, alpha: false }}
          onPointerMissed={() => props.onSelect(null)}
          fallback={
            <div className="webgl-fallback">
              当前设备暂不支持三维展厅，仍可通过下方目录阅读展品。
            </div>
          }
        >
          <color attach="background" args={["#162b30"]} />
          <fog attach="fog" args={["#162b30", 18, 35]} />
          <ambientLight intensity={1.1} />
          <hemisphereLight args={["#f4ead4", "#243e4c", 1.7]} />
          <directionalLight
            position={[3, 9, 5]}
            intensity={3.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-9}
            shadow-camera-right={9}
            shadow-camera-top={9}
            shadow-camera-bottom={-9}
          />
          <spotLight
            position={[-3, 7, -1]}
            intensity={38}
            angle={0.7}
            penumbra={1}
            color="#ffe6b5"
          />
          <Room />
          {props.exhibition.furniture.map((item) => (
            <Exhibit key={item.id} item={item} props={props} />
          ))}
          <ContactShadows
            position={[0, 0.012, 0]}
            opacity={0.3}
            scale={17}
            blur={2.5}
            far={5}
            resolution={512}
          />
          <CameraRig focused={focused} reset={reset} />
        </Canvas>
      </SceneBoundary>
      <LoadingNotice />
      <div className="scene-controls">
        <span>
          <i /> LIVE EXHIBITION
        </span>
        <button
          onClick={() => {
            props.onSelect(null);
            setReset((v) => v + 1);
          }}
        >
          ↗ 全馆视角
        </button>
        <button
          onClick={() => {
            const item = props.exhibition.furniture.find(
              (x) => x.kind === "model",
            );
            if (item) props.onSelect({ id: item.id, kind: item.kind });
          }}
        >
          ⊕ 检视手办
        </button>
      </div>
      <div className="scene-hint">
        拖动旋转视角 <b>·</b> 滚轮缩放 <b>·</b> 点击展品探索
      </div>
    </section>
  );
}
