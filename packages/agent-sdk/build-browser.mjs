import {build} from 'esbuild';
import {readFileSync, realpathSync, statSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

const packageDirectory = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(packageDirectory, '../..');
const outdir = resolve(packageDirectory, 'dist/browser');
const entry = resolve(packageDirectory, 'src/browser-v1.ts');
const banner = 'if(!globalThis.Buffer||typeof globalThis.Buffer.byteLength!=="function"){globalThis.Buffer={byteLength(text){return new TextEncoder().encode(String(text)).length;}};}';

const forbidden = [
  /node:fs/,
  /node:path/,
  /node:crypto/,
  /node:timers/,
  /node:child_process/,
  /node:module/,
  /node:buffer/,
  /require\(["']fs["']\)/,
  /require\(["']path["']\)/,
  /require\(["']crypto["']\)/,
  /\bBuffer\.(alloc|from|concat|allocUnsafe|isBuffer)\b/,
  /\b__dirname\b/,
  /\b__filename\b/,
  /\bprocess\.binding\b/,
  /\bprocess\.versions\b/,
  /\bprocess\.exit\b/,
  /\bprocess\.env\b/,
];

function scan(text, file) {
  const hits = [];
  for (const pattern of forbidden) if (pattern.test(text)) hits.push(pattern.source);
  if (hits.length) throw new Error('Node-only API leaked into ' + file + ': ' + hits.join(', '));
  return hits;
}

const cryptoPlugin = {
  name: 'browser-crypto',
  setup(build) {
    build.onResolve({filter: /^node:/}, args => {
      if (args.path === 'node:crypto') return {path: resolve(packageDirectory, 'src/browser-crypto.ts')};
      throw new Error('Node-only import leaked into the browser bundle: ' + args.path + ' from ' + args.importer);
    });
  },
};

const shared = {
  absWorkingDir: root,
  entryPoints: [entry],
  bundle: true,
  platform: 'browser',
  target: 'es2022',
  banner: {js: banner},
  legalComments: 'eof',
  plugins: [cryptoPlugin],
  define: {'process.env.NODE_ENV': '"production"'},
  logLevel: 'warning',
};

export async function buildBrowser() {
  const esm = await build({...shared, format: 'esm', outfile: resolve(outdir, 'quinelings-v1.mjs')});
  const iife = await build({...shared, format: 'iife', globalName: 'QuinelingsV1', outfile: resolve(outdir, 'quinelings-v1.iife.js')});
  const files = {
    esm: resolve(outdir, 'quinelings-v1.mjs'),
    iife: resolve(outdir, 'quinelings-v1.iife.js'),
  };
  const warnings = [...esm.warnings, ...iife.warnings].map(warning => warning.text);
  if (warnings.some(text => /node:|Could not resolve|is not exported/.test(text))) throw new Error(warnings.join('\n'));
  const sizes = {};
  for (const [name, file] of Object.entries(files)) {
    const text = readFileSync(file, 'utf8');
    scan(text, file);
    sizes[name] = statSync(file).size;
  }
  return {files, sizes, warnings};
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (invoked) {
  const result = await buildBrowser();
  process.stdout.write(JSON.stringify(result.sizes) + '\n');
}
