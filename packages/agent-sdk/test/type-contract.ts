import {Runtime,type Intent,type IntentStep,type CreationResult,type ParseResult,type FrameOptions,type CreationOptions,type Frame,type HarmonicGenome} from '../src/index.js';
function constraints(r:Runtime,created:CreationResult,parsed:ParseResult){
 if(created.status==='supported')created.artifact.id;
 if(parsed.status==='supported')parsed.intent.inputs;
 const a=r.dispatch({operation:'compile',intent:{format:'quineling-intent',name:'a',thought:'a',inputs:[{id:'x',value:1,type:{kind:'number',unit:'one'}}],steps:[],outputs:['x']}});a.id;
 // @ts-expect-error outputs name at least one node
 const emptyOutputs:Intent={format:'quineling-intent',name:'a',thought:'a',inputs:[],steps:[],outputs:[]};
 // @ts-expect-error run requires an artifact ID
 r.dispatch({operation:'run'});
 // @ts-expect-error unsupported result cannot carry an artifact
 const rejected:CreationResult={status:'unsupported',artifact:a,diagnostics:[],assumptions:[]};
 // @ts-expect-error sum has one ordered input port
 const wrongPorts:IntentStep={id:'x',op:'sum',inputs:['a','b'],params:{}};
 // @ts-expect-error multiply needs a factor
 const missingFactor:IntentStep={id:'x',op:'map',inputs:['a'],params:{kind:'multiply'}};
 // @ts-expect-error square has no factor parameter
 const ignoredFactor:IntentStep={id:'x',op:'map',inputs:['a'],params:{kind:'square',factor:2}};
 const record=r.run(a.id);const graphOutputs:string[]=record.result.tasks[0]!.graph.outputs;void graphOutputs;
 const tagged=r.exchange({operation:'run',artifactId:a.id});
 if(tagged.operation==='run')tagged.result.result.emitted;
 if(tagged.operation==='inspect')tagged.result.id;
 const posed:FrameOptions={budget:4000,crests:4};
 // @ts-expect-error crests are 2, 3, or 4
 const crest:FrameOptions={crests:5};
 const eight:CreationOptions={repeats:8};
 // @ts-expect-error repeats are 1 through 8
 const repeats:CreationOptions={repeats:9};
 // @ts-expect-error retry maxAttempts are 1 through 8
 const attempts:IntentStep={id:'r',op:'retry',inputs:['a'],params:{maxAttempts:0}};
 const color:Frame['nodeColors'][number]='#aabbcc';
 // @ts-expect-error node colors are hash-prefixed
 const named:Frame['nodeColors'][number]='red';
 const role:Frame['nodeRoles'][number]='input';
 // @ts-expect-error node roles are the closed chroma set
 const other:Frame['nodeRoles'][number]='spine';
 // @ts-expect-error a crest line has 301 samples
 const short:Frame['ridges'][number]['line']=[{x:0,y:0,z:0,nx:0,ny:0,nz:1,owner:0}];
 // @ts-expect-error each harmonic band has 32 bins
 const band:HarmonicGenome['bands'][number]=[0,1,2];
 return [rejected,wrongPorts,missingFactor,ignoredFactor,posed,crest,eight,repeats,attempts,color,named,role,other,short,band,emptyOutputs];
}
void constraints;
