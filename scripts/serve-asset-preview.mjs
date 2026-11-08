import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'frontend/package.json'));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const deps=path.join(root,'frontend/node_modules');
const server=await createServer({configFile:false,root,publicDir:path.join(root,'frontend/public'),resolve:{alias:{'pixi.js':path.join(deps,'pixi.js/lib/index.mjs'),'@pixi-spine/base':path.join(deps,'@pixi-spine/base/lib/index.mjs'),'@pixi-spine/runtime-3.8':path.join(deps,'@pixi-spine/runtime-3.8/lib/index.mjs'),three:path.join(deps,'three')}},server:{host:'127.0.0.1',port:5188,strictPort:true}});
await server.listen();console.log('Open http://127.0.0.1:5188/scripts/asset-preview.html');
