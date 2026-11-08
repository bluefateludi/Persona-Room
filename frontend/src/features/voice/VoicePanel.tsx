import { useState } from 'react';
import type { CharacterContent, VoiceEntry } from '../../../../shared/src/contracts';
import { EmptyState, FavoriteButton, SourceLink } from '../../components/GalleryPrimitives';
import { favoriteKey } from '../../state/galleryStorage';
import type { useVoicePlayer } from './useVoicePlayer';
export type VoicePlayer = ReturnType<typeof useVoicePlayer>;
const statusText = { idle: '选择一段声音', loading: '正在加载语音…', playing: '正在聆听', paused: '已暂停', ended: '余音渐息', missing: '暂缺语音，可阅读台词', error: '语音暂时无法播放，可点击重试或阅读台词。' };
export function VoicePanel({ character, voices, player, favorites, onFavorite }: { character: CharacterContent; voices: VoiceEntry[]; player: VoicePlayer; favorites: string[]; onFavorite: (id: string) => void }) {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const active = player.entry ?? voices[0];
  const portrait = character.artworks[0]?.imageUrl;
  return <div className="voice-dialogue">
    <div className="voice-portrait" aria-hidden="true">{portrait && !portraitFailed ? <img src={portrait} alt="" onError={() => setPortraitFailed(true)} /> : <span>{character.name}</span>}</div>
    <div className="voice-conversation">
      <div className="voice-speaker"><h2>{character.name}</h2><span>{active?.title ?? '片刻相逢'}</span><small>{active?.language}</small></div>
      {active ? <p className="voice-subtitle">{active.text || '此条语音暂无字幕。'}</p> : <EmptyState>暂未收录语音与台词。</EmptyState>}
      {voices.length > 1 && <label className="voice-picker">换一段声音<select aria-label="切换语音" value={active?.id ?? ''} onChange={event => { const voice = voices.find(item => item.id === event.target.value); if (voice) void player.play(voice); }}>{voices.map(voice => <option key={voice.id} value={voice.id}>{voice.title}</option>)}</select></label>}
      <div className="voice-controls">
        <span className={`voice-status ${player.status}`} role="status"><i aria-hidden="true" />{statusText[player.status]}</span>
        {active?.audioUrl && <button type="button" disabled={player.status === 'loading'} onClick={() => ['playing', 'paused'].includes(player.status) ? void player.togglePause() : void player.play(active)}>{player.status === 'playing' ? '暂停' : player.status === 'paused' ? '继续播放' : player.status === 'error' ? '重试播放' : '重新播放'}</button>}
        <button type="button" aria-pressed={player.muted} onClick={player.toggleMute}>{player.muted ? '取消静音' : '静音'}</button>
        {active && <FavoriteButton active={favorites.includes(favoriteKey('voice', active.id))} onClick={() => onFavorite(favoriteKey('voice', active.id))} />}
      </div>
      <SourceLink source={active?.source} />
    </div>
  </div>;
}
