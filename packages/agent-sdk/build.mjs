import { build } from 'esbuild';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const packageDirectory=fileURLToPath(new URL('.',import.meta.url));
const manifest=JSON.parse(readFileSync(new URL('package.json',import.meta.url),'utf8'));
const entryPoints=['index','schema','mcp','mcp-cli','a2a','a2a-cli','v1','v1-schema','v1-mcp','v1-mcp-cli','v1-a2a','v1-a2a-cli','v1-migrate','v1-ranch'].map(name=>resolve(packageDirectory,'src',name+'.ts'));
for(const entry of entryPoints)if(!existsSync(entry))throw new Error('Required SDK build entry is missing: '+entry);
const outdir=resolve(packageDirectory,'dist');
rmSync(outdir,{recursive:true,force:true});
await build({absWorkingDir:packageDirectory,entryPoints,outdir,bundle:true,splitting:true,platform:'node',format:'esm',target:'node22',packages:'external',sourcemap:true});
execFileSync(process.execPath,[resolve(packageDirectory,'node_modules/typescript/bin/tsc'),'--project',resolve(packageDirectory,'tsconfig.json'),'--emitDeclarationOnly'],{cwd:packageDirectory,stdio:'inherit'});
const targets=[...Object.values(manifest.exports).flatMap(conditions=>Object.values(conditions)),...Object.values(manifest.bin)];
for(const target of targets)if(typeof target!=='string'||!existsSync(resolve(packageDirectory,target)))throw new Error('SDK build did not produce its declared package target: '+target);
