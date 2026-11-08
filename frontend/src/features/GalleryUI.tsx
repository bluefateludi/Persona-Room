import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryUIProps, FurnitureOverrides } from '../../../shared/src/contracts';
import { EmptyState, FavoriteButton } from '../components/GalleryPrimitives';
import { favoriteKey, parseSave, readSave, writeSave } from '../state/galleryStorage';
import { ArchivePanel } from './archive/ArchivePanel';
import { EditorPanel } from './editor/EditorPanel';
import { VoicePanel } from './voice/VoicePanel';
import { useVoicePlayer } from './voice/useVoicePlayer';
import './GalleryUI.css';

type Panel = 'intro' | 'archive' | 'voice' | 'art' | 'collection' | 'editor' | 'settings';
const titles: Record<Panel, string> = { intro: '数字手办', archive: '档案卷册', voice: '与黍交谈', art: '丹青留影', collection: '我的收藏', editor: '布置展厅', settings: '展馆设置' };
const menuEntries: { id: Panel; mark: string; title: string; subtitle: string }[] = [
  { id: 'collection', mark: '藏', title: '我的收藏', subtitle: '留住心动的片刻' },
  { id: 'editor', mark: '置', title: '布置展厅', subtitle: '安放一处喜欢的风景' },
  { id: 'settings', mark: '设', title: '展馆设置', subtitle: '声音、视角与操作' },
];
export function GalleryUI(props: GalleryUIProps) {
  return <GalleryUISession key={`${props.character.id}:${props.exhibition.id}`} {...props} />;
}
function GalleryUISession({ onOverlayChange, onVisit, onResetView, onShowHelp, isWalking, character, exhibition, selection, furnitureOverrides, onSelect, onLayoutChange }: GalleryUIProps) {
  const [initial] = useState(() => readSave(character, exhibition));
  const [save, setSave] = useState(initial.save);
  const [warning, setWarning] = useState(initial.warning);
  const [notice, setNotice] = useState('');
  const [panel, setPanel] = useState<Panel>('intro');
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (isWalking) { setOpen(false); setMenuOpen(false); } }, [isWalking]);
  useEffect(() => { onOverlayChange?.(open || menuOpen); }, [open, menuOpen, onOverlayChange]);
  const [archiveId, setArchiveId] = useState<string>();
  const player = useVoicePlayer();
  const layoutCallback = useRef(onLayoutChange);
  layoutCallback.current = onLayoutChange;
  const panelRef = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => { layoutCallback.current(initial.save.furnitureOverrides); }, [initial]);
  useEffect(() => { if (save === initial.save) return; const failure = writeSave(save, character, exhibition); if (failure) setWarning(failure); }, [save, initial, character, exhibition]);
  const markRead = useCallback((id: string) => setSave(old => old.readArchiveIds.includes(id) ? old : { ...old, readArchiveIds: [...old.readArchiveIds, id] }), []);
  const toggleFavorite = useCallback((id: string) => setSave(old => ({ ...old, favorites: old.favorites.includes(id) ? old.favorites.filter(x => x !== id) : [...old.favorites, id] })), []);
  const show = useCallback((target: Panel) => { opener.current = document.activeElement as HTMLElement; if (target !== 'voice') player.pause(); setMenuOpen(false); setPanel(target); setOpen(true); }, [player.pause]);
  const close = useCallback(() => {
    setOpen(false); setMenuOpen(false); player.pause(); onSelect(null);
    (opener.current?.isConnected ? opener.current : menuToggle.current)?.focus();
  }, [onSelect, player.pause]);
  const previousSelection = useRef<typeof selection>(null);
  useEffect(() => {
    if (selection === previousSelection.current) return;
    previousSelection.current = selection;
    if (!selection) { setOpen(false); return; }
    const furniture = exhibition.furniture.find(x => x.id === selection.id && x.kind === selection.kind);
    if (!furniture) return;
    if (selection.kind === 'archive') setArchiveId(furniture.contentId);
    if (selection.kind === 'companion' || selection.kind === 'voice') {
      const voice = character.voices.find(x => x.id === furniture.contentId) ?? character.voices.find(x => x.audioUrl) ?? character.voices[0];
      if (voice) void player.play(voice);
      show('voice');
    } else show(selection.kind === 'model' ? 'intro' : selection.kind === 'archive' ? 'archive' : 'art');
  }, [selection, exhibition.furniture, character.voices, player.play, show]);
  useEffect(() => {
    const surface = menuOpen ? menuRef.current : open ? panelRef.current : null;
    if (!surface) return;
    surface.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(surface.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([type="hidden"]), select, [tabindex="0"]')).filter(element => element.getClientRects().length);
      if (!focusable.length) { event.preventDefault(); surface.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === surface)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !surface.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [open, menuOpen, panel, close]);
  function travelTo(id: string) {
    close();
    if (onVisit) onVisit(id);
    else { const item = exhibition.furniture.find(item => item.id === id); if (item) onSelect({ id, kind: item.kind }); }
  }
  function changeLayout(overrides: FurnitureOverrides) {
    // Validate programmatic presets with the same rules as imported files.
    const next = parseSave(JSON.stringify({ ...save, furnitureOverrides: overrides }), character, exhibition);
    setSave(next); onLayoutChange(next.furnitureOverrides); setNotice('布置已更新');
  }
  function importConfig(raw: string) {
    const next = parseSave(raw, character, exhibition);
    setSave(next); onLayoutChange(next.furnitureOverrides); setNotice('配置已导入，收藏、已读和布置已恢复。');
  }
  function exportConfig() {
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `gallery-${character.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('配置已导出');
  }
  const model = exhibition.furniture.find(x => x.kind === 'model');
  const modelKey = model ? favoriteKey('model', model.id) : null;
  const favorites = [
    ...character.archives.map(x => ({ id: x.id, key: favoriteKey('archive', x.id), title: x.title, kind: '精选档案', panel: 'archive' as Panel })),
    ...character.voices.map(x => ({ id: x.id, key: favoriteKey('voice', x.id), title: x.title, kind: '角色语音', panel: 'voice' as Panel })),
    ...character.artworks.map(x => ({ id: x.id, key: favoriteKey('art', x.id), title: x.title, kind: '画廊', panel: 'art' as Panel })),
    ...(modelKey ? [{ id: model!.id, key: modelKey, title: model!.label, kind: '数字手办', panel: 'intro' as Panel }] : []),
  ].filter(x => save.favorites.includes(x.key));
  return <div className="g-ui">
    {(open || menuOpen) && <div className={`g-ui-shade${panel === 'voice' && open ? ' is-dialogue' : ''}${panel === 'editor' && open ? ' is-editing' : ''}`} onPointerDown={close} aria-hidden="true" />}
    <button ref={menuToggle} type="button" className="gallery-menu-toggle" aria-label={menuOpen ? '关闭展馆菜单' : '打开展馆菜单'} aria-expanded={menuOpen} aria-controls="gallery-menu"
      onClick={() => { if (menuOpen) close(); else { opener.current = menuToggle.current; player.pause(); setOpen(false); onSelect(null); setMenuOpen(true); } }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 7h14M8 12h11M5 17h14" /><path d="M5 11v2" /></svg><span>展馆</span>
    </button>
    {menuOpen && <aside id="gallery-menu" ref={menuRef} tabIndex={-1} className="gallery-menu" role="dialog" aria-modal="true" aria-label="展馆菜单">
      <div className="menu-heading"><span>穗间小记</span><button type="button" onClick={close} aria-label="关闭菜单">×</button></div>
      <p className="menu-whisper">一方天地，随心安放。</p>
      <nav aria-label="展馆功能">{menuEntries.map(item => <button key={item.id} type="button" onClick={() => show(item.id)}>
        <span className="menu-mark" aria-hidden="true">{item.mark}</span><span>{item.title}<small>{item.subtitle}</small></span><span aria-hidden="true">›</span>
      </button>)}</nav>
      <p className="menu-progress">已读 {save.readArchiveIds.length} / {character.archives.length} 篇 · 收藏 {save.favorites.length} 项</p>
      {warning && <p className="g-ui-error" role="alert">{warning}</p>}
      <button type="button" className="menu-return" onClick={close}>返回展厅 <span aria-hidden="true">↗</span></button>
    </aside>}
    {open && <aside ref={panelRef} tabIndex={-1} className={`g-ui-panel panel-${panel}`} role="dialog" aria-modal="true" aria-label={titles[panel]}>
      <div className="g-ui-panel-top"><span><b aria-hidden="true">穗</b> {titles[panel]}</span><button type="button" onClick={close} aria-label="返回展厅">×</button></div>
      <div className="g-ui-panel-content">
      {panel === 'intro' && <><p className="g-ui-eyebrow">THE EXHIBIT / 数字藏品</p><h2>{character.name}<span className="g-ui-subtitle">一方展厅，一段相逢</span></h2><p className="g-ui-intro">{character.intro}</p><p className="g-ui-note">于岁时之间，留住她的身影。</p><div className="g-ui-actions"><button type="button" className="g-ui-primary" onClick={() => show('archive')}>了解她的故事 ↗</button>{modelKey && <FavoriteButton active={save.favorites.includes(modelKey)} onClick={() => toggleFavorite(modelKey)} />}</div><div className="g-ui-reading"><h3>你的参观足迹</h3><p>已阅读 {save.readArchiveIds.length} / {character.archives.length} 篇档案 · 已收藏 {save.favorites.length} 项</p><p className="g-ui-note">参观记录保存在此浏览器中。</p></div></>}
      {panel === 'archive' && <ArchivePanel key={archiveId ?? 'default'} initialId={archiveId} character={character} favorites={save.favorites} readIds={save.readArchiveIds} onFavorite={toggleFavorite} onRead={markRead} />}
      {panel === 'voice' && <VoicePanel character={character} voices={character.voices} player={player} favorites={save.favorites} onFavorite={toggleFavorite} />}
      {panel === 'editor' && <EditorPanel exhibition={exhibition} overrides={furnitureOverrides} onChange={changeLayout} onExport={exportConfig} onImport={importConfig} />}
      {panel === 'art' && <><p className="g-ui-eyebrow">ARTWORK / 画廊</p><h2>纸上相逢</h2>{character.artworks.length ? character.artworks.map(art => <figure className="g-ui-art" key={art.id}><ArtworkImage src={art.imageUrl} title={art.title} /><figcaption><h3>{art.title}</h3><p>{art.description}</p><FavoriteButton active={save.favorites.includes(favoriteKey('art', art.id))} onClick={() => toggleFavorite(favoriteKey('art', art.id))} /></figcaption></figure>) : <EmptyState>当前暂无可展示的图片。</EmptyState>}</>}
      {panel === 'collection' && <><p className="g-ui-eyebrow">KEEPSAKES / 我的收藏</p><h2>留在心上的片刻</h2><p className="g-ui-intro">收藏会留在这个浏览器，也可以随布展配置一起导出。</p>{favorites.length ? <div className="g-ui-collections">{favorites.map(item => <div key={item.key}><button type="button" onClick={() => { if (item.panel === 'archive') setArchiveId(item.id); if (item.panel === 'voice') { const voice = character.voices.find(x => x.id === item.id); if (voice) void player.play(voice); } show(item.panel); }}><small>{item.kind}</small><span>{item.title} ↗</span></button><FavoriteButton active onClick={() => toggleFavorite(item.key)} /></div>)}</div> : <EmptyState>还没有收藏。读一篇档案，或留下一段喜欢的声音。</EmptyState>}</>}
      {panel === 'settings' && <>
        <p className="g-ui-eyebrow">随心而行</p><h2>展馆设置</h2>
        <div className="settings-row"><div><h3>角色声音</h3><p>语音播放时的声音开关</p></div><button type="button" aria-pressed={!player.muted} onClick={player.toggleMute}>{player.muted ? '声音已关闭' : '声音已开启'}</button></div>
        <div className="settings-row"><div><h3>全馆视角</h3><p>回到最初的观看位置</p></div><button type="button" onClick={() => { close(); onResetView?.(); }}>重置视角</button></div>
        <div className="settings-row"><div><h3>操作提示</h3><p>点地面移动 · 走近家具后按 E 或点击签牌</p></div><button type="button" onClick={() => { close(); onShowHelp?.(); }}>显示提示</button></div>
        <section className="g-ui-reading"><h3>展厅导览</h3><p>选择一处展品，让黍带你走过去。</p>
          <nav className="exhibit-map" aria-label="展厅导览">{exhibition.furniture.map(item => <button type="button" key={item.id} onClick={() => travelTo(item.id)}>{item.label}<span aria-hidden="true">↗</span></button>)}</nav>
        </section>
        <p className="g-ui-note settings-credit">非官方同人展示 · 角色及原始素材版权归原权利人。<br />收藏、已读与布展保存在此浏览器，可在「布置展厅」中导出。</p>
      </>}
      {warning && <p className="g-ui-error" role="alert">{warning}</p>}{notice && <p className="g-ui-note" role="status">{notice}</p>}
      </div>
      {panel !== 'voice' && <footer className="g-ui-panel-footer"><span>岁时有序，山川有信。</span><small>黍 · 私人展馆</small></footer>}
    </aside>}
  </div>;
}
function ArtworkImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? <EmptyState>图片暂时无法加载 · {title}</EmptyState> : <img src={src} alt={title} onError={() => setFailed(true)} />;
}
