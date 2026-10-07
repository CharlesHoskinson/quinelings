import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Runtime} from '../src/index.js';
import {Session} from '../src/v1.js';
import {VisualCapsule, MathematicalLifeforms} from '../src/experimental.js';

test('experimental extension preserves useful legacy calculation across three source generations',()=>{
  const created=new Runtime().create('[2,3,4] | square | sum | report total');
  assert.equal(created.status,'supported');
  if(created.status!=='supported')throw Error('Unsupported test recipe');
  const capsule=VisualCapsule.author(created.artifact.source,42);
  let program=capsule.program;
  for(let generation=0;generation<3;generation++){
    const result=VisualCapsule.execute(program);
    assert.ok('tasks' in result);
    assert.deepEqual(result.tasks[0]!.output,[{total:29}]);
    assert.equal(result.emitted[0],capsule.source);
    assert.ok(Number.isFinite(result.steps));
    program=JSON.parse(result.emitted[0]!);
  }
  for(const encoding of ['colors','harmonics'] as const)
    assert.equal(VisualCapsule.recover(capsule,encoding).source,capsule.source);
});

test('experimental extension executes supplied QDL1 inputs without changing retained source',()=>{
  const session=new Session();
  const stable=session.compile({format:'qdl-intent',version:1,name:'Measured total',
    thought:'Sum supplied readings.',
    inputs:[{id:'samples',name:'samples',type:{kind:'array',element:{kind:'number',unit:'L'}}}],
    steps:[{id:'total',op:'sum',inputs:['samples'],params:{}}],outputs:['total']});
  const capsule=VisualCapsule.author(stable.source,7);
  assert.equal(capsule.taskSource,stable.source);
  const first=VisualCapsule.execute(capsule.program,{bindings:{samples:[2,3,4]}});
  const second=VisualCapsule.execute(capsule.program,{bindings:{samples:[8,9]}});
  for(const [result,expected] of [[first,9],[second,17]] as const){
    assert.ok('occurrences' in result);
    const actual=result as unknown as {occurrences:{outputs:unknown[]}[];steps:number};
    assert.deepEqual(actual.occurrences[0]!.outputs,[expected]);
    assert.ok(Number.isFinite(actual.steps),'public work count must be finite');
    assert.equal(result.emitted[0],capsule.source);
  }
  assert.equal(VisualCapsule.verify(capsule).source,capsule.source);
  assert.equal(VisualCapsule.recover(capsule,'colors').taskSource,stable.source);
  const passive=VisualCapsule.execute(capsule.program,{constructionOnly:true});
  assert.ok('tasks' in passive);
  assert.deepEqual(passive.tasks,[]);
  assert.equal(passive.emitted[0],capsule.source);
});

test('all five distributed specimens admit and expose operation-owned finite geometry through the extension',()=>{
  const mechanisms=new Set<string>();
  for(const id of ['tideglass','emberfold','mosswell','threadwing','hourbloom']){
    const artifact=JSON.parse(readFileSync(new URL(`../../../programs/generated/${id}.json`,import.meta.url),'utf8'));
    const capsule=VisualCapsule.admit(artifact.source);
    mechanisms.add(capsule.design.woven.mechanism);
    const compiled=MathematicalLifeforms.compile(capsule.design.woven,capsule.task);
    const frame=MathematicalLifeforms.frame(compiled,.6,{budget:2048});
    assert.equal(frame.points.length,8192);
    assert.equal(frame.owners.length,2048);
    assert.ok(frame.points.every(Number.isFinite));
    assert.ok(frame.owners.every(owner=>owner<capsule.task.nodes.length));
    const first=MathematicalLifeforms.frame(compiled,0,{budget:2048});
    const wrapped=MathematicalLifeforms.frame(compiled,Math.PI*2,{budget:2048});
    assert.deepEqual(wrapped.owners,first.owners,'phase wrap preserves operation ownership');
    for(let i=0;i<first.points.length;i++)
      assert.ok(Math.abs(first.points[i]!-wrapped.points[i]!)<1e-6,'animation cycle closes without a jump');
    for(const node of capsule.task.nodes){
      const anchor=MathematicalLifeforms.anchor(compiled,node.id,.6);
      assert.ok([anchor.x,anchor.y,anchor.z].every(Number.isFinite));
    }
    assert.equal(VisualCapsule.verify(capsule).source,artifact.source);
    assert.equal(VisualCapsule.recover(capsule,'harmonics').source,artifact.source);
    assert.throws(()=>VisualCapsule.admit(artifact.source+' '));
  }
  assert.equal(mechanisms.size,5,'distributed set must contain five different constructions');
});

test('experimental execution refuses malformed options instead of silently skipping the task',()=>{
  const created=new Runtime().create('[2,3,4] | square | sum | report total');
  if(created.status!=='supported')throw Error('Unsupported test recipe');
  const capsule=VisualCapsule.author(created.artifact.source,42);
  for(const malformed of [null,[],{constructionOnly:'false'},{constructionOnly:1},
    {unexpected:true},{constructionOnly:true,bindings:{samples:[1]}}]){
    assert.throws(()=>VisualCapsule.execute(capsule.program,malformed as never),
      `Malformed options must refuse: ${JSON.stringify(malformed)}`);
  }
});

// spec/visual-capsule.qnt admittedOnly: construct/run act only on admitted
// capsules. A capsule-shaped program that fails admission must refuse rather
// than fall back to the legacy interpreter (whose constructionOnly path skips
// task and design validation and returned a successful record).
test('experimental execution refuses tampered capsules even when construction-only',()=>{
  const created=new Runtime().create('[2,3,4] | square | sum | report total');
  if(created.status!=='supported')throw Error('Unsupported test recipe');
  const capsule=VisualCapsule.author(created.artifact.source,42);
  const territory=JSON.stringify(capsule.design.woven.territories[0]!.node);
  const seeded=capsule.source.replace('"seed":42','"seed":43');
  assert.notEqual(seeded,capsule.source);
  const renamed=capsule.source.replace(territory,'"foreign-operation"');
  assert.notEqual(renamed,capsule.source);
  for(const tampered of [seeded,renamed]){
    const program=JSON.parse(tampered) as unknown[];
    assert.throws(()=>VisualCapsule.admit(tampered));
    for(const options of [undefined,{constructionOnly:true},{constructionOnly:false},{bindings:{}}])
      assert.throws(()=>VisualCapsule.execute(program,options as never),`Tampered capsule must refuse: ${JSON.stringify(options)}`);
  }
  // Admitted capsules and genuine legacy programs keep their behaviour.
  const constructed=VisualCapsule.execute(capsule.program,{constructionOnly:true});
  assert.equal(constructed.emitted[0],capsule.source);
  const legacy=VisualCapsule.execute(JSON.parse(created.artifact.source) as unknown[],{constructionOnly:true});
  assert.equal(legacy.emitted[0],created.artifact.source);
});
