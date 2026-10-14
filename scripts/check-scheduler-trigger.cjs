// Verify only BenchScout's testing scheduler. Never print or put its secret in a URL.
require('@next/env').loadEnvConfig(process.cwd());
(async()=>{
 if(!process.env.CRON_SECRET||process.env.CRON_SECRET.length<32)throw new Error('Scheduler secret is not configured');
 const response=await fetch('https://bench-scout-git-testing-sholly.vercel.app/api/cron/daily-digest?dryRun=1',{headers:{Authorization:`Bearer ${process.env.CRON_SECRET}`},signal:AbortSignal.timeout(20000)});
 const result=await response.json();
 console.log(JSON.stringify({httpStatus:response.status,authenticated:response.ok&&result.success===true,dryRun:result.dryRun===true,dueAccounts:result.dueAccounts,emailEnabledAccounts:result.emailEnabledAccounts}));
 if(!response.ok||result.dryRun!==true)process.exitCode=1;
})().catch(()=>{console.error('Could not verify the testing scheduler');process.exitCode=1;});
