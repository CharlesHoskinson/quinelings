'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),K=require('../kernels.js');
const cases=JSON.parse(fs.readFileSync('research/thought-lifeform-09-benchmark.json')).cases,c=(op,args,p={})=>K.calculate(op,args,p),checks=[];
function check(id,actual,expected){assert.deepEqual(actual,expected);checks.push(id);}
check('01',c('sum',[[2,3,5]]),10);
check('02',c('weightedMean',[[10,20],[1,3]]),17.5);
check('03',c('bfs',[{A:['B','C'],B:['D'],C:['D'],D:[]},['B']],{start:'A',goal:'D'}),cases[2].expected);
const grants=c('allocate',[5,[{id:'a',amount:4},{id:'b',amount:4}]]);check('04',[grants.grants.map(x=>x.granted),grants.remaining],[[4,1],0]);
const schedule=c('schedule',[[{id:'a',depends:[],duration:2},{id:'b',depends:['a'],duration:3},{id:'c',depends:[],duration:4}]]);check('05',[Object.fromEntries(schedule.jobs.map(j=>[j.id,j.start])),schedule.makespan],[{a:0,b:2,c:0},5]);
const cost=c('sum',[c('map',[[2,3]],{kind:'square'})]);check('06',[cost,c('budget',[10,cost])],[13,{allocated:10,remaining:0}]);
const queue=[{id:'a',urgent:true,priority:2},{id:'b',urgent:false,priority:10},{id:'a',urgent:true,priority:9},{id:'c',urgent:true,priority:7}],work=c('sort',[c('dedupe',[c('filter',[queue],{key:'urgent',operator:'eq',value:true})],{key:'id'})],{key:'priority',descending:true});check('07',[work.map(x=>x.id),work.map(x=>x.priority),work.length],[['c','a'],[7,2],2]);
check('08',c('consensus',[[{source:'s1',choice:'A'},{source:'s1',choice:'B'},{source:'s2',choice:'A'}]],{required:2}),cases[7].expected);
check('09',c('evidence',[[{source:'s1',claim:'safe',value:true},{source:'s1',claim:'safe',value:true},{source:'s2',claim:'safe',value:false}]],{claim:'safe'}),cases[8].expected);
check('10',c('retry',[['retry','unknown','ok']],{maxAttempts:3}),cases[9].expected);
assert.throws(()=>c('weightedMean',[[10,20],[0,0]]));assert.throws(()=>c('schedule',[[{id:'a',depends:['b'],duration:1},{id:'b',depends:['a'],duration:1}]]));
assert.equal(cases.length,20);assert.equal(new Set(cases.map(x=>x.id)).size,20);
fs.writeFileSync('research/thought-lifeform-09-oracle-results.json',JSON.stringify({passed:true,currentKernelOutcomeOracles:checks,refinementRejections:['18','20'],compilerClassifierMeasured:false,bodyGeneratorMeasured:false},null,2)+'\n');console.log('PASS: 10 externally specified outcome fixtures, two refinement rejections; compiler and body generator not evaluated.');
