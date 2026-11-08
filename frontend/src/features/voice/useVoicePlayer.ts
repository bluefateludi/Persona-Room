import { useCallback, useEffect, useRef, useState } from 'react';
import type { VoiceEntry } from '../../../../shared/src/contracts';

export type VoiceStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'missing' | 'error';
export function useVoicePlayer() {
  const player = useRef<HTMLAudioElement | null>(null);
  const request = useRef(0);
  const mutedRef = useRef(false);
  const [entry, setEntry] = useState<VoiceEntry | null>(null);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [muted, setMuted] = useState(false);
  const stop = useCallback(() => {
    request.current++;
    const audio = player.current;
    if (audio) { audio.pause(); audio.onended = null; audio.onerror = null; audio.onplaying = null; audio.removeAttribute('src'); audio.load(); }
    player.current = null;
  }, []);
  useEffect(() => stop, [stop]);
  const play = useCallback(async (voice: VoiceEntry) => {
    stop();
    setEntry(voice);
    if (!voice.audioUrl) { setStatus('missing'); return; }
    const ticket = request.current;
    const audio = new Audio(voice.audioUrl);
    player.current = audio;
    audio.muted = mutedRef.current;
    setStatus('loading');
    audio.onended = () => { if (ticket === request.current) setStatus('ended'); };
    audio.onerror = () => { if (ticket === request.current) setStatus('error'); };
    audio.onplaying = () => { if (ticket === request.current) setStatus('playing'); };
    try { await audio.play(); } catch { if (ticket === request.current) setStatus('error'); }
  }, [stop]);
  const togglePause = useCallback(async () => {
    const audio = player.current;
    if (!audio) return;
    if (!audio.paused) { audio.pause(); setStatus('paused'); }
    else { const ticket = request.current; try { await audio.play(); } catch { if (ticket === request.current) setStatus('error'); } }
  }, []);
  const pause = useCallback(() => {
    const audio = player.current;
    if (audio && !audio.paused) { audio.pause(); setStatus('paused'); }
  }, []);
  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    if (player.current) player.current.muted = mutedRef.current;
  }, []);
  return { entry, status, muted, play, pause, togglePause, toggleMute };
}
