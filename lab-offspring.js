import {V1Ranch, V1Session, Quinelings} from './assets/ranch/quinelings-runtime.js';

/** A body-only construction preserves the base task; admission replays its derivation. */
export function bodyOnlyExperiment(session, parent, donor, inputs, nonce=1) {
  const preview=V1Ranch.preview(session,{parents:[parent.id,donor.id],recipe:{kind:'body',base:0},nonce,name:'Same calculation, inherited body'});
  if(preview.status!=='ready') throw Error(preview.diagnostics.map(x=>x.message).join('; '));
  const candidate=preview.candidate, child=V1Ranch.admit(session,candidate).artifact;
  const run=a=>session.run({artifactId:a.id,requestId:'body-'+crypto.randomUUID(),inputs:structuredClone(inputs)});
  const parentRecord=run(parent),childRecord=run(child);
  const recovered=new V1Session().recover({colors:Quinelings.encodeColors(JSON.parse(child.source))});
  const evidence={classification:candidate.classification,sourceChanged:parent.source!==child.source,
    taskPreserved:Quinelings.canon(parent.payload.task)===Quinelings.canon(child.payload.task),
    declarationPreserved:Quinelings.canon(parent.payload.thought)===Quinelings.canon(child.payload.thought),
    outputsEqual:Quinelings.canon(parentRecord.result.occurrences.map(x=>x.outputs))===Quinelings.canon(childRecord.result.occurrences.map(x=>x.outputs)),
    effectsEqual:Quinelings.canon(parentRecord.result.occurrences.map(x=>x.effects))===Quinelings.canon(childRecord.result.occurrences.map(x=>x.effects)),
    exactChildGenome:recovered.source===child.source,
    emissionExact:[parentRecord.result.emitted[0]===parent.source,childRecord.result.emitted[0]===child.source],
    bodyChanged:candidate.changes.bodyChanged,parentSource:parent.sourceHash,childSource:child.sourceHash,
    derivationId:candidate.derivationId,policy:V1Ranch.policy};
  if(!evidence.taskPreserved||!evidence.declarationPreserved||!evidence.outputsEqual||!evidence.effectsEqual||!evidence.exactChildGenome||!evidence.emissionExact.every(Boolean))throw Error('Body-only invariants failed.');
  return {parent,child,parentRecord,childRecord,evidence};
}
