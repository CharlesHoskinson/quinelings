'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(process.argv[2]);
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const name = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(name) : [name];
  });
}
const files = walk(root);
for (const file of files) {
  const relative = path.relative(root, file);
  assert.ok(!/^(research|spec|fixtures)\//.test(relative), `Internal archive published: ${relative}`);
  assert.ok(!/^(?:docs\/.*(?:WORKPLAN|DELIVERY|AUDIT|CANDIDATE)|[^/]*verification\.json$)/.test(relative), `Internal report published: ${relative}`);
  if (!file.endsWith('.html')) continue;
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|data:|blob:|mailto:|#)/.test(reference)) continue;
    const target = path.resolve(path.dirname(file), reference.split(/[?#]/)[0]);
    assert.ok(target === root || target.startsWith(root + path.sep), `Link escapes site: ${relative}: ${reference}`);
    assert.ok(fs.existsSync(target), `Broken published link: ${relative}: ${reference}`);
  }
}
console.log('Public site contains product files with valid local page links.');
