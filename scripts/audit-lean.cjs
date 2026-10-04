'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const project=path.join(__dirname,'../spec/lean'),folder=path.join(project,'QDL');
function withoutComments(text){let out='',depth=0;for(let i=0;i<text.length;i++){const pair=text.slice(i,i+2);if(pair==='/-'){depth++;i++;continue;}if(depth&&pair==='-/'){depth--;i++;continue;}if(depth)continue;if(pair==='--'){while(i<text.length&&text[i]!=='\n')i++;out+='\n';continue;}out+=text[i];}assert.equal(depth,0,'Unclosed Lean comment');return out;}
const theorems=[];
for(const name of fs.readdirSync(folder).filter(n=>n.endsWith('.lean'))){const code=withoutComments(fs.readFileSync(path.join(folder,name),'utf8'));assert(!/\b(?:sorry|axiom)\b/u.test(code),`${name}: admitted proof or project axiom`);const namespaces=[];
 for(const line of code.split('\n')){let m;if((m=line.match(/^namespace\s+([\w.]+)/u)))namespaces.push(m[1]);else if(/^end(?:\s|$)/u.test(line))namespaces.pop();else if((m=line.match(/^theorem\s+([^\s{(:]+)/u)))theorems.push([...namespaces,m[1]].join('.'));}
}
assert(theorems.length>=70,'Missing expected QDL theorem coverage');
if(process.argv[2]==='--generate'){const target=path.join(project,'.lake/qdl-theorem-audit.lean');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'import QDL\n\n'+theorems.map(n=>'#print axioms '+n).join('\n')+'\n');console.log(`Auditing all ${theorems.length} exported QDL theorems.`);}
else{const log=fs.readFileSync(process.argv[2],'utf8'),allowed=new Set(['propext','Classical.choice','Quot.sound']);assert(!/\bsorryAx\b/u.test(log),'Proof dependency contains sorryAx');
 for(const match of log.matchAll(/depends on axioms:\s*\[([\s\S]*?)\]/gu))for(const name of match[1].split(',').map(n=>n.trim()).filter(Boolean))assert(allowed.has(name),'Unexpected proof dependency: '+name);
 const inspected=(log.match(/depends on axioms:|does not depend on any axioms/gu)||[]).length;assert.equal(inspected,theorems.length,'Every public theorem must have a dependency report');
 const report={toolchain:fs.readFileSync(path.join(project,'lean-toolchain'),'utf8').trim(),theorems:theorems.length,numericDomainsMatched:require("./check-qdl-domains.cjs").domains,heredityDomainsMatched:require("./check-heredity-domains.cjs").domains,proofPlaceholders:0,projectAxioms:0,allowedFoundations:[...allowed],dependenciesChecked:true};fs.writeFileSync(path.join(__dirname,'../lean-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
