# Fixed phone testing URL

The `testing` Git branch is the dedicated Vercel Preview branch. Keep `main` as the production branch.

Expected branch URL: `https://bench-scout-git-testing-sholly.vercel.app/home`. Confirm the exact alias in Vercel after deployment. Bookmark the branch URL, not the URL containing a deployment hash. The branch URL follows successful updates to `testing` and does not depend on the Mac's IP address, Wi-Fi, or development server.

`NEXT_PUBLIC_APP_URL` has a branch-specific Preview override so verification/reset links and same-origin checks stay on the test site. Production retains its existing value. No automatic database migration runs during the application build.

The existing Vercel Preview configuration currently shares database and email configuration with Production. This is a test release, not an isolated data sandbox. Use dedicated test accounts; emails and authorized record changes are real. New private-storage/admin/salary configuration must be supplied separately before those capabilities are available in Preview.

## Update the phone test version

1. Make changes on `testing`.
2. Run `npm run check` and `npm run build`.
3. Review the changed files and ensure `.env` files, credentials, private files, and browser artifacts remain excluded.
4. Commit and push `testing` to GitHub. Vercel builds the Preview automatically.
5. Wait for Ready, then open the same branch URL on the phone.

Production release is a separate reviewed action. Do not push or merge this branch to `main` as part of routine phone testing. Keep Vercel Preview protection enabled; sign in to the owning Vercel account if prompted on the phone.
