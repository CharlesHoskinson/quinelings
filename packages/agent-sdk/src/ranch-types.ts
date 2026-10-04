import type {Artifact,Diagnostic,Frame,FrameOptions,Intent,IntentType,Json} from './types.js';
export interface Traits {elongation:number;spread:number;curvature:number;gestureGain:number;tempo:number;pigmentGain:number}
export interface Heredity {model:'bounded-traits-experimental';parents:[string,string];seedDigest:string;nonce:number;traits:Traits}
export interface ParentPin {artifactId:string;intentHash:string|null}
export type OffspringRecipe={kind:'compose';donorOutput:string;recipientInput:string}|{kind:'mate';donorNode:string;replaceNode:string}|{kind:'merge'}|{kind:'body';base:0|1};
export type OffspringOrigin={kind:'manual'}|{kind:'pairing';worldId:string;proposalId:string;parentResidents:[string,string];epochs:[number,number]};
export interface OffspringInput {parents:[ParentPin,ParentPin];recipe:OffspringRecipe;nonce:number;style:{mutation:'none'|'gentle';traits?:Traits};origin:OffspringOrigin}
export interface OffspringChanges {sourceChanged:boolean;taskSyntaxChanged:boolean;bodyChanged:boolean}
export interface NodeOrigin {nodeId:string;parent:0|1|'generated';parentNodeId?:string}
export interface Derivation {id:string;candidateId:string;childArtifactId:string;childSourceHash:string;parents:[{sourceHash:string;intentHash:string|null},{sourceHash:string;intentHash:string|null}];construction:OffspringInput;policies:Record<string,string>;classification:string;changes:OffspringChanges;origins:NodeOrigin[];heredity:{traits:Traits;parents:Json[];draws:Json[];changes:Json[];override:boolean};seam?:{donorNode:string;recipientNode:string;type:IntentType;integrationNode:string}}
export interface OffspringCandidate {candidateId:string;derivationId:string;childSourceHash:string;child:Artifact;changes:OffspringChanges;classification:string;diagnostics:Diagnostic[];lineage:Derivation}
export type OffspringPreview={status:'ready';candidate:OffspringCandidate}|{status:'rejected';diagnostics:Diagnostic[]};
export interface OffspringFrameInput {input:OffspringInput;candidateId:string;childSourceHash:string;phase:number;options?:FrameOptions}
export interface OffspringFrameResult {candidateId:string;childSourceHash:string;frame:Frame}
export type OffspringTarget={kind:'library'}|{kind:'world';worldId:string;expectedRevision:number};
export interface AdmissionInput {input:OffspringInput;candidateId:string;childSourceHash:string;target:OffspringTarget;requestId:string}
export interface AdmissionResult {requestId:string;candidateId:string;derivationId:string;artifactId:string;childSourceHash:string;worldId?:string;residentId?:string;revision?:number;tick?:number}
export interface LineageInput {artifactId?:string;cursor?:number;limit?:number}
export interface LineageResult {derivations:Derivation[];nextCursor?:number}
export interface AnnotationInput {artifactId:string;intent:Intent}
export interface WorldConfig {worldKey:string;seed:number;affinity?:'structural'|'neutral'}
export interface Position {x:number;y:number}
export interface Resident extends Position {id:string;artifactId:string;sourceHash:string;intentHash:string|null;epoch:number;enabled:boolean;energy:number;rest:boolean;nurseryUntil:number;readyAfterTick:number;heading:number;invitation:{partnerId:string;expiry:number}|null;partner:string|null;pendingProposal:string|null;roles:string[];gestureKind:string}
export interface SocialPair {id:string;parentResidents:[string,string];slots:[Position,Position];startTick:number;approachDeadline:number;attemptDeadline:number;dwell:number;arrived:boolean}
export interface SocialProposal {id:string;parentResidents:[string,string];artifactIds:[string,string];sourceHashes:[string,string];intentHashes:[string|null,string|null];epochs:[number,number];createdTick:number;expiry:number}
export type WorldAction={kind:'import';artifactId:string}|{kind:'retire';residentId:string}|{kind:'participate';residentId:string;enabled:boolean}|{kind:'invite';residentId:string;partnerId:string}|{kind:'cancelProposal';proposalId:string}|{kind:'advance';ticks:1|2|3|4};
export interface WorldCommandInput {worldId:string;expectedRevision:number;sequence:number;command:WorldAction}
export interface WorldCommandResult {worldId:string;revision:number;sequence:number;tick:number;residentId?:string;proposalId?:string;appliedTicks?:number}
export interface World {id:string;worldKey:string;seed:number;affinity:'structural'|'neutral';tick:number;revision:number;nextResident:number;nextSequence:number;residents:Resident[];pairs:SocialPair[];proposals:SocialProposal[];events:{tick:number;kind:string;residentIds:string[]}[];droppedEvents:number;receipts:{sequence:number;payloadHash:string;result:WorldCommandResult}[]}
export type RanchRequest=
 |{operation:'offspringPreview';input:OffspringInput}
 |({operation:'offspringFrame'}&OffspringFrameInput)
 |({operation:'offspringAdmit'}&AdmissionInput)
 |({operation:'lineage'}&LineageInput)
 |({operation:'annotate'}&AnnotationInput)
 |({operation:'worldCreate'}&WorldConfig)
 |{operation:'worldInspect';worldId:string}
 |({operation:'worldCommand'}&WorldCommandInput);
export type RanchResponse=OffspringPreview|OffspringFrameResult|AdmissionResult|LineageResult|Artifact|World|WorldCommandResult;
export type RanchResponseFor<R>=R extends {operation:'offspringPreview'}?OffspringPreview:R extends {operation:'offspringFrame'}?OffspringFrameResult:R extends {operation:'offspringAdmit'}?AdmissionResult:R extends {operation:'lineage'}?LineageResult:R extends {operation:'annotate'}?Artifact:R extends {operation:'worldCreate'|'worldInspect'}?World:R extends {operation:'worldCommand'}?WorldCommandResult:never;
