import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
await fs.mkdir('.scratch/assets',{recursive:true});
for(const name of ['charword_table','handbook_info_table']) {
 const file=`.scratch/assets/${name}.json`;
 try { await fs.access(file); } catch {
  const response=await fetch(`https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/63c7cec73c3858d0ae913f85cc89af3cef4d744f/zh_CN/gamedata/excel/${name}.json`);
  if(!response.ok) throw new Error(`Source download failed: ${response.status}`);
  await fs.writeFile(file,Buffer.from(await response.arrayBuffer()));
 }
}
const word = JSON.parse(await fs.readFile('.scratch/assets/charword_table.json', 'utf8')).charWords.char_2025_shu_CN_001;
const handbook = JSON.parse(await fs.readFile('.scratch/assets/handbook_info_table.json', 'utf8')).handbookDict.char_2025_shu;
const source = {label:'明日方舟游戏档案 · ArknightsGameData',url:'https://github.com/Kengxxiao/ArknightsGameData/blob/master/zh_CN/gamedata/excel/handbook_info_table.json'};
const prefix = '/content/assets/shu/';
const character = {
 schemaVersion:1,id:'shu',name:'黍',intro:'炎国农业天师，曾长期在大荒城研究农业，如今以访客身份暂驻罗德岛。她以耐心照料庄稼，也关心身边每个人的日常生活。',
 model:{url:prefix+'shu-figurine.glb',posterUrl:prefix+'shu-figurine-concept.png',targetHeight:2.5,rotation:[0,0,0]},
 spine:{skeletonUrl:prefix+'spine/build_char_2025_shu.skel',atlasUrl:prefix+'spine/build_char_2025_shu.atlas',textureUrl:prefix+'spine/build_char_2025_shu.png',version:'3.8',premultipliedAlpha:true,animations:{idle:'Relax',interact:'Interact',move:'Move'},verified:true},
 archives:[
  {id:'profile',title:'客观履历 · 原文节选',text:handbook.storyTextAudio.find(s=>s.storyTitle==='客观履历').stories[0].storyText,source},
  {id:'care',title:'档案资料一 · 展馆导读',text:'她会为年安排健康饮食，提醒夕走出画卷、适度运动。面对其他干员，她同样愿意倾听烦恼、耐心解答；这种细致的照料，让“黍姐”的称呼渐渐亲切起来。\n\n本段为创作者依据游戏档案整理的导读，并非游戏原文。',source},
  {id:'harvest',title:'档案资料三 · 展馆导读',text:'黍关心的不止是粮食产量，也包括食材的品质。农业研究从抵御风霜、提高收成，走向移动城市与无土栽培；她更在意眼前一季庄稼与一餐好饭，把漫长的理想落在踏实的生活里。\n\n本段为创作者依据游戏档案整理的导读，并非游戏原文。',source},
 ],
 voices:[{id:'shu-assistant',title:word.voiceTitle,text:word.voiceText,language:'普通话',audioUrl:prefix+'voice/CN_001.wav',source:{label:'Ark-Voice 普通话 · CN_001；字幕：ArknightsGameData',url:'https://github.com/isHarryh/Ark-Voice'}}],
 artworks:[{id:'shu-art',title:'黍 · 角色参考',imageUrl:prefix+'shu-reference.png',description:'用户已有的角色参考图，游戏角色素材版权归原权利人。'},{id:'shu-figure-art',title:'数字手办 · 概念参考',imageUrl:prefix+'shu-figurine-concept.png',description:'AI 生成的手办参考效果图，与实际 3D 手办分别展示。'}],
 story:{label:'前往文库阅读',url:'https://terra-library.pages.dev/',directLinkVerified:false,searchHint:'黍'},
};
const furniture=[
 ['shu-figure','model','黍的数字手办',[0,0,0],'shu'],
 ['shu-companion','companion','与黍互动',[-2.5,0,1],'shu'],
 ['archive-desk','archive','了解她的故事',[-3,0,-2],'profile'],
 ['voice-station','voice','听她说话',[3,0,-2],'shu-assistant'],
 ['art-frame','art','角色画廊',[0,1.8,-4],'shu-art'],
].map(([id,kind,label,position,contentId])=>({id,kind,label,position,rotation:[0,0,0],scale:[1,1,1],contentId}));
furniture.find(item=>item.id==='archive-desk').modelUrl=prefix+'rice-archive-cabinet.glb';
await fs.writeFile('content/characters/shu.json',JSON.stringify(character,null,2)+'\n');
await fs.writeFile('content/exhibitions/shu.json',JSON.stringify({schemaVersion:1,id:'shu-gallery',characterId:'shu',title:'黍 · 百谷长青',furniture},null,2)+'\n');
console.log('Generated curated character and exhibition content');
