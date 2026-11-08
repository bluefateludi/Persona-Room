import type { ReactNode } from 'react';
import type { SourceRef } from '../../../shared/src/contracts';
import { safeExternalUrl } from '../state/galleryStorage';

export function SourceLink({ source }: { source?: SourceRef }) {
  if (!source) return null;
  const href = safeExternalUrl(source.url);
  return <p className="g-ui-source">来源 · {href ? <a href={href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a> : source.label}</p>;
}
export function FavoriteButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return <button className="g-ui-favorite" type="button" aria-pressed={active} onClick={onClick}>{active ? '◆ 已收藏' : '◇ 收藏'}</button>;
}
export function EmptyState({ children }: { children: ReactNode }) { return <p className="g-ui-empty">{children}</p>; }
