const {mailer}=require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {sendVerificationEmail}=require('../lib/verification-email.ts');
const {passwordResetEmail}=require('../lib/password-reset-email.ts');
const {accountEmailLayout}=require('../lib/account-email-layout.ts');

test('candidate/employer confirmation and reset deliver the same real logo and layout while preserving their purpose',async()=>{
 process.env.NODE_ENV='production';process.env.NEXT_PUBLIC_APP_URL='https://bench-scout-git-testing-sholly.vercel.app';
 const expectedLogo=await fs.readFile('public/icons/benchscout-192.png');
 const reset=await passwordResetEmail(process.env.NEXT_PUBLIC_APP_URL+'/reset-password?token=synthetic&role=candidate');
 const header=reset.html.slice(0,reset.html.indexOf('PASSWORD RESET'));
 const buttonStyle=reset.html.match(/<a href="[^"]+" style="([^"]+)"/)[1];
 for(const role of ['candidate','employer']){
  let delivered;mailer.sendEmail=async(to,subject,html,text,images)=>{delivered={to,subject,html,text,images};};
  await sendVerificationEmail(new Request(process.env.NEXT_PUBLIC_APP_URL),'qa+branding@example.invalid','c'.repeat(64),role);
  assert.equal(delivered.subject,'Confirm your BenchScout account');assert.equal(delivered.to,'qa+branding@example.invalid');
  assert.equal(delivered.images.length,1);assert.equal(delivered.images[0].contentId,'benchscout-logo');assert.deepEqual(delivered.images[0].content,expectedLogo);assert.deepEqual(delivered.images[0].content,reset.images[0].content);
  assert.equal(delivered.html.slice(0,delivered.html.indexOf('EMAIL CONFIRMATION')),header);assert.equal(delivered.html.match(/<a href="[^"]+" style="([^"]+)"/)[1],buttonStyle);
  assert.match(delivered.html,/src="cid:benchscout-logo"/);assert.match(delivered.html,/alt="BenchScout logo"/);assert.match(delivered.text,/24 hours/);assert.match(delivered.text,/used once/);
  const link=new URL(delivered.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&'));
  assert.equal(link.origin,process.env.NEXT_PUBLIC_APP_URL);assert.equal(link.pathname,'/verify');assert.equal(link.searchParams.get('role'),role);assert.equal(link.searchParams.get('email'),'qa+branding@example.invalid');assert.equal(link.searchParams.get('token'),'c'.repeat(64));assert.ok(delivered.text.includes(link.toString()));
  assert.equal(delivered.text.includes('Company review is a separate step'),role==='employer');
 }
 assert.match(reset.text,/one hour/);assert.match(reset.text,/password will stay unchanged/);
});

test('shared account email layout escapes message text and action-link attributes',async()=>{
 const content=await accountEmailLayout({label:'<label>',title:'A & B',paragraphs:['<script>unsafe</script>'],actionLabel:'Confirm "email"',actionUrl:'https://example.invalid/verify?token=synthetic&role=candidate',expiry:'Expiry < 24 hours',footer:'Ignore <this>'});
 assert.equal(content.html.includes('<script>'),false);assert.match(content.html,/&lt;script&gt;unsafe&lt;\/script&gt;/);assert.match(content.html,/A &amp; B/);assert.match(content.html,/Confirm &quot;email&quot;/);assert.match(content.html,/token=synthetic&amp;role=candidate/);assert.match(content.text,/https:\/\/example.invalid\/verify\?token=synthetic&role=candidate/);
});
