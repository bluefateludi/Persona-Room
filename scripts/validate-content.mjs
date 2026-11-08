import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles } from './prepare-assets.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async name=>JSON.parse(await fs.readFile(path.join(root,'content',name),'utf8'));
const c=await read('characters/shu.json');const e=await read('exhibitions/shu.json');
const string=(v,label)=>assert.equal(typeof v,'string',label);
const vector=v=>assert(Array.isArray(v)&&v.length===3&&v.every(Number.isFinite),'invalid Vec3');
const ids=entries=>{const seen=new Set();for(const item of entries){string(item.id,'id');assert(!seen.has(item.id),'duplicate ID');seen.add(item.id);}};
const refs=[];
const asset=p=>{assert(typeof p==='string'&&p.startsWith('/content/'),'asset URL must be deployment-relative');assert(!p.includes('..'),'path traversal');assert(publicFiles.includes(p.slice('/content/'.length)),`not whitelisted: ${p}`);refs.push(p);};
assert.equal(c.schemaVersion,1);assert.equal(e.schemaVersion,1);assert.equal(e.characterId,c.id);string(c.name,'name');string(c.intro,'intro');
asset(c.model.url);asset(c.model.posterUrl);assert(c.model.targetHeight>0);vector(c.model.rotation);
if(c.spine){assert.equal(c.spine.version,'3.8');assert.equal(typeof c.spine.verified,'boolean');assert.equal(typeof c.spine.premultipliedAlpha,'boolean');asset(c.spine.skeletonUrl);asset(c.spine.atlasUrl);asset(c.spine.textureUrl);string(c.spine.animations.idle,'idle');}
for(const group of [c.archives,c.voices,c.artworks,e.furniture])ids(group);
for(const a of c.archives){string(a.title,'archive title');string(a.text,'archive text');assert(new URL(a.source.url).protocol==='https:');}
for(const v of c.voices){string(v.text,'subtitle');string(v.language,'voice language');if(v.audioUrl!==null)asset(v.audioUrl);}
for(const a of c.artworks)asset(a.imageUrl);
assert(new URL(c.story.url).protocol==='https:');assert.equal(typeof c.story.directLinkVerified,'boolean');string(c.story.searchHint,'search hint');
const expected=new Map([['shu-figure','model'],['shu-companion','companion'],['archive-desk','archive'],['voice-station','voice'],['art-frame','art']]);
for(const f of e.furniture){assert.equal(f.kind,expected.get(f.id));expected.delete(f.id);vector(f.position);vector(f.rotation);vector(f.scale);assert(f.scale.every(x=>x>0));if(f.modelUrl)asset(f.modelUrl);const group=f.kind==='archive'?c.archives:f.kind==='voice'?c.voices:f.kind==='art'?c.artworks:[{id:c.id}];if(f.contentId)assert(group.some(item=>item.id===f.contentId),'invalid furniture content reference');}assert.equal(expected.size,0);
const published=path.join(root,'frontend/public/content');
for(const url of refs)await fs.access(path.join(published,url.slice('/content/'.length)));
const allowed=new Set([...publicFiles,'characters/shu.json','exhibitions/shu.json']);
async function audit(dir,relative=''){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const rel=relative+entry.name;assert(!entry.isSymbolicLink(),'public symlink rejected');if(entry.isDirectory())await audit(path.join(dir,entry.name),rel+'/');else assert(allowed.has(rel),`unexpected public file: ${rel}`);}}
await audit(published);
for(const file of publicFiles.filter(file=>file.endsWith('.glb'))) {
const b=await fs.readFile(path.join(root,file));assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert(gltf.images.every(i=>i.bufferView!==undefined),'GLB textures must be embedded');
}
const wav=await fs.readFile(path.join(root,'assets/shu/voice/CN_001.wav'));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.equal(wav.readUInt32LE(4)+8,wav.length);
console.log(`PASS: contract IDs, vectors, references, ${allowed.size} public files, embedded GLB textures and WAV header. Browser evidence is separate.`);
