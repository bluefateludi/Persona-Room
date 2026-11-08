import { ALPHA_MODES, Application, BaseTexture } from 'pixi.js';
import { TextureAtlas } from '@pixi-spine/base';
import { AtlasAttachmentLoader, SkeletonBinary, Spine } from '@pixi-spine/runtime-3.8';
import type { SpineAsset } from '../../../shared/src/contracts';

/** Owns every GPU/DOM resource; callers must dispose on unmount or source change. */
export async function mountSpineActor(host: HTMLElement, source: SpineAsset, signal: AbortSignal) {
  const base = import.meta.env.BASE_URL ?? '/';
  const url = (path: string) => path.startsWith('/content/') ? `${base.replace(/\/$/, '')}${path}` : path;
  const read = async (path: string) => {
    const result = await fetch(url(path), { signal });
    if (!result.ok) throw new Error(`素材加载失败 (${result.status})`);
    return result;
  };
  const [skeleton, atlasText, blob] = await Promise.all([
    read(source.skeletonUrl).then(r => r.arrayBuffer()),
    read(source.atlasUrl).then(r => r.text()),
    read(source.textureUrl).then(r => r.blob()),
  ]);
  signal.throwIfAborted();
  const imageUrl = URL.createObjectURL(blob);
  let app: Application | undefined;
  let texture: BaseTexture | undefined;
  let observer: ResizeObserver | undefined;
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    app?.destroy(true, { children: true, texture: false, baseTexture: false });
    texture?.destroy();
    URL.revokeObjectURL(imageUrl);
  };
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    signal.throwIfAborted();
    texture = BaseTexture.from(image, { alphaMode: source.premultipliedAlpha ? ALPHA_MODES.PMA : ALPHA_MODES.UNPACK });
    const atlas = new TextureAtlas(atlasText, (_name, callback) => callback(texture!));
    if (atlas.pages.length !== 1) throw new Error('当前内容包只支持单页 Spine 图集');
    const data = new SkeletonBinary(new AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(skeleton));
    const animations = data.animations.map(animation => animation.name);
    if (!animations.includes(source.animations.idle)) throw new Error('配置的待机动画不存在');
    if (source.animations.interact && !animations.includes(source.animations.interact)) throw new Error('配置的互动动画不存在');
    app = new Application({ backgroundAlpha: 0, antialias: true, autoDensity: true, resolution: Math.min(devicePixelRatio, 2) });
    const actor = new Spine(data);
    actor.autoUpdate = false;
    actor.skeleton.setToSetupPose();
    actor.state.setAnimation(0, source.animations.idle, true);
    actor.update(0);
    const bounds = actor.getLocalBounds();
    app.stage.addChild(actor);
    const fit = () => {
      if (disposed || !app) return;
      const width = Math.max(host.clientWidth, 160);
      const height = Math.max(host.clientHeight, 200);
      app.renderer.resize(width, height);
      const scale = Math.min(width * 0.9 / bounds.width, height * 0.88 / bounds.height);
      actor.scale.set(scale);
      actor.position.set(width / 2 - (bounds.x + bounds.width / 2) * scale, height * 0.94 - (bounds.y + bounds.height) * scale);
    };
    fit();
    observer = new ResizeObserver(fit);
    observer.observe(host);
    app.ticker.add(() => {
      if (!document.hidden) actor.update(Math.min(app!.ticker.deltaMS / 1000, 0.1));
    });
    const canvas = app.view as HTMLCanvasElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.display = 'block';
    host.appendChild(canvas);
    return {
      animations,
      version: data.version,
      interact() {
        if (disposed) return;
        const name = source.animations.interact;
        if (name) {
          actor.state.setAnimation(0, name, false);
          actor.state.addAnimation(0, source.animations.idle, true, 0);
        }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}


