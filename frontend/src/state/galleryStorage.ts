import type { CharacterContent, ExhibitionContent, FurnitureOverrides, Vec3 } from '../../../shared/src/contracts';

export interface GallerySave {
  schemaVersion: 1;
  characterId: string;
  exhibitionId: string;
  favorites: string[];
  readArchiveIds: string[];
  furnitureOverrides: FurnitureOverrides;
}
export const MAX_IMPORT_BYTES = 256 * 1024;
export const favoriteKey = (kind: 'archive' | 'voice' | 'model' | 'art', id: string) => `${kind}:${id}`;
export const storageKey = (character: CharacterContent, exhibition: ExhibitionContent) =>
  `ark-gallery:v1:${encodeURIComponent(character.id)}:${encodeURIComponent(exhibition.id)}`;
export function emptySave(character: CharacterContent, exhibition: ExhibitionContent): GallerySave {
  return { schemaVersion: 1, characterId: character.id, exhibitionId: exhibition.id, favorites: [], readArchiveIds: [], furnitureOverrides: {} };
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function vector(value: unknown, limit: number): value is Vec3 {
  return Array.isArray(value) && value.length === 3 && value.every(n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= limit);
}
export function parseSave(raw: string, character: CharacterContent, exhibition: ExhibitionContent): GallerySave {
  if (new TextEncoder().encode(raw).length > MAX_IMPORT_BYTES) throw new Error('配置文件过大，请选择小于 256 KB 的展馆存档。');
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new Error('不是有效的 JSON 文件，原有布置已保留。'); }
  if (!record(data) || data.schemaVersion !== 1) throw new Error('不支持此存档版本。');
  if (data.characterId !== character.id || data.exhibitionId !== exhibition.id) throw new Error('此存档属于其他角色或展厅，未导入。');
  const allowed = new Set([
    ...character.archives.map(x => favoriteKey('archive', x.id)),
    ...character.voices.map(x => favoriteKey('voice', x.id)),
    ...character.artworks.map(x => favoriteKey('art', x.id)),
    ...exhibition.furniture.filter(x => x.kind === 'model').map(x => favoriteKey('model', x.id)),
  ]);
  const readIds = new Set(character.archives.map(x => x.id));
  const ids = (value: unknown, valid: Set<string>): string[] => {
    if (!Array.isArray(value) || value.length > 2000 || value.some(id => typeof id !== 'string' || !valid.has(id))) throw new Error('存档包含未知的收藏或档案条目。');
    return [...new Set(value)] as string[];
  };
  if (!record(data.furnitureOverrides)) throw new Error('存档缺少有效的家具布置。');
  const furnitureIds = new Set(exhibition.furniture.map(x => x.id));
  const overrides: FurnitureOverrides = {};
  for (const [id, item] of Object.entries(data.furnitureOverrides)) {
    if (['__proto__', 'constructor', 'prototype'].includes(id) || !furnitureIds.has(id) || !record(item) || !vector(item.position, 50) || !vector(item.rotation, Math.PI * 8)) throw new Error('家具位置或朝向无效；位置须在 ±50、朝向须在 ±8π 范围内。');
    overrides[id] = { position: [...item.position], rotation: [...item.rotation] };
  }
  return { schemaVersion: 1, characterId: character.id, exhibitionId: exhibition.id, favorites: ids(data.favorites, allowed), readArchiveIds: ids(data.readArchiveIds, readIds), furnitureOverrides: overrides };
}
export function readSave(character: CharacterContent, exhibition: ExhibitionContent): { save: GallerySave; warning: string } {
  try {
    const raw = window.localStorage.getItem(storageKey(character, exhibition));
    return { save: raw ? parseSave(raw, character, exhibition) : emptySave(character, exhibition), warning: '' };
  } catch { return { save: emptySave(character, exhibition), warning: '本地存档不可用或与当前内容不兼容。当前可继续参观，建议导出备份。' }; }
}
export function writeSave(save: GallerySave, character: CharacterContent, exhibition: ExhibitionContent): string {
  try { window.localStorage.setItem(storageKey(character, exhibition), JSON.stringify(save)); return ''; }
  catch { return '浏览器未允许保存。当前修改仍在本次参观中保留，请导出备份。'; }
}
export function safeExternalUrl(value: string): string | undefined {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
