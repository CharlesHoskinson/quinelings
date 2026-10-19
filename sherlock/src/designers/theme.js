import * as THREE from 'three/webgpu';

export const PALETTE = {
  paper: 0xf4f0e8,
  paperWarm: 0xebe5da,
  paperCool: 0xe2ddd2,
  ink: 0x14171f,
  inkSoft: 0x333c4d,
  graphite: 0x1c2331,
  graphiteLight: 0x2a3446,
  graphiteDark: 0x111621,
  titanium: 0xd8dde6,
  titaniumSilver: 0xe2e7f0,
  titaniumLight: 0xe2e7f0,
  ceramicAlabaster: 0xebe5da,
  ceramicEdge: 0xd5cec0,
  ceramic: 0xebe5da,
  substrateRim: 0xd5cec0,
  wellSlate: 0x161d29,
  gold: 0xd4af37,
  goldBright: 0xfbbf24,
  copper: 0xd97706,
  heat: 0xea580c,
  heatBright: 0xf97316,
  resolve: 0x0d9488,
  resolveBright: 0x2dd4bf,
  envCyan: 0x2dd4bf,
  opAmber: 0xf59e0b,
  opGold: 0xfbbf24,
  gateViolet: 0x818cf8,
  errorRed: 0xe11d48,
  cyan: 0x38bdf8,
  violet: 0x818cf8,
  steel: 0x0284c7,
  steelBright: 0x38bdf8,
  amber: 0xf59e0b,
};

export const CSS_COLORS = {
  paper: '#f4f0e8',
  paperWarm: '#ebe5da',
  ink: '#14171f',
  graphite: '#1c2331',
  graphiteLight: '#2a3446',
  titanium: '#d8dde6',
  titaniumSilver: '#e2e7f0',
  ceramicAlabaster: '#ebe5da',
  ceramicEdge: '#d5cec0',
  wellSlate: '#161d29',
  gold: '#d4af37',
  goldBright: '#fbbf24',
  copper: '#d97706',
  heat: '#ea580c',
  heatBright: '#f97316',
  resolve: '#0d9488',
  resolveBright: '#2dd4bf',
  envCyan: '#2dd4bf',
  opAmber: '#f59e0b',
  opGold: '#fbbf24',
  gateViolet: '#818cf8',
  errorRed: '#e11d48',
  cyan: '#38bdf8',
  violet: '#818cf8',
  steel: '#0284c7',
  steelBright: '#38bdf8',
  amber: '#f59e0b',
  muted: '#64748b',
};

export const FRAME_KIND_META = {
  // ENV Family (Cyan-Teal: Return = deep emerald-teal, Scope = bright sky-cyan)
  Return: { color: 0x0d9488, css: '#0d9488', family: 'ENV',  badge: 'RET', desc: 'Saved caller env & return type check' },
  Scope:  { color: 0x38bdf8, css: '#0284c7', family: 'ENV',  badge: 'SCP', desc: 'Saved lexical scope restoration' },
  // OP Family (Amber-Copper -> Luminous Gold)
  Left:   { color: 0xf59e0b, css: '#d97706', family: 'OP',   badge: 'LFT', desc: 'Evaluating left operand ([?] op rhs)' },
  Right:  { color: 0xfbbf24, css: '#b45309', family: 'OP',   badge: 'RGT', desc: 'Left value locked, waiting for right (v op [?])' },
  Unary:  { color: 0xf97316, css: '#ea580c', family: 'OP',   badge: 'UNA', desc: 'Pending unary operator (not / leaf)' },
  Args:   { color: 0xfb923c, css: '#c2410c', family: 'OP',   badge: 'ARG', desc: 'Evaluating call argument vector' },
  // GATE Family (Royal Violet-Indigo)
  If:     { color: 0x818cf8, css: '#4f46e5', family: 'GATE', badge: 'IF',  desc: 'Pending boolean branch (then / else)' },
  Match:  { color: 0xa78bfa, css: '#7c3aed', family: 'GATE', badge: 'MAT', desc: 'Pending pattern match arms' },
  Let:    { color: 0xc084fc, css: '#9333ea', family: 'GATE', badge: 'LET', desc: 'Evaluating let-binding RHS' },
};

