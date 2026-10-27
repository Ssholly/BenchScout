require('./register.cjs');
const {test}=require('node:test');const assert=require('node:assert/strict');
const {notificationTarget}=require('../lib/notification-target.ts');
const jobs=[{id:'a',role:'Medical Laboratory Scientist',company:'Apex Diagnostic Hub'},{id:'b',role:'Senior Scientist',company:'Apex Diagnostic Hub'},{id:'c',role:'Medical Laboratory Scientist',company:'Other Lab',applied:true}];
test('invitations select the specific role instead of returning to an unchanged matches page',()=>{
 assert.equal(notificationTarget({title:'Exclusive Recruitment Invitation',body:'Apex Diagnostic Hub invited you to apply for Senior Scientist. Review the vacancy in your job matches.'},jobs),'/matches?job=b');
});
test('interview and application updates select the relevant notified job',()=>{
 assert.equal(notificationTarget({title:'Interview scheduled',body:'Other Lab scheduled your interview for Medical Laboratory Scientist on 2030-12-20'},jobs),'/matches?job=c');
});
test('removed invitation vacancies still open a filtered view',()=>{
 assert.equal(notificationTarget({title:'Exclusive Recruitment Invitation',body:'Apex Diagnostic Hub invited you to apply for Removed role. Review the vacancy in your job matches.'},jobs),'/matches?search=Removed%20role');
});
test('an invitation already applied to still selects the notified vacancy',()=>{
 assert.equal(notificationTarget({title:'Exclusive Recruitment Invitation',body:'Other Lab invited you to apply for Medical Laboratory Scientist. Review the vacancy in your job matches.'},jobs),'/matches?job=c');
});
test('a fresh invitation selects the unapplied role when the same employer has an older application',()=>{
 const duplicates=[{id:'old',role:'Medical Laboratory Scientist',company:'Apex Diagnostic Hub',applied:true},{id:'new',role:'Medical Laboratory Scientist',company:'Apex Diagnostic Hub',applied:false}];
 assert.equal(notificationTarget({title:'Exclusive Recruitment Invitation',body:'Apex Diagnostic Hub invited you to apply for Medical Laboratory Scientist. Review the vacancy in your job matches.'},duplicates),'/matches?job=new');
});
