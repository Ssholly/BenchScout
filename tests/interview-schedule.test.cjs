require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {interviewScheduleError}=require('../lib/interview-schedule.ts');
const now=Date.parse('2026-10-20T09:00:30Z'); // 10:00:30 in Lagos
test('past days, current minute and exact current instant cannot schedule interviews',()=>{
 for(const [date,time] of [['2026-10-19','23:59'],['2026-10-20','09:30'],['2026-10-20','10:00']]) assert.match(interviewScheduleError(date,time,now),/future.*Africa\/Lagos/);
 assert.match(interviewScheduleError('2026-10-20','10:01',Date.parse('2026-10-20T09:01:00Z')),/future/);
});
test('a later minute today and a future day are accepted in Lagos time',()=>{
 assert.equal(interviewScheduleError('2026-10-20','10:01',now),null);
 assert.equal(interviewScheduleError('2026-10-21','00:00',now),null);
});
test('Lagos midnight is evaluated against the previous UTC day',()=>{
 const nearMidnight=Date.parse('2026-10-20T23:30:00Z'); // Oct 21, 00:30 Lagos
 assert.match(interviewScheduleError('2026-10-21','00:15',nearMidnight),/future/);
 assert.equal(interviewScheduleError('2026-10-21','00:31',nearMidnight),null);
});
test('impossible dates and invalid time shapes are rejected before scheduling',()=>{
 for(const date of [undefined,null,42,'','2026-2-01','2026-02-29','2026-04-31','2026-13-01']) assert.match(interviewScheduleError(date,'10:00',now),/valid interview date/);
 for(const time of [undefined,null,12,'','9:00','24:00','12:60','10:00:00']) assert.match(interviewScheduleError('2026-10-21',time,now),/valid interview time/);
 assert.equal(interviewScheduleError('2028-02-29','10:00',now),null);
});
