import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Runtime, QuinelingError } from './index.js';
import {IntentSchema,OffspringInputSchema,OffspringFrameSchema,AdmissionSchema,LineageSchema,AnnotationSchema,WorldConfigSchema,WorldCommandSchema} from './schema.js';
export * from './schema.js';

const REQUEST_BYTES = 4 * 1024 * 1024;
const RESPONSE_BYTES = 8 * 1024 * 1024;
const id = z.string().min(1).max(160);
const options = z.strictObject({
  seed: z.number().int().min(0).max(0xffffffff).optional(),
  repeats: z.number().int().min(1).max(8).optional()
}).optional();
const harmonics = z.strictObject({
  format: z.literal('quineling-harmonics-1'),
  bands: z.array(z.array(z.number().int().min(0).max(256)).length(32)).min(1).max(2049)
});
const colors = z.strictObject({
  format: z.literal('quineling-chroma-1'),
  pixels: z.array(z.array(z.tuple([
    z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)
  ]).nullable()).length(32)).min(1).max(2049)
});

/** All computation is bounded local simulation. This adapter grants no host authority. */
export function createQuinelingMcpServer(runtime: Runtime = new Runtime()): McpServer {
  const server = new McpServer({ name: 'quinelings', version: '0.0.0-experimental' });

  function register<S extends z.ZodRawShape>(name: string, description: string,
    shape: S, run: (args: z.infer<z.ZodObject<S>>) => unknown,
    readOnly: boolean, idempotent: boolean, exactlyOne = false, destructive = false): void {
    let inputSchema = z.strictObject(shape);
    if(exactlyOne){
      const keys=Object.keys(shape);
      // SDK 1.32 discovery only serializes root object schemas, so retain the
      // object and expose the exclusive alternatives as standard oneOf metadata.
      inputSchema=inputSchema.superRefine((value,context)=>{
        if(Object.values(value).filter(item=>item!==undefined).length!==1)context.addIssue({code:'custom',message:'Supply exactly one recovery encoding.'});
      }).meta({oneOf:keys.map(key=>({required:[key]}))});
    }
    server.registerTool<z.ZodRawShape, typeof inputSchema>(name, {
      description,
      inputSchema,
      annotations: { readOnlyHint: readOnly, destructiveHint: destructive, idempotentHint: idempotent, openWorldHint: false }
    }, async (raw, extra): Promise<CallToolResult> => {
      try {
        if(extra.signal.aborted)throw new QuinelingError('cancelled','MCP request cancelled before dispatch.');
        if (Buffer.byteLength(JSON.stringify(raw)) > REQUEST_BYTES) throw new QuinelingError('resource-limit', 'MCP request exceeds 4 MiB.');
        // Explicitly retain strict parsing even when a client skips advertised JSON Schema checks.
        const args = inputSchema.parse(raw);
        if(extra.signal.aborted)throw new QuinelingError('cancelled','MCP request cancelled before dispatch.');
        const result = run(args);
        const text = JSON.stringify({ result });
        if (Buffer.byteLength(text) > RESPONSE_BYTES) throw new QuinelingError('resource-limit', 'MCP result exceeds 8 MiB; use a smaller frame budget or artifact.');
        return { content: [{ type: 'text', text }], structuredContent: JSON.parse(text) as Record<string, unknown> };
      } catch (error) {
        const detail = error instanceof QuinelingError ? error.toJSON() : error instanceof z.ZodError ? {
          code:'invalid-input', path:error.issues[0]?.path.length?'$.'+error.issues[0].path.map(String).join('.'):'$',
          message:(error.issues[0]?.message||'Invalid MCP input.').slice(0,2048)
        } : {
          code: 'execution-failed', path: '$',
          message: (error instanceof Error ? error.message : 'Quineling operation failed.').slice(0,2048)
        };
        const structuredContent = { error: detail };
        const text = JSON.stringify(structuredContent);
        return { isError: true, content: [{ type: 'text', text }], structuredContent };
      }
    });
  }

  register('quineling_parse',
    'Parse complete bounded local thought syntax or an imported typed plan. Returns supported/clarify/unsupported/inconsistent. Does not execute a task, call a model, or store an artifact.',
    { thought: z.string().max(16384) }, ({ thought }) => runtime.parse(thought), true, true);

  register('quineling_compile',
    'Validate a complete typed intent and store a new task, generated body and recoverable constructor quine. Build checks pure refinements but never runs simulated actions. Unit/provenance metadata stays in the companion contract.',
    { intent: IntentSchema, options }, ({ intent, options: selected }) => {
      return runtime.compile(intent, selected);
    }, false, true);

  register('quineling_create',
    'Parse supported local thought syntax and compile/store an artifact when complete. Arbitrary English may need clarification or an explicit external proposer; this tool makes no model or network call and does not run tasks.',
    { thought: z.string().max(16384), options }, ({ thought, options: selected }) => runtime.create(thought, selected), false, true);

  register('quineling_inspect',
    'Read a stored artifact, including exact source, task, anatomy, contract and both recoverable genomes. Does not execute or animate the task.',
    { artifactId: id }, ({ artifactId }) => runtime.inspect(artifactId), true, true);

  register('quineling_run',
    'Explicitly execute a stored bounded task and verify its constructor emission. Creates a source-bound execution record. Action nodes generate local simulated receipts only; repeated calls create fresh executions.',
    { artifactId: id }, ({ artifactId }) => runtime.run(artifactId), false, false);

  register('quineling_reproduce',
    'Create and execute a verified fresh copy from a matching parent execution record. This is a fresh execution, including any local simulated action receipts, and creates a new record. It grants no external authority.',
    { artifactId: id, recordId: id }, ({ artifactId, recordId }) => runtime.reproduce(artifactId, recordId), false, false);

  register('quineling_recover',
    'Recover and store a canonical artifact from exactly one source string, harmonic genome or color genome. Validates structure and identity without executing the recovered task. Companion thought metadata is not recovered from a genome.',
    { source: z.string().max(65536).optional(), harmonics: harmonics.optional(), colors: colors.optional() }, input => {
      if (Object.values(input).filter(value => value !== undefined).length !== 1) throw new QuinelingError('invalid-input', 'Supply exactly one of source, harmonics or colors.');
      if (input.source !== undefined && Buffer.byteLength(input.source)>65536) throw new QuinelingError('source-budget', 'Source exceeds 65,536 UTF-8 bytes.', '$.source');
      if (input.source !== undefined) return runtime.recover({source: input.source});
      if (input.harmonics !== undefined) return runtime.recover({harmonics: input.harmonics});
      if (input.colors !== undefined) return runtime.recover({colors: input.colors});
      throw new QuinelingError('invalid-input', 'Supply a recovery encoding.');
    }, false, true, true);

  register('quineling_frame',
    'Sample a deterministic body pose as JSON at a finite phase. Watch-only: does not execute instructions or change source. Use budget 4000 for agent inspection; crest count is 2–4; all owners and operation anchors remain inspectable.',
    { artifactId: id, phase: z.number().min(-1e6).max(1e6), options: z.strictObject({
      budget: z.number().int().min(4000).max(24000).optional(),
      crests: z.number().int().min(2).max(4).optional()
    }).optional() }, ({ artifactId, phase, options: selected }) => runtime.frame(artifactId, phase, selected), true, true);

  register('quineling_offspring_preview','Prepare a source-backed typed compose/mate/merge/body candidate without storing, executing, ticking or creating offspring. Bounded pure refinement evaluation is allowed; units/guards are checked.',{input:OffspringInputSchema},({input})=>runtime.offspringPreview(input),true,true);
  register('quineling_offspring_frame','Statelessly rebuild a prepared candidate and sample its body. Both candidate and exact child-source identities must match. No admission or execution.',OffspringFrameSchema.shape,input=>runtime.offspringFrame(input),true,true);
  register('quineling_offspring_admit','Explicitly admit rebuilt offspring to the library or a fresh world proposal. Atomically stores source/lineage/receipt; world birth charges both parents once. Retry the same requestId and payload after transport loss. Never runs a task.',AdmissionSchema.shape,input=>runtime.offspringAdmit(input),false,true);
  register('quineling_lineage','Read bounded flat append-order derivation evidence. Source heredity is asserted; only session derivations have replay inputs. No ancestor recursion or task execution.',LineageSchema.shape,input=>runtime.lineage(input),true,true);
  register('quineling_annotate','Attach an explicitly supplied typed interpretation to a source-only artifact after exact task graph comparison. Existing conflicting metadata refuses; world parent proposals are invalidated atomically.',AnnotationSchema.shape,input=>runtime.annotate(input),false,true);
  register('quineling_world_create','Create one bounded experimental ranch in this session. Same worldKey/seed/affinity is idempotent; a different configuration refuses. Residents start with participation disabled.',WorldConfigSchema.shape,input=>runtime.worldCreate(input),false,true);
  register('quineling_world_inspect','Read a detached ranch snapshot without advancing social time, animating or executing tasks.',{worldId:z.string().min(1).max(128)},({worldId})=>runtime.worldInspect(worldId),true,true);
  register('quineling_world_command','Explicit bounded import/retire/participate/invite/cancelProposal/advance command. Exact next sequence and revision required; replay same sequence and complete payload, never allocate a new sequence to retry. Social steps never run tasks.',WorldCommandSchema.shape,input=>runtime.worldCommand(input),false,true,false,true);
  return server;
}

export const createMcpServer = createQuinelingMcpServer;
