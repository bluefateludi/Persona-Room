import { mountSpineActor } from '../frontend/src/character/SpineActor.runtime';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const report: Record<string, unknown> = {};
const show = () => { document.querySelector('#report')!.textContent = JSON.stringify(report, null, 2); (window as any).assetReport = report; };
const character = await fetch('/content/characters/shu.json').then(r=>r.json());
// Discovery pass reads the real skeleton before selecting a verified mapping.
try {
 const player = await mountSpineActor(document.querySelector('#spine')!,character.spine,new AbortController().signal);
 report.spine = {version:player.version,animations:player.animations};
 document.querySelector('#interact')!.addEventListener('click',()=>{player.interact();report.interaction='played';show();});
} catch(error) { report.spineError=String(error); }
show();
try {
 const host=document.querySelector('#model')!;
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(650,620);renderer.setPixelRatio(1);host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b9c7c6');
 scene.add(new THREE.HemisphereLight(0xffffff,0x34484b,2.5));const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(4,6,3);scene.add(key);
 const camera=new THREE.PerspectiveCamera(35,650/620,0.01,100);camera.position.set(3,1.7,5);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.2,0);controls.update();
 const start=performance.now();const gltf=await new GLTFLoader().loadAsync(character.model.url);
 const box=new THREE.Box3().setFromObject(gltf.scene);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());
 const meshes:any[]=[];gltf.scene.traverse(o=>{if((o as any).isMesh){const m=o as THREE.Mesh;const material=m.material as THREE.MeshStandardMaterial;meshes.push({vertices:m.geometry.attributes.position.count,triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3,texture:!!material.map});}});
 gltf.scene.position.sub(center);gltf.scene.position.y+=size.y/2;const group=new THREE.Group();group.add(gltf.scene);group.scale.setScalar(2.5/size.y);scene.add(group);
 renderer.setAnimationLoop(()=>renderer.render(scene,camera));report.glb={loadMs:Math.round(performance.now()-start),bounds:size.toArray(),meshes};show();
} catch(error) { report.glbError=String(error);show(); }
try {
 const ctx=new AudioContext({sampleRate:44100});const bytes=await fetch(character.voices[0].audioUrl).then(r=>r.arrayBuffer());const buffer=await ctx.decodeAudioData(bytes);
 const pcm=buffer.getChannelData(0);let peak=0;for(let i=0;i<pcm.length;i++)peak=Math.max(peak,Math.abs(pcm[i]));
 const audio=document.querySelector('#audio') as HTMLAudioElement;audio.src=character.voices[0].audioUrl;
 document.querySelector('#voice')!.addEventListener('click',async()=>{try{await audio.play();report.audioPlayback='started';}catch(error){report.audioError=String(error);}show();});audio.addEventListener('ended',()=>{report.audioPlayback='ended';show();});
 report.audio={clipDuration:buffer.duration,sampleRate:buffer.sampleRate,peak,subtitle:character.voices[0].text};await ctx.close();show();
} catch(error){report.audioError=String(error);show();}
