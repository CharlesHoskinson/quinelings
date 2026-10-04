#!/usr/bin/env python3
"""Run the six explicitly requested native candidate auditors, three at a time.

Candidate text is provided in the prompt: these are design audits before code
implementation, never reported as independent runtime verification.
"""
import asyncio, hashlib, json, pathlib, sys, uuid
ROOT=pathlib.Path(__file__).resolve().parents[1]
FOCI=[
 ('semantics','Typed program composition, donor slices, effects/guards, useful offspring, source identity and honest recoverability'),
 ('world','Social state machine, reciprocal participation, atomic birth, freshness, finite resources, replay and proposed Quint/Lean properties'),
 ('experience','Visual beauty, mathematical forms, color meaning, birth/merge choreography, global performance and API/docs/accessibility')]
async def main():
 candidate=ROOT/'docs/RANCH-CANDIDATE.md'
 if not candidate.exists():raise SystemExit('Converged candidate missing: run only after the ten brainstorm reports.')
 for name in ['semantics','genetics','social','biology','visual','experience','api','formal','robustness','examples']:
  if not (ROOT/'research/ranch'/f'brainstorm-{name}.md').exists():raise SystemExit('Missing brainstorm '+name)
 source=candidate.read_text();digest=hashlib.sha256(source.encode()).hexdigest()
 sem=asyncio.Semaphore(3);ledger=[]
 async def audit(provider,n,focus):
  name,topic=focus
  prompt=(f'You are {provider} design auditor {n} of3, focus:{topic}. The user requested3Grok/3Gemini/3GPT audits of this converged Quineling ranch design BEFORE implementation. '
    'All candidate text is included below. Do not use tools, edit/read files, deploy, access credentials or launch agents. '
    'Reason independently and return a substantive Markdown report now: concrete defect with severity and candidate section, counterexample, exact correction and test/model obligation. '
    'Distinguish required correction from optional enhancement and unproved properties. Include aesthetic/utility concerns within your specialty. '
    'Do not claim implementation tests or cite nonexistent code. End with a candidate recommendation conditioned on identified corrections.\n\n'+source)
  async with sem:
   session=str(uuid.uuid4())
   item={'provider':provider,'model':'grok-4.7' if provider=='Grok' else 'gemini-3.1-pro-high','specialist':n,'focus':name,'candidateSha256':digest,'status':'started'}
   ledger.append(item);(ROOT/'research/ranch/native-audit-execution.json').write_text(json.dumps(ledger,indent=2)+'\n')
   argv=(['grok','--model','grok-4.7','--session-id',session,'--permission-mode','bypassPermissions','--always-approve','--tools','','--no-subagents','--max-turns','1','--reasoning-effort','high','--cwd',str(ROOT),'--single',prompt] if provider=='Grok' else
         ['agy','--model','gemini-3.1-pro-high','--mode','plan','--dangerously-skip-permissions','--effort','high','--print-timeout','8m','--print',prompt])
   print(f'Start {provider} candidate specialist{n}',flush=True)
   process=await asyncio.create_subprocess_exec(*argv,cwd=ROOT,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE)
   try:out,err=await asyncio.wait_for(process.communicate(),540)
   except asyncio.TimeoutError:
    process.terminate();out,err=await process.communicate();item['timeout']=True
   report=ROOT/'research/ranch'/f'audit-{provider.lower()}-{n}.md';report.write_text(out.decode(errors='replace'))
   (pathlib.Path('/tmp')/f'quineling-ranch-{provider.lower()}-{n}.stderr').write_text(err.decode(errors='replace'))
   item.update({'exitCode':process.returncode,'report':report.name,'bytes':len(out),'status':'report_received' if process.returncode==0 and len(out)>500 else 'needs_inspection','session':session if provider=='Grok' else None})
   (ROOT/'research/ranch/native-audit-execution.json').write_text(json.dumps(ledger,indent=2)+'\n');print(json.dumps(item),flush=True)
 await asyncio.gather(*(audit(provider,n,focus) for provider in (sys.argv[1:] or ['Grok','Gemini']) for n,focus in enumerate(FOCI,1)))
asyncio.run(main())
