require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseMyJobMag,parseHotJobs,enrichPosting,postingDeadline,collectJobs}=require('../lib/job-sources.ts');
const {scoreJob}=require('../lib/job-matching.ts');
const my='<li class="job-info"><h2><a href="/job/test-placement">Medical Laboratory Science Interns at Test Teaching Hospital</a></h2><li class="job-desc">Supervised laboratory training</li></li>';
const hot='<div><span class="jobheader"><h1><a href="https://www.hotnigerianjobs.com/hotjobs/123/test.html">Medical Laboratory Science Interns at Test Hospital</a></h1></span><div class="mycase4">The position is located in Enugu State.</div></div>';
test('current public-board markup yields employer names and plural internship titles',()=>{
 const jobs=[...parseMyJobMag(my),...parseHotJobs(hot)];assert.equal(jobs.length,2);assert.equal(jobs[0].company,'Test Teaching Hospital');assert.equal(jobs[1].loc,'Enugu State');
 for(const job of jobs)assert.ok(scoreJob(job,{careerPhase:'internship',location:'All Nigeria',keywords:'',minScore:70,strictMls:true,includeTier3:true}));
});
test('detail pages supply location, explicit internship type and calendar deadline',()=>{
 const job=parseMyJobMag(my)[0];const result=enrichPosting(job,'<body><ul class="job-key-info"><li>Job Type Internship</li>\n<li>Location Lagos</li></ul><p>Deadline: 20th December, 2030</p></body>');
 assert.equal(result.loc,'Lagos');assert.equal(result.jobType,'internship');assert.equal(result.deadline,'2030-12-20');
 assert.equal(postingDeadline('Application Closing Date\n30th February, 2030'),undefined);
 const expired=scoreJob({...result,deadline:'2000-01-01'},{careerPhase:'internship',location:'All Nigeria',keywords:'',minScore:0,strictMls:true,includeTier3:true});assert.equal(expired,null);
});
test('nationwide source queries use the real search key and bounded provider limits',async()=>{
 const originalFetch=global.fetch,previous=process.env.APIFY_API_KEY;process.env.APIFY_API_KEY='test-only';const inputs=[];
 global.fetch=async(raw,init)=>{
  const url=new URL(raw);
  if(url.hostname==='api.apify.com'){inputs.push(JSON.parse(init.body));return Response.json([]);}
  if(url.pathname==='/search/jobs'){assert.equal(url.searchParams.get('q'),'medical laboratory');assert.equal(url.searchParams.has('job_q'),false);return new Response(my);}
  if(url.pathname.startsWith('/discipline/'))return new Response(hot);
  if(url.hostname==='www.myjobmag.com')return new Response('<body><ul class="job-key-info"><li>Location Lagos</li></ul></body>');
  return new Response('<div><span class="jobheader"><h1>Medical Laboratory Science Interns</h1></span>\nLocation: Enugu\nApplication Closing Date\n20th December, 2030</div>');
 };
 try{const result=await collectJobs('internship','Nigeria');assert.equal(result.jobs.length,2);assert.ok(result.jobs.some(job=>job.loc==='Lagos'));assert.ok(result.jobs.some(job=>job.loc==='Enugu'));const indeed=inputs.find(input=>input.country==='NG');assert.equal(indeed.location,undefined);assert.equal(indeed.maxItemsPerSearch,30);assert.equal(inputs.find(input=>input.urls).limitPerSource,30);}
 finally{global.fetch=originalFetch;if(previous===undefined)delete process.env.APIFY_API_KEY;else process.env.APIFY_API_KEY=previous;}
});
