'use strict';
// Authored finite decimal numbers become exact rationals. This is not a verified JSON parser.
const fs=require('node:fs'),assert=require('node:assert/strict'),D=require('../qdl.js'),M=require('../morphology.js');
const target=__dirname+'/../spec/lean/QDL/Fixtures.lean';
const sections={organ:['model','baseRadius','degreeGain','literalGain','amplitudes'],filament:['model','bend','frequencyGain','ripple'],motion:['clock','phaseRate','reducedMotion','rhythm'],ink:['ghostAlpha','secondaryAlpha','ridgeAlpha','neutral'],surface:['model','ribbons','crests','spread','folds','taper','asymmetry','depth','twist','phaseLag','samples'],light:['model','recessAlpha','crestAlpha','depthContrast'],composition:['occupancy','lean','yaw','pitch','focus']};
function rational(n){assert(Number.isFinite(n));const [mantissa,exponent='0']=String(n).split('e'),parts=mantissa.split('.'),digits=parts.join(''),power=(parts[1]?.length||0)-Number(exponent);return power>0?`(${digits} / ${10n**BigInt(power)})`:`(${BigInt(digits)*10n**BigInt(-power)})`;}
function expression(d){D.validate(d);assert.deepEqual(Object.keys(d).sort(),['qdl','family',...Object.keys(sections)].sort());
 const fields=[`formatMarker := ${d.qdl}`,`family := .${d.family}`];
 for(const [section,keys] of Object.entries(sections)){assert.deepEqual(Object.keys(d[section]).sort(),[...keys].sort());const record=[];
  for(const key of keys){const value=d[section][key];if(['model','clock','reducedMotion'].includes(key))continue;
   if(key==='rhythm'){assert.deepEqual(Object.keys(value).sort(),['model','mode','rate','breath','wave','waveNumber','lag','asymmetry','overtone'].sort());const parts=[`mode := .${value.mode}`,...['rate','breath','wave','waveNumber','lag','asymmetry','overtone'].map(k=>`${k} := ${rational(value[k])}`)];record.push(`rhythm := some { ${parts.join(', ')} }`);}
   else if(key==='amplitudes'){record.push(`amplitude₀ := ${rational(value[0])}`,`amplitude₁ := ${rational(value[1])}`);}
   else if(key==='neutral'){const rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));record.push(`neutral := { red := ${rgb[0]}, green := ${rgb[1]}, blue := ${rgb[2]} }`);}
   else record.push(`${key} := ${Number.isInteger(value)?value:rational(value)}`);
  }fields.push(`${section} := { ${record.join(', ')} }`);
 }return '{\n  '+fields.join('\n  ')+'\n}';
}
const ids=JSON.parse(fs.readFileSync(__dirname+'/../programs/manifest.json')),unfold='Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Bounded';
let text='-- Generated from qdl.js and the ten library families. Run npm run lean:fixtures.\nimport QDL.Design\nimport QDL.RhythmDefaults\n\nnamespace QDL.Fixtures\n\n';
text+=`def runtimeDefault : Design := ${expression(D.DEFAULT)}\n\ntheorem runtimeDefault_valid : runtimeDefault.Valid := by\n  norm_num [runtimeDefault, ${unfold}]\n\n`;
const absent=structuredClone(D.DEFAULT);delete absent.motion.rhythm;
const runtimeFallback=structuredClone(absent);runtimeFallback.motion.rhythm=M.motionState({design:absent},0).rhythm;
text+=`def runtimeFallback : Design := ${expression(runtimeFallback)}\n\ntheorem fallback_matches_runtime : runtimeFallback.motion.rhythm = some RhythmDefaults.fallback := by\n  rfl\n\n`;
for(const id of ids){const item=JSON.parse(fs.readFileSync(__dirname+`/../programs/${id}.json`)),name=id.replace(/[^a-zA-Z0-9]/g,'');text+=`def ${name} : Design := ${expression(D.create(item.skin.family))}\n\ntheorem ${name}_valid : ${name}.Valid := by\n  norm_num [${name}, ${unfold}]\n\n`;}
text+=`theorem default_matches_runtime : runtimeDefault = defaultDesign := by\n  rfl\n\nexample : validateDesign { defaultDesign with surface := { defaultDesign.surface with samples := 24001 } } = false := by\n  apply (validateDesign_reject_iff _).mpr\n  norm_num [defaultDesign, ${unfold}]\n\nexample : validateDesign { defaultDesign with composition := { defaultDesign.composition with occupancy := 1 } } = false := by\n  apply (validateDesign_reject_iff _).mpr\n  norm_num [defaultDesign, ${unfold}]\n\nend QDL.Fixtures\n`;
if(process.argv.includes('--check')){assert.equal(fs.readFileSync(target,'utf8'),text,'Lean fixtures are stale; run npm run lean:fixtures.');console.log('Lean fixtures match all ten current QDL profiles.');}else{fs.writeFileSync(target,text);console.log('Generated ten exact-rational Lean QDL fixtures.');}
