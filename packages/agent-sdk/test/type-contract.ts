import {Runtime,type IntentStep,type CreationResult,type ParseResult} from '../src/index.js';
function constraints(r:Runtime,created:CreationResult,parsed:ParseResult){
 if(created.status==='supported')created.artifact.id;
 if(parsed.status==='supported')parsed.intent.inputs;
 const a=r.dispatch({operation:'compile',intent:{format:'quineling-intent',name:'a',thought:'a',inputs:[{id:'x',value:1,type:{kind:'number',unit:'one'}}],steps:[],outputs:['x']}});a.id;
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
 return [rejected,wrongPorts,missingFactor,ignoredFactor];
}
void constraints;
