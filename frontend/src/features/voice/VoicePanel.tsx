import type { VoiceEntry } from '../../../../shared/src/contracts';
import { EmptyState, FavoriteButton, SourceLink } from '../../components/GalleryPrimitives';
import { favoriteKey } from '../../state/galleryStorage';
import type { useVoicePlayer } from './useVoicePlayer';
export type VoicePlayer = ReturnType<typeof useVoicePlayer>;
const statusText = { idle: '选择一段声音', loading: '正在加载语音…', playing: '正在播放', paused: '已暂停', ended: '播放结束', missing: '暂缺语音 · 可阅读台词', error: '语音暂时无法播放，请重试或阅读台词。' };
export function VoicePanel({ voices, player, favorites, onFavorite }: { voices: VoiceEntry[]; player: VoicePlayer; favorites: string[]; onFavorite: (id: string) => void }) {
  return <><p className="g-ui-eyebrow">VOICES / 留声处</p><h2>听见她的声音</h2><p className="g-ui-intro">一段声音，一次相遇。切换条目会停止上一段语音。</p>
    {voices.length === 0 && <EmptyState>暂未收录语音与台词。</EmptyState>}
    <div className="g-ui-voices">{voices.map((voice, i) => <div key={voice.id} className="g-ui-voice-row" data-active={player.entry?.id === voice.id}>
      <button type="button" aria-pressed={player.entry?.id === voice.id} onClick={() => void player.play(voice)}><span className="g-ui-number">{String(i + 1).padStart(2, '0')}</span><span>{voice.title}<small>{voice.language} · {voice.audioUrl ? '试听语音' : '暂缺语音'}</small></span><span aria-hidden="true">{voice.audioUrl ? '▷' : '—'}</span></button>
      <FavoriteButton active={favorites.includes(favoriteKey('voice', voice.id))} onClick={() => onFavorite(favoriteKey('voice', voice.id))} />
    </div>)}</div>
    <p className="g-ui-play-status" role="status">{statusText[player.status]}</p>
    {player.entry && <div className="g-ui-paper"><h3>{player.entry.title}</h3><p className="g-ui-prose">{player.entry.text || '此条语音暂无字幕。'}</p><SourceLink source={player.entry.source} />
      <div className="g-ui-actions">{player.entry.audioUrl && <button type="button" onClick={() => player.status === 'error' || player.status === 'ended' ? void player.play(player.entry!) : void player.togglePause()} disabled={player.status === 'loading'}>{player.status === 'playing' ? '暂停' : player.status === 'paused' ? '继续播放' : '重新播放'}</button>}<button type="button" aria-pressed={player.muted} onClick={player.toggleMute}>{player.muted ? '取消静音' : '静音'}</button></div>
    </div>}
  </>;
}
