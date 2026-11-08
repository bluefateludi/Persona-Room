import { useEffect, useState } from "react";
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
export function App() {
  const [content, setContent] = useState({
    character: initialCharacter,
    exhibition: initialExhibition,
  });
  const [selection, onSelect] = useState<Selection>(null);
  const [furnitureOverrides] = useState<FurnitureOverrides>({});
  const [contentReady, setContentReady] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    loadContent(controller.signal)
      .then((data) => {
        setContent(data);
        setContentReady(true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const props = { ...content, selection, onSelect, furnitureOverrides };
  return (
    <main className={`gallery-app${selection ? " is-inspecting" : ""}`}>
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
      <GalleryScene {...props} />
      <nav className="exhibit-nav" aria-label="展品目录">
        {content.exhibition.furniture.map((item, index) => (
          <button
            key={item.id}
            className={selection?.id === item.id ? "active" : ""}
            onClick={() => onSelect({ id: item.id, kind: item.kind })}
          >
            <span>0{index + 1}</span>
            {item.label}
            <i>↗</i>
          </button>
        ))}
      </nav>
      {selection && (
        <aside className="temporary-panel">
          <button onClick={() => onSelect(null)} aria-label="关闭展品说明">
            ×
          </button>
          <p className="eyebrow">COLLECTION / {selection.kind.toUpperCase()}</p>
          <h2>
            {
              content.exhibition.furniture.find((x) => x.id === selection.id)
                ?.label
            }
          </h2>
          <p>
            {selection.kind === "model"
              ? content.character.intro
              : "展品入口已接通，详细内容正由对应模块接入。"}
          </p>
          {selection.kind === "model" && (
            <p>拖动场景旋转手办视角，滚轮缩放。点击「全馆视角」返回展厅。</p>
          )}
        </aside>
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
