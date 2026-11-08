import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryUIProps, FurnitureOverrides } from '../../../shared/src/contracts';
import { EmptyState, FavoriteButton } from '../components/GalleryPrimitives';
import { favoriteKey, parseSave, readSave, writeSave } from '../state/galleryStorage';
import { ArchivePanel } from './archive/ArchivePanel';
import { EditorPanel } from './editor/EditorPanel';
import { VoicePanel } from './voice/VoicePanel';
import { useVoicePlayer } from './voice/useVoicePlayer';
import './GalleryUI.css';

type Panel = 'intro' | 'archive' | 'voice' | 'art' | 'collection' | 'editor';
const navigation: [Panel, string][] = [['intro', '展品'], ['archive', '档案'], ['voice', '语音'], ['collection', '收藏'], ['editor', '布展']];
export function GalleryUI(props: GalleryUIProps) {
  return <GalleryUISession key={`${props.character.id}:${props.exhibition.id}`} {...props} />;
}
function GalleryUISession({ character, exhibition, selection, furnitureOverrides, onSelect, onLayoutChange }: GalleryUIProps) {
  const [initial] = useState(() => readSave(character, exhibition));
  const [save, setSave] = useState(initial.save);
  const [warning, setWarning] = useState(initial.warning);
  const [notice, setNotice] = useState('');
  const [panel, setPanel] = useState<Panel>('intro');
  const [open, setOpen] = useState(false);
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
  const show = useCallback((target: Panel) => { opener.current = document.activeElement as HTMLElement; setPanel(target); setOpen(true); }, []);
  const close = useCallback(() => { setOpen(false); onSelect(null); opener.current?.focus(); }, [onSelect]);
  const previousSelection = useRef<typeof selection>(null);
  useEffect(() => {
    if (selection === previousSelection.current) return;
    previousSelection.current = selection;
    if (!selection) return;
    const furniture = exhibition.furniture.find(x => x.id === selection.id && x.kind === selection.kind);
    if (!furniture) return;
    if (selection.kind === 'archive') setArchiveId(furniture.contentId);
    if (selection.kind === 'companion') {
      const voice = character.voices.find(x => x.id === furniture.contentId) ?? character.voices.find(x => x.audioUrl) ?? character.voices[0];
      if (voice) void player.play(voice);
      show('voice');
    } else show(selection.kind === 'model' ? 'intro' : selection.kind === 'archive' ? 'archive' : selection.kind === 'voice' ? 'voice' : 'art');
  }, [selection, exhibition.furniture, character.voices, player.play, show]);
  useEffect(() => { if (open) panelRef.current?.focus(); }, [open, panel]);
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open, close]);
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
    <div className="g-ui-brand"><span className="g-ui-seal" aria-hidden="true">{character.name.slice(0, 1)}</span><div><p>ARKNIGHTS · PERSONAL GALLERY</p><h1>{exhibition.title}</h1></div></div>
    <nav className="g-ui-navigation" aria-label="展馆面板">{navigation.map(([id, label]) => <button type="button" key={id} aria-pressed={open && panel === id} onClick={() => show(id)}>{label}{id === 'collection' && save.favorites.length > 0 && <small>{save.favorites.length}</small>}</button>)}</nav>
    {!open && <button type="button" className="g-ui-story-trigger" onClick={() => show('archive')}><small>MEET {character.name}</small><span>了解她的故事 <b>↗</b></span></button>}
    {open && <aside ref={panelRef} tabIndex={-1} className="g-ui-panel" aria-label={`${navigation.find(x => x[0] === panel)?.[1] ?? '画廊'}面板`}><div className="g-ui-panel-top"><span>{character.name} / 私人展馆</span><button type="button" onClick={close} aria-label="关闭面板">✕</button></div><div className="g-ui-panel-content">
      {panel === 'intro' && <><p className="g-ui-eyebrow">THE EXHIBIT / 数字藏品</p><h2>{character.name}<span className="g-ui-subtitle">一方展厅，一段相逢</span></h2><p className="g-ui-intro">{character.intro}</p><p className="g-ui-note">点击展台检视手办，使用场景中的操作提示调整视角。</p><div className="g-ui-actions"><button type="button" className="g-ui-primary" onClick={() => show('archive')}>了解她的故事 ↗</button>{modelKey && <FavoriteButton active={save.favorites.includes(modelKey)} onClick={() => toggleFavorite(modelKey)} />}</div><div className="g-ui-reading"><h3>你的参观足迹</h3><p>已阅读 {save.readArchiveIds.length} / {character.archives.length} 篇档案 · 已收藏 {save.favorites.length} 项</p><p className="g-ui-note">参观记录保存在此浏览器中。</p></div></>}
      {panel === 'archive' && <ArchivePanel key={archiveId ?? 'default'} initialId={archiveId} character={character} favorites={save.favorites} readIds={save.readArchiveIds} onFavorite={toggleFavorite} onRead={markRead} />}
      {panel === 'voice' && <VoicePanel voices={character.voices} player={player} favorites={save.favorites} onFavorite={toggleFavorite} />}
      {panel === 'editor' && <EditorPanel exhibition={exhibition} overrides={furnitureOverrides} onChange={changeLayout} onExport={exportConfig} onImport={importConfig} />}
      {panel === 'art' && <><p className="g-ui-eyebrow">ARTWORK / 画廊</p><h2>纸上相逢</h2>{character.artworks.length ? character.artworks.map(art => <figure className="g-ui-art" key={art.id}><ArtworkImage src={art.imageUrl} title={art.title} /><figcaption><h3>{art.title}</h3><p>{art.description}</p><FavoriteButton active={save.favorites.includes(favoriteKey('art', art.id))} onClick={() => toggleFavorite(favoriteKey('art', art.id))} /></figcaption></figure>) : <EmptyState>当前暂无可展示的图片。</EmptyState>}</>}
      {panel === 'collection' && <><p className="g-ui-eyebrow">KEEPSAKES / 我的收藏</p><h2>留在心上的片刻</h2><p className="g-ui-intro">收藏会留在这个浏览器，也可以随布展配置一起导出。</p>{favorites.length ? <div className="g-ui-collections">{favorites.map(item => <div key={item.key}><button type="button" onClick={() => { if (item.panel === 'archive') setArchiveId(item.id); if (item.panel === 'voice') { const voice = character.voices.find(x => x.id === item.id); if (voice) void player.play(voice); } show(item.panel); }}><small>{item.kind}</small><span>{item.title} ↗</span></button><FavoriteButton active onClick={() => toggleFavorite(item.key)} /></div>)}</div> : <EmptyState>还没有收藏。读一篇档案，或留下一段喜欢的声音。</EmptyState>}</>}
      {warning && <p className="g-ui-error" role="alert">{warning}</p>}{notice && <p className="g-ui-note" role="status">{notice}</p>}
    </div><footer className="g-ui-panel-footer">岁时有序，山川有信 <span>— {character.name}的展馆</span></footer></aside>}
    {player.entry && (!open || panel !== 'voice') && <div className="g-ui-mini-player"><button type="button" onClick={() => show('voice')}>{player.entry.title}<span>{player.entry.text || '暂无字幕'}</span></button>{['playing', 'paused'].includes(player.status) && <button type="button" onClick={() => void player.togglePause()}>{player.status === 'playing' ? '暂停' : '继续'}</button>}<button type="button" aria-pressed={player.muted} onClick={player.toggleMute}>{player.muted ? '取消静音' : '静音'}</button></div>}
  </div>;
}
function ArtworkImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? <EmptyState>图片暂时无法加载 · {title}</EmptyState> : <img src={src} alt={title} onError={() => setFailed(true)} />;
}
