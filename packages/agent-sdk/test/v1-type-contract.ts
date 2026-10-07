import {Session,type Step,type Request,type ExecutionRecord,type Intent,type FrameOptions,type Diagnostic} from '../src/v1.js';
function constraints(session:Session){
 const valid:Step={id:'add',op:'arithmetic',inputs:['a','b'],params:{kind:'add'}};
 // @ts-expect-error arithmetic requires exactly two ordered producers
 const arity:Step={id:'add',op:'arithmetic',inputs:['a'],params:{kind:'add'}};
 // @ts-expect-error unit-aware arithmetic uses a closed operation vocabulary
 const kind:Step={id:'add',op:'arithmetic',inputs:['a','b'],params:{kind:'sqrt'}};
 // @ts-expect-error source evidence must name its claim
 const claim:Step={id:'ev',op:'evidence',inputs:['rows'],params:{}};
 // @ts-expect-error input source nodes require a declared type
 const input:Step={id:'in',op:'input',inputs:[],params:{name:'reading'}};
 // @ts-expect-error square has no factor
 const map:Step={id:'m',op:'map',inputs:['a'],params:{kind:'square',factor:3}};
 // @ts-expect-error run inputs cannot be omitted even for a no-port task
 const run:Request={operation:'run',artifactId:'ql_x',requestId:'key'};
 // @ts-expect-error run must be explicitly keyed
 session.run({artifactId:'ql_x',inputs:{}});
 const record:ExecutionRecord=session.dispatch({operation:'run',artifactId:'ql_x',requestId:'key',inputs:{}});
 const verified=session.dispatch({operation:'verify',artifactId:'ql_x'});verified.source;
 // @ts-expect-error verification returns no run occurrence
 verified.result;
 void [valid,arity,kind,claim,input,map,run,record];
}
function ranges(intent:Intent,options:FrameOptions,diagnostic:Diagnostic){
 const crests:FrameOptions={crests:4,budget:4000};
 // @ts-expect-error crest count is 2, 3, or 4
 const lowCrests:FrameOptions={crests:1};
 // @ts-expect-error crest count is 2, 3, or 4
 const highCrests:FrameOptions={crests:5};
 const repeats:Intent={...intent,repeats:8};
 // @ts-expect-error repeats is an integer from 1 through 8
 const zeroRepeats:Intent={...intent,repeats:0};
 // @ts-expect-error repeats is an integer from 1 through 8
 const nineRepeats:Intent={...intent,repeats:9};
 // @ts-expect-error outputs name at least one node
 const emptyOutputs:Intent={...intent,outputs:[]};
 const fresh:Step={id:'fresh',op:'evidenceFresh',inputs:['a','b','c'],params:{allowedKinds:['observation']}};
 // @ts-expect-error evidence kinds are observation, testimony, or inference
 const badKind:Step={id:'fresh',op:'evidenceFresh',inputs:['a','b','c'],params:{allowedKinds:['rumor']}};
 const chosen:Step={id:'pick',op:'select',inputs:['rows','keys'],params:{keys:['id'],order:[],default:{}}};
 // @ts-expect-error select default is a record
 const badDefault:Step={id:'pick',op:'select',inputs:['rows','keys'],params:{keys:['id'],order:[],default:1}};
 const retry:Step={id:'again',op:'retry',inputs:['task'],params:{maxAttempts:8}};
 // @ts-expect-error retry maxAttempts is an integer from 1 through 8
 const tooMany:Step={id:'again',op:'retry',inputs:['task'],params:{maxAttempts:9}};
 const seen:Diagnostic={...diagnostic,occurrence:7};
 // @ts-expect-error an occurrence index is 0 through 7
 const late:Diagnostic={...diagnostic,occurrence:8};
 void [crests,lowCrests,highCrests,repeats,zeroRepeats,nineRepeats,emptyOutputs,fresh,badKind,chosen,badDefault,retry,tooMany,seen,late,options];
}
void constraints;
void ranges;