export const CONTROL_KIND_META = {
  Eval:            { phase: 'DESCEND', color: 0xea580c, css: '#ea580c', label: 'EVAL',   sector: 'EVAL',   badge: 'EVAL' },
  Push:            { phase: 'DESCEND', color: 0xf59e0b, css: '#d97706', label: 'PUSH',   sector: 'PUSH',   badge: 'PUSH' },
  Return:          { phase: 'RETURN',  color: 0x2dd4bf, css: '#0d9488', label: 'RET',    sector: 'RET',    badge: 'RET' },
  Invoke:          { phase: 'DESCEND', color: 0xd4af37, css: '#b45309', label: 'INVOKE', sector: 'INVOKE', badge: 'INVOKE' },
  Enter:           { phase: 'DESCEND', color: 0x38bdf8, css: '#0284c7', label: 'ENTER',  sector: 'ENTER',  badge: 'ENTER' },
  Bound:           { phase: 'DESCEND', color: 0xc084fc, css: '#9333ea', label: 'BOUND',  sector: 'BOUND',  badge: 'BOUND' },
  Cases:           { phase: 'DESCEND', color: 0x818cf8, css: '#4f46e5', label: 'CASES',  sector: 'CASES',  badge: 'CASES' },
  CaseResult:      { phase: 'RESOLVE', color: 0xa78bfa, css: '#7c3aed', label: 'MATCH',  sector: 'MATCH',  badge: 'MATCH' },
  PrimitiveResult: { phase: 'RESOLVE', color: 0xfbbf24, css: '#d97706', label: 'PRIM',   sector: 'PRIM',   badge: 'PRIM' },
  Error:           { phase: 'ERROR',   color: 0xe11d48, css: '#e11d48', label: 'ERR',    sector: 'ERR',    badge: 'ERR' },
  Done:            { phase: 'RETURN',  color: 0x2dd4bf, css: '#0d9488', label: 'DONE',   sector: 'RET',    badge: 'DONE' },
  Rejected:        { phase: 'ERROR',   color: 0xe11d48, css: '#e11d48', label: 'REJ',    sector: 'ERR',    badge: 'REJ' },
  Exhausted:       { phase: 'ERROR',   color: 0xe11d48, css: '#e11d48', label: 'FUEL',   sector: 'ERR',    badge: 'FUEL' },
};

/**
 * Pre-allocated reusable scratch primitives for zero-allocation `.update(stepState)` loops.
 */
export const SCRATCH_COLOR = new THREE.Color();
export const SCRATCH_VEC3 = new THREE.Vector3();
export const SCRATCH_MAT4 = new THREE.Matrix4();
export const SCRATCH_QUAT = new THREE.Quaternion();
export const SCRATCH_EULER = new THREE.Euler();
export const SCRATCH_OBJ3D = new THREE.Object3D();

export function clamp(val, min = 0, max = 1) {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Bounded LRU texture caches to eliminate per-frame DOM `<canvas>` creation and GPU texture uploads.
 */
const MAX_PLAQUE_CACHE_SIZE = 1024;
const MAX_MATERIAL_CACHE_SIZE = 64;
const plaqueTextureCache = new Map();
const metalTextureCache = new Map();
const reticleTextureCache = new Map();
let ceramicGrainSingleton = null;
const ceramicTextureCache = new Map();

function setBoundedTextureCache(cache, maxEntries, key, tex) {
  if (cache.size >= maxEntries && !cache.has(key)) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }
  cache.set(key, tex);
}

/**
 * Creates (or retrieves from cache) a high-key neutral silver-white (`#f4f6fa` base with
 * `#e2e7f0` / `#ffffff` streaks) anisotropic brushed metal texture so when multiplied by
 * `material.color` (e.g. `0xd8dde6`) in Three.js PBR shaders it does not square-darken.
 */
