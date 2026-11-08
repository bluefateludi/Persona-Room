import { GalleryUI } from "../features/GalleryUI";
import { lazy, Suspense, useEffect, useState } from "react";
import type {
  FurnitureOverrides,
  Selection,
} from "../../../shared/src/contracts";
import {
  initialCharacter,
  initialExhibition,
  loadContent,
} from "../data/content";
import { GalleryScene } from "../scene/GalleryScene";
const SpineActor = lazy(() =>
  import("../character/SpineActor").then((module) => ({
    default: module.SpineActor,
  })),
);
export function App() {
  const [content, setContent] = useState({
    character: initialCharacter,
    exhibition: initialExhibition,
  });
  const [isWalking, setIsWalking] = useState(false);
  const [visitRequest, setVisitRequest] = useState<{ id: string; sequence: number }>();
  const [selection, onSelect] = useState<Selection>(null);
  const [furnitureOverrides, onLayoutChange] = useState<FurnitureOverrides>({});
  const [contentReady, setContentReady] = useState(false);
  const [contentResolved, setContentResolved] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    loadContent(controller.signal)
      .then((data) => {
        setContent(data);
        setContentReady(true);
        setContentResolved(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setContentResolved(true);
      });
    return () => controller.abort();
  }, []);
  const props = { ...content, selection, onSelect, furnitureOverrides };
  return (
    <main className={`gallery-app${selection || isWalking ? " is-inspecting" : ""}`}>
      <header className="masthead">
        <a className="brand" href="./" aria-label="穗间展馆首页">
          <span className="brand-seal">穗</span>
          <span>
            穗间<small>GALLERY OF SHU</small>
          </span>
        </a>
        <div className="edition">
          明日方舟 · 干员主题展馆<span>VOL. 001 — SHU</span>
        </div>
        <span className="private-badge">个人珍藏馆</span>
      </header>
      <div className="gallery-heading">
        <div>
          <p className="eyebrow">A MOMENT BETWEEN THE HARVESTS</p>
          <h1>
            一穗，<em>一岁。</em>
          </h1>
          <p>在岁月的间隙，与你相逢。</p>
        </div>
        <div className="exhibit-count">
          <span>01</span>
          <p>
            当期展出
            <br />黍 · 数字珍藏
          </p>
        </div>
      </div>
      {contentResolved ? (
        <GalleryScene
          {...props}
          visitRequest={visitRequest}
          onWalkingChange={setIsWalking}
          companion={(motion) =>
            content.character.spine ? (
              <Suspense
                fallback={
                  <span className="companion-loading">正在迎接黍…</span>
                }
              >
                <SpineActor
                  source={content.character.spine}
                  {...motion}
                />
              </Suspense>
            ) : (
              <span className="companion-loading">动态小人暂不可用</span>
            )
          }
        />
      ) : (
        <section className="gallery-scene">
          <div className="webgl-fallback" role="status">
            正在打开馆藏…
          </div>
        </section>
      )}
      <nav className="exhibit-nav" aria-label="展品目录">
        {content.exhibition.furniture.map((item, index) => (
          <button
            key={item.id}
            className={selection?.id === item.id ? "active" : ""}
            onClick={() => setVisitRequest(previous => ({ id: item.id, sequence: (previous?.sequence ?? 0) + 1 }))}
          >
            <span>0{index + 1}</span>
            {item.label}
            <i>↗</i>
          </button>
        ))}
      </nav>
      {contentResolved && (
        <GalleryUI {...props} isWalking={isWalking} onLayoutChange={onLayoutChange} />
      )}
      <footer className="gallery-footer">
        <span>岁丰长相伴 · 黍的互动展馆</span>
        <span>
          {contentReady ? "角色内容已载入" : "场景预览 · 内容包待接入"}
          <b> / </b>非官方同人展示
        </span>
      </footer>
    </main>
  );
}
