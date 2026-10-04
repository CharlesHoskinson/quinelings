'use strict';
const fs=require('node:fs'),path=require('node:path');
// Restricted repository Markdown renderer. Escape source HTML, preserve code,
// headings, paragraphs, lists and ordinary links. No user Markdown is rendered.
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const guides=[
 {source:'sdk-quickstart',route:'sdk-quickstart',title:'Quickstart'},
 {source:'sdk-lifecycle',route:'sdk-lifecycle',title:'Lifecycle'},
 {source:'sdk-api',route:'sdk-api',title:'API reference'},
 {source:'SDK-RANCH-GUIDE',route:'sdk-ranch-guide',title:'Experimental ranch'},
 {source:'sdk-mcp-guide',route:'sdk-mcp-guide',title:'MCP guide'},
 {source:'sdk-a2a-guide',route:'sdk-a2a-guide',title:'A2A guide'}
];
const guideLink=url=>{const [target,anchor]=url.split('#');if(target.startsWith('../packages/'))return 'https://github.com/CharlesHoskinson/quinelings/blob/main/'+target.slice(3)+(anchor?'#'+anchor:'');const guide=guides.find(g=>target===g.source+'.md'||target==='./'+g.source+'.md');return guide?guide.route+'.html'+(anchor?'#'+anchor:''):url;};
const inline=s=>escape(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_m,label,url)=>/^(?:https?:\/\/|[.\/\w#-])/.test(url)?`<a href="${guideLink(url)}">${label}</a>`:label).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
function markdown(text){let out=[],buffer=[],code=null,list=false,table=false;const flush=()=>{if(buffer.length){out.push('<p>'+inline(buffer.join(' '))+'</p>');buffer=[];}if(list){out.push('</ul>');list=false;}if(table){out.push('</tbody></table>');table=false;}};
 for(const line of text.split('\n')){
  if(line.startsWith('```')){flush();if(code!==null){out.push('<pre><code>'+escape(code.join('\n'))+'</code></pre>');code=null;}else code=[];continue;}
  if(code!==null){code.push(line);continue;}
  if(/^\|.*\|$/.test(line.trim())){if(/^\|[ \t:|\-]+\|$/.test(line.trim()))continue;if(!table){flush();out.push('<table><tbody>');table=true;}out.push('<tr>'+line.trim().slice(1,-1).split('|').map(cell=>'<td>'+inline(cell.trim())+'</td>').join('')+'</tr>');continue;}
  const heading=line.match(/^(#{1,6}) (.+)$/);if(heading){flush();const n=heading[1].length;out.push(`<h${n}>${inline(heading[2])}</h${n}>`);continue;}
  if(/^\s*- /.test(line)){if(buffer.length)flush();if(!list){out.push('<ul>');list=true;}out.push('<li>'+inline(line.replace(/^\s*- /,''))+'</li>');continue;}
  if(!line.trim()){flush();continue;}
  if(list)flush();buffer.push(line);
 }flush();if(code!==null)throw Error('Unclosed Markdown code fence');return out.join('\n');}
const checkOnly=process.argv.includes('--check');
for(const guide of guides){
 const file=path.join(__dirname,'../docs',guide.source+'.md'),body=markdown(fs.readFileSync(file,'utf8'));
 const guideNav=guides.map(item=>`<a href="${item.route}.html"${item.route===guide.route?' aria-current="page"':''}>${escape(item.title)}</a>`).join('');
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Quinelings · ${escape(guide.title)}</title><style>body{margin:auto;max-width:940px;padding:28px;background:#080f16;color:#c5dfd5;font:17px/1.7 system-ui}a{color:#83d8be}nav{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:24px}nav[aria-label="SDK guides"]{gap:16px;margin-bottom:40px;font-size:15px}a[aria-current="page"]{color:#f0f5ed;text-decoration-thickness:3px}h1{font-size:40px;line-height:1.15}h2{margin-top:44px;color:#f0f5ed}pre{overflow:auto;padding:22px;background:#0d1a23;border:1px solid #29403e;border-radius:12px;font:14px/1.6 monospace}table{border-collapse:collapse;display:block;overflow:auto;width:100%;font-size:15px}td{padding:12px;border:1px solid #29403e}tr:first-child{font-weight:bold}code{overflow-wrap:anywhere;color:#e0f5cf}li{margin:8px 0}p{overflow-wrap:anywhere}@media(max-width:600px){body{padding:18px;font-size:16px}h1{font-size:32px}}</style></head><body><nav aria-label="Project"><a href="../sdk.html">← Agent SDK</a><a href="../create.html">Creation workspace</a><a href="../ranch.html">Experimental ranch</a><a href="${guide.source}.md">Markdown source</a></nav><nav aria-label="SDK guides">${guideNav}</nav>${body}</body></html>\n`;
 if(!html.includes('aria-current="page"')||!body.includes('<h1>'))throw Error('Incomplete guide rendering: '+guide.source);
 for(const match of html.matchAll(/href="([^"]+)"/g)){
  const url=match[1];if(/^(?:https?:|#)/.test(url))continue;
  const target=url.split('#')[0];if(guides.some(item=>target===item.route+'.html'))continue;
  if(!fs.existsSync(path.resolve(__dirname,'../docs',target)))throw Error('Missing guide link: '+guide.source+' → '+target);
 }
 if(!checkOnly)fs.writeFileSync(path.join(__dirname,'../docs',guide.route+'.html'),html);
}
console.log(`${checkOnly?'Checked':'Rendered'} ${guides.length} experimental SDK guides.`);
