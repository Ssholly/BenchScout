# Deploying the security upgrade

The code changes do not apply themselves to the live database or migrate already public files.

1. Back up PostgreSQL and the old blob store. Put the existing deployment into maintenance mode while upgrading so old endpoints cannot continue writing public documents or accepting unauthenticated changes.
2. Compare the existing database with the original schema represented by `prisma/migrations/20260527000000_baseline/migration.sql`. If it matches and no Prisma migration history exists, mark that baseline as already applied:

   ```sh
   npx prisma migrate resolve --applied 20260527000000_baseline
   npx prisma migrate deploy
   ```

   For a new empty database, run only `npx prisma migrate deploy`. If the existing database differs, reconcile the schema in staging first. Never run `migrate reset` against production. The security migration is additive; it does not delete user data.

3. Configure a separate private Blob store, `BLOB_PRIVATE_READ_WRITE_TOKEN`, the legacy `BLOB_READ_WRITE_TOKEN`, independent admin/cron/salary secrets, the canonical application URL, and a verified email sender.
4. Run `npm run documents:migrate` to inspect counts, then `npm run documents:migrate -- --apply` to copy objects privately and remove their public originals. If old-object deletion fails, manually remove the reported pathname from the legacy store. The script does not claim to revoke copies already downloaded by third parties.
5. Deploy the new application and configure authenticated server schedules as described in README. Existing browser-local login hints are intentionally invalid until the user signs in again.
6. In staging, verify candidate registration and confirmation mail; login and logout; private CV/license upload/download/delete; cross-account denials; employer review, posting, application, shortlisting and email delivery; password reset revocation; salary editing; and a scheduled scan with fresh and repeated source fixtures. Check desktop and mobile screens with both account roles.
7. Review existing employer approvals and independently review licenses before using the new review label. Existing salary reports have no owner key and cannot safely be claimed using a public report ID; contributors can submit a new report, while an administrator handles legacy corrections offline.
8. Reopen access after checking database backups, migration results, and private storage behavior. Retain migration logs without tokens or document contents.

Rollback requires restoring the prior database/storage backup and compatible application together. Do not redeploy the prior insecure API against user data as a routine rollback strategy.
