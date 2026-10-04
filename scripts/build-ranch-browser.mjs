import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url)),require=createRequire(new URL('../packages/agent-sdk/package.json',import.meta.url));
const {build}=require('esbuild');
await build({absWorkingDir:root,entryPoints:['packages/agent-sdk/src/browser-entry.ts'],outfile:'assets/ranch/quinelings-runtime.js',bundle:true,platform:'browser',format:'esm',target:'es2022',sourcemap:true,plugins:[{name:'browser-crypto',setup(b){b.onResolve({filter:/^node:crypto$/},()=>({path:resolve(root,'packages/agent-sdk/src/browser-crypto.ts')}));}}]});
