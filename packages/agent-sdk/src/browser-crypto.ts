// A browser build alias only; Node entry retains its native node:crypto import.
// @ts-expect-error shared JavaScript has no declarations
import C from '../../../ranch-crypto.js';
export function createHash(algorithm:string){if(algorithm!=='sha256')throw new TypeError('Browser runtime supports SHA256 only');let text='';return {update(value:string){if(typeof value!=='string')throw new TypeError('Hash input must be text');text+=value;return this;},digest(encoding?:string):any{const hex=C.sha256(text);if(encoding==='hex')return hex;if(encoding!==undefined)throw new TypeError('Unsupported digest encoding');return {readUInt32BE(offset:number){if(!Number.isInteger(offset)||offset<0||offset>28)throw new RangeError('Digest offset');return parseInt(hex.slice(offset*2,offset*2+8),16);}};}};}
export function randomUUID(){return globalThis.crypto.randomUUID();}
