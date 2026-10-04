'use strict';
const assert=require('node:assert/strict'),{createHash}=require('node:crypto'),{sha256}=require('./ranch-crypto.js');
const vectors=[['','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],['abc','ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq','248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'],['a'.repeat(1000000),'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0']];
for(const [text,hash]of vectors)assert.equal(sha256(text),hash);
for(const n of [1,55,56,63,64,65,127,128,129,65536])for(const token of ['z','🍄','\ud800','\n\"']){const text=token.repeat(n);assert.equal(sha256(text),createHash('sha256').update(text).digest('hex'));}
assert.throws(()=>sha256('x'.repeat(2097153)),RangeError);assert.throws(()=>sha256({}),TypeError);
console.log('Shared SHA256: four published vectors,40 platform UTF8/block boundary vectors,2 rejection checks passed');
