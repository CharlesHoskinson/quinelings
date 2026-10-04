(function(root){
'use strict';
// All City-shaped examples use synthetic supplied snapshots. These recipes
// produce quotes, readiness assessments and local simulation receipts only.
const N=(unit='one',min)=>({kind:'number',unit,...(min===undefined?{}:{min})}),Nat=unit=>({kind:'number',unit,integer:true,min:0}),S={kind:'string'},B={kind:'boolean'},A=element=>({kind:'array',element}),R=fields=>({kind:'record',fields});
const evidence=R({id:S,source:S,claim:S,value:{kind:'optional',element:B},kind:{kind:'string',enum:['observation','testimony','inference']},observedAt:Nat('tick'),revision:Nat('revision')});
const clock=R({now:Nat('tick'),maxAge:Nat('tick'),minRevision:Nat('revision')});
const receipt=R({id:S,operation:S,attempt:S,sequence:Nat('revision'),status:{kind:'string',enum:['confirmed','failed','pending','unknown']},units:Nat('item')});
const clone=x=>JSON.parse(JSON.stringify(x));
function builder(id,name,description){
 const inputs=[],steps=[],outputs=[];
 const input=(id,type)=>{inputs.push({id,name:id,type});return id;};
 const constant=(id,value,type)=>{inputs.push({id,value,type});return id;};
 const step=(id,op,args,params={},type)=>{steps.push({id,op,inputs:args,params,...(type?{type}:{})});return id;};
 const get=(id,from,path,type)=>step(id,'get',[from],{path},type);
 const and=(id,a,b)=>step(id,'choose',[a,b,'no']);
 const report=(id,args,labels)=>step(id,'report',args,{labels});
 function finish(result,fixtures,completion){
  outputs.push(...result);const nodes=[...inputs,...steps].map(x=>x.id),runtime=inputs.filter(x=>Object.hasOwn(x,'name'));
  const thought={observations:runtime.map(x=>({id:'ob_'+x.id,text:'Supplied synthetic snapshot: '+x.id+'. Its provenance and freshness remain caller obligations.',input:x.id,path:[],basis:'open'})),evidence:[],goals:completion?[{id:'goal',text:description,outputs:[...outputs],completion}]:[],decisions:completion?[{id:'decision',text:'Read the recorded Boolean result before making a new external decision.',guard:completion,evidence:[]}]:[],plans:[{id:'plan',text:description,tasks:['task']}],tasks:[{id:'task',text:description,nodes,outputs:[...outputs]}]};
  return {id,name,description,intent:{format:'qdl-intent',version:1,name,thought,inputs,steps,outputs},fixtures};
 }
 return {input,constant,step,get,and,report,finish};
}
const programs=[];
{
 const b=builder('gather-readiness','Gather readiness','Check six ordered supplied facts: skill, route, reservation, capacity, owner permission and remaining uses; check a bounded freshness window and simulate one gather proposal. A proposal is not a confirmed haul.');
 b.input('checks',{kind:'array',element:B,minLength:6,maxLength:6});b.input('observedAt',Nat('tick'));b.input('now',Nat('tick'));b.input('maxAge',Nat('tick'));b.constant('no',false,B);b.constant('quantity',3,Nat('item'));
 b.step('eligible','all',['checks']);b.step('notFuture','compareValues',['observedAt','now'],{operator:'lte'});b.step('safeTime','arithmetic',['observedAt','now'],{kind:'min'},Nat('tick'));b.step('age','arithmetic',['now','safeTime'],{kind:'sub'},Nat('tick'));b.step('young','compareValues',['age','maxAge'],{operator:'lte'});b.and('fresh','notFuture','young');b.and('ready','fresh','eligible');b.step('proposal','action',['ready','quantity'],{allowed:true,action:'gather-proposal'});
 const yes=[true,true,true,true,true,true],base={checks:yes,observedAt:10,now:12,maxAge:2};
 const expected=status=>[{status,action:'gather-proposal',payload:3},status==='simulated'];
 programs.push(b.finish(['proposal','ready'],[
  {name:'inclusive freshness boundary',inputs:base,expectedOutputs:expected('simulated')},
  {name:'resource reserved check',inputs:{...base,checks:[true,true,false,true,true,true]},expectedOutputs:expected('skipped')},
  {name:'stale observation',inputs:{...base,now:13},expectedOutputs:expected('skipped')},
  {name:'future observation',inputs:{...base,observedAt:14},expectedOutputs:expected('skipped')},
  {name:'missing required snapshot',inputs:{checks:yes,now:12,maxAge:2},expectedStatus:'refused',expectedDiagnostic:'missing-input'}
 ],'ready'));
}
{
 const b=builder('craft-quote','Bounded craft quote','Quote at most the requested batches for a fixed two-ore, one-wood recipe and two-space net output. Predicted consumption is never inventory mutation.');
 const material=R({id:S,amount:Nat('item')});b.input('inventory',{...A(material),uniqueBy:'id'});b.input('requested',Nat('batch'));b.input('freeCapacity',Nat('space'));b.constant('oreQuery',{id:'ore'},R({id:S}));b.constant('woodQuery',{id:'wood'},R({id:S}));b.constant('oreNeed',2,Nat('batch^-1*item'));b.constant('woodNeed',1,Nat('batch^-1*item'));b.constant('netSpace',2,Nat('batch^-1*space'));
 for(const id of ['ore','wood']){b.step(id,'select',['inventory',id+'Query'],{keys:['id'],order:[],default:{id:'',amount:0}});b.get(id+'Amount',id,'value.amount',Nat('item'));b.step(id+'Bound','arithmetic',[id+'Amount',id+'Need'],{kind:'floorDiv'},Nat('batch'));}
 b.step('spaceBound','arithmetic',['freeCapacity','netSpace'],{kind:'floorDiv'},Nat('batch'));b.step('materialBound','arithmetic',['oreBound','woodBound'],{kind:'min'},Nat('batch'));b.step('capacityBound','arithmetic',['materialBound','spaceBound'],{kind:'min'},Nat('batch'));b.step('feasible','arithmetic',['capacityBound','requested'],{kind:'min'},Nat('batch'));b.step('oreUsed','arithmetic',['feasible','oreNeed'],{kind:'mul'},Nat('item'));b.step('woodUsed','arithmetic',['feasible','woodNeed'],{kind:'mul'},Nat('item'));b.report('quote',['requested','feasible','oreUsed','woodUsed'],['requested','feasible','oreUsed','woodUsed']);b.step('fullRequest','compareValues',['feasible','requested'],{operator:'eq'});
 programs.push(b.finish(['quote','fullRequest'],[
  {name:'capacity binds',inputs:{inventory:[{id:'ore',amount:7},{id:'wood',amount:8}],requested:4,freeCapacity:5},expectedOutputs:[{requested:4,feasible:2,oreUsed:4,woodUsed:2},false]},
  {name:'materials bind',inputs:{inventory:[{id:'ore',amount:7},{id:'wood',amount:8}],requested:4,freeCapacity:100},expectedOutputs:[{requested:4,feasible:3,oreUsed:6,woodUsed:3},false]},
  {name:'absent ore is explicit empty data',inputs:{inventory:[{id:'wood',amount:8}],requested:4,freeCapacity:100},expectedOutputs:[{requested:4,feasible:0,oreUsed:0,woodUsed:0},false]},
  {name:'zero request',inputs:{inventory:[],requested:0,freeCapacity:0},expectedOutputs:[{requested:0,feasible:0,oreUsed:0,woodUsed:0},true]},
  {name:'negative inventory refused',inputs:{inventory:[{id:'ore',amount:-1}],requested:1,freeCapacity:3},expectedStatus:'refused',expectedDiagnostic:'refinement'}
 ],'fullRequest'));
}
{
 const b=builder('confirmed-checkpoints','Confirmed checkpoints','Require fresh observation support for both haul and arrival checkpoints. Testimony, stale claims and conflict do not complete the supplied mission.');
 b.input('records',A(evidence));b.input('clock',clock);b.constant('haulClaim','haul',S);b.constant('arrivalClaim','arrival',S);b.constant('no',false,B);
 for(const id of ['haul','arrival']){b.step(id,'evidenceFresh',['records',id+'Claim','clock'],{allowedKinds:['observation']});b.get(id+'State',id,'state');b.step(id+'Confirmed','compare',[id+'State'],{operator:'eq',value:'supported'});}
 b.and('completed','haulConfirmed','arrivalConfirmed');b.report('checkpointStates',['haulState','arrivalState'],['haul','arrival']);
 const r=(id,claim,value=true,kind='observation',observedAt=10)=>({id,source:id,claim,value,kind,observedAt,revision:1}),c={now:12,maxAge:2,minRevision:1};
 programs.push(b.finish(['checkpointStates','completed'],[
  {name:'both confirmed',inputs:{records:[r('a','haul'),r('b','arrival')],clock:c},expectedOutputs:[{haul:'supported',arrival:'supported'},true]},
  {name:'testimony is not checkpoint confirmation',inputs:{records:[r('a','haul',true,'testimony'),r('b','arrival')],clock:c},expectedOutputs:[{haul:'unknown',arrival:'supported'},false]},
  {name:'stale checkpoint',inputs:{records:[r('a','haul',true,'observation',9),r('b','arrival')],clock:c},expectedOutputs:[{haul:'unknown',arrival:'supported'},false]},
  {name:'contradictory checkpoint',inputs:{records:[r('a','haul'),r('z','haul',false),r('b','arrival')],clock:c},expectedOutputs:[{haul:'conflict',arrival:'supported'},false]}
 ],'completed'));
}
{
 const b=builder('evidence-ledger','Fresh evidence ledger','Assess exactly one supplied claim, retaining used and skipped records and same-source contradictions. Source strings do not establish independent or authentic witnesses.');
 b.input('records',A(evidence));b.input('claim',S);b.input('clock',clock);b.step('ledger','evidenceFresh',['records','claim','clock'],{allowedKinds:['observation','testimony','inference']});
 const r=(id,value,observedAt=0)=>({id,source:'sensor',claim:'ready',value,kind:'observation',observedAt,revision:2}),c={now:10,maxAge:10,minRevision:2};const a=r('a',true),z=r('z',false),unknown=r('u',null);
 const empty={state:'unknown',support:0,refute:0,sources:0,sourceConflicts:[],used:[],skipped:[]};
 programs.push(b.finish(['ledger'],[
  {name:'no supplied evidence',inputs:{records:[],claim:'ready',clock:c},expectedOutputs:[empty]},
  {name:'inclusive age and revision',inputs:{records:[a],claim:'ready',clock:c},expectedOutputs:[{state:'supported',support:1,refute:0,sources:1,sourceConflicts:[],used:[a],skipped:[]}]},
  {name:'same source contradiction retained',inputs:{records:[a,z],claim:'ready',clock:c},expectedOutputs:[{state:'conflict',support:1,refute:1,sources:1,sourceConflicts:['sensor'],used:[a,z],skipped:[]}]},
  {name:'unknown value remains unknown',inputs:{records:[unknown],claim:'ready',clock:c},expectedOutputs:[{...empty,skipped:[{record:unknown,reason:'unknown'}]}]},
  {name:'stale value remains unavailable',inputs:{records:[a],claim:'ready',clock:{...c,now:11}},expectedOutputs:[{...empty,skipped:[{record:a,reason:'stale'}]}]}
 ]));
}
{
 const b=builder('route-preview','Reachable route preview','Find an adjacency-order shortest edge route in a supplied four-node map. Freshness and reachability guard a local walking proposal; route previews are not arrival.');
 b.input('streets',R({A:A(S),B:A(S),C:A(S),D:A(S)}));b.input('blocked',A(S));b.input('current',B);b.constant('no',false,B);b.step('route','bfs',['streets','blocked'],{start:'A',goal:'D'});b.get('found','route','found');b.and('ready','current','found');b.get('path','route','path');b.step('proposal','action',['ready','path'],{allowed:true,action:'walk-proposal'});
 const streets={A:['C','B'],B:['D'],C:['D'],D:[]},route={found:true,path:['A','C','D'],distance:2},miss={found:false,path:[],distance:null};
 programs.push(b.finish(['route','proposal','ready'],[
  {name:'stable neighbor order',inputs:{streets,blocked:[],current:true},expectedOutputs:[route,{status:'simulated',action:'walk-proposal',payload:['A','C','D']},true]},
  {name:'blocked goal',inputs:{streets,blocked:['D'],current:true},expectedOutputs:[miss,{status:'skipped',action:'walk-proposal',payload:[]},false]},
  {name:'stale route snapshot',inputs:{streets,blocked:[],current:false},expectedOutputs:[route,{status:'skipped',action:'walk-proposal',payload:['A','C','D']},false]}
 ],'ready'));
}
{
 const b=builder('trade-preview','Current offer quote','Quote a supplied current offer only when quantity, stock, inventory and allowance permit it. Inventory crystals are a symbolic City quantity; this quote performs no settlement.');
 const offer=R({id:S,price:N('crystal*item^-1',0),expiry:Nat('tick'),available:Nat('item')});b.input('offers',{...A(offer),uniqueBy:'id'});b.input('now',Nat('tick'));b.input('quantity',Nat('item'));b.input('inventory',Nat('item'));b.input('allowance',Nat('item'));b.constant('query',{id:'offer'},R({id:S}));b.constant('no',false,B);b.constant('zeroCrystal',0,Nat('crystal'));b.constant('zeroItem',0,Nat('item'));
 b.step('offer','select',['offers','query'],{keys:['id'],order:[],default:{id:'',price:0,expiry:0,available:0}});b.get('found','offer','found');b.get('price','offer','value.price');b.get('expiry','offer','value.expiry',Nat('tick'));b.get('stock','offer','value.available',Nat('item'));b.step('unexpired','compareValues',['now','expiry'],{operator:'lte'});b.step('hasInventory','compareValues',['quantity','inventory'],{operator:'lte'});b.step('hasStock','compareValues',['quantity','stock'],{operator:'lte'});b.step('withinAllowance','compareValues',['quantity','allowance'],{operator:'lte'});b.step('positive','compare',['quantity'],{operator:'gt',value:0});b.and('a','found','unexpired');b.and('b','a','hasInventory');b.and('c','b','hasStock');b.and('d','c','withinAllowance');b.and('ready','d','positive');b.step('rawProceeds','arithmetic',['price','quantity'],{kind:'mul'});b.step('proceeds','choose',['ready','rawProceeds','zeroCrystal']);b.step('quotedQuantity','choose',['ready','quantity','zeroItem']);b.report('quote',['ready','quotedQuantity','proceeds'],['ready','quantity','predictedProceeds']);
 const base={offers:[{id:'offer',price:3,expiry:10,available:5}],now:10,quantity:2,inventory:5,allowance:2},no={ready:false,quantity:0,predictedProceeds:0};
 programs.push(b.finish(['quote','ready'],[
  {name:'inclusive live-offer boundary',inputs:base,expectedOutputs:[{ready:true,quantity:2,predictedProceeds:6},true]},
  {name:'expired offer',inputs:{...base,now:11},expectedOutputs:[no,false]},
  {name:'absent offer',inputs:{...base,offers:[]},expectedOutputs:[no,false]},
  {name:'allowance exhausted',inputs:{...base,allowance:1},expectedOutputs:[no,false]}
 ],'ready'));
}
{
 const b=builder('needs-triage','Hunger and food triage','Choose fresh supplied edible food by restoration descending and stable item ID. Hunger and current needs guard a local proposal; no item is consumed by this recipe.');
 const food=R({id:S,edible:B,fresh:B,restoration:Nat('one')});b.input('foods',{...A(food),uniqueBy:'id'});b.input('hunger',Nat('one'));b.input('current',B);b.constant('query',{edible:true,fresh:true},R({edible:B,fresh:B}));b.constant('no',false,B);b.constant('emptyId','',S);b.step('food','select',['foods','query'],{keys:['edible','fresh'],order:[{path:'restoration',descending:true},{path:'id',descending:false}],default:{id:'',edible:false,fresh:false,restoration:0}});b.get('found','food','found');b.get('chosenId','food','value.id');b.step('hungry','compare',['hunger'],{operator:'gt',value:0});b.and('validNeed','current','hungry');b.and('ready','validNeed','found');b.step('itemId','choose',['ready','chosenId','emptyId']);b.step('proposal','action',['ready','itemId'],{allowed:true,action:'eat-proposal'});
 const foods=[{id:'b',edible:true,fresh:true,restoration:8},{id:'a',edible:true,fresh:true,restoration:8}],base={foods,hunger:4,current:true};
 const expected=(status,payload)=>[{status,action:'eat-proposal',payload},status==='simulated'];
 programs.push(b.finish(['proposal','ready'],[
  {name:'stable item ID breaks restoration tie',inputs:base,expectedOutputs:expected('simulated','a')},
  {name:'no hunger',inputs:{...base,hunger:0},expectedOutputs:expected('skipped','')},
  {name:'absent food',inputs:{...base,foods:[]},expectedOutputs:expected('skipped','')},
  {name:'stale needs',inputs:{...base,current:false},expectedOutputs:expected('skipped','')}
 ],'ready'));
}
{
 const b=builder('receipt-reconciliation','Partial result reconciliation','Reconcile supplied attempt history without dispatching or retrying. Preserve partial confirmed units and stop advice on pending or unknown results.');
 b.input('receipts',A(receipt));b.input('policy',R({operation:S,requested:Nat('item'),maxAttempts:{...Nat('count'),min:1,max:8}}));b.step('result','reconcile',['receipts','policy']);
 const r=(id,attempt,status,units=0,sequence=1)=>({id,operation:'craft',attempt,sequence,status,units}),policy={operation:'craft',requested:3,maxAttempts:4};
 const expected=(state,confirmedUnits,confirmedAttempts,failedAttempts,pendingAttempts,unknownAttempts,attempts,mayRetry)=>({state,confirmedUnits,confirmedAttempts,failedAttempts,pendingAttempts,unknownAttempts,attempts,mayRetry});
 const a=r('a','attempt1','confirmed',1),z=r('z','attempt2','unknown');
 programs.push(b.finish(['result'],[
  {name:'no attempts yet',inputs:{receipts:[],policy},expectedOutputs:[expected('ready',0,0,0,0,0,0,true)]},
  {name:'partial confirmations and exhausted fourth',inputs:{receipts:[a,r('b','attempt2','confirmed',1),r('c','attempt3','confirmed',1),r('d','attempt4','failed')],policy:{...policy,requested:4}},expectedOutputs:[expected('exhausted',3,3,1,0,0,4,false)]},
  {name:'unknown stops retry advice',inputs:{receipts:[a,z],policy},expectedOutputs:[expected('unknown',1,1,0,0,1,2,false)]},
  {name:'pending is not confirmation',inputs:{receipts:[r('p','attempt1','pending')],policy},expectedOutputs:[expected('pending',0,0,0,1,0,1,false)]},
  {name:'duplicate acknowledgement counted once',inputs:{receipts:[a,a],policy:{...policy,requested:1}},expectedOutputs:[expected('completed',1,1,0,0,0,1,false)]},
  {name:'terminal regression is failed evaluation',inputs:{receipts:[a,r('later','attempt1','pending',0,2)],policy},expectedStatus:'failed',expectedDiagnostic:'receipt-conflict'}
 ]));
}
{
 const b=builder('water-total','Water measurement total','Sum supplied nonnegative liter measurements and report their count. The recipe has no hidden sensors, unit conversion or persistent accumulator.');
 b.input('readings',A(N('L',0)));b.step('total','sum',['readings']);b.step('count','length',['readings']);b.report('summary',['total','count'],['liters','measurements']);
 programs.push(b.finish(['summary'],[
  {name:'ordinary readings',inputs:{readings:[1.5,2,0.5]},expectedOutputs:[{liters:4,measurements:3}]},
  {name:'empty observation batch',inputs:{readings:[]},expectedOutputs:[{liters:0,measurements:0}]},
  {name:'one supplied observation',inputs:{readings:[2.25]},expectedOutputs:[{liters:2.25,measurements:1}]},
  {name:'negative reading refused',inputs:{readings:[-1]},expectedStatus:'refused',expectedDiagnostic:'refinement'}
 ]));
}
{
 const b=builder('work-schedule','Bounded work schedule','Predict dependency-ordered start/end ticks and compare makespan with a supplied deadline. This schedule does not reserve workstations or confirm work completion.');
 b.input('jobs',A(R({id:S,depends:A(S),duration:Nat('tick')})));b.input('deadline',Nat('tick'));b.step('schedule','schedule',['jobs']);b.get('makespan','schedule','makespan',Nat('tick'));b.step('withinDeadline','compareValues',['makespan','deadline'],{operator:'lte'});
 const jobs=[{id:'a',depends:[],duration:3},{id:'b',depends:['a'],duration:2},{id:'c',depends:[],duration:4}],out={order:['a','b','c'],jobs:[{id:'a',start:0,end:3},{id:'b',start:3,end:5},{id:'c',start:0,end:4}],makespan:5};
 programs.push(b.finish(['schedule','withinDeadline'],[
  {name:'parallel work and inclusive deadline',inputs:{jobs,deadline:5},expectedOutputs:[out,true]},
  {name:'missed deadline',inputs:{jobs,deadline:4},expectedOutputs:[out,false]},
  {name:'empty schedule',inputs:{jobs:[],deadline:0},expectedOutputs:[{order:[],jobs:[],makespan:0},true]},
  {name:'cyclic supplied jobs fail evaluation',inputs:{jobs:[{id:'a',depends:['b'],duration:1},{id:'b',depends:['a'],duration:1}],deadline:5},expectedStatus:'failed',expectedDiagnostic:'refinement'}
 ],'withinDeadline'));
}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
freeze(programs);
function get(id){const p=programs.find(p=>p.id===id);if(!p){const e=new Error('Unknown v1 library program '+id);e.code='unknown-program';e.path='$.id';throw e;}return clone(p);}
const api=Object.freeze({programs,get});if(typeof module!=='undefined'&&module.exports)module.exports=api;root.QDLV1Library=api;
})(typeof globalThis!=='undefined'?globalThis:this);
