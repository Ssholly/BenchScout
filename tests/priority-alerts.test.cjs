require('./register.cjs');
const {test}=require('node:test');const assert=require('node:assert/strict');
const {priorityAlertMatches}=require('../lib/priority-alerts.ts');
const jobs=[1,2,3].map(tier=>({title:'Medical Laboratory Scientist',company:'Test Lab',desc:tier===2?'Haematology':'Microbiology',url:`https://example.com/jobs/${tier}`,tier}));
test('priority tiers and case-insensitive keyword filters intersect',()=>{
 assert.deepEqual(priorityAlertMatches(jobs,{alertTier:'Tier 1 Only'}).map(j=>j.tier),[1]);
 assert.deepEqual(priorityAlertMatches(jobs,{alertTier:'Tier 1 & Tier 2',alertKeywords:'HAEMATOLOGY'}).map(j=>j.tier),[2]);
 assert.equal(priorityAlertMatches(jobs,{alertTier:'Tier 1 Only',alertKeywords:'Haematology'}).length,0);
 assert.equal(priorityAlertMatches(jobs,{alertTier:'All Tiers',alertKeywords:''}).length,3);
});
test('priority filters accept saved role fields and reject unsafe application links',()=>{
 assert.equal(priorityAlertMatches([{role:'Medical Laboratory Scientist',company:'Test',desc:null,url:'javascript:alert(1)',tier:1}],{}).length,0);
 assert.equal(priorityAlertMatches([{role:'Medical Laboratory Scientist',company:'Test',desc:null,url:'https://example.com/job/1',tier:1}],{alertKeywords:'scientist'}).length,1);
});
