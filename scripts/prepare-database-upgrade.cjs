// Read-only schema comparison. Only writes SQL review artifacts to /private/tmp.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const cli = require.resolve('prisma/build/index.js');
function diff(target, output) {
  const result = spawnSync(process.execPath, [cli, 'migrate', 'diff', '--from-schema-datasource', 'prisma/schema.prisma', '--to-schema-datamodel', target, '--script', '--exit-code'], { encoding: 'utf8' });
  if (![0,2].includes(result.status)) throw new Error('Schema comparison could not connect or complete.');
  fs.writeFileSync(output, result.stdout);
  return result.status === 0;
}
try {
  const baselineMatches = diff('/private/tmp/benchscout-original-schema.prisma','/private/tmp/benchscout-baseline-comparison.sql');
  const currentMatches = diff('prisma/schema.prisma','/private/tmp/benchscout-database-upgrade.sql');
  const sql = fs.readFileSync('/private/tmp/benchscout-database-upgrade.sql','utf8');
  console.log(JSON.stringify({ baselineMatches, currentMatches, destructiveStatements: /DROP\s+(TABLE|COLUMN)|DELETE\s+FROM|TRUNCATE/i.test(sql), plan: '/private/tmp/benchscout-database-upgrade.sql' },null,2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
