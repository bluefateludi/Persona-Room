import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { emptySave, parseSave, safeExternalUrl } from '../../state/galleryStorage.ts';
import { character, exhibition } from './fixture.ts';

test('roundtrip restores collections, chapters and furniture without sharing arrays', () => {
  const save = { ...emptySave(character, exhibition), favorites: ['archive:one', 'voice:missing'], readArchiveIds: ['one'], furnitureOverrides: { 'archive-desk': { position: [-1, 0, 1], rotation: [0, Math.PI / 4, 0] } } };
  assert.deepEqual(parseSave(JSON.stringify(save), character, exhibition), save);
});
test('rejects invalid configuration before changing existing state', () => {
  const valid = emptySave(character, exhibition);
  for (const invalid of [null, [], { ...valid, schemaVersion: 2 }, { ...valid, characterId: 'other' }, { ...valid, favorites: ['archive:unknown'] }, { ...valid, readArchiveIds: [4] }, { ...valid, furnitureOverrides: { ghost: { position: [0, 0, 0], rotation: [0, 0, 0] } } }, { ...valid, furnitureOverrides: { 'archive-desk': { position: [1e100, 0, 0], rotation: [0, 0, 0] } } }, { ...valid, furnitureOverrides: { 'archive-desk': { position: [0, null, 0], rotation: [0, 0, 0] } } }]) assert.throws(() => parseSave(JSON.stringify(invalid), character, exhibition));
  assert.throws(() => parseSave('{broken', character, exhibition));
  assert.throws(() => parseSave(' '.repeat(256 * 1024 + 1), character, exhibition));
  assert.throws(() => parseSave(JSON.stringify(valid).replace('"furnitureOverrides":{}', '"furnitureOverrides":{"__proto__":{"position":[0,0,0],"rotation":[0,0,0]}}'), character, exhibition));
  assert.deepEqual(valid, emptySave(character, exhibition));
});
test('external links only accept http(s)', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), undefined);
  assert.equal(safeExternalUrl('data:text/html,x'), undefined);
  assert.equal(safeExternalUrl('https://terra-library.pages.dev/'), 'https://terra-library.pages.dev/');
});
