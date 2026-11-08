import { GalleryUI } from "../features/GalleryUI";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import type { FurnitureOverrides, Selection } from "../../../shared/src/contracts";
import { initialCharacter, initialExhibition, loadContent } from "../data/content";
import { GalleryScene } from "../scene/GalleryScene";
const SpineActor = lazy(() => import("../character/SpineActor").then(module => ({ default: module.SpineActor })));
const HELP_KEY = 'shu-gallery:movement-help-seen';
function needsHelp() { try { return sessionStorage.getItem(HELP_KEY) !== 'yes'; } catch { return true; } }
export function App() {
  const [content, setContent] = useState({ character: initialCharacter, exhibition: initialExhibition });
  const [isWalking, setIsWalking] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(needsHelp);
  const [visitRequest, setVisitRequest] = useState<{ id: string; sequence: number }>();
  const [resetRequest, setResetRequest] = useState(0);
  const [selection, onSelect] = useState<Selection>(null);
  const [furnitureOverrides, onLayoutChange] = useState<FurnitureOverrides>({});
  const [contentState, setContentState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const dismissHelp = useCallback(() => { setShowHelp(false); try { sessionStorage.setItem(HELP_KEY, 'yes'); } catch { /* Session hints still work without storage. */ } }, []);
  const walkingChanged = useCallback((moving: boolean) => { setIsWalking(moving); if (moving) dismissHelp(); }, [dismissHelp]);
  useEffect(() => {
    const controller = new AbortController();
    loadContent(controller.signal).then(data => { setContent(data); setContentState('ready'); }).catch(() => {
      if (!controller.signal.aborted) setContentState('fallback');
    });
    return () => controller.abort();
  }, []);
  const props = { ...content, selection, onSelect, furnitureOverrides };
  return <main className={`gallery-app${overlayOpen ? ' has-overlay' : ''}`}>
    <div className="gallery-location" aria-label="穗间，黍的私人展厅">
      <span className="location-seal" aria-hidden="true">穗</span>
      <div><span>穗间</span><small>岁丰 · 黍的私人展厅</small></div>
    </div>
    {contentState !== 'loading' ? <GalleryScene {...props} visitRequest={visitRequest} resetRequest={resetRequest}
      inputBlocked={overlayOpen} onWalkingChange={walkingChanged}
      companion={motion => content.character.spine ? <Suspense fallback={<span className="companion-loading">正在迎接黍…</span>}>
        <SpineActor source={content.character.spine} {...motion} />
      </Suspense> : <span className="companion-loading">动态小人暂不可用</span>} />
      : <section className="gallery-scene"><div className="webgl-fallback" role="status">正在打开穗间…</div></section>}
    {contentState === 'fallback' && <p className="content-warning" role="status">角色内容暂未载入，当前为展厅预览。刷新可重试。</p>}
    {showHelp && !overlayOpen && !isWalking && contentState !== 'loading' && <div className="game-onboarding">
      <span className="hint-mark" aria-hidden="true">◇</span>
      <p>点地面移动，点家具靠近，再按提示互动。<small>拖动旋转视角 · 滚轮或双指缩放</small></p>
      <button type="button" onClick={dismissHelp} aria-label="收起操作提示">知道了</button>
    </div>}
    {contentState !== 'loading' && <GalleryUI {...props} isWalking={isWalking} onLayoutChange={onLayoutChange}
      onOverlayChange={setOverlayOpen}
      onVisit={id => setVisitRequest(previous => ({ id, sequence: (previous?.sequence ?? 0) + 1 }))}
      onResetView={() => setResetRequest(value => value + 1)} onShowHelp={() => setShowHelp(true)} />}
  </main>;
}
