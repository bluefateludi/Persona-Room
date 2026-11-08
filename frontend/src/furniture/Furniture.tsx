import { Suspense } from 'react';
import { Html, Image, useGLTF } from '@react-three/drei';
import type { CharacterContent, FurnitureItem } from '../../../shared/src/contracts';
const cream = '#e8dfc9', gold = '#b99a56', ink = '#233d42';
export function Box({position = [0,0,0], size, color = cream}: {position?: [number,number,number];size:[number,number,number];color?:string}) {
 return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={0.65}/></mesh>;
}
function CabinetModel({url}: {url:string}) { const {scene} = useGLTF(url); return <primitive object={scene.clone()} />; }
export function Furniture({item, character}: {item: FurnitureItem; character: CharacterContent}) {
 if (item.kind === 'archive') return item.modelUrl ? <Suspense fallback={<Box position={[0,.7,0]} size={[1.5,1.4,.7]}/>}><CabinetModel url={item.modelUrl}/></Suspense> : <group>
  <Box position={[0,.8,0]} size={[1.7,1.6,.65]} color={ink}/><Box position={[0,1.64,0]} size={[1.85,.12,.8]}/>
  {[-.48,0,.48].map(x => <group key={x}><Box position={[x,.85,.35]} size={[.43,1.3,.06]}/><Box position={[x,1,.4]} size={[.045,.25,.04]} color={gold}/></group>)}
  <Box position={[0,.12,0]} size={[1.85,.14,.8]} color={gold}/>
  <Html center position={[0,1.95,0]} distanceFactor={9}><div className="furniture-label">02 / 岁月档案</div></Html>
 </group>;
 if(item.kind === 'voice') return <group>
  <Box position={[0,.65,0]} size={[1.05,1.3,.9]} color={ink}/><Box position={[0,1.34,0]} size={[1.2,.08,1]} color={gold}/>
  <mesh position={[0,1.43,0]}><cylinderGeometry args={[.39,.39,.06,48]}/><meshStandardMaterial color="#111c22"/></mesh>
  <mesh position={[0,1.48,0]}><cylinderGeometry args={[.1,.1,.02,32]}/><meshStandardMaterial color={gold}/></mesh>
  <mesh position={[.26,1.7,-.2]} rotation={[0,0,-.65]}><coneGeometry args={[.4,.7,32,1,true]}/><meshStandardMaterial color={gold} side={2}/></mesh>
  <Html center position={[0,2.2,0]} distanceFactor={9}><div className="furniture-label">03 / 听见黍</div></Html>
 </group>;
 if(item.kind === 'art') return <group>
  <Box position={[0,1.75,0]} size={[1.7,2.8,.16]} color={gold}/><Box position={[0,1.75,.1]} size={[1.57,2.67,.06]} color={cream}/>
  {character.artworks[0] && <Suspense fallback={null}><Image url={character.artworks[0].imageUrl} position={[0,1.75,.15]} scale={[1.43,2.5]} transparent /></Suspense>}
  <Html center position={[0,3.4,0]} distanceFactor={9}><div className="furniture-label">04 / 丹青留影</div></Html>
 </group>;
 if(item.kind === 'companion') return <group><mesh position={[0,.04,0]}><cylinderGeometry args={[.65,.65,.08,64]}/><meshStandardMaterial color={gold}/></mesh><Html center position={[0,.65,0]} distanceFactor={9}><div className="furniture-label">05 / 与黍相遇</div></Html></group>;
 return null;
}