export function createBrushedMetalTexture({
  size = 256,
  baseHex = '#f4f6fa',
  streakAlpha = 0.08,
} = {}) {
  // Normalize legacy `#d8dde6` base requests to high-key `#f4f6fa` to prevent `color * map` double-multiply darkening
  const resolvedBase =
    !baseHex || baseHex.toLowerCase() === '#d8dde6' ? '#f4f6fa' : baseHex;
  const alphaKey = Number(streakAlpha).toFixed(3);
  const key = `${size}|${resolvedBase}|${alphaKey}`;
  if (metalTextureCache.has(key)) {
    return metalTextureCache.get(key);
  }

  if (typeof document === 'undefined') {
    const fallback = new THREE.Texture();
    metalTextureCache.set(key, fallback);
    return fallback;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // High-key neutral silver-white base (#f4f6fa)
  ctx.fillStyle = resolvedBase;
  ctx.fillRect(0, 0, size, size);

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(0.5, 'rgba(226, 231, 240, 0.05)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.07)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Fine multi-frequency horizontal anisotropic micro-streaks (#e2e7f0 / #ffffff)
  for (let y = 0; y < size; y++) {
    const hash = ((y * 73 + 19) * 31) % 97;
    const isHighlight = hash % 2 === 0;
    const alpha = streakAlpha * (0.45 + (hash / 97) * 0.75);
    ctx.fillStyle = isHighlight
      ? `rgba(255, 255, 255, ${alpha.toFixed(4)})`
      : `rgba(226, 231, 240, ${alpha.toFixed(4)})`;
    ctx.fillRect(0, y, size, 1);

    // Secondary micro-groove pass for realistic machined platinum grain
    const subX = (y * 53) % size;
    const subLen = 32 + ((y * 29) % (size >> 1));
    ctx.fillStyle = isHighlight
      ? `rgba(255, 255, 255, ${(streakAlpha * 0.75).toFixed(4)})`
      : `rgba(216, 221, 230, ${(streakAlpha * 0.55).toFixed(4)})`;
    ctx.fillRect(subX, y, Math.min(size - subX, subLen), 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;

  metalTextureCache.set(key, tex);
  return tex;
}

/**
 * Creates (or returns singleton) a neutral high-key (`#fafafa`..`#ffffff`) micro-pebble grain texture
 * for the IC package porcelain ceramic (`0xebe5da`) so `material.color * material.map` stays bright
 * warm alabaster porcelain and never square-darkens.
 */
export function createCeramicGrainTexture({
  size = 256,
  baseHex = '#fafafa',
  grainAlpha = 0.055,
} = {}) {
  const resolvedBase =
    !baseHex || baseHex.toLowerCase() === '#ebe5da' ? '#fafafa' : baseHex;
  const isDefault = size === 256 && resolvedBase === '#fafafa' && grainAlpha === 0.055;
  if (isDefault && ceramicGrainSingleton) {
    return ceramicGrainSingleton;
  }

  const alphaKey = Number(grainAlpha).toFixed(3);
  const key = `${size}|${resolvedBase}|${alphaKey}`;
  if (ceramicTextureCache.has(key)) {
    return ceramicTextureCache.get(key);
  }

  if (typeof document === 'undefined') {
    const fallback = new THREE.Texture();
    if (isDefault) ceramicGrainSingleton = fallback;
    ceramicTextureCache.set(key, fallback);
    return fallback;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = resolvedBase;
  ctx.fillRect(0, 0, size, size);

  // Deterministic high-key mineral micro-pebble grain via single ImageData buffer pass
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  const step = 2;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const h = ((x * 374761393 + y * 668265263) ^ 0x5bf03635) >>> 0;
      const norm = (h & 0xff) / 255;
      if (norm > 0.35) {
        const isWarmLight = (h & 0x100) !== 0;
        const r = isWarmLight ? 255 : 242;
        const g = isWarmLight ? 255 : 239;
        const b = isWarmLight ? 254 : 233;
        const a = Math.min(1, grainAlpha * (0.4 + (norm - 0.35) * 0.9));
        const invA = 1 - a;
        for (let dy = 0; dy < step && y + dy < size; dy++) {
          const rowBase = (y + dy) * size;
          for (let dx = 0; dx < step && x + dx < size; dx++) {
            const p = (rowBase + x + dx) * 4;
            data[p] = Math.round(data[p] * invA + r * a);
            data[p + 1] = Math.round(data[p + 1] * invA + g * a);
            data[p + 2] = Math.round(data[p + 2] * invA + b * a);
          }
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;

  if (isDefault) {
    ceramicGrainSingleton = tex;
  }
  ceramicTextureCache.set(key, tex);
  return tex;
}

/**
 * Creates (or retrieves from cache) a crisp optical reticle texture.
 */
export function createReticleTexture({
  size = 512,
  color = '#d4af37',
} = {}) {
  const key = `${size}|${color}`;
  if (reticleTextureCache.has(key)) {
    return reticleTextureCache.get(key);
  }

  if (typeof document === 'undefined') {
    const fallback = new THREE.Texture();
    reticleTextureCache.set(key, fallback);
    return fallback;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const half = size / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, (size / 256) * 2);

  ctx.beginPath();
  ctx.arc(half, half, half * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(half, half, half * 0.14, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;

  reticleTextureCache.set(key, tex);
  return tex;
}

/**
 * Creates (or returns from a string-keyed LRU cache) a crisp 2x supersampled high-DPI
 * canvas texture for die markings, frame badges, or value labels.
 */
export function createPlaqueTexture({
  title = '',
  subtitle = '',
  badge = '',
  accent,
  accentHex,
  bg,
  bgHex,
  fg,
  textHex,
  muted = '#94a3b8',
  width = 512,
  height = 128,
  border = true,
  renderScale = 2,
} = {}) {
  const resolvedAccent = accentHex ?? accent ?? '#d4af37';
  const resolvedBg = bgHex ?? bg ?? 'rgba(22, 29, 41, 0.94)';
  const resolvedFg = textHex ?? fg ?? '#f4f0e8';
  const scale = clamp(Number.isFinite(renderScale) ? renderScale : 2, 1, 3);

  const cacheKey = `${title}|${subtitle}|${badge}|${resolvedAccent}|${resolvedBg}|${resolvedFg}|${muted}|${width}|${height}|${border ? 1 : 0}|s${scale}`;

  if (plaqueTextureCache.has(cacheKey)) {
    const cachedTex = plaqueTextureCache.get(cacheKey);
    // Refresh LRU order
    plaqueTextureCache.delete(cacheKey);
    plaqueTextureCache.set(cacheKey, cachedTex);
    return cachedTex;
  }

  if (typeof document === 'undefined') {
    const fallbackTex = new THREE.Texture();
    fallbackTex.userData = { title, subtitle, badge, width, height };
    plaqueTextureCache.set(cacheKey, fallbackTex);
    return fallbackTex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.scale(scale, scale);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = resolvedBg;
  roundRect(ctx, 4, 4, width - 8, height - 8, 12);
  ctx.fill();

  if (border) {
    ctx.strokeStyle = resolvedAccent;
    ctx.lineWidth = 3;
    roundRect(ctx, 4, 4, width - 8, height - 8, 12);
    ctx.stroke();
  }

  let textX = 22;
  if (badge) {
    ctx.font = '700 24px "JetBrains Mono", monospace';
    const bw = Math.max(76, ctx.measureText(badge).width + 28);
    ctx.fillStyle = resolvedAccent;
    roundRect(ctx, 16, 18, bw, 40, 8);
    ctx.fill();
    ctx.fillStyle = '#141413';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge, 30, 39);
    textX = 28 + bw;
  }

  ctx.fillStyle = resolvedFg;
  ctx.font = '600 28px "JetBrains Mono", monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(title).slice(0, 32), textX, subtitle ? 38 : height / 2);

  if (subtitle) {
    ctx.fillStyle = muted;
    ctx.font = '500 21px "JetBrains Mono", monospace';
    ctx.fillText(String(subtitle).slice(0, 44), 22, height - 30);
  }

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.userData = { title, subtitle, badge, width, height, renderScale: scale, sharedPlaque: true };
  tex.needsUpdate = true;

  if (plaqueTextureCache.size >= MAX_PLAQUE_CACHE_SIZE) {
    const oldestKey = plaqueTextureCache.keys().next().value;
    if (oldestKey !== undefined) {
      // Do NOT call .dispose() on evicted textures that may still be mounted on active meshes
      plaqueTextureCache.delete(oldestKey);
    }
  }
  plaqueTextureCache.set(cacheKey, tex);
  return tex;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Tag a Three.js Object3D hierarchy with interactive inspection metadata for Designer 7's raycaster.
 */
export function tagInspectable(object3d, meta) {
  object3d.userData = {
    ...object3d.userData,
    inspectable: true,
    ...meta,
  };
  object3d.traverse((child) => {
    if (child !== object3d) {
      child.userData = {
        ...child.userData,
        inspectableParent: object3d,
      };
    }
  });
  return object3d;
}

let studioEnvMapSingleton = null;

/**
 * Creates (or returns singleton) a procedural Apple Studio Softbox equirectangular reflection
 * environment map (`THREE.EquirectangularReflectionMapping`).
 * Includes bright overhead softbox cards separated by dark contrast bands so machined stainless
 * steel, turned collars, and rhodium rings reflect crisp specular gradients from every camera angle.
 */
export function createStudioEnvironmentMap({ width = 512, height = 256 } = {}) {
  if (studioEnvMapSingleton) {
    return studioEnvMapSingleton;
  }

  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      const v = y / Math.max(1, height - 1);
      const isTop = v < 0.48;
      const r = isTop ? Math.round(lerp(252, 210, v * 2)) : Math.round(lerp(42, 68, (v - 0.48) * 1.9));
      const g = isTop ? Math.round(lerp(250, 216, v * 2)) : Math.round(lerp(52, 92, (v - 0.48) * 1.9));
      const b = isTop ? Math.round(lerp(246, 226, v * 2)) : Math.round(lerp(70, 104, (v - 0.48) * 1.9));
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    const fallbackTex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    fallbackTex.mapping = THREE.EquirectangularReflectionMapping;
    fallbackTex.colorSpace = THREE.SRGBColorSpace;
    fallbackTex.needsUpdate = true;
    studioEnvMapSingleton = fallbackTex;
    return fallbackTex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. High-contrast studio enclosure with dark separation bands (critical for stainless steel reflection definition)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0.00, '#f8fafc');
  bgGrad.addColorStop(0.20, '#e2e8f0');
  bgGrad.addColorStop(0.42, '#334155');
  bgGrad.addColorStop(0.50, '#1e293b');
  bgGrad.addColorStop(0.58, '#cbd5e1');
  bgGrad.addColorStop(0.76, '#1e293b');
  bgGrad.addColorStop(1.00, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Broad Neutral-White Overhead Key Softbox Card (draws continuous highlight across stainless interposer)
  const keySoftbox = ctx.createRadialGradient(
    width * 0.24,
    height * 0.17,
    8,
    width * 0.24,
    height * 0.17,
    width * 0.26
  );
  keySoftbox.addColorStop(0.0, 'rgba(255, 255, 255, 0.98)');
  keySoftbox.addColorStop(0.5, 'rgba(248, 250, 252, 0.58)');
  keySoftbox.addColorStop(1.0, 'rgba(248, 250, 252, 0.0)');
  ctx.fillStyle = keySoftbox;
  ctx.fillRect(0, 0, width, height * 0.5);

  // 3. Narrower Cool-White Opposite Strip (describes the lathe-turned collar's curvature)
  const fillSoftbox = ctx.createRadialGradient(
    width * 0.76,
    height * 0.21,
    8,
    width * 0.76,
    height * 0.21,
    width * 0.22
  );
  fillSoftbox.addColorStop(0.0, 'rgba(235, 245, 255, 0.92)');
  fillSoftbox.addColorStop(0.55, 'rgba(219, 234, 254, 0.45)');
  fillSoftbox.addColorStop(1.0, 'rgba(219, 234, 254, 0.0)');
  ctx.fillStyle = fillSoftbox;
  ctx.fillRect(0, 0, width, height * 0.5);

  // 4. Restrained Nadir Bounce for Hollow Interior Chamber
  const nadirBounce = ctx.createRadialGradient(
    width * 0.5,
    height * 0.82,
    8,
    width * 0.5,
    height * 0.82,
    width * 0.32
  );
  nadirBounce.addColorStop(0.0, 'rgba(148, 163, 184, 0.32)');
  nadirBounce.addColorStop(1.0, 'rgba(15, 23, 42, 0.0)');
  ctx.fillStyle = nadirBounce;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  const envTex = new THREE.CanvasTexture(canvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  envTex.needsUpdate = true;

  studioEnvMapSingleton = envTex;
  return envTex;
}

export function disposeThemeCaches() {
  for (const cache of [plaqueTextureCache, metalTextureCache, reticleTextureCache, ceramicTextureCache]) {
    for (const tex of cache.values()) {
      if (tex && typeof tex.dispose === 'function') tex.dispose();
    }
    cache.clear();
  }
  if (ceramicGrainSingleton && typeof ceramicGrainSingleton.dispose === 'function') {
    ceramicGrainSingleton.dispose();
  }
  ceramicGrainSingleton = null;
  if (studioEnvMapSingleton && typeof studioEnvMapSingleton.dispose === 'function') {
    studioEnvMapSingleton.dispose();
  }
  studioEnvMapSingleton = null;
}

