// Compile local TypeScript in memory; tests never load the configured database client.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const unexpected = () => { throw new Error('Unexpected database call in test'); };
const table = () => new Proxy({}, { get(target, key) { return target[key] || unexpected; } });
const prisma = { authSession: table(), user: table(), employer: table(), job: table(), application: table(), notification: table(), rateLimit: table(), salaryReport: table(), runHistory: table(), verificationToken: table(), $transaction: unexpected };
prisma.documentCleanup = table();
prisma.safetyReview = table();
prisma.jobReport = table();
const originalLoad = Module._load;
prisma.passwordResetToken = table();
const mailer = { sendEmail: async () => {} };
Module._load = function(request, parent, isMain) {
  if (request === '@/lib/prisma') return { prisma };
  if (request === '@/lib/mailer') return mailer;
  if (request.startsWith('@/')) request = path.join(root, request.slice(2));
  return originalLoad.call(this, request, parent, isMain);
};
require.extensions['.ts'] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  module._compile(compiled.outputText, filename);
};
module.exports = { prisma, mailer };
