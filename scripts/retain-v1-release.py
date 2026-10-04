#!/usr/bin/env python3
"""Retain a reviewed commit once; refuse to overwrite an existing release."""
import hashlib, json, pathlib, shutil, subprocess, sys
root = pathlib.Path(__file__).resolve().parent.parent
revision = subprocess.check_output(['git', 'rev-parse', sys.argv[1] if len(sys.argv)>1 else 'HEAD'], cwd=root, text=True).strip()
dest = root/'releases/qdl-v1.0.0'
if dest.exists():
    raise SystemExit('Release already exists; never regenerate or overwrite its retained artifacts.')
registry = json.loads((root/'design/qdl-v1-registry.json').read_text())
dest.mkdir(parents=True)
archive = dest/'quinelings-qdl-v1.0.0-source.tar.gz'
with archive.open('wb') as target:
    source = subprocess.Popen(['git','archive','--format=tar','--prefix=quinelings-qdl-v1.0.0/',revision],cwd=root,stdout=subprocess.PIPE)
    zipped = subprocess.run(['gzip','-n'],stdin=source.stdout,stdout=target,check=True)
    source.stdout.close()
    if source.wait()!=0: raise SystemExit('git archive failed')
for original in ['assets/sdk/quinelings-agent-sdk-1.0.0.tgz','design/qdl-v1-registry.json']:
    shutil.copyfile(root/original,dest/pathlib.Path(original).name)
assets = {p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(dest.iterdir())}
manifest = {'release':'qdl-v1.0.0','language':'qdl-program','version':1,'canonical':'qdl-json-1','registry':registry['manifest']['id'],'registryDigest':registry['digest'],'sdkVersion':'1.0.0','sourceCommit':revision,'tagPolicy':'Never retag or replace retained release assets; verify SHA-256 before use.','scope':'Bounded deterministic local single-owner Session; simulation-only effects. Stable v1/schema/mcp/a2a/migrate entrypoints; legacy/default and ranch policies experimental.','implementationHashes':registry['manifest']['implementationHashes'],'assets':assets,'acceptance':'research/qdl-v1/acceptance.json; research/qdl-v1/release-*-gates.md','archiveContents':'Complete tracked source checkout including matching interpreter, registry, normative docs, independent golden sources/genomes and migration fixtures; SDK distribution separately retained.'}
(dest/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
with (dest/'SHA256SUMS').open('w') as out:
    for p in sorted(dest.iterdir()):
        if p.name!='SHA256SUMS': out.write(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n')
print('Retained',revision,'as',dest)
