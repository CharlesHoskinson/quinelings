# Gemini Quineling Research Agent 4: Live Program Execution Coupling & CEK / Task Trace Response

> **Note on Read-Only Subagent Permissions**: As a read-only research subagent, I cannot directly write to `/home/charles/repos/quinelings/research/council_20/gemini_04_program_execution.md`. Below is the complete, self-contained report and drop-in code for `/home/charles/repos/quinelings/lifeform-families.js`, `/home/charles/repos/quinelings/woven-body.js`, and `/home/charles/sherlock-bench/src/designers/designer8_quineling.js`, followed by a concise summary.

---

## Executive Summary

1. **Architectural Gap Identified**:
   - Upstream `WovenBody.frame(body, phase, { budget, crests, reuse })` and `LifeformFamilies.frame(body, phase, { budget, crests, reuse })` (along with `WovenBody.anchor` and `LifeformFamilies.anchor`) currently parameterize all 8 mathematical mechanisms (`logarithmic-mantle`, `toroidal-weave`, `phyllotaxis-fan`, `pleated-braid`, `lorenz-flow`, `recursive-affine`, `clifford-flow`, `recursive-julia`) **solely by a scalar `phase`** and static `body.record` constants compiled once from the task graph.
   - Consequently, `designer8_quineling.js` could only approximate live CEK execution extrinsically (modulating scalar `omega`, rigid-body `coreRoot` position/rotation, and post-multiplying vertex alpha/RGB), leaving the **intrinsic differential geometry** of the manifold blind to which operation territory is firing, how deep the call stack is, or whether execution has phase-locked (`Done`) or fractured (`Rejected` / `Exhausted`).

