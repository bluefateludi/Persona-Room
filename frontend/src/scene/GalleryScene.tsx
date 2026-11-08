import { CompanionProjection } from "./CompanionProjection";
import { SceneBoundary } from "./SceneBoundary";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, useProgress } from "@react-three/drei";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type {
  GallerySceneProps,
  FurnitureItem,
  Vec3,
  Selection,
} from "../../../shared/src/contracts";
import { SceneLabel } from "./SceneLabel";
import { Figurine } from "../character/Figurine";
import { Box, Furniture } from "../furniture/Furniture";
import { findPath, getObstacles, nearestWalkable, pathToExhibit, type Point } from "./navigation";
export interface CompanionMotion { moving: boolean; facing: 'left' | 'right'; onInteract: () => void }
type SceneProps = GallerySceneProps & {
  companion?: (motion: CompanionMotion) => ReactNode;
  visitRequest?: { id: string; sequence: number };
  onWalkingChange?: (moving: boolean) => void;
};
function Room({ onFloorClick }: { onFloorClick: (event: ThreeEvent<MouseEvent>) => void }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={onFloorClick}>
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
function Exhibit({ item, props, onVisit }: { item: FurnitureItem; props: SceneProps; onVisit: (item: FurnitureItem) => void }) {
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
        if (e.delta <= 5) onVisit(item);
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
  const companionElement = useRef<HTMLDivElement>(null);
  const companionItem = props.exhibition.furniture.find(item => item.kind === 'companion');
  const home = companionItem ? (props.furnitureOverrides[companionItem.id]?.position ?? companionItem.position) : [-2.5, 0, 1];
  const position = useRef<Point>([home[0], home[2]]);
  const [route, setRoute] = useState<Point[]>([]);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [notice, setNotice] = useState('点一处空地，陪黍逛逛展厅');
  const [sceneReady, setSceneReady] = useState(false);
  const pending = useRef<Selection>(null);
  const moving = route.length > 0;
  const obstacles = useMemo(() => getObstacles(props.exhibition.furniture, props.furnitureOverrides), [props.exhibition.furniture, props.furnitureOverrides]);
  const stop = useCallback(() => { pending.current = null; setRoute([]); setNotice('在这里歇一会儿吧'); }, []);
  useEffect(() => { props.onWalkingChange?.(moving); }, [moving, props.onWalkingChange]);
  const previousHome = useRef(home.join(','));
  useEffect(() => {
    // Re-layout cancels stale destinations and relocates only if a new obstacle covers her feet.
    const homeChanged = previousHome.current !== home.join(',');
    previousHome.current = home.join(',');
    const safe = nearestWalkable(homeChanged ? [home[0], home[2]] : position.current, obstacles);
    if (safe) position.current = safe;
    pending.current = null; setRoute([]);
    setNotice(safe ? '点一处空地，陪黍逛逛展厅' : '展厅太拥挤了，请先调整家具');
  }, [obstacles, home[0], home[2]]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') stop(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [stop]);
  const interact = useCallback(() => {
    stop();
    if (companionItem) props.onSelect({ id: companionItem.id, kind: 'companion' });
  }, [stop, companionItem, props.onSelect]);
  const startJourney = useCallback((path: Point[] | null, selection: Selection, label: string) => {
    pending.current = null;
    if (!path) { setRoute([]); setNotice('这里暂时走不到，换一处空地试试'); return; }
    pending.current = selection;
    props.onSelect(null);
    setNotice(label);
    setRoute(path);
  }, [props.onSelect]);
  const visit = useCallback((item: FurnitureItem) => {
    if (item.kind === 'companion') { interact(); return; }
    const selection = { id: item.id, kind: item.kind };
    if (!sceneReady || !props.character.spine) { props.onSelect(selection); return; }
    startJourney(pathToExhibit(position.current, item, props.furnitureOverrides, obstacles), selection, `一起去：${item.label}`);
  }, [interact, sceneReady, props.character.spine, props.furnitureOverrides, props.onSelect, obstacles, startJourney]);
  // A request is a user action, not a selected exhibit; repeated visits also work.
  const handledRequest = useRef(0);
  useEffect(() => {
    if (!props.visitRequest || props.visitRequest.sequence === handledRequest.current) return;
    handledRequest.current = props.visitRequest.sequence;
    const item = props.exhibition.furniture.find(item => item.id === props.visitRequest!.id);
    if (item) visit(item);
  }, [props.visitRequest, props.exhibition.furniture, visit]);
  useEffect(() => { if (props.selection) { pending.current = null; setRoute([]); } }, [props.selection]);
  function arrive() {
    const selection = pending.current;
    pending.current = null; setRoute([]);
    setNotice(selection ? '到了，一起看看吧' : '还想去哪里？点点地面吧');
    if (selection) props.onSelect(selection);
  }
  function walkTo(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (event.delta > 5 || !props.character.spine) return;
    startJourney(findPath(position.current, [event.point.x, event.point.z], obstacles), null, '正在散步 · 可以随时换个目的地');
  }
  const selected = props.exhibition.furniture.find(
    (x) => x.id === props.selection?.id,
  );
  const focused = selected
    ? (selected.kind === "companion" ? [position.current[0], 0, position.current[1]] as Vec3 : props.furnitureOverrides[selected.id]?.position ?? selected.position)
    : null;
  return (
    <section className={`gallery-scene${moving ? " is-walking" : ""}`} aria-label="三维互动展厅">
      <SceneBoundary>
        <Canvas
          frameloop="demand"
          onCreated={() => setSceneReady(true)}
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
          <Room onFloorClick={walkTo} />
          {props.exhibition.furniture.filter(item => item.kind !== "companion").map((item) => (
            <Exhibit key={item.id} item={item} props={props} onVisit={visit} />
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
          <CompanionProjection position={position} route={route} element={companionElement} onArrive={arrive} onFacing={setFacing} />
          {moving && <mesh position={[route[route.length - 1][0], 0.03, route[route.length - 1][1]]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => {}}>
            <ringGeometry args={[0.18, 0.24, 40]} /><meshBasicMaterial color="#f2d58a" depthWrite={false} />
          </mesh>}
        </Canvas>
      </SceneBoundary>
      {props.companion && (
        <div ref={companionElement} className="companion-overlay">
          <div className="companion-anchor">{props.companion({ moving, facing, onInteract: interact })}</div>
        </div>
      )}
      <LoadingNotice />
      <div className="scene-controls">
        <span>
          <i /> LIVE EXHIBITION
        </span>
        <button
          onClick={() => {
            stop();
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
            if (item) { stop(); props.onSelect({ id: item.id, kind: item.kind }); }
          }}
        >
          ⊕ 检视手办
        </button>
      </div>
      <div className="companion-status">
        <span className={moving ? 'walk-dot active' : 'walk-dot'} aria-hidden="true" />
        <span role="status" aria-live="polite">{notice}</span>
        {moving && <button type="button" onClick={stop}>停在这里</button>}
      </div>
      <div className="scene-hint">
        拖动旋转视角 <b>·</b> 滚轮缩放 <b>·</b> 点击地面散步 <b>·</b> 点击展品带路
      </div>
    </section>
  );
}
