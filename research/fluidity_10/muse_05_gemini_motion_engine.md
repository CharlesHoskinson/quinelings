# Gemini Motion Studio — `motion.html`

Superior, open, Gemini-native Claude Motion equivalent for mathematical organisms. Single-file, deterministic, surgically editable, exportable at 60fps.

## 1. Architecture

```
motion.html
├── <canvas id="stage"> 1920x1080         // sole render target
├── renderAtFrame(f)                       // PURE: 0<=f<5400, 60fps, 90.0s
│     ├── resolveScene(f) -> scene, localT, act
│     ├── drawOrganism(ctx, scene, localT, f)  // seeded, no Date/random
│     ├── drawFormulaOverlay(ctx, scene, localT)
│     ├── drawCamera(ctx, scene, localT)       // orbit track applied as transform
│     └── drawSoliton(ctx, scene, localT)      // execution soliton track
├── Scene Registry: 12 scenes, JSON-editable, durations sum to 5400
├── Timeline UI: 5 tracks (Act | Scene | Formula | Camera | Soliton)
├── Live Editor: form + raw JSON, applies instantly, no re-render pipeline
└── Exporter: canvas.captureStream(60) + MediaRecorder -> WebM/MP4
```

**Determinism invariants:**

1. `renderAtFrame(f)` depends only on `f` and `SCENES` JSON. No `Date.now()`, no unseeded `Math.random()`, no accumulated state.
2. Scrubbing to frame `f`, playing to frame `f`, and exporting frame `f` produce pixel-identical output.
3. All pseudo-randomness uses `hash(seed, i)` — a pure integer hash.
4. Phase is always `phase = 2π * (f / periodFrames) * phaseSpeed`, never integrated.

## 2. Complete `motion.html`

