import { useEffect, useRef, useState } from 'react';
import type { SpineActorProps } from '../../../shared/src/contracts';
import { mountSpineActor } from './SpineActor.runtime';

export function SpineActor({ source, onInteract, className }: SpineActorProps) {
  const host = useRef<HTMLDivElement>(null);
  const playback = useRef<Awaited<ReturnType<typeof mountSpineActor>> | null>(null);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setState('loading');
    mountSpineActor(host.current!, source, abort.signal).then(player => {
      if (abort.signal.aborted) { player.dispose(); return; }
      playback.current = player;
      setState('ready');
    }).catch(error => {
      if (!abort.signal.aborted) setState(error instanceof Error ? error.message : '小人加载失败');
    });
    return () => { abort.abort(); playback.current?.dispose(); playback.current = null; };
  }, [source, attempt]);
  return <div className={className} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 240 }}>
    <div ref={host} style={{ position: 'absolute', inset: 0 }} />
    <button type="button" aria-label="与黍互动" disabled={state !== 'ready'}
      onClick={() => { playback.current?.interact(); onInteract?.(); }}
      style={{ position: 'absolute', inset: 0, background: 'transparent', border: 0, cursor: state === 'ready' ? 'pointer' : 'default', color: 'inherit' }}>
      {state === 'loading' ? '正在加载动态小人…' : state === 'ready' ? <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>点击与黍互动</span> : null}
    </button>
    {state !== 'ready' && state !== 'loading' && <div role="status" style={{ position: 'relative', padding: 16 }}>
      <p>动态小人暂不可用：{state}</p><button type="button" onClick={() => setAttempt(n => n + 1)}>重试加载</button>
    </div>}
  </div>;
}