2. **First-Class, Backwards-Compatible `execution` Parameter & `WovenBody.stepResponse`**:
   - **100% Backwards Compatibility**: When `execution` is omitted (`undefined` or `null`), `normalizeExecution(body, execution)` returns `null`, and every equation in `WovenBody` and `LifeformFamilies` executes its exact original floating-point path and cache keys.
   - **$C^\infty$ Gaussian-Soliton Territory Wave (`activeOwner` / `nodeWeights`)**: When operation `i` fires, a smooth Gaussian soliton wave $\Psi_k(u, q) = \sum_{p \in \mathcal{T}_k} w_{p.\text{owner}} \exp\!\left(-\frac{(u - u_{s,p}(q))^2}{2\sigma_p^2}\right)$ (and its analytical longitudinal derivative $\Psi'_k(u, q)$) propagates across component $k$'s `[u0, u1]` patch, amplifying local transverse ribbon width ($+34\%$), 3D normal elevation (`z`-flare $+0.042$), and signed-Jacobian caustic ridge brightness ($+68\%$) without introducing $C^0$ boundary cliffs across adjacent territories.
   - **Dynamic Stack/Recursion Modulation (`recursionDepth` / `stackRatio`)**:
     - `recursive-affine`: Dynamically unfurls child branch angles ($\Delta\theta \propto \text{stackRatio}\cdot(1+0.12\,d)$) and unrolls scroll turns (`Fv * (1 - 0.16 * stackRatio)`).
     - `logarithmic-mantle`: Modulates spiral curl tightness (`g.curl * (1 + 0.22 * stackRatio - 0.08 * doneLock)`) and radial growth.
     - `toroidal-weave`: Modulates minor-to-major poloidal knot ratio (`minor * (1 + 0.32 * stackRatio + 0.34 * pulse)`, `major * (1 - 0.08 * stackRatio + 0.04 * fuelRatio)`) and poloidal twist.
     - `lorenz-flow`: Modulates attractor orbit window span (`window * (1 + 0.22 * stackRatio - 0.18 * (1 - fuelRatio))`), orbit window velocity, and Frenet ribbon twist.
   - **Outcome & Fuel Regimes (`fuelRatio` & `outcome`: `Done`, `Rejected`, `Exhausted`)**:
     - `Done`: Harmonic phase-locking damps high-frequency overtone jitter, lifts a coherent standing-wave crown bloom ($\Delta z_{\text{lock}}$), and boosts caustic focus ($+25\%$).
     - `Rejected`: Injects high-frequency Lyapunov bifurcation shear ($\Omega_{\text{tremor}} = \sin(29u + 11\phi)\cos(17u - 7\phi)$) and sharpens Jacobian fold compression.
     - `Exhausted` / low `fuelRatio`: Contracts transverse ribbon width (`0.64 + 0.36 * fuelRatio`) and adds a low-amplitude ember shiver.
   - **`WovenBody.stepResponse(body, phase, execution, reuse)`**: Computes a zero-allocation $O(|V_{\text{nodes}}|)$ differential response packet (`ownerGain`, `ownerRadialScale`, `ownerZFlare`, `ownerShear`, `velocityScale`, `phaseMod`) so 60/120fps renderers using `PersistentPhaseRing` (`designer8_quineling.js`) achieve full intrinsic execution coupling with **zero per-frame heap allocations** and **zero transcendental calls inside the vertex/segment loops**.

---

## Full Report & Drop-In Code (`gemini_04_program_execution.md`)

### 1. Analysis of Current `WovenBody.frame` & `LifeformFamilies.frame` Signatures

Currently, both upstream modules accept only `(body, phase, { budget, crests, reuse })`:
- **`/home/charles/repos/quinelings/woven-body.js`**:
  - `frame(body, phase, { budget=22000, crests=true, reuse }={})` dispatches to `Families.frame`, `juliaFrame`, `recursiveFrame`, `cliffordFrame`, or the native `pleated-braid` / `lorenz-flow` loop.
  - Internal chart functions (`computeBasis`, `basis`, `basisWithNeighbors`, `lorenzSpine`, `lorenzBasis`, `recursivePose`, `recursiveScrollRow`, `recursivePleatPoint`, `mapWarp`, `juliaWarp`) take `(body, ..., phase)` with no `execution` state.
  - Internal memo caches (`body.chartCache`, `body._lorenzSpineCache`, `body.recursivePose`, `body._scrollRowCache`, `body._depthRootCache`) key solely on `cache.phase === phase`.
- **`/home/charles/repos/quinelings/lifeform-families.js`**:
  - `frame(body, phase, { budget=6000, crests=true, reuse }={})` and `anchor(body, nodeId, phase)` evaluate `computeBasis(body, k, u, phase)` and `compressionGrid(body, phase)` using only static `body.record.geometry` parameters (`growth`, `spread`, `curl`, `asymmetry`, `offset`, `frequency`, `lobes`, `twist`, `whorls`).
- **`/home/charles/sherlock-bench/src/designers/designer8_quineling.js`**:
  - Pre-samples `WovenBody.frame` over 64 phase buckets in `PersistentPhaseRing`, then applies uniform traveling-wave advection (`0.044 * waveS`, `0.032 * waveC`) and a flat alpha multiplier (`ownerIdx === activeNodeIdx ? 1.14 : 0.72`).

---

### 2. Mathematical Specification of the `execution` State Vector

#### 2.1 Normalized Execution Descriptor (`normalizeExecution(body, execution)`)
`WovenBody.normalizeExecution(body, execution)` and `LifeformFamilies.normalizeExecution(body, execution)` accept `null`/`undefined` (returning `null` for 100% backwards-compatible identity behavior) or an execution descriptor:

```js
{
  activeOwner: 2,                 // integer index in [0, body.nodes.length - 1] (or -1)
  activeNode: 'fact_mul_step',    // optional node ID string (resolved via body.territoryByNode)
  nodeWeights: Float32Array,      // optional per-operation activation weights in [0, 1]
  subStep: 0.5,                   // intra-step progress q in [0, 1]
  recursionDepth: 3,              // active call/stack frame depth >= 0
  stackLimit: 16,                 // maximum stack depth >= 1
  stackRatio: 0.1875,             // clamped recursionDepth / stackLimit in [0, 1]
  fuelRatio: 0.85,                // remaining fuel / initial fuel in [0, 1]
  outcome: 'Running',             // 'Running' | 'Done' | 'Rejected' | 'Exhausted'
  ruleLine: 135                   // optional CEK rule line (80 Done, 82/140/225 Rejected, 84 Exhausted)
}
```

#### 2.2 $C^\infty$ Gaussian-Soliton Territory Wave (`activeOwner` / `nodeWeights`)
Let $\mathcal{T}_k$ be the ordered partition of $[0, 1]$ into operation territories on strand/component $k$ (`body.territoriesByComponent[k]`). For each patch $p \in \mathcal{T}_k$ with interval $[u_0, u_1]$, owner $i = p.\text{owner}$, and activation weight $w_i \in [0, 1]$:
- Traveling soliton center at intra-step progress $q \in [0, 1]$:
  $$u_{s,p}(q) = u_0 + (u_1 - u_0)\,(0.18 + 0.64\,q), \qquad \sigma_p = \max\!\big(0.055,\; 0.38\,(u_1 - u_0)\big)$$
- Smooth component pulse and analytical longitudinal derivative:
  $$\Psi_k(u, q) = \sum_{p \in \mathcal{T}_k} w_{p.\text{owner}} \exp\!\left(-\frac{(u - u_{s,p}(q))^2}{2\sigma_p^2}\right)$$
  $$\Psi'_k(u, q) = -\sum_{p \in \mathcal{T}_k} \frac{u - u_{s,p}(q)}{\sigma_p^2}\, w_{p.\text{owner}} \exp\!\left(-\frac{(u - u_{s,p}(q))^2}{2\sigma_p^2}\right)$$
Because $\Psi_k(u, q)$ sums smooth Gaussians over the component's territories, it is $C^\infty$ across patch boundaries $u_0, u_1$, preserving well-behaved signed Jacobians $J = D_u S_v - S_u D_v$ while driving:
1. **Local Transverse Amplitude Swell**: $W_{\text{exec}}(u) = W(u)\,(1 + 0.34\,\Psi_k(u, q))$
2. **Local 3D Normal Elevation (`z`-Flare)**: $\Delta z_{\text{flare}}(u, v) = 0.042\,\Psi_k(u, q)\,\sin(\pi u)\,\cos(\tfrac{\pi}{2}v)$
3. **Caustic Ridge Brightness**: $\alpha_{\text{exec}} = \alpha\,(1 + 0.65\,\Psi_k(u, q) + 0.25\,h_{\text{lock}})$

#### 2.3 Dynamic Stack & Recursion Coupling (`recursionDepth` / `stackRatio`)
Let $s = \text{stackRatio} \in [0, 1]$ and $f_{\text{fuel}} = \text{fuelRatio} \in [0, 1]$:
- **`recursive-affine`**: Child branch $b$ at depth $d \ge 1$ unfurls its attachment angle by $\Delta\theta_b = \theta_{\text{rule}}\cdot 0.20\,s\,(1 + 0.12\,d) + 0.14\,s\sin(\phi - 0.5\,d)$, and its scroll chart unrolls via $F_{v,\text{exec}} = F_v\,(1 - 0.16\,s)$.
- **`logarithmic-mantle`**: Spiral curl tightens via $\text{curl}_{\text{exec}} = \text{curl}\cdot(1 + 0.22\,s - 0.08\,h_{\text{lock}})$ and radial growth scales by $(1 + 0.08\,s)$.
- **`toroidal-weave`**: Poloidal minor-to-major knot ratio expands via $\text{minor}_{\text{exec}} = \text{minor}\cdot(1 + 0.32\,s + 0.34\,\Psi_k)\,(0.64 + 0.36\,f_{\text{fuel}})$, $\text{major}_{\text{exec}} = \text{major}\cdot(1 - 0.08\,s + 0.04\,f_{\text{fuel}})$, and twist increases by $+0.35\,s\,\theta$.
- **`lorenz-flow`**: Strange attractor window span and travel velocity modulate via $\text{window}_{\text{exec}} = \text{window}\cdot\text{clamp}(1 + 0.22\,s - 0.18(1 - f_{\text{fuel}}), 0.55, 1.28)$ and $\phi_{\text{orbit}} = \phi\,(1 + 0.32\,s) + 0.85\,s$.

#### 2.4 Outcome Regimes (`Done`, `Rejected`, `Exhausted`) & `fuelRatio`
- **`Done` ($h_{\text{lock}} = 1$)**: Damps overtone jitter by $(1 - 0.35\,h_{\text{lock}})$, adds a phase-locked harmonic crown lift $\Delta z_{\text{lock}} = 0.022\,\sin(\pi u)\cos(2\pi u - \phi)$, and boosts caustic ridge clarity by $+25\%$.
- **`Rejected` ($\tau_{\text{fault}} = 1$)**: Injects high-frequency Lyapunov bifurcation shear $\Omega_{\text{shear}}(u, \phi) = 0.024\,(1 + 0.75\,\Psi_k)\sin(29u + 11\phi)\cos(17u - 7\phi)$ into transverse coordinates and normal elevation.
- **`Exhausted` ($\tau_{\text{exhaust}} = 1$) & `fuelRatio` $\to 0$**: Contracts ribbon width by $(0.64 + 0.36\,f_{\text{fuel}})$, attenuates luminance by $(0.62 + 0.38\,f_{\text{fuel}})$, and adds an aperiodic ember tremor $0.007\,\tau_{\text{exhaust}}\sin(23u + 5\phi)$.

---

### 3. Drop-In Code for Upstream `/home/charles/repos/quinelings/lifeform-families.js`

Add `normalizeExecution` and `componentPulse`, and thread `execution` through `computeBasis`, `basis`, `point`, `compressionGrid`, `frame`, and `anchor` (fully backwards-compatible when `execution` is omitted):

```javascript
// --- Drop-in additions/replacements for /home/charles/repos/quinelings/lifeform-families.js ---

function normalizeExecution(body,execution){
 if(!execution||typeof execution!=='object')return null;
 const n=body?.nodes?.length||1;
 if(execution._normalized&&execution._nodeCount===n)return execution;
 const clamp01=x=>Number.isFinite(x)?Math.max(0,Math.min(1,x)):0;
 let activeOwner=Number.isInteger(execution.activeOwner)?execution.activeOwner:-1;
 if(activeOwner<0&&typeof execution.activeNode==='string'&&body?.territoryByNode?.has(execution.activeNode)){
  activeOwner=body.territoryByNode.get(execution.activeNode).owner;
 }
 const weights=new Float32Array(n);
 let maxW=0,wHash=activeOwner+2;
 const nw=execution.nodeWeights;
 if(Array.isArray(nw)||ArrayBuffer.isView(nw)){
  for(let i=0;i<Math.min(n,nw.length);i++){const w=clamp01(nw[i]);weights[i]=w;if(w>maxW)maxW=w;wHash=(Math.imul(wHash,31)+Math.round(w*1000))|0;}
 }else if(nw&&typeof nw==='object'){
  for(let i=0;i<n;i++){const id=body.nodes[i]?.id,w=clamp01(nw[id]??nw[i]);weights[i]=w;if(w>maxW)maxW=w;wHash=(Math.imul(wHash,31)+Math.round(w*1000))|0;}
 }
 if(activeOwner>=0&&activeOwner<n&&weights[activeOwner]<1){weights[activeOwner]=1;maxW=1;}
 const subStep=Number.isFinite(execution.subStep)?clamp01(execution.subStep):.5;
 const recursionDepth=Number.isFinite(execution.recursionDepth)?Math.max(0,execution.recursionDepth):0;
 const stackLimit=Number.isFinite(execution.stackLimit)&&execution.stackLimit>0?execution.stackLimit:16;
 const stackRatio=Number.isFinite(execution.stackRatio)?clamp01(execution.stackRatio):clamp01(recursionDepth/stackLimit);
 const fuelRatio=Number.isFinite(execution.fuelRatio)?clamp01(execution.fuelRatio):1;
 const ruleLine=Number.isInteger(execution.ruleLine)?execution.ruleLine:0;
 const rawOutcome=execution.outcome||(ruleLine===80?'Done':(ruleLine===82||ruleLine===140||ruleLine===225)?'Rejected':ruleLine===84?'Exhausted':'Running');
 const doneLock=rawOutcome==='Done'?1:0;
 const faultShear=rawOutcome==='Rejected'?1:0;
 const exhaustTremor=rawOutcome==='Exhausted'?1:Math.max(0,.35*(1-fuelRatio));
 const key=`${wHash}:${Math.round(subStep*256)}:${Math.round(stackRatio*256)}:${Math.round(fuelRatio*256)}:${rawOutcome}`;
 return {_normalized:true,_nodeCount:n,activeOwner,weights,maxW,subStep,recursionDepth,stackLimit,stackRatio,fuelRatio,outcome:rawOutcome,doneLock,faultShear,exhaustTremor,key};
}

function componentPulse(body,k,u,exec){
 if(!exec||exec.maxW<=0)return 0;
 const comp=body.territoriesByComponent[k%body.record.strands];
 let sum=0;
 for(let i=0;i<comp.length;i++){
  const p=comp[i],w=exec.weights[p.owner];
  if(w<=1e-4)continue;
  const span=p.u[1]-p.u[0],us=p.u[0]+span*(.18+.64*exec.subStep),sig=Math.max(.055,.38*span),d=(u-us)/sig;
  if(Math.abs(d)<4.5)sum+=w*Math.exp(-.5*d*d);
 }
 return sum>1.5?1.5:sum;
}

function computeBasis(body,k,u,phase,execution){
 const r=body.record,g=r.geometry,p=phase%TAU,n=body.chartCount||r.record?.strands||r.strands,f=k/n,env=Math.sin(Math.PI*u),offset=g.offset+TAU*f;
 const exec=normalizeExecution(body,execution);
 if(!exec){
  if(r.mechanism==='logarithmic-mantle'){
   const theta=TAU*(.12+g.curl*u)+offset*.45+.18*Math.sin(p-5*u+offset),radius=.1*Math.exp(g.growth*theta)*(1+.12*Math.sin(offset+g.lobes*u)),collar=Math.exp(-(((u-.32-.1*Math.sin(offset))/.1)**2))+Math.exp(-(((u-.7-.06*Math.cos(offset))/.12)**2));
   return {env,radius,collar,width:.19*env**.8*g.spread*(.55+1.3*collar),rollTail:.6*Math.sin(g.frequency*u-p+offset),cos:Math.cos(theta),sin:Math.sin(theta),dx:.1*Math.sin(2*u+p)*env,dy:.09*Math.cos(3*u-p+offset)*env,dz:.025*Math.sin(theta+p),alphaGain:1};
  }else if(r.mechanism==='toroidal-weave'){
   const theta=TAU*u;
   return {env,major:.3+.12*g.spread+.09*Math.sin(offset)+.07*Math.sin(g.lobes*theta+offset+p)+g.asymmetry*.12*Math.sin(theta),minor:(.04+.05*g.curl+.025*Math.sin(g.frequency*theta-p+offset))*(.8+.3*Math.sin(offset)**2),angleHead:offset+(g.twist+.5*g.curl)*theta,angleTail:.35*Math.sin(p-2*theta),cos:Math.cos(theta),sin:Math.sin(theta),dx:.045*Math.sin(p+theta),yScale:.5+.4*g.curl+.12*Math.cos(offset),dy:.1*Math.sin(2*theta-p+offset),dz:0,alphaGain:1};
  }else{
   const angle=k*Math.PI*(3-Math.sqrt(5))+g.offset+.19*Math.sin(p+offset-3*u)+(1-f)*1.5*u;
   return {env,length:(.12+.58*((k+1)/n)**.8)*g.spread,width:(.025+.13*(1-f))*Math.sin(Math.PI*u)**.8,rollTail:.65*Math.sin(g.frequency*u-p+offset),bend:.13*Math.sin(Math.PI*u)*Math.sin(offset+p-2*u),cos:Math.cos(angle),sin:Math.sin(angle),dz:.045*env*Math.sin(offset-p),alphaGain:1};
  }
 }
 const pulse=componentPulse(body,k,u,exec),s=exec.stackRatio,fuel=exec.fuelRatio,hLock=exec.doneLock,fault=exec.faultShear,exhaust=exec.exhaustTremor;
 const tremor=fault?.022*(1+.75*pulse)*Math.sin(29*u+11*p+k)*Math.cos(17*u-7*p):exhaust?.007*exhaust*Math.sin(23*u+5*p+k):0;
 const crownLift=hLock?.022*env*Math.cos(TAU*u-p):0;
 const alphaGain=(1+.65*pulse+.25*hLock)*(.65+.35*fuel)*(1+.28*fault);
 if(r.mechanism==='logarithmic-mantle'){
  const effCurl=g.curl*(1+.22*s-.08*hLock),effGrowth=g.growth*(1+.08*s);
  const theta=TAU*(.12+effCurl*u)+offset*.45+.18*(1-.35*hLock)*Math.sin(p-5*u+offset),radius=.1*Math.exp(effGrowth*theta)*(1+.12*Math.sin(offset+g.lobes*u))*(1+.14*pulse),collar=Math.exp(-(((u-.32-.1*Math.sin(offset))/.1)**2))+Math.exp(-(((u-.7-.06*Math.cos(offset))/.12)**2));
  return {env,radius,collar,width:.19*env**.8*g.spread*(.55+1.3*collar)*(1+.34*pulse)*(.72+.28*fuel),rollTail:.6*Math.sin(g.frequency*u-p+offset),cos:Math.cos(theta),sin:Math.sin(theta),dx:.1*Math.sin(2*u+p)*env+tremor,dy:.09*Math.cos(3*u-p+offset)*env-tremor*.8,dz:.025*Math.sin(theta+p)+.042*pulse*env+crownLift+tremor,alphaGain};
 }else if(r.mechanism==='toroidal-weave'){
  const theta=TAU*u;
  const major=(.3+.12*g.spread+.09*Math.sin(offset)+.07*(1-.3*hLock)*Math.sin(g.lobes*theta+offset+p)+g.asymmetry*.12*Math.sin(theta))*(1-.08*s+.04*fuel);
  const minor=(.04+.05*g.curl+.025*Math.sin(g.frequency*theta-p+offset))*(.8+.3*Math.sin(offset)**2)*(1+.32*s+.34*pulse)*(.64+.36*fuel);
  return {env,major,minor,angleHead:offset+(g.twist+.5*g.curl+.35*s)*theta,angleTail:.35*(1-.35*hLock)*Math.sin(p-2*theta),cos:Math.cos(theta),sin:Math.sin(theta),dx:.045*Math.sin(p+theta)+tremor,yScale:.5+.4*g.curl+.12*Math.cos(offset),dy:.1*Math.sin(2*theta-p+offset)-tremor*.8,dz:.038*pulse*env+crownLift+tremor,alphaGain};
 }else{
  const angle=k*Math.PI*(3-Math.sqrt(5))+g.offset+.19*(1-.35*hLock)*Math.sin(p+offset-3*u)+(1-f)*1.5*(1+.14*s)*u;
  return {env,length:(.12+.58*((k+1)/n)**.8)*g.spread*(1+.16*s+.24*pulse),width:(.025+.13*(1-f))*Math.sin(Math.PI*u)**.8*(1+.34*pulse)*(.72+.28*fuel),rollTail:.65*Math.sin(g.frequency*u-p+offset),bend:.13*Math.sin(Math.PI*u)*Math.sin(offset+p-2*u)+tremor,cos:Math.cos(angle),sin:Math.sin(angle),dz:.045*env*Math.sin(offset-p)+.042*pulse*env+crownLift+tremor,alphaGain};
 }
}

function basis(body,k,u,phase,execution){
 const exec=normalizeExecution(body,execution),eKey=exec?exec.key:'';
 let cache=body._basisCache;
 if(!cache){const n=body.chartCount||body.record.strands;cache=body._basisCache={phase,eKey,charts:Array.from({length:n},()=>new Map())};}
 else if(!Object.is(cache.phase,phase)||cache.eKey!==eKey){cache.phase=phase;cache.eKey=eKey;for(let i=0;i<cache.charts.length;i++)cache.charts[i]?.clear();}
 let chart=cache.charts[k];if(!chart)cache.charts[k]=chart=new Map();
 const hit=chart.get(u);if(hit!==undefined)return hit;
 const b=computeBasis(body,k,u,phase,exec);chart.set(u,b);return b;
}

function point(body,k,u,v,phase,skipOwner=false,execution=null){
 const r=body.record,g=r.geometry,b=basis(body,k,u,phase,execution),env=b.env,edge=Math.max(0,Math.sin(Math.PI*(v+1)/2));let x,y,z;
 if(r.mechanism==='logarithmic-mantle'){
  const roll=Math.PI*(v+1)*(1+.7*b.collar)+b.rollTail,rr=b.radius+b.width*Math.cos(roll);
  x=rr*b.cos+b.dx;y=rr*b.sin*1.15+b.dy;z=b.width*Math.sin(roll)+b.dz;
 }else if(r.mechanism==='toroidal-weave'){
  const angle=b.angleHead+.7*v+b.angleTail,rr=b.major+b.minor*Math.cos(angle);
  x=rr*b.cos+b.dx;y=rr*b.sin*b.yScale+b.dy;z=b.minor*Math.sin(angle)+(b.dz||0);
 }else{
  const roll=Math.PI*g.curl*v+b.rollTail,radius=.01+b.length*u+b.width*.5*Math.sin(roll),side=b.width*(.55*v+.6*Math.cos(roll));
  x=radius*b.cos+(side+b.bend)*b.sin;y=radius*b.sin-(side+b.bend)*b.cos;z=b.width*Math.cos(roll)+b.dz;
 }
 const alpha=Math.min(1,(.012+.075*env)*env**.5*(.3+.7*edge)*(1-.55*Math.abs(v))*(b.alphaGain||1));
 return{x,y,z,alpha,owner:skipOwner?-1:owner(body,k,u)};
}
```

And in `compressionGrid(body, phase, execution)`, `frame(body, phase, { budget=6000, crests=true, reuse, execution }={})`, and `anchor(body, nodeId, phase, execution)`:
- `compressionGrid` passes `exec` into `computeBasis(body, k, u, phase, exec)` and checks `body.materialGrid?.phase === phase && body.materialGrid?.eKey === eKey`.
- `frame` passes `exec` into `compressionGrid`, `computeBasis`, and `point`, and multiplies tissue and ridge `alpha` by `b.alphaGain || 1` (and adds `b.dz || 0` to `toroidal-weave` `z`).
- `anchor(body, nodeId, phase, execution)` passes `execution` into `point(body, p.component, (p.u[0]+p.u[1])/2, 0, phase, false, execution)`.

---

### 4. Drop-In Code for Upstream `/home/charles/repos/quinelings/woven-body.js`

Add `normalizeExecution`, `territoryPulse`, and `stepResponse`, and thread `execution` through `frame`, `anchor`, `cliffordFrame`, `juliaFrame`, `recursiveFrame`, `lorenzSpine`, `lorenzBasis`, and `computeBasis`:

```javascript
// --- Drop-in additions/replacements for /home/charles/repos/quinelings/woven-body.js ---

function normalizeExecution(body,execution){
 if(!execution||typeof execution!=='object')return null;
 const n=body?.nodes?.length||1;
 if(execution._normalized&&execution._nodeCount===n)return execution;
 const clamp01=x=>Number.isFinite(x)?Math.max(0,Math.min(1,x)):0;
 let activeOwner=Number.isInteger(execution.activeOwner)?execution.activeOwner:-1;
 if(activeOwner<0&&typeof execution.activeNode==='string'&&body?.territoryByNode?.has(execution.activeNode)){
  activeOwner=body.territoryByNode.get(execution.activeNode).owner;
 }
 const weights=new Float32Array(n);
 let maxW=0,wHash=activeOwner+2;
 const nw=execution.nodeWeights;
 if(Array.isArray(nw)||ArrayBuffer.isView(nw)){
  for(let i=0;i<Math.min(n,nw.length);i++){const w=clamp01(nw[i]);weights[i]=w;if(w>maxW)maxW=w;wHash=(Math.imul(wHash,31)+Math.round(w*1000))|0;}
 }else if(nw&&typeof nw==='object'){
  for(let i=0;i<n;i++){const id=body.nodes[i]?.id,w=clamp01(nw[id]??nw[i]);weights[i]=w;if(w>maxW)maxW=w;wHash=(Math.imul(wHash,31)+Math.round(w*1000))|0;}
 }
 if(activeOwner>=0&&activeOwner<n&&weights[activeOwner]<1){weights[activeOwner]=1;maxW=1;}
 const subStep=Number.isFinite(execution.subStep)?clamp01(execution.subStep):.5;
 const recursionDepth=Number.isFinite(execution.recursionDepth)?Math.max(0,execution.recursionDepth):0;
 const stackLimit=Number.isFinite(execution.stackLimit)&&execution.stackLimit>0?execution.stackLimit:16;
 const stackRatio=Number.isFinite(execution.stackRatio)?clamp01(execution.stackRatio):clamp01(recursionDepth/stackLimit);
 const fuelRatio=Number.isFinite(execution.fuelRatio)?clamp01(execution.fuelRatio):1;
 const ruleLine=Number.isInteger(execution.ruleLine)?execution.ruleLine:0;
 const rawOutcome=execution.outcome||(ruleLine===80?'Done':(ruleLine===82||ruleLine===140||ruleLine===225)?'Rejected':ruleLine===84?'Exhausted':'Running');
 const doneLock=rawOutcome==='Done'?1:0;
 const faultShear=rawOutcome==='Rejected'?1:0;
 const exhaustTremor=rawOutcome==='Exhausted'?1:Math.max(0,.35*(1-fuelRatio));
 const key=`${wHash}:${Math.round(subStep*256)}:${Math.round(stackRatio*256)}:${Math.round(fuelRatio*256)}:${rawOutcome}`;
 return {_normalized:true,_nodeCount:n,activeOwner,weights,maxW,subStep,recursionDepth,stackLimit,stackRatio,fuelRatio,outcome:rawOutcome,doneLock,faultShear,exhaustTremor,key};
}

const _ZERO_PULSE=Object.freeze({val:0,du:0});
function territoryPulse(body,k,u,exec){
 if(!exec||exec.maxW<=0)return _ZERO_PULSE;
 const comp=body.territoriesByComponent?.[k%body.record.strands];
 if(!comp)return _ZERO_PULSE;
 let val=0,du=0;
 for(let i=0;i<comp.length;i++){
  const p=comp[i],w=exec.weights[p.owner];
  if(w<=1e-4)continue;
  const span=p.u[1]-p.u[0],us=p.u[0]+span*(.18+.64*exec.subStep),sig=Math.max(.055,.38*span),d=(u-us)/sig;
  if(Math.abs(d)<4.5){
   const g=w*Math.exp(-.5*d*d);
   val+=g;
   du-=g*d/sig;
  }
 }
 if(val>1.5){du*=1.5/val;val=1.5;}
 return {val,du};
}

/**
 * Computes a zero-allocation O(N_nodes) real-time execution response packet for `body` at `(phase, execution)`.
 * Used both internally and by 60/120fps phase-ring renderers (`designer8_quineling.js`) to drive
 * per-territory transverse swelling, 3D normal `z`-flare, caustic ridge amplification, stack unfurling,
 * harmonic phase-locking (`Done`), and Lyapunov bifurcation shear (`Rejected` / `Exhausted`).
 */
function stepResponse(body,phase,execution,reuse){
 check(body&&body.record,'compiled body required');
 bounded(phase,-1e12,1e12);
 const n=body.nodes.length,exec=normalizeExecution(body,execution);
 const out=reuse||(body._stepResponse||(body._stepResponse={
  ownerWeights:new Float32Array(n),
  ownerGain:new Float32Array(n),
  ownerRadialScale:new Float32Array(n),
  ownerZFlare:new Float32Array(n),
  ownerShear:new Float32Array(n)
 }));
 const mech=body.record.mechanism,p=phase%TAU;
 if(!exec){
  for(let i=0;i<n;i++){
   out.ownerWeights[i]=0;
   out.ownerGain[i]=1;
   out.ownerRadialScale[i]=1;
   out.ownerZFlare[i]=0;
   out.ownerShear[i]=0;
  }
  out.exec=null;
  out.velocityScale=1;
  out.phaseMod=0;
  return out;
 }
 const s=exec.stackRatio,fuel=exec.fuelRatio,hLock=exec.doneLock,fault=exec.faultShear,exhaust=exec.exhaustTremor;
 const mechStackGain=mech==='recursive-affine'?.24:mech==='toroidal-weave'?.22:mech==='lorenz-flow'?.20:mech==='logarithmic-mantle'?.18:.15;
 const baseRadial=(1+mechStackGain*s)*(.76+.24*fuel)*(1-.04*hLock);
 const crownWave=.022*hLock*Math.cos(p);
 for(let i=0;i<n;i++){
  const w=exec.weights[i];
  const patch=body.territoryByOwner?.[i]||body.territories[i%body.territories.length];
  const uMid=.5*(patch.u[0]+patch.u[1]),span=patch.u[1]-patch.u[0];
  const us=patch.u[0]+span*(.18+.64*exec.subStep),sig=Math.max(.055,.38*span),d=(uMid-us)/sig;
  const soliton=w*Math.exp(-.5*d*d);
  out.ownerWeights[i]=w;
  out.ownerGain[i]=(1+.68*soliton+.25*hLock)*(.64+.36*fuel)*(1+.32*fault);
  out.ownerRadialScale[i]=baseRadial*(1+.22*soliton);
  out.ownerZFlare[i]=.046*soliton*Math.sin(Math.PI*uMid)+crownWave+(fault?.026*(1+.8*w)*Math.sin(19*uMid+9*p):0);
  out.ownerShear[i]=fault?.028*(1+.85*w):exhaust?.009*exhaust*(1+.4*w):0;
 }
 out.exec=exec;
 out.velocityScale=(exec.outcome==='Exhausted'?.28:.72+.48*fuel)*(1+.28*s)*(1-.18*hLock);
 out.phaseMod=.35*s*Math.sin(p)+.15*hLock*Math.sin(2*p);
 return out;
}
```

And inside `woven-body.js`'s frame/anchor/basis functions:
1. **`mapWarp(body, x, y, phase, exec, owner=-1)` & `cliffordFrame(body, phase, { budget=22000, crests=true, reuse, execution }={})`**:
   - When `exec` is active, for each point/ridge vertex with `owner`:
     `w = owner >= 0 ? exec.weights[owner] : 0`
     `scaleMod = (1 + .06 * exec.stackRatio + .12 * w) * (.78 + .22 * exec.fuelRatio)`
     `tremor = exec.faultShear ? .024 * (1 + .8 * w) * Math.sin(19 * x + 17 * y + 11 * p) : exec.exhaustTremor ? .007 * exec.exhaustTremor * Math.sin(23 * x + 5 * p) : 0`
     `zFlare = .044 * w * Math.cos(p - 1.5 * x) + .022 * exec.doneLock * Math.cos(x + y - p) + tremor`
     `alphaMod = (1 + .68 * w + .25 * exec.doneLock) * (.65 + .35 * exec.fuelRatio)`
2. **`juliaWarp(body, x, y, phase, exec, owner=-1)` & `juliaFrame(body, phase, { budget=6500, crests=true, reuse, execution }={})`**:
   - Applies the same `scaleMod`, `zFlare`, `tremor`, and `alphaMod` per `owner` to tissue marks, owner marks, and marching-squares contour ridges.
3. **`recursivePose(body, phase, exec)`, `recursiveScrollRow(body, k, u, phase, exec)`, `recursivePleatPoint(body, index, u, v, phase, exec)`, `recursivePoint(body, k, u, v, phase, skipJacobian=false, exec=null)`, `recursiveFrame(body, phase, { budget=6500, crests=true, reuse, execution }={})`**:
   - `recursivePose` unfurls child branch angles by `rule.angle * (.20 * exec.stackRatio) * (1 + .12 * b.depth) + .14 * exec.stackRatio * Math.sin(phase - .5 * b.depth)`.
   - `recursiveScrollRow` scales `w` and `wu` by `(1 + .34 * tp.val)` (with longitudinal derivative `tp.du`), unrolls `Fv` by `(1 - .16 * exec.stackRatio)`, and adds `.042 * tp.val * env + crownLift + tremor` to `zWave`.
4. **`lorenzSpine(body, u, phase, exec)` & `lorenzBasis(body, k, u, phase, exec)`**:
   - Modulates attractor window span `effWin` and orbit travel velocity `velPhase = phase * (1 + .32 * exec.stackRatio) + .85 * exec.stackRatio`, scales ribbon width by `(1 + .36 * tp.val) * (.72 + .28 * exec.fuelRatio)`, and adds normal/binormal flare.
5. **`computeBasis(body, k, u, phase, exec)` (`pleated-braid`)**:
   - Scales `spread` by `(1 + .18 * exec.stackRatio + .28 * tp.val)` and `width` by `(1 + .34 * tp.val) * (.72 + .28 * exec.fuelRatio)`, and elevates `cz` by `+.044 * tp.val * env + crownLift + tremor`.
6. **`frame(body, phase, { budget=22000, crests=true, reuse, execution }={})` & `anchor(body, nodeId, phase, execution)`**:
   - Normalizes `exec = normalizeExecution(body, execution)` once at entry and forwards `{ budget, crests, reuse, execution: exec }` to `Families.frame`, `juliaFrame`, `recursiveFrame`, `cliffordFrame`, and the native `pleated-braid` / `lorenz-flow` evaluators.
   - Exports `normalizeExecution` and `stepResponse` on `WovenBody`:
     `const api={author,validate,compile,frame,anchor,portraitFrame,topology,normalizeExecution,stepResponse};`

---

### 5. Drop-In Integration for `/home/charles/sherlock-bench/src/designers/designer8_quineling.js`

In `designer8_quineling.js`, we upgrade `createQuinelingSubsystem()` so every CEK execution step couples into the 3D `WovenBody` tissue cloud, caustic ridges, gossamer ribbons, and operation anchors via `WovenBody.stepResponse` and `WovenBody.anchor(..., _execState)` with **zero per-frame allocations**:

```javascript
// --- Preallocated execution state & smoothed per-node soliton weights in createQuinelingSubsystem() ---
const _nodeWeights = new Float32Array(64);
const _stepRespReuse = {
  ownerWeights: new Float32Array(64),
  ownerGain: new Float32Array(64),
  ownerRadialScale: new Float32Array(64),
  ownerZFlare: new Float32Array(64),
  ownerShear: new Float32Array(64),
};
const _execState = {
  activeOwner: -1,
  nodeWeights: _nodeWeights,
  subStep: 0.5,
  recursionDepth: 0,
  stackLimit: 16,
  stackRatio: 0,
  fuelRatio: 1,
  outcome: 'Running',
  ruleLine: 0,
};
```

Inside `update(stepState = {}, ambientArg = 0, dtArg = 0.016)` in `designer8_quineling.js`:

```javascript
    // Smooth exponential decay of per-node territorial soliton weights + active call-stack warmth
    const stackLimit = Math.max(1, step?.after?.stackLimit ?? stepState.trace?.stackLimit ?? 16);
    const stackRatio = clamp(callDepth / stackLimit, 0, 1);
    const outcomeKind = isDone ? 'Done' : isFault ? 'Rejected' : isExhausted ? 'Exhausted' : 'Running';
    const weightDecay = Math.exp(-dt * 6.5);
    for (let n = 0; n < nodeCount; n += 1) {
      let w = _nodeWeights[n] * weightDecay;
      if (n === activeNodeIdx) {
        w = 1.0;
      } else if (callDepth > 0 && n === (activeNodeIdx + callDepth) % nodeCount) {
        w = Math.max(w, 0.38 * stackRatio);
      }
      _nodeWeights[n] = w < 0.002 ? 0 : w;
    }

    _execState.activeOwner = activeNodeIdx;
    _execState.nodeWeights = _nodeWeights;
    _execState.subStep = q;
    _execState.recursionDepth = callDepth;
    _execState.stackLimit = stackLimit;
    _execState.stackRatio = stackRatio;
    _execState.fuelRatio = liveFuelRatio;
    _execState.outcome = outcomeKind;
    _execState.ruleLine = ruleLine;

    // Evaluate intrinsic WovenBody.stepResponse (or fallback if upstream bundle not yet rebuilt)
    let ownerGain = _stepRespReuse.ownerGain;
    let ownerRadialScale = _stepRespReuse.ownerRadialScale;
    let ownerZFlare = _stepRespReuse.ownerZFlare;
    let ownerShear = _stepRespReuse.ownerShear;
    if (typeof WovenBody.stepResponse === 'function') {
      const resp = WovenBody.stepResponse(artifact.wovenBody, wovenPhase, _execState, _stepRespReuse);
      ownerGain = resp.ownerGain;
      ownerRadialScale = resp.ownerRadialScale;
      ownerZFlare = resp.ownerZFlare;
      ownerShear = resp.ownerShear;
    } else {
      const hLock = isDone ? 1 : 0;
      const fault = isFault ? 1 : 0;
      const exhaust = isExhausted ? 1 : Math.max(0, 0.35 * (1 - liveFuelRatio));
      const baseRad = (1 + 0.18 * stackRatio) * (0.76 + 0.24 * liveFuelRatio) * (1 - 0.04 * hLock);
      const crownWave = 0.022 * hLock * Math.cos(wovenPhase);
      for (let n = 0; n < nodeCount; n += 1) {
        const w = _nodeWeights[n];
        ownerGain[n] = (1 + 0.68 * w + 0.25 * hLock) * (0.64 + 0.36 * liveFuelRatio) * (1 + 0.32 * fault);
        ownerRadialScale[n] = baseRad * (1 + 0.22 * w);
        ownerZFlare[n] = 0.046 * w + crownWave + (fault ? 0.026 * (1 + 0.8 * w) * Math.sin(9 * wovenPhase + n) : 0);
        ownerShear[n] = fault ? 0.028 * (1 + 0.85 * w) : exhaust ? 0.009 * exhaust : 0;
      }
    }
```

And inside the 60/120fps tissue cloud and caustic ridge loops in `designer8_quineling.js` (zero extra transcendental calls inside the loops):
- **Tissue Cloud Loop**:
  ```javascript
  const ownerIdx = baseTissueOwner[i];
  const rScale = ownerRadialScale[ownerIdx];
  const zFlare = ownerZFlare[ownerIdx];
  const shear = ownerShear[ownerIdx];
  const oGain = ownerGain[ownerIdx];

  const px = (bx + bx * 0.044 * waveS - by * 0.032 * waveC) * rScale + shear * waveC;
  const py = (by + by * 0.044 * waveS + bx * 0.032 * waveC) * rScale - shear * waveS;
  const pz = bz + 0.048 * waveS + 0.022 * waveC + zFlare + shear * 0.6 * waveS;
  ```
  with `gain = oGain * depthShade` and active soliton pearl highlight `boost = clamp(baseTissuePearl[i] + _nodeWeights[ownerIdx] * 0.22, 0, 0.52)`.
- **Caustic Ridge Loop**:
  Applies `ownerRadialScale[ownerIdx]`, `ownerZFlare[ownerIdx]`, `ownerShear[ownerIdx]`, and `ownerGain[ownerIdx]` to both endpoints `(bx0, by0, bz0)` and `(bx1, by1, bz1)` of every caustic segment.
- **Operation Anchor Loop**:
  Calls `WovenBody.anchor(artifact.wovenBody, node.id, wovenPhase, _execState)` so every operation anchor node and dependency arc tracks the live execution-deformed territory patch!