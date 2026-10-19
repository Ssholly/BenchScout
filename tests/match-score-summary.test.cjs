require('./register.cjs');
const {test}=require('node:test');const assert=require('node:assert/strict');
const {matchScoreSummary}=require('../lib/match-score-summary.ts');
test('employer posts cannot dilute the average of personalised listing scores',()=>{
 const result=matchScoreSummary([{score:90,isDirectPost:false},{score:0,isDirectPost:true},{score:80,isDirectPost:false}]);
 assert.equal(result.average,85);assert.equal(result.grade,'A');assert.match(result.explanation,/2 scored listings/);
});
test('employer-only and empty feeds do not invent a numeric personalised score',()=>{
 const direct=matchScoreSummary([{score:0,isDirectPost:true}]);assert.equal(direct.average,null);assert.equal(direct.grade,'N/A');assert.match(direct.explanation,/do not have a personalised match score/);
 assert.equal(matchScoreSummary([]).average,null);
});
test('zero is a valid external score while invalid score values are excluded',()=>{
 const result=matchScoreSummary([{score:0},{score:NaN},{score:120},{score:-5}]);assert.equal(result.average,0);assert.match(result.explanation,/1 scored listing\./);
});
