import { useEffect, useState } from 'react';
import type { CharacterContent } from '../../../../shared/src/contracts';
import { EmptyState, FavoriteButton, SourceLink } from '../../components/GalleryPrimitives';
import { favoriteKey, safeExternalUrl } from '../../state/galleryStorage';

export function ArchivePanel({ character, favorites, readIds, onFavorite, onRead, initialId }: {
  character: CharacterContent; favorites: string[]; readIds: string[];
  onFavorite: (id: string) => void; onRead: (id: string) => void; initialId?: string;
}) {
  const [activeId, setActiveId] = useState(initialId ?? character.archives[0]?.id ?? '');
  const active = character.archives.find(x => x.id === activeId) ?? character.archives[0];
  useEffect(() => { if (active) onRead(active.id); }, [active?.id, onRead]);
  const storyUrl = safeExternalUrl(character.story.url);
  return <>
    <p className="g-ui-eyebrow">STORIES / 精选档案</p>
    <h2>了解她的故事</h2><p className="g-ui-intro">{character.intro}</p>
    <div className="g-ui-chapters" aria-label="选择档案章节">
      {character.archives.map((archive, index) => <button type="button" key={archive.id} aria-pressed={archive.id === active?.id} onClick={() => setActiveId(archive.id)}>
        <span className="g-ui-number">{String(index + 1).padStart(2, '0')}</span><span>{archive.title}</span><small>{readIds.includes(archive.id) ? '已读' : '未读'}</small>
      </button>)}
    </div>
    {active ? <article className="g-ui-paper"><div className="g-ui-row"><h3>{active.title}</h3><FavoriteButton active={favorites.includes(favoriteKey('archive', active.id))} onClick={() => onFavorite(favoriteKey('archive', active.id))} /></div><p className="g-ui-prose">{active.text}</p><SourceLink source={active.source} /></article> : <EmptyState>精选档案尚未收录，可前往文库继续了解。</EmptyState>}
    <div className="g-ui-reading"><span className="g-ui-eyebrow">THE STORY CONTINUES</span><h3>把故事读下去</h3>
      {storyUrl ? <a className="g-ui-primary" href={storyUrl} target="_blank" rel="noopener noreferrer">{character.story.label || '前往文库阅读'} ↗</a> : <p>文库链接暂不可用。</p>}
      <p>{character.story.directLinkVerified ? '在新标签页打开，展馆为你保留。' : `将在新标签页打开文库首页，请搜索「${character.story.searchHint || character.name}」。`}</p>
    </div>
  </>;
}
