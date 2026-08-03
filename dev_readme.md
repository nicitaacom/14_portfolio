### Why this exist?

Portfolio allows me to showcase my projects in order to have some proof (as reviews)

In docs I write how something work or how to implement something<br>

For example if you want upderstand how Project.tsx work go to directory `(site)/dev_readme.md`
and there you find info how Project.tsx work

[AI_readme_code-sytle-patterns.md](./AI_readme_code-sytle-patterns.md)<br/>
[AI_UI_skill.md](./AI_UI_skill.md)<br/>
[dev_readme-supabase-sql.md](./dev_readme-supabase-sql.md)<br/>
[dev_readme-ui-system.md](./dev_readme-ui-system.md) — how every seasonal theme is built<br/>
[dev_readme-utm-stats.md](./dev_readme-utm-stats.md) — the 4 layers that resolve one deviceId per visitor<br/>
[app/api/webhooks/check-envs/dev_readme-check-env.md](./app/api/webhooks/check-envs/dev_readme-check-env.md) — are the API keys still valid: pre-push run every 3 days, weekly prod webhook<br/>

### Docs structure:

0. why this exists (problem it solves, in plain words)

1. define where data lives e.g redis DB or EB or zustand store

   - types

   - show directories for UI where data rendered
   - use images to show how data looks in each store (redis screenshot, supabase screenshot, EB screenshot)
   - use images to show where data renders in UI (scheduled tab, outreached page, etc.) - include file directories
   - add terminology table right below (so AI reading this section has the vocab before reading the ASCII)
   - for each store: explain WHY it exists there (not just what it holds)

2. TODO and decisions made AGAINST
3. define termininology - explain with ASCII examples how it should work
4. reproduction steps - examples with ASCII of how it work
