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

const {announcementLinks,parseAnnouncement,recruitmentSources,collectRecruitmentSource}=require('../lib/recruitment-sources.ts');
test('hospital archive read-more links retain the actual announcement title and reject offsite links',()=>{
 const source=recruitmentSources.find(s=>s.name==='UBTH');
 const links=announcementLinks('<article><header><h2><a href="">INTERNSHIP VACANCIES</a></h2></header><footer><a href="/internship-vacancies/">read more</a></footer></article><a href="https://evil.example/intern">Medical Laboratory Intern</a>',source);
 assert.equal(links.length,1);assert.equal(links[0].title,'INTERNSHIP VACANCIES');assert.equal(links[0].url,'https://ubth.org/internship-vacancies/');
});
test('multi-role notices require laboratory evidence and historical notices do not become current matches',()=>{
 const source=recruitmentSources.find(s=>s.name==='UNTH'),url='https://unth.edu.ng/notice/';
 assert.equal(parseAnnouncement('Pharmacy and Nursing','Internship opportunities',url,source,postingDeadline),null);
 assert.equal(parseAnnouncement('Medical Laboratory Science','2025 Internship opportunities',url,source,postingDeadline),null);
 assert.equal(parseAnnouncement('Medical Laboratory Science\nPublished: March 8, 2023','Internship vacancies',url,source,postingDeadline),null);
 const job=parseAnnouncement('Medical Laboratory Science\nThe closing date for the submission of the application is 26th October, 2030','Internship opportunities',url,source,postingDeadline);
 assert.equal(job.deadline,'2030-10-26');assert.equal(job.jobType,'internship');assert.match(job.title,/Medical Laboratory Science Intern/);assert.equal(job.loc,'Ituku-Ozalla, Enugu');
});
test('detail extraction ignores unrelated page titles and related vacancies',async()=>{
 const original=global.fetch;const source=recruitmentSources[0];
 global.fetch=async url=>new Response(url===source.url?'<a href="/post/nursing">Nursing Internship</a>':'<meta property="og:title" content="Nursing Internship"><div class="single-page-content"><p>Nursing only</p></div><h1>You may also like</h1><article>Medical Laboratory Science</article>');
 try {assert.equal((await collectRecruitmentSource(source,postingDeadline)).jobs.length,0);}finally{global.fetch=original;}
});
test('unreadable attachments are reported and unsafe redirects are not followed',async()=>{
 const original=global.fetch;const source=recruitmentSources.find(s=>s.name==='UNTH');let calls=0;
 global.fetch=async url=>{calls++;return url===source.url?new Response('<a href="/internship">Internship vacancies</a>'):new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}});};
 try {const result=await collectRecruitmentSource(source,postingDeadline);assert.equal(calls,2);assert.equal(result.jobs.length,0);assert.match(result.warning,/could not be read/);}finally{global.fetch=original;}
});
test('structured job metadata resolves employer references and closing dates',async()=>{
 const original=global.fetch;const source=recruitmentSources.find(s=>s.name==='Jobberman');
 const graph={'@graph':[{'@type':'JobPosting',title:'Medical Laboratory Scientist',description:'Diagnostic testing',validThrough:'2030-12-20',hiringOrganization:{'@id':'employer'},jobLocation:{address:{addressLocality:'Lagos'}}},{'@type':'Organization','@id':'employer',name:'Test Hospital'}]};
 global.fetch=async url=>new Response(url===source.url?'<a href="/listings/test">Medical Laboratory Scientist</a>':`<script type="application/ld+json">${JSON.stringify(graph)}</script>`);
 try {const {jobs}=await collectRecruitmentSource(source,postingDeadline);assert.equal(jobs[0].company,'Test Hospital');assert.equal(jobs[0].loc,'Lagos');assert.equal(jobs[0].deadline,'2030-12-20');}finally{global.fetch=original;}
});
