const { prisma } = require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const protectedRoutes = [
    ['user','GET','candidate'],['user','POST','candidate'],['user/preferences','POST','candidate'],['user/compliance','GET','candidate'],['user/compliance','POST','candidate'],
    ['history','GET','candidate'],['reset','POST','candidate'],['notifications','GET','candidate'],['notifications/mark-read','POST','candidate'],['scheduler/sync','GET','candidate'],
    ['upload','POST','candidate'],['upload','DELETE','candidate'],['extract-license','POST','candidate'],['generate-letter','POST','candidate'],['scrape','POST','candidate'],
    ['readiness','GET','candidate'],['send-digest','POST','candidate'],['apply','POST','candidate'],['apply','DELETE','candidate'],['jobs/status','PUT','candidate'],
    ['salary','POST','candidate'],['salary','PUT','candidate'],['salary','DELETE','candidate'],
    ['employer/verification','GET','employer'],['employer/verification','POST','employer'],['jobs/report','POST','candidate'],['jobs/direct','POST','employer'],['jobs/direct','PATCH','employer'],['jobs/direct','DELETE','employer'],
    ['jobs/applicants','GET','employer'],['jobs/applicants','PATCH','employer'],['jobs/applicants','DELETE','employer'],['employer/talent','GET','employer'],['employer/talent','POST','employer'],['user/career','POST','candidate'],
    ['documents','GET','either'],['jobs','GET','either'],['auth/session','GET','either'],
];
function request(path,method,role) {
    return new Request(`http://localhost:3173/api/${path}`,{method,headers:{Origin:'http://localhost:3173',...(role?{cookie:`benchscout_session=${'a'.repeat(64)}`} :{}),...(!['GET','HEAD'].includes(method)?{'Content-Type':'application/json'}:{})},...(!['GET','HEAD'].includes(method)?{body:'{}'}:{})});
}
test('all protected route methods reject anonymous access before executing their handlers', async () => {
    for(const [path,method] of protectedRoutes) {
        const response=await require(`../app/api/${path}/route.ts`)[method](request(path,method));
        assert.equal(response.status,401,`${method} ${path}`);
        assert.equal(response.headers.get('Cache-Control'),'no-store');
    }
});
test('scientist and employer route methods reject the opposite account role', async () => {
    for(const [path,method,access] of protectedRoutes.filter(row=>row[2]!=='either')) {
        const role=access==='candidate'?'employer':'candidate';
        prisma.authSession.findUnique=async()=>({subjectId:'owner',role,expiresAt:new Date(Date.now()+60000)});
        prisma.user.findUnique=async()=>({id:'owner',email:'owner@example.com',name:'Owner',isVerified:true});
        prisma.employer.findUnique=async()=>({id:'owner',email:'owner@example.com',companyName:'Owner',isVerified:true});
        const response=await require(`../app/api/${path}/route.ts`)[method](request(path,method,role));
        assert.equal(response.status,403,`${method} ${path}`);
    }
});
