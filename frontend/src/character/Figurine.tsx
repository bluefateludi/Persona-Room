import { Component, Suspense, useMemo, type ReactNode } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { Box3, Vector3, Mesh } from "three";
import type { CharacterContent } from "../../../shared/src/contracts";
export function NormalizedModel({
  url,
  height,
}: {
  url: string;
  height: number;
}) {
  const gltf = useGLTF(url);
  const normalized = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = height / Math.max(size.y, 0.001);
    scene.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );
    scene.scale.setScalar(scale);
    scene.traverse((o) => {
      if (o instanceof Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return scene;
  }, [gltf, height]);
  return <primitive object={normalized} />;
}
class ModelBoundary extends Component<
  { children: ReactNode; poster: string; url: string },
  { failed: boolean; retry: number }
> {
  state = { failed: false, retry: 0 };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <Html center position={[0, 1.4, 0]}>
        <div className="model-fallback">
          <img src={this.props.poster} alt="手办图片预览" />
          <p>模型加载失败 · 当前为图片预览</p>
          <button
            onClick={() => {
              useGLTF.clear(this.props.url);
              this.setState((s) => ({ failed: false, retry: s.retry + 1 }));
            }}
          >
            重新加载模型
          </button>
        </div>
      </Html>
    ) : (
      <group key={this.state.retry}>{this.props.children}</group>
    );
  }
}
export function Figurine({ character }: { character: CharacterContent }) {
  return (
    <group rotation={character.model.rotation}>
      <ModelBoundary
        poster={character.model.posterUrl}
        url={character.model.url}
      >
        <Suspense
          fallback={
            <mesh position={[0, 1.25, 0]}>
              <cylinderGeometry args={[0.3, 0.45, 2.5, 24]} />
              <meshStandardMaterial color="#b99a56" wireframe />
            </mesh>
          }
        >
          <NormalizedModel
            url={character.model.url}
            height={character.model.targetHeight}
          />
        </Suspense>
      </ModelBoundary>
    </group>
  );
}
