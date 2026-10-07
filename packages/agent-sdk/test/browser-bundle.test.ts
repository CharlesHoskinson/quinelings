import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildBrowser} from '../build-browser.mjs';

const chrome = [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, '/home/charl/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', '/usr/bin/chromium'].find((path): path is string => typeof path === 'string' && path.length > 0 && existsSync(path));
// Chrome 151 rejects --use-gl=swiftshader (it resolves to gl=none). ANGLE SwiftShader is the software GL path on this binary.
const chromeArgs = [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--allow-file-access-from-files',
  '--remote-debugging-port=0',
];
const intent = {
  format: 'qdl-intent', version: 1, name: 'Measured total',
  thought: 'Sum the supplied measurements.',
  inputs: [{id: 'samples', name: 'samples', type: {kind: 'array', element: {kind: 'number', unit: 'item', min: 0, integer: true}, maxLength: 512}}],
  steps: [{id: 'total', op: 'sum', inputs: ['samples'], params: {}}],
  outputs: ['total']
} as const;

type BrowserSession = {
  compile(intent: unknown): {id: string};
  frame(id: string, phase: number, options: {budget: number; crests: number}): {points: number[]; owners: number[]; normals: number[]};
  exportSnapshot(): {records: unknown[]};
  run(input: {artifactId: string; requestId: string; inputs: {samples: number[]}}): {result: {occurrences: {outputs: number[]}[]}};
};

type PageReport = {
  ok: boolean;
  error?: string;
  runtime: {process: string; require: string; module: string; dirname: string; bufferKeys: string[]};
  compileMs: number;
  frameMs: number;
  ink: number;
  gl: string | null;
  lifeforms: string;
  passiveFrame: boolean;
  recordsAfterFrame: number;
  recordsAfterRun: number;
  points: number;
  output: number[];
};

let pending: ReturnType<typeof buildBrowser> | undefined;
function bundle() { return pending ??= buildBrowser(); }

async function launch(url: string): Promise<PageReport> {
  const profile = mkdtempSync(join(tmpdir(), 'quineling-chrome-'));
  const child = spawn(chrome as string, [...chromeArgs, `--user-data-dir=${profile}`, url], {stdio: ['ignore', 'ignore', 'pipe'], detached: true});
  let stderr = '';
  try {
    const port = await new Promise<number>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('DevTools port did not open\n' + stderr.slice(-1000))), 10000);
      child.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
        const match = stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
        if (match?.[1]) { clearTimeout(timer); resolve(Number(match[1])); }
      });
      child.on('exit', code => { clearTimeout(timer); reject(new Error('Chrome exited ' + code + '\n' + stderr.slice(-1000))); });
    });
    const deadline = Date.now() + 10000;
    let list: {type: string; url: string; webSocketDebuggerUrl: string}[] = [];
    let page: {type: string; url: string; webSocketDebuggerUrl: string} | undefined;
    while (Date.now() < deadline) {
      try {
        list = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json()) as typeof list;
      } catch {
        list = [];
      }
      page = list.find(target => target.type === 'page' && target.url.startsWith('file:'));
      if (page) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (!page) throw new Error('No file page in ' + JSON.stringify(list.map(target => target.url)) + '\n' + stderr.slice(-1000));
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise<void>((resolve, reject) => {
      ws.addEventListener('open', () => resolve());
      ws.addEventListener('error', () => reject(new Error('DevTools socket failed')));
    });
    let id = 0;
    const waiting = new Map<number, (message: {error?: unknown; result?: {result?: {value?: string}}}) => void>();
    ws.addEventListener('message', event => {
      const message = JSON.parse(String(event.data)) as {id?: number; error?: unknown; result?: {result?: {value?: string}}};
      if (message.id === undefined) return;
      const done = waiting.get(message.id);
      if (!done) return;
      waiting.delete(message.id);
      done(message);
    });
    const send = (method: string, params: object) => new Promise<{result?: {value?: string}}>((resolve, reject) => {
      const msgId = ++id;
      waiting.set(msgId, message => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result ?? {}));
      ws.send(JSON.stringify({id: msgId, method, params}));
    });
    const started = Date.now();
    let text = '';
    while (Date.now() - started < 30000) {
      const result = await send('Runtime.evaluate', {expression: 'document.getElementById("report") && document.getElementById("report").textContent', returnByValue: true});
      text = result.result?.value ?? '';
      if (text && text !== 'pending') break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    ws.close();
    if (!text || text === 'pending') throw new Error('Page did not finish\n' + stderr.slice(-1000));
    return JSON.parse(text) as PageReport;
  } finally {
    if (child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); } }
    rmSync(profile, {recursive: true, force: true});
  }
}

