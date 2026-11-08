import { useEffect, useState } from 'react';
import type { CharacterContent } from '../../../../shared/src/contracts';
import { EmptyState, FavoriteButton, SourceLink } from '../../components/GalleryPrimitives';
import { favoriteKey, safeExternalUrl } from '../../state/galleryStorage';
export function ArchivePanel({ character, favorites, readIds, onFavorite, onRead, initialId }: {
  character: CharacterContent; favorites: string[]; readIds: string[];
  onFavorite: (id: string) => void; onRead: (id: string) => void; initialId?: string;
}) {
  const [activeId, setActiveId] = useState(initialId ?? character.archives[0]?.id ?? '');
  const active = character.archives.find(item => item.id === activeId) ?? character.archives[0];
  const index = character.archives.findIndex(item => item.id === active?.id);
  useEffect(() => { if (active) onRead(active.id); }, [active?.id, onRead]);
  const storyUrl = safeExternalUrl(character.story.url);
  return <div className="archive-book">
    <div className="archive-index"><p className="g-ui-eyebrow">岁月拾遗 · 人物卷</p><h2>{character.name}的故事</h2><p className="archive-preface">在字里行间，<br />认识与你同行的她。</p>
      <nav className="g-ui-chapters" aria-label="选择档案章节">{character.archives.map((archive, i) => <button type="button" key={archive.id} aria-pressed={archive.id === active?.id} onClick={() => setActiveId(archive.id)}>
        <span className="g-ui-number">{String(i + 1).padStart(2, '0')}</span><span>{archive.title}</span><small>{readIds.includes(archive.id) ? '已读' : '未读'}</small>
      </button>)}</nav>
      <p className="archive-imprint">百谷长青<small>SHU · PERSONAL ARCHIVE</small></p>
    </div>
    <div className="archive-leaf">
      {active ? <article className="archive-text" key={active.id}>
        <div className="g-ui-row"><span className="archive-page-number">卷 {String(index + 1).padStart(2, '0')}</span><FavoriteButton active={favorites.includes(favoriteKey('archive', active.id))} onClick={() => onFavorite(favoriteKey('archive', active.id))} /></div>
        <h3>{active.title}</h3><p className="g-ui-prose">{active.text}</p><SourceLink source={active.source} />
      </article> : <EmptyState>精选档案尚未收录，可前往文库继续了解。</EmptyState>}
      <div className="archive-continue"><span>故事仍在继续</span>{storyUrl ? <a href={storyUrl} target="_blank" rel="noopener noreferrer">{character.story.label || '前往文库阅读'} ↗</a> : <p>文库链接暂不可用。</p>}
        <small>{character.story.directLinkVerified ? '在新标签页打开，展馆为你保留。' : `在文库首页搜索「${character.story.searchHint || character.name}」，阅读完整故事。`}</small>
      </div>
    </div>
  </div>;
}
