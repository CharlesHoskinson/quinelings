'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
// Synthetic receipts stay in memory or an isolated directory. This test cannot
// create the real private acceptance receipt or approve any candidate.
const isolated=fs.mkdtempSync(path.join(os.tmpdir(),'quineling-release-guard-'));process.env.QUINELING_VISUAL_PRIVATE_DIR=isolated;
const guard=require('../scripts/check-visual-release.cjs'),pins=guard.pins();
const absent=cp.spawnSync(process.execPath,['scripts/check-visual-release.cjs'],{encoding:'utf8',env:{...process.env,QUINELING_VISUAL_PRIVATE_DIR:isolated}});assert.notEqual(absent.status,0);assert.match(absent.stderr,/VISUAL RELEASE REFUSED/);
const sample={stage:'PROTOTYPE',status:'accepted',pins};assert.throws(()=>guard.verify(sample),/Prototype/);
assert.throws(()=>guard.verify({...sample,stage:'RELEASE',status:'failed'}),/failed or missing/);
assert.throws(()=>guard.verify({...sample,stage:'RELEASE',pins:{...pins,benchmarkSha256:'wrong'}}),/stale/);
const changed=structuredClone(pins);changed.sources[Object.keys(changed.sources)[0]]='changed-source';assert.throws(()=>guard.verify({...sample,stage:'RELEASE',pins:changed}),/stale/);
const code=structuredClone(pins);code.renderCode['woven-body.js']='changed-code';assert.throws(()=>guard.verify({...sample,stage:'RELEASE',pins:code}),/stale/);
assert.throws(()=>guard.verify({...sample,stage:'RELEASE'}),/Missing independent/);
fs.rmSync(isolated,{recursive:true,force:true});console.log('Early visual release guard refuses missing/failed/prototype/stale-source/stale-renderer/unreviewed evidence. No acceptance receipt authored.');