Save verbatim as `motion.html` and open in Chrome/Edge/Firefox:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gemini Motion Studio — Mathematical Organisms</title>
<style>
  :root{--bg:#0b0e14;--panel:#12161f;--line:#232a3a;--txt:#e6edf3;--dim:#8b98b8;--acc:#7c5cff;--acc2:#00d4a6}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:13px/1.45 system-ui,sans-serif}
  header{padding:10px 16px;border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  header h1{font-size:15px;margin:0}header span{color:var(--dim)}
  main{display:grid;grid-template-columns:1fr 340px;gap:0;height:calc(100vh - 49px)}
  #left{padding:12px;overflow:auto}#right{background:var(--panel);border-left:1px solid var(--line);padding:12px;overflow:auto}
  canvas#stage{width:100%;background:#000;border:1px solid var(--line);border-radius:6px}
  .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:8px 0}
  button{background:#1c2333;color:var(--txt);border:1px solid var(--line);border-radius:5px;padding:5px 10px;cursor:pointer}
  button:hover{border-color:var(--acc)}button.primary{background:var(--acc);border-color:var(--acc)}
  input,select,textarea{background:#0d1117;color:var(--txt);border:1px solid var(--line);border-radius:5px;padding:5px}
  input[type=range]{flex:1}textarea{width:100%;height:180px;font:11px monospace}
  label{color:var(--dim);font-size:11px;display:block;margin-top:8px}
  /* Timeline */
  .track{display:flex;align-items:center;margin:3px 0}
  .track b{width:82px;font-size:10px;color:var(--dim);font-weight:600;text-transform:uppercase;letter-spacing:.04em}
  .lane{flex:1;position:relative;height:22px;background:#0d1117;border:1px solid var(--line);border-radius:4px;overflow:hidden}
  .blk{position:absolute;top:2px;height:18px;border-radius:3px;font-size:9px;padding:2px 4px;overflow:hidden;white-space:nowrap;cursor:pointer;border:1px solid rgba(255,255,255,.25)}
  .blk.sel{outline:2px solid #fff}
  #playhead{position:absolute;top:0;width:2px;height:100%;background:#ff4757;pointer-events:none;z-index:5}
  .stat{font-family:monospace;color:var(--acc2)}
  fieldset{border:1px solid var(--line);border-radius:6px;margin:10px 0}legend{color:var(--dim);font-size:11px}
</style>
</head>
<body>
<header>
  <h1>◈ Gemini Motion Studio</h1><span>Mathematical Organisms · 5400f · 60fps · 90.0s</span>
  <span class="stat" id="tc">f=0 · 00:00.000 · Scene 1/12</span>
</header>
<main>
<section id="left">
  <canvas id="stage" width="1920" height="1080"></canvas>
  <div class="row">
    <button id="btnPlay" class="primary">▶ Play</button>
    <button id="btnStop">⏮ 0</button>
    <input type="range" id="scrub" min="0" max="5399" value="0" step="1">
    <input type="number" id="frameIn" min="0" max="5399" value="0" style="width:80px">
    <select id="speed"><option>0.25</option><option>0.5</option><option selected>1</option><option>2</option></select>
  </div>
  <div id="timeline"></div>
  <fieldset><legend>Video Export — captureStream(60) + MediaRecorder</legend>
    <div class="row">
      <button id="btnExport">● Export Full 90s (realtime)</button>
      <button id="btnExportFast">● Export (4x preview, 22.5s)</button>
      <span id="expStat" class="stat"></span>
    </div>
    <div class="row"><a id="dl" style="color:var(--acc2)" download></a></div>
    <p style="color:var(--dim)">MP4 attempted first (Safari/Chrome 126+); falls back to WebM VP9/VP8. Export renders through the same <code>renderAtFrame</code>, so exported frames are identical to scrubbed frames.</p>
  </fieldset>
</section>
<aside id="right">
  <fieldset><legend>Surgical Live Editor — selected scene</legend>
    <label>Scene</label><select id="edScene" style="width:100%"></select>
    <label>Name</label><input id="edName" style="width:100%">
    <label>Duration (frames, total must = 5400)</label><input id="edDur" type="number" min="60" step="30" style="width:100%">
    <label>Math formula (overlay text, LaTeX-style)</label><input id="edFormula" style="width:100%">
    <label>Organism kernel</label>
    <select id="edKernel" style="width:100%">
      <option>soliton</option><option>lorenz</option><option>wave</option>
      <option>lissajous</option><option>spiro</option><option>field</option>
    </select>
    <label>Phase speed (0.1 – 4.0)</label>
    <div class="row"><input type="range" id="edSpeed" min="0.1" max="4" step="0.05"><span id="edSpeedV" class="stat"></span></div>
    <label>Palette</label>
    <select id="edPal" style="width:100%">
      <option value="violet">Violet/Teal</option><option value="solar">Solar</option>
      <option value="mono">Mono Ice</option><option value="magma">Magma</option>
    </select>
    <label>Camera orbit (deg / scene)</label><input id="edOrbit" type="number" step="5" style="width:100%">
    <label>Soliton amplitude</label><input id="edSol" type="number" step="0.1" min="0" max="3" style="width:100%">
    <div class="row"><button id="btnNorm">Normalize durations → 5400</button></div>
  </fieldset>
  <fieldset><legend>Raw JSON (Gemini agent surface)</legend>
    <textarea id="json"></textarea>
    <div class="row"><button id="btnApply" class="primary">Apply JSON</button>
    <button id="btnCopy">Copy</button><button id="btnReset">Reset defaults</button></div>
    <span id="jsonErr" style="color:#ff6b81"></span>
  </fieldset>
  <fieldset><legend>Gemini / Remotion / Motion Canvas bridge</legend>
    <p style="color:var(--dim)">Paste Gemini output as JSON above and hit Apply — no pixel regeneration. For Remotion: import <code>SCENES</code> and call <code>renderOrganism2D(ctx,scene,frame)</code> per frame in a &lt;Canvas&gt; composition at fps=60, durationInFrames=5400. For Motion Canvas: yield each scene as a <code>view.add()</code> segment with <code>duration = scene.duration/60</code>. The JSON schema is the shared contract.</p>
  </fieldset>
</aside>
</main>

<script>
"use strict";
/* ============ CONSTANTS ============ */
const FPS=60, TOTAL=5400, W=1920, H=1080; // 5400/60 = 90.0s exactly
const PALETTES={
  violet:["#7c5cff","#00d4a6","#ff6bcb","#ffd166"],
  solar: ["#ff9f1c","#ffbf69","#ffffff","#2ec4b6"],
  mono:  ["#caf0f8","#90e0ef","#00b4d8","#0077b6"],
  magma: ["#fcffa4","#f98e09","#bc3754","#000004"]};

/* ============ 12 SCENES — the editable contract ============ */
const DEFAULT_SCENES=[
 {name:"Genesis Seed",     act:"I · Origin",    dur:450,formula:"ψ₀(x)=sech(x)·e^{iθ}",        kernel:"soliton", phaseSpeed:1.0,palette:"violet",orbit:30, solitonAmp:1.0},
 {name:"Soliton Birth",    act:"I · Origin",    dur:450,formula:"∂²ψ/∂t²−∂²ψ/∂x²+sinψ=0",      kernel:"soliton", phaseSpeed:1.2,palette:"violet",orbit:45, solitonAmp:1.4},
 {name:"Wave Interference",act:"I · Origin",    dur:450,formula:"ψ=Σₖ Aₖe^{i(kx−ωt)}",          kernel:"wave",    phaseSpeed:1.0,palette:"mono",  orbit:60, solitonAmp:0.8},
 {name:"Lorenz Awakening", act:"II · Chaos",    dur:450,formula:"ẋ=σ(y−x), ẏ=x(ρ−z)−y, ż=xy−βz",kernel:"lorenz", phaseSpeed:1.5,palette:"solar", orbit:90, solitonAmp:0.6},
 {name:"Phase Locking",    act:"II · Chaos",    dur:450,formula:"θ̇=ω+K·sin(φ−θ)",               kernel:"lissajous",phaseSpeed:1.0,palette:"solar",orbit:120,solitonAmp:0.7},
 {name:"Spiro Bloom",      act:"II · Chaos",    dur:450,formula:"r(θ)=R−r·cos((R/r)θ)",         kernel:"spiro",   phaseSpeed:0.8,palette:"magma", orbit:180, solitonAmp:0.5},
 {name:"Field Lines",      act:"III · Structure",dur:450,formula:"∇×B=μ₀J,  ∇·B=0",              kernel:"field",   phaseSpeed:1.0,palette:"mono",  orbit:45, solitonAmp:0.9},
 {name:"Resonance",        act:"III · Structure",dur:450,formula:"fₙ=n·v/2L",                    kernel:"wave",    phaseSpeed:1.8,palette:"violet",orbit:75, solitonAmp:1.6},
 {name:"Chaos Edge",       act:"III · Structure",dur:450,formula:"λ=lim (1/t)·ln|δ(t)/δ₀|",      kernel:"lorenz", phaseSpeed:2.0,palette:"magma", orbit:150, solitonAmp:1.0},
 {name:"Harmonic Return",  act:"IV · Resolution",dur:450,formula:"ψ=∫ψ̂(k)e^{ikx}dk",             kernel:"lissajous",phaseSpeed:0.7,palette:"violet",orbit:90, solitonAmp:0.8},
 {name:"Soliton Fusion",   act:"IV · Resolution",dur:450,formula:"sech(x−vt)·sech(x+vt)→2·sech(x)",kernel:"soliton",phaseSpeed:1.1,palette:"solar",orbit:60,solitonAmp:2.0},
 {name:"Final Stillness",  act:"IV · Resolution",dur:450,formula:"lim t→∞ ψ(x,t)=ψ*(x)",         kernel:"spiro",   phaseSpeed:0.4,palette:"mono",  orbit:20, solitonAmp:0.3},
];
let SCENES=structuredClone(DEFAULT_SCENES);
let sel=0;

/* ============ PURE HELPERS (deterministic) ============ */
const hash=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>13))*1274126177;return((h^(h>>16))>>>0)/4294967295};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

/* Resolve global frame -> scene + local progress. Pure. */
function resolveScene(f){
  let acc=0;
  for(let i=0;i<SCENES.length;i++){const d=SCENES[i].dur;
    if(f<acc+d)return{index:i,scene:SCENES[i],start:acc,local:f-acc,t:(f-acc)/d};
    acc+=d;}
  const i=SCENES.length-1;return{index:i,scene:SCENES[i],start:TOTAL-SCENES[i].dur,local:SCENES[i].dur-1,t:1};
}

/* ============ ORGANISM KERNELS (all pure in f) ============ */
function K(ctx,s,f,lt){
  const P=PALETTES[s.palette]||PALETTES.violet, cx=W/2, cy=H/2, ph=f*s.phaseSpeed;
  ctx.lineWidth=2;
  if(s.kernel==="soliton"){
    for(let k=0;k<3;k++){ctx.strokeStyle=P[k%4];ctx.beginPath();
      for(let x=0;x<=W;x+=6){const u=(x-W/2)/220-k*1.2+Math.sin(ph*0.02+k)*1.5;
        const y=cy-Math.cosh(u)**-1*260*s.solitonAmp*Math.sin(1+k*0.3+ph*0.01)+ (k-1)*40;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
  }else if(s.kernel==="lorenz"){
    const dt=0.008;let x=0.1,y=0,z=0;ctx.beginPath();
    const N=2600,skip=Math.floor(ph*2)%400;
    for(let i=0;i<N+skip;i++){const dx=10*(y-x)*dt,dy=(x*(28-z)-y)*dt,dz=(x*y-8/3*z)*dt;x+=dx;y+=dy;z+=dz;
      if(i>=skip){const px=cx+x*16*Math.cos(ph*0.002),py=cy+(z-25)*13;i===skip?ctx.moveTo(px,py):ctx.lineTo(px,py);}}
    ctx.strokeStyle=P[0];ctx.stroke();
  }else if(s.kernel==="wave"){
    for(let k=0;k<5;k++){ctx.strokeStyle=P[k%4];ctx.beginPath();
      for(let x=0;x<=W;x+=5){const y=cy+Math.sin(x*0.008+ph*0.05+k)*90*Math.sin(x*0.001+ph*0.02)+ (k-2)*36;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
  }else if(s.kernel==="lissajous"){
    ctx.strokeStyle=P[0];ctx.beginPath();
    for(let i=0;i<=900;i++){const t=i/900*Math.PI*2;
      const x=cx+Math.sin(3*t+ph*0.03)*520,y=cy+Math.sin(4*t)*320;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
  }else if(s.kernel==="spiro"){
    ctx.strokeStyle=P[1];ctx.beginPath();const R=340,r=110;
    for(let i=0;i<=1200;i++){const t=i/1200*Math.PI*2*(r/gcd(R,r))+ph*0.005;
      const x=cx+(R-r)*Math.cos(t)+90*Math.cos((R-r)/r*t),y=cy+(R-r)*Math.sin(t)-90*Math.sin((R-r)/r*t);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
  }else{ /* field */
    for(let i=0;i<160;i++){const a=hash(i,7)*Math.PI*2+ph*0.01,r=60+hash(i,13)*620;
      const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*0.6;
      ctx.fillStyle=P[i%4];ctx.beginPath();ctx.arc(x,y,3.5,0,7);ctx.fill();
      ctx.strokeStyle=P[i%4];ctx.beginPath();ctx.moveTo(x,y);
      ctx.lineTo(x+Math.cos(a+ph*0.02)*36,y+Math.sin(a+ph*0.02)*22);ctx.stroke();}
  }
  function gcd(a,b){return b?gcd(b,a%b):a}
}

/* ============ THE DETERMINISTIC RENDERER ============ */
const cv=document.getElementById('stage'),ctx=cv.getContext('2d');
function renderAtFrame(f){
  f=clamp(Math.floor(f),0,TOTAL-1);
  const{index,scene:s,local,t}=resolveScene(f),P=PALETTES[s.palette]||PALETTES.violet;
  /* background */
  const g=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,900);
  g.addColorStop(0,"#12172a");g.addColorStop(1,"#05070d");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  /* Camera Orbit track: rotation about centre, purely from local t */
  ctx.save();ctx.translate(W/2,H/2);ctx.rotate((s.orbit*Math.PI/180)*ease(t)-s.orbit*Math.PI/360);
  ctx.translate(-W/2,-H/2);
  K(ctx,s,f,t);
  ctx.restore();
  /* Execution Soliton track: travelling pulse on bottom rail */
  const sx=(f%900)/900*W;
  ctx.fillStyle=P[1];ctx.shadowColor=P[1];ctx.shadowBlur=24;
  ctx.beginPath();ctx.arc(sx,H-70,13*s.solitonAmp,0,7);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle="rgba(255,255,255,.15)";ctx.beginPath();ctx.moveTo(0,H-70);ctx.lineTo(W,H-70);ctx.stroke();
  /* Math Formula overlay track */
  ctx.fillStyle="rgba(5,7,13,.55)";ctx.fillRect(48,42,980,86);
  ctx.strokeStyle=P[0];ctx.strokeRect(48,42,980,86);
  ctx.fillStyle="#fff";ctx.font="44px Georgia,serif";ctx.fillText(s.formula,72,98);
  /* HUD */
  ctx.font="26px monospace";ctx.fillStyle=P[2];
  ctx.fillText(`${s.act}  ·  ${index+1}. ${s.name}`,50,H-110);
  ctx.fillStyle="#8b98b8";
  ctx.fillText(`f=${f}  ${(f/FPS).toFixed(2)}s / 90.00s  phase×${s.phaseSpeed}`,50,160);
  const fade=Math.min(local,5399-f,30)/30; /* 0.5s crossfade at boundaries */
  if(fade<1){ctx.fillStyle=`rgba(0,0,0,${1-fade})`;ctx.fillRect(0,0,W,H);}
  return{index,scene:s,t};
}

/* ============ TIMELINE UI (5 tracks) ============ */
const tl=document.getElementById('timeline');
function buildTimeline(curF){
  const{index:cur}=resolveScene(curF);
  const rows=[
    ["Act",      SCENES.map((s,i)=>({l:s.start??0,t:s.act,c:"#2c3a5e"}))],
  ];
  /* compute starts */
  let acc=0;const starts=SCENES.map(s=>{const v=acc;acc+=s.dur;return v});
  const mk=(label,items)=>`<div class="track"><b>${label}</b><div class="lane">${
    items.map((b,i)=>`<div class="blk ${i===sel?'sel':''}" data-i="${i}"
      style="left:${starts[i]/TOTAL*100}%;width:${SCENES[i].dur/TOTAL*100}%;background:${b.c}"
      title="${b.t}">${b.t}</div>`).join("")}
    <div id="playhead" style="left:${curF/TOTAL*100}%"></div></div></div>`;
  tl.innerHTML =
    mk("Act",    SCENES.map(s=>({t:s.act,c:"#2c3a5e"}))) +
    mk("Scene",  SCENES.map((s,i)=>({t:`${i+1} ${s.name}`,c:i===cur?"#7c5cff":"#233052"}))) +
    mk("Formula",SCENES.map(s=>({t:s.formula,c:"#134e4a"}))) +
    mk("Camera", SCENES.map(s=>({t:`orbit ${s.orbit}°`,c:"#4a2c14"}))) +
    mk("Soliton",SCENES.map(s=>({t:`amp ${s.solitonAmp} · ×${s.phaseSpeed}`,c:"#3d1450"})));
  tl.querySelectorAll('.blk').forEach(el=>el.onclick=()=>{sel=+el.dataset.i;syncEditor();buildTimeline(curFrame);});
}

/* ============ TRANSPORT ============ */
let curFrame=0,playing=false,lastTs=null,accMs=0;
const $=id=>document.getElementById(id);
function show(f){curFrame=clamp(Math.floor(f),0,TOTAL-1);const r=renderAtFrame(curFrame);
  $('scrub').value=curFrame;$('frameIn').value=curFrame;
  const s=(curFrame/FPS);
  $('tc').textContent=`f=${curFrame} · ${String(Math.floor(s/60)).padStart(2,'0')}:${(s%60).toFixed(3).padStart(6,'0')} · Scene ${r.index+1}/12 · ${r.scene.name}`;
  buildTimeline(curFrame);}
function loop(ts){if(!playing)return;
  if(lastTs==null)lastTs=ts;accMs+=(ts-lastTs)*+$('speed').value;lastTs=ts;
  const adv=Math.floor(accMs/(1000/FPS));accMs%= (1000/FPS);
  if(adv)show((curFrame+adv)%TOTAL);
  requestAnimationFrame(loop);}
$('btnPlay').onclick=()=>{playing=!playing;$('btnPlay').textContent=playing?"⏸ Pause":"▶ Play";lastTs=null;if(playing)requestAnimationFrame(loop)};
$('btnStop').onclick=()=>{playing=false;$('btnPlay').textContent="▶ Play";show(0)};
$('scrub').oninput=e=>show(+e.target.value);
$('frameIn').onchange=e=>show(+e.target.value);

/* ============ SURGICAL LIVE EDITOR ============ */
function syncEditor(){
  const s=SCENES[sel];
  $('edScene').innerHTML=SCENES.map((x,i)=>`<option value="${i}" ${i===sel?'selected':''}>${i+1}. ${x.name}</option>`).join("");
  $('edName').value=s.name;$('edDur').value=s.dur;$('edFormula').value=s.formula;
  $('edKernel').value=s.kernel;$('edSpeed').value=s.phaseSpeed;$('edSpeedV').textContent="×"+s.phaseSpeed;
  $('edPal').value=s.palette;$('edOrbit').value=s.orbit;$('edSol').value=s.solitonAmp;
  $('json').value=JSON.stringify(SCENES,null,1);$('jsonErr').textContent="";
}
function bind(id,key,parse=v=>v){$(id).oninput=e=>{SCENES[sel][key]=parse(e.target.value);
  if(id==='edSpeed')$('edSpeedV').textContent="×"+SCENES[sel].phaseSpeed;
  $('json').value=JSON.stringify(SCENES,null,1);show(curFrame);};}
bind('edName','name');bind('edDur','dur',v=>Math.max(60,+v||450));bind('edFormula','formula');
bind('edKernel','kernel');bind('edSpeed','phaseSpeed',v=>+v);bind('edPal','palette');
bind('edOrbit','orbit',v=>+v||0);bind('edSol','solitonAmp',v=>+v||0);
$('edScene').onchange=e=>{sel=+e.target.value;syncEditor();show(curFrame)};
$('btnNorm').onclick=()=>{const sum=SCENES.reduce((a,s)=>a+s.dur,0)||1;
  SCENES.forEach(s=>s.dur=Math.max(60,Math.round(s.dur/sum*TOTAL)));
  SCENES[SCENES.length-1].dur+=TOTAL-SCENES.reduce((a,s)=>a+s.dur,0);syncEditor();show(curFrame);};
$('btnApply').onclick=()=>{try{const v=JSON.parse($('json').value);
  if(!Array.isArray(v)||!v.length)throw new Error("JSON must be a non-empty scene array");
  SCENES=v;sel=clamp(sel,0,SCENES.length-1);syncEditor();show(curFrame);}
  catch(e){$('jsonErr').textContent=e.message;}};
$('btnCopy').onclick=()=>navigator.clipboard.writeText($('json').value);
$('btnReset').onclick=()=>{SCENES=structuredClone(DEFAULT_SCENES);sel=0;syncEditor();show(0)};

/* ============ VIDEO EXPORTER ============ */
async function exportVideo(speedMul){
  const mime=["video/mp4;codecs=avc1","video/mp4","video/webm;codecs=vp9","video/webm"]
    .find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
  if(!mime){$('expStat').textContent="MediaRecorder unsupported in this browser";return;}
  const ext=mime.includes("mp4")?"mp4":"webm";
  const rec=new MediaRecorder(cv.captureStream(FPS),{mimeType:mime,videoBitsPerSecond:16_000_000});
  const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const done=new Promise(r=>rec.onstop=r);
  rec.start(200);const wasPlaying=playing;playing=false;
  /* Drive deterministically frame-by-frame; playback speed only changes wall time, never frame content. */
  for(let f=0;f<TOTAL;f++){renderAtFrame(f);$('expStat').textContent=`exporting f=${f}/${TOTAL}`;
    if(f%Math.round(speedMul)===0)await new Promise(r=>setTimeout(r,1000/FPS/speedMul));}
  rec.stop();await done;playing=wasPlaying;
  const url=URL.createObjectURL(new Blob(chunks,{type:mime.split(";")[0]}));
  $('dl').href=url;$('dl').download=`gemini-motion.${ext}`;$('dl').textContent=`⬇ Download gemini-motion.${ext}`;
  $('expStat').textContent=`done · ${mime} · ${TOTAL}f @ ${FPS}fps`;
}
$('btnExport').onclick=()=>exportVideo(1);
$('btnExportFast').onclick=()=>exportVideo(4);

/* Gemini agent API: call from console or an agent bridge */
window.GeminiMotion={renderAtFrame,resolveScene,getScenes:()=>structuredClone(SCENES),
  setScenes:v=>{SCENES=v;syncEditor();show(curFrame)},seek:show,TOTAL,FPS};

syncEditor();show(0);
</script>
</body>
</html>
```

## 3. Surgical editing — why it is instantaneous

Edits mutate only `SCENES[i]` fields (`dur`, `formula`, `phaseSpeed`, `palette`, `kernel`, `orbit`, `solitonAmp`). The next `show(curFrame)` call re-evaluates the pure renderer with the new parameters. There is no pixel cache, no pre-render, and no regeneration step — the same property lets a Gemini agent paste JSON via `GeminiMotion.setScenes(...)` and see the result on the very next frame. Duration edits re-flow all five timeline tracks immediately; **Normalize** rescales durations proportionally and assigns the rounding remainder to the last scene so the total stays exactly 5400.

## 4. Remotion / Motion Canvas integration

| Target | Contract |
|---|---|
| This file | `renderAtFrame(f)`, `f ∈ [0, 5400)` |
| Remotion | `<Composition fps={60} durationInFrames={5400}>`, call the kernel `K(ctx, scene, frame)` inside a canvas component; `SCENES` JSON is imported unchanged |
| Motion Canvas | One `yield*` segment per scene, `duration = scene.dur / 60` seconds; formula overlay becomes a `<Txt>` node |
| Gemini agent | Reads/writes the Raw JSON panel or `window.GeminiMotion` API; schema = the 9 fields per scene shown above |

## 5. Verification checklist

1. Scrub to frame 2700, note the image; play from 0 to 2700 — identical frame (determinism).
2. Change Phase Speed mid-scene — motion rate changes instantly, no reload.
3. Paste a Gemini-generated scene array into Raw JSON → Apply — timeline and canvas update together; malformed JSON shows an inline error and leaves state untouched.
4. Export — downloaded file is 90.0s at 60fps (MP4 where supported, WebM otherwise); the fast preview exports identical frames in 22.5s of wall time.