test('browser bundle keeps frame passive and evaluates only on run', async () => {
  const built = await bundle();
  const esm = readFileSync(built.files.esm, 'utf8');
  const iife = readFileSync(built.files.iife, 'utf8');
  for (const [name, text] of [['esm', esm], ['iife', iife]] as const) {
    assert.equal(text.includes('node:crypto'), false, name);
    assert.equal(text.includes('node:fs'), false, name);
    assert.equal(/\bprocess\.env\b/.test(text), false, name);
    assert.equal(/\bBuffer\.(alloc|from|concat|allocUnsafe)\b/.test(text), false, name);
    assert.equal(text.includes('Buffer.byteLength'), true, name);
  }
  assert.match(iife, /var QuinelingsV1 =/);
  const api = await import(pathToFileURL(built.files.esm).href) as {Session: new () => BrowserSession};
  const session = new api.Session();
  const artifact = session.compile(intent);
  const before = JSON.stringify(session.exportSnapshot());
  const frame = session.frame(artifact.id, 0.4, {budget: 4000, crests: 2});
  assert.equal(JSON.stringify(session.exportSnapshot()), before);
  assert.equal(session.exportSnapshot().records.length, 0);
  assert.equal(frame.points.length, 16000);
  assert.equal(frame.owners.length, 4000);
  const run = session.run({artifactId: artifact.id, requestId: 'node-bundle', inputs: {samples: [3, 5, 7]}});
  assert.deepEqual(run.result.occurrences[0]!.outputs, [15]);
  assert.equal(session.exportSnapshot().records.length, 1);
  console.log(JSON.stringify({
    bytes: built.sizes,
    gzip: {esm: gzipSync(esm).length, iife: gzipSync(iife).length},
    warnings: built.warnings,
  }));
});

test('headless Chromium draws one framed creature from the file URL bundle', {skip: chrome === undefined && 'no Chromium executable; set PLAYWRIGHT_CHROMIUM_EXECUTABLE'}, async () => {
  await bundle();
  const iife = await launch(new URL('../examples/browser.html', import.meta.url).href);
  assert.equal(iife.error, undefined, JSON.stringify(iife));
  assert.equal(iife.ok, true);
  assert.equal(iife.runtime.process, 'undefined');
  assert.equal(iife.runtime.require, 'undefined');
  assert.equal(iife.runtime.module, 'undefined');
  assert.equal(iife.runtime.dirname, 'undefined');
  assert.deepEqual(iife.runtime.bufferKeys, ['byteLength']);
  assert.equal(iife.passiveFrame, true);
  assert.equal(iife.recordsAfterFrame, 0);
  assert.equal(iife.recordsAfterRun, 1);
  assert.equal(iife.points, 16000);
  assert.deepEqual(iife.output, [15]);
  assert.ok(iife.ink > 100);
  assert.ok(iife.compileMs >= 0);
  assert.ok(iife.frameMs >= 0);
  assert.match(iife.gl ?? '', /SwiftShader/);

  const directory = mkdtempSync(join(tmpdir(), 'quineling-esm-'));
  try {
    writeFileSync(join(directory, 'quinelings-v1.mjs'), readFileSync(new URL('../dist/browser/quinelings-v1.mjs', import.meta.url)));
    writeFileSync(join(directory, 'browser-draw.js'), readFileSync(new URL('../examples/browser-draw.js', import.meta.url)));
    writeFileSync(join(directory, 'page.html'), `<!DOCTYPE html><html><body><canvas id="creature" width="720" height="480"></canvas><pre id="report">pending</pre>
      <script>addEventListener('error',function(event){document.getElementById('report').textContent=JSON.stringify({ok:false,error:String(event.message)});});</script>
      <script src="./browser-draw.js"></script>
      <script type="module">import * as api from './quinelings-v1.mjs'; QuinelingBrowserDraw(api);</script>
    </body></html>`);
    const esm = await launch(pathToFileURL(join(directory, 'page.html')).href);
    assert.equal(esm.ok, true, JSON.stringify(esm));
    assert.match(esm.gl ?? '', /SwiftShader/);
    console.log(JSON.stringify({
      iife: {compileMs: iife.compileMs, frameMs: iife.frameMs, ink: iife.ink, gl: iife.gl, runtime: iife.runtime},
      esm: {compileMs: esm.compileMs, frameMs: esm.frameMs, ink: esm.ink, gl: esm.gl},
    }));
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
});
