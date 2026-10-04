#!/usr/bin/env python3
"""Run explicitly requested native AGY/Grok auditors; no credential export."""
import asyncio, json, pathlib, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
FOCI=[
 ('types','API ergonomics, discriminated results, TypeScript types, caller mistakes and diagnostics'),
 ('execution','passive compile/recover/frame, explicit execution, quine reproduction, stale records and source provenance'),
 ('protocols','MCP/A2A interoperability, tool/message schemas, annotations, cancellation and task artifacts'),
 ('robustness','untrusted JSON, budgets, source admission, overflow, accessors, mutation, resource exhaustion and package portability'),
 ('documentation','clean onboarding, reproducible documented examples, honest capabilities and tests that independently verify outcomes')]
async def main():
 sem=asyncio.Semaphore(3)
 async def audit(provider,n,focus):
  name,topic=focus
  prompt=(f'User explicitly requested five {provider} audit agents. You are specialist {n}: {topic}. '
    f'Read /home/hoskinson/Projects/quinelings/AGENTS.md. Audit packages/agent-sdk/src, tests, package/build and docs/sdk-*.md plus thought.js/anatomy.js/core.js as needed. '
    'Implementation is actively progressing; distinguish missing-yet from bugs. Do not edit any files, deploy, read secrets, or send messages. '
    'Use read-only inspection and safe tests if available. Return Markdown report: severity, exact file/line, concrete failing scenario, recommended fix, independent verification. '
    'Also identify which Quint lifecycle or Lean invariant each finding needs. Do not claim tests passed without running. Prioritize actionable bugs over generic advice. Final report only.')
  argv=(['agy','--model','gemini-3.1-pro-high','--mode','plan','--dangerously-skip-permissions','--effort','high','--print-timeout','15m','--print',prompt] if provider=='Gemini' else
        ['grok','--model','grok-4.7','--permission-mode','bypassPermissions','--always-approve','--reasoning-effort','xhigh','--cwd',str(ROOT),'--single',prompt])
  async with sem:
   print(f'Start {provider} {n}: {name}',flush=True)
   process=await asyncio.create_subprocess_exec(*argv,cwd=ROOT,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE)
   try: out,err=await asyncio.wait_for(process.communicate(),1200)
   except asyncio.TimeoutError:
    process.terminate();out,err=await process.communicate()
   target=ROOT/'research'/f'sdk-{provider.lower()}-audit-{n}.md'
   target.write_text(out.decode(errors='replace'))
   log=pathlib.Path('/tmp')/f'quinelings-{provider.lower()}-{n}.stderr'
   log.write_text(err.decode(errors='replace'))
   print(json.dumps({'provider':provider,'model':'gemini-3.1-pro-high' if provider=='Gemini' else 'grok-4.7','specialist':n,'exitCode':process.returncode,'report':str(target),'bytes':len(out)}),flush=True)
  return {'provider':provider,'specialist':n,'exitCode':process.returncode,'bytes':len(out)}
 results=await asyncio.gather(*(audit(provider,n,focus) for provider in (sys.argv[1:] or ['Gemini','Grok']) for n,focus in enumerate(FOCI,1)))
 (ROOT/'research'/'sdk-council-execution.json').write_text(json.dumps(results,indent=2)+'\n')
asyncio.run(main())
