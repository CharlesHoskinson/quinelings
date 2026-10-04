import {Session,type Step,type Request,type ExecutionRecord} from '../src/v1.js';
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
void constraints;
