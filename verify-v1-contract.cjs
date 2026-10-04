'use strict';
const A=require('node:assert/strict'),T=require('./qdl-v1-types.js'),C=require('./qdl-v1-contract.js');let cases=0;
const N=(unit='one')=>({kind:'number',unit}),S={kind:'string'},B={kind:'boolean'},Z={kind:'null'},Ar=element=>({kind:'array',element}),O=element=>({kind:'optional',element}),R=fields=>({kind:'record',fields});
const node=(id,op,inputs,params,type)=>({id,op,inputs,params,type});
const literal=(id,value,type)=>node(id,'literal',[],{value},type),input=(id,type,name=id)=>node(id,'input',[],{name},type),task=(nodes,outputs)=>({format:'qdl-task',version:1,nodes,outputs});
function ok(name,f){f();cases++;}
function bad(name,f,code){let e;try{f()}catch(x){e=x}A.ok(e,name);A.equal(e.code,code,name);A.equal(typeof e.path,'string',name);cases++;}
const evidence=R({source:S,claim:S,value:B}),fresh=R({id:S,source:S,claim:S,value:O(B),kind:S,observedAt:N('tick'),revision:N('revision')}),receipt=R({id:S,operation:S,attempt:S,sequence:N('revision'),status:S,units:N('item')}),item=R({id:S,amount:N('item')});
const matrix=[
 ['literal',[],{value:3},N()],['input',[],{name:'x'},N()],
 ['sum',[Ar(N('L'))],{},N('L')],['mean',[Ar(N())],{},N()],['min',[Ar(N())],{},N()],['max',[Ar(N())],{},N()],
 ['weightedMean',[Ar(N('L')),Ar(N())],{},N('L')],['length',[S],{},N('count')],
 ['map',[Ar(N('L'))],{kind:'square'},Ar(N('L^2'))],['sort',[Ar(N())],{descending:true},Ar(N())],['dedupe',[Ar(S)],{},Ar(S)],
 ['filter',[Ar(N())],{operator:'gte',value:0},Ar(N())],['compare',[N('L')],{operator:'eq',value:2},B],['choose',[B,N(),Z],{},O(N())],
 ['get',[R({a:N('L')})],{path:'a'},N('L')],['clamp',[N('L')],{min:0,max:2},N('L')],
 ['budget',[N('credits'),N('credits')],{},R({allocated:N('credits'),remaining:N('credits')})],
 ['action',[B,S],{allowed:true,action:'local'},R({status:S,action:S,payload:S})],['report',[N(),B],{labels:['n','b']},R({n:N(),b:B})],
 ['bfs',[R({a:Ar(S)}),Ar(S)],{start:'a',goal:'b'},R({found:B,path:Ar(S),distance:O(N('edge'))})],
 ['allocate',[N('item'),Ar(item)],{},R({grants:Ar(R({id:S,requested:N('item'),granted:N('item')})),remaining:N('item')})],
 ['schedule',[Ar(R({id:S,depends:Ar(S),duration:N('second')}))],{},R({order:Ar(S),jobs:Ar(R({id:S,start:N('second'),end:N('second')})),makespan:N('second')})],
 ['consensus',[Ar(R({source:S,choice:S}))],{required:1},R({choice:O(S),support:N('count'),accepted:B,uniqueSources:N('count')})],
 ['retry',[Ar(S)],{maxAttempts:2},R({status:S,attempts:N('count'),history:Ar(S)})],
 ['evidence',[Ar(evidence)],{claim:'ready'},R({state:S,support:N('count'),refute:N('count'),sources:N('count')})],
 ['arithmetic',[N('item'),N('batch^-1')],{kind:'mul'},N('batch^-1*item')],['compareValues',[N('L'),N('L')],{operator:'gt'},B],['all',[Ar(B)],{},B],
 ['select',[Ar(item),R({id:S})],{keys:['id'],order:[{path:'amount',descending:true}],default:{id:'',amount:0}},R({found:B,value:item,index:O(N('count'))})],
 ['evidenceFresh',[Ar(fresh),S,R({now:N('tick'),maxAge:N('tick'),minRevision:N('revision')})],{allowedKinds:['observation']},R({state:S,support:N('count'),refute:N('count'),sources:N('count'),sourceConflicts:Ar(S),used:Ar(fresh),skipped:Ar(R({record:fresh,reason:S}))})],
 ['reconcile',[Ar(receipt),R({operation:S,requested:N('item'),maxAttempts:N('count')})],{},R({state:S,confirmedUnits:N('item'),confirmedAttempts:N('count'),failedAttempts:N('count'),pendingAttempts:N('count'),unknownAttempts:N('count'),attempts:N('count'),mayRetry:B})]
];
for(const [op,types,params,expected] of matrix)bad('closed '+op+' params',()=>C.inferNode(node('n',op,types.map((_,i)=>'in'+i),{...params,unknown:1},expected),types),'unknown-field');
for(const [op,types,params,expected] of matrix)ok('independent '+op+' signature',()=>{const n=node('n',op,types.map((_,i)=>'in'+i),params,expected);A.equal(T.canonical(T.normalize(C.inferNode(n,types))),T.canonical(T.normalize(expected)));const ins=types.map((t,i)=>input('in'+i,t));A.deepEqual(C.validate(task([...ins,n],['n'])).order,[...ins.map(x=>x.id),'n']);});
ok('first-ready authored order',()=>{const g=task([node('sum','sum',['xs'],{},N()),input('xs',Ar(N())),input('flag',B),node('out','report',['sum','flag'],{labels:['sum','flag']},R({sum:N(),flag:B}))],['out']);A.deepEqual(C.validate(g).order,['xs','sum','flag','out']);});
ok('source untouched and normalized ports',()=>{const g=task([input('x',N('L*one'),'measure')],['x']),before=T.canonical(g),v=C.validate(g);A.equal(T.canonical(g),before);A.equal(v.ports[0].type.unit,'L');v.task.nodes[0].params.name='changed';A.equal(g.nodes[0].params.name,'measure');});
ok('no sample execution for empty mean',()=>A.equal(C.validate(task([literal('xs',[],Ar(N())),node('mean','mean',['xs'],{},N())],['mean'])).order.length,2));
ok('computed refinements runtime obligation',()=>C.validate(task([input('x',Ar(N())),node('sum','sum',['x'],{}, {...N(),integer:true,min:0,max:2})],['sum'])));
bad('constant refinement enforced',()=>C.validate(task([literal('x',-1,{...N(),min:0})],['x'])),'refinement');
bad('declared output unit mismatch',()=>C.validate(task([input('x',Ar(N('L'))),node('sum','sum',['x'],{},N('mL'))],['sum'])),'unit-type');
bad('declared output wrong fields',()=>C.validate(task([input('x',N()),input('y',N()),node('b','budget',['x','y'],{},R({allocated:N()}))],['b'])),'unit-type');
bad('unknown top-level field',()=>C.validate({...task([input('x',N())],['x']),name:'extra'}),'unknown-field');
bad('unknown node field',()=>C.validate(task([{...input('x',N()),label:'extra'}],['x'])),'unknown-field');
bad('unknown params',()=>C.validate(task([node('x','input',[],{name:'x',value:1},N())],['x'])),'unknown-field');
bad('duplicate IDs',()=>C.validate(task([input('x',N()),input('x',N())],['x'])),'id');
bad('duplicate names',()=>C.validate(task([input('x',N(),'port'),input('y',N(),'port'),node('out','report',['x','y'],{labels:['x','y']},R({x:N(),y:N()}))],['out'])),'id');
bad('unknown reference',()=>C.validate(task([node('sum','sum',['missing'],{},N())],['sum'])),'reference');
bad('unknown output',()=>C.validate(task([input('x',N())],['missing'])),'reference');
bad('duplicate output',()=>C.validate(task([input('x',N())],['x','x'])),'ports');
bad('cycle',()=>C.validate(task([node('a','length',['b'],{},N('count')),node('b','length',['a'],{},N('count'))],['a'])),'cycle');
bad('unreachable pure input',()=>C.validate(task([input('x',N()),input('y',N())],['x'])),'disconnected');
bad('unsafe ID',()=>C.validate(task([input('constructor',N())],['constructor'])),'id');
bad('unknown opcode',()=>C.validate(task([node('x','JavaScript',[],{},N())],['x'])),'unsupported');
bad('wrong arity',()=>C.validate(task([node('x','all',[],{},B)],['x'])),'ports');
bad('all boolean array required',()=>C.inferNode(node('x','all',['a'],{},B),[B]),'unit-type');
bad('weighted units',()=>C.inferNode(node('x','weightedMean',['a','b'],{},N()),[Ar(N()),Ar(N('kg'))]),'unit-type');
bad('unlike choice',()=>C.inferNode(node('x','choose',['a','b','c'],{},N()),[B,N(),S]),'type');
ok('nullable optional merge',()=>A.equal(T.canonical(C.inferNode(node('x','choose',['a','b','c'],{},O(N())),[B,O(N()),N()])),T.canonical(O(N()))));
bad('evidence requires claim',()=>C.inferNode(node('x','evidence',['a'],{},S),[Ar(evidence)]),'missing');
bad('evidence exact row',()=>C.inferNode(node('x','evidence',['a'],{claim:'a'},S),[Ar(R({...evidence.fields,basis:S}))]),'unit-type');
bad('schedule exact row',()=>C.inferNode(node('x','schedule',['a'],{},S),[Ar(R({id:S,depends:Ar(S),duration:N(),extra:S}))]),'type');
bad('fresh timestamp unit',()=>C.inferNode(node('x','evidenceFresh',['a','b','c'],{allowedKinds:[]},S),[Ar(fresh),S,R({now:N('second'),maxAge:N('tick'),minRevision:N('revision')})]),'unit-type');
bad('fresh kind duplicates',()=>C.inferNode(node('x','evidenceFresh',['a','b','c'],{allowedKinds:['observation','observation']},S),[Ar(fresh),S,R({now:N('tick'),maxAge:N('tick'),minRevision:N('revision')})]),'parameter');
bad('reconcile exact policy',()=>C.inferNode(node('x','reconcile',['a','b'],{},S),[Ar(receipt),R({operation:S,requested:N('item'),maxAttempts:N('count'),extra:B})]),'unit-type');
for(const kind of ['add','sub','min','max'])bad('arithmetic '+kind+' incompatible units',()=>C.inferNode(node('x','arithmetic',['a','b'],{kind},N()),[N('L'),N('mL')]),'unit-type');
for(const kind of ['div','floorDiv'])ok('arithmetic '+kind+' exact quotient units',()=>A.deepEqual(C.inferNode(node('x','arithmetic',['a','b'],{kind},N('batch')),[N('item'),N('batch^-1*item')]),N('batch')));
bad('comparison ordering records',()=>C.inferNode(node('x','compareValues',['a','b'],{operator:'gt'},B),[R({a:N()}),R({a:N()})]),'type');
bad('get optional traversal',()=>C.inferNode(node('x','get',['a'],{path:'a.b'},N()),[R({a:O(R({b:N()}))})]),'type');
bad('prototype path',()=>C.inferNode(node('x','get',['a'],{path:'constructor'},N()),[R({a:N()})]),'parameter');
ok('array own-index path',()=>A.deepEqual(C.inferNode(node('x','get',['a'],{path:'a.0'},N('L')),[R({a:Ar(N('L'))})]),N('L')));
bad('array index bound',()=>C.inferNode(node('x','get',['a'],{path:'a.512'},N()),[R({a:Ar(N())})]),'parameter');
bad('select query exact keys',()=>C.inferNode(node('x','select',['a','b'],{keys:[],order:[],default:{id:'',amount:0}},S),[Ar(item),R({id:S})]),'type');
bad('select default full refinement',()=>C.inferNode(node('x','select',['a','b'],{keys:[],order:[],default:{id:'',amount:-1}},S),[Ar(R({id:S,amount:{...N('item'),min:0}})),R({})]),'refinement');
bad('select order Boolean',()=>C.inferNode(node('x','select',['a','b'],{keys:[],order:[{path:'id',descending:'true'}],default:{id:'',amount:0}},S),[Ar(item),R({})]),'parameter');
const receiptType=R({status:S,action:S,payload:S});
const actionNodes=[literal('guard',true,B),literal('payload','hello',S),node('send','action',['guard','payload'],{allowed:true,action:'local'},receiptType)];
ok('pure guard and payload permitted',()=>C.validate(task(actionNodes,['send'])));
bad('eager false branch action',()=>C.validate(task([...actionNodes,literal('false',false,B),literal('fallback',{status:'skipped',action:'local',payload:'none'},receiptType),node('choose','choose',['false','send','fallback'],{},receiptType)],['choose'])),'eager-effect');
bad('transitive eager action',()=>C.validate(task([...actionNodes,node('status','get',['send'],{path:'status'},S),literal('false',false,B),literal('fallback','none',S),node('choose','choose',['false','status','fallback'],{},S)],['choose'])),'eager-effect');
bad('action payload ancestor',()=>C.validate(task([...actionNodes,node('again','action',['guard','send'],{allowed:true,action:'again'},R({status:S,action:S,payload:receiptType}))],['again'])),'effect-cone');
bad('action guard ancestor',()=>C.validate(task([...actionNodes,node('status','get',['send'],{path:'status'},S),node('yes','compare',['status'],{operator:'eq',value:'simulated'},B),node('again','action',['yes','payload'],{allowed:true,action:'again'},receiptType)],['again'])),'effect-cone');
bad('disconnected action',()=>C.validate(task(actionNodes,['payload'])),'disconnected');
let calls=0;const getter=task([input('x',N())],['x']);Object.defineProperty(getter.nodes[0].params,'name',{get(){calls++;return 'x'},enumerable:true});bad('getter rejection',()=>C.validate(getter),'json');ok('getter not invoked',()=>A.equal(calls,0));
ok('64-node boundary',()=>{const nodes=[input('x',N())];for(let i=1;i<64;i++)nodes.push(node('n'+i,'clamp',[nodes.at(-1).id],{min:0,max:1},N()));A.equal(C.validate(task(nodes,['n63'])).order.length,64);});
bad('65 nodes',()=>C.validate(task(Array.from({length:65},(_,i)=>input('n'+i,N())),['n0'])),'limit');
bad('unit exponent overflow',()=>C.inferNode(node('x','arithmetic',['a','b'],{kind:'mul'},N()),[N('L^99'),N('L')]),'unit');
bad('map square unexpected factor',()=>C.inferNode(node('x','map',['a'],{kind:'square',factor:2},Ar(N())),[Ar(N())]),'unknown-field');
bad('nonstring producer',()=>C.inferNode(node('x','all',[1],{},B),[Ar(B)]),'reference');
ok('structured node path',()=>{try{C.validate(task([input('x',Ar(N('L'))),node('sum','sum',['x'],{},N('mL'))],['sum']))}catch(e){A.equal(e.path,'$.nodes.1.type');return;}A.fail('must reject');});
for(const [op,types,params,expected] of matrix){
 const draft={id:'draft',op,inputs:types.map((_,i)=>'in'+i),params};
 if(op==='literal'||op==='input')bad(op+' inference requires explicit type',()=>C.inferNode(draft,types),'missing');
 else ok(op+' inference without declared type',()=>A.equal(T.canonical(T.normalize(C.inferNode(draft,types))),T.canonical(T.normalize(expected))));
}
bad('admission requires computed node type',()=>C.validate(task([input('x',Ar(N())),{id:'sum',op:'sum',inputs:['x'],params:{}}],['sum'])),'missing');
bad('admission requires literal node type',()=>C.validate(task([{id:'x',op:'literal',inputs:[],params:{value:1}}],['x'])),'missing');
bad('admission requires input node type',()=>C.validate(task([{id:'x',op:'input',inputs:[],params:{name:'x'}}],['x'])),'missing');
console.log('QDL v1 contract: '+cases+' independent cases passed; all 31 opcode signatures checked without kernel execution. Node '+process.version+'.');
