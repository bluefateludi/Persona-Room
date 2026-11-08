import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
 'shu-figurine.glb', 'shu-figurine-concept.png', 'shu-reference.png',
 'spine/build_char_2025_shu.skel', 'spine/build_char_2025_shu.atlas', 'spine/build_char_2025_shu.png',
 'voice/CN_001.wav',
];
export const publicFiles = files.map(name => `assets/shu/${name}`);
export async function prepareAssets() {
 const entries = [...publicFiles, 'characters/shu.json', 'exhibitions/shu.json'];
 const output = path.join(root, 'frontend/public/content');
 const allowed = new Set(entries);
 async function audit(dir, relative = '') {
  let items; try { items = await fs.readdir(dir, { withFileTypes: true }); } catch(error) { if(error.code === 'ENOENT') return; throw error; }
  for(const item of items) {
   const rel = relative + item.name;
   if(item.isSymbolicLink()) throw new Error(`Public symlink rejected: ${rel}`);
   if(item.isDirectory()) await audit(path.join(dir,item.name), rel+'/');
   else if(!allowed.has(rel)) throw new Error(`Unexpected public file; remove or review before publishing: ${rel}`);
  }
 }
 await audit(output);
 // Validate every source before writing, and use an explicit whitelist. No recursive source copy.
 for (const file of entries) await fs.access(path.join(root, file.startsWith('assets/') ? file : `content/${file}`));
 for (const file of entries) {
  const src = path.join(root, file.startsWith('assets/') ? file : `content/${file}`);
  const dest = path.join(root, 'frontend/public/content', file);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
 }
 console.log(`Prepared ${entries.length} whitelisted files. Internal generation records excluded.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareAssets();

