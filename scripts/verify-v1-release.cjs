'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'releases/qdl-v1.0.0'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(manifest.release,'qdl-v1.0.0');assert.equal(manifest.registryDigest,require('../qdl-v1-registry.js').digest);assert.equal(manifest.sdkVersion,'1.0.0');
for(const [file,digest]of Object.entries(manifest.assets)){assert.equal(sha(fs.readFileSync(path.join(dir,file))),digest,`${file} checksum`);}
const sourceArchive=path.join(dir,'quinelings-qdl-v1.0.0-source.tar.gz');
for(const [file,digest]of Object.entries(manifest.implementationHashes)){
 const archived=cp.execFileSync('tar',['-xOzf',sourceArchive,`quinelings-qdl-v1.0.0/${file}`],{maxBuffer:16*1024*1024});assert.equal(sha(archived),digest,`${file} archived implementation`);assert.equal(sha(fs.readFileSync(path.join(root,file))),digest,`${file} current implementation`);
}
const archivedManifest=JSON.parse(cp.execFileSync('tar',['-xOzf',sourceArchive,'quinelings-qdl-v1.0.0/design/qdl-v1-registry.json'],{encoding:'utf8'}));assert.equal(archivedManifest.digest,manifest.registryDigest);
const listing=cp.execFileSync('tar',['-tzf',sourceArchive],{encoding:'utf8',maxBuffer:16*1024*1024});for(const entry of ['fixtures/qdl-v1/legacy/manifest.json','fixtures/qdl-v1/candidate/manifest.json','docs/QDL-V1.md','packages/agent-sdk/src/v1.ts','packages/agent-sdk/package-lock.json'])assert.ok(listing.includes('quinelings-qdl-v1.0.0/'+entry),`retained ${entry}`);
assert.equal(sha(fs.readFileSync(path.join(root,'assets/sdk/quinelings-agent-sdk-1.0.0.tgz'))),manifest.assets['quinelings-agent-sdk-1.0.0.tgz']);
console.log(`Verified ${manifest.release}: ${Object.keys(manifest.assets).length} retained assets, ${Object.keys(manifest.implementationHashes).length} pinned interpreter files, SDK and legacy/v1 goldens.`);
