## Commit patterns

Format: `type: message`

One line, lowercase message, no period at the end, no body (except the specific exceptions in the
Rules section below).

### Types (from most to least used)

| type    | when                                                         |
| ------- | ------------------------------------------------------------ |
| `fix`   | bug fix                                                      |
| `upd`   | update existing behavior/code (not a new feature, not a fix) |
| `style` | UI/CSS only change, no logic change                          |
| `docs`  | changes to files in `docs/` or `dev_readme-*.md`             |
| `feat`  | new feature                                                  |
| `chore` | renames, cleanup, types, logs, imports, non-behavior changes |

### Reason-tags (optional, `(fix)`/`(perf)` only)

`chore` and `style` are both catch-alls that can mean either "a deliberate choice" or "a bug got
corrected" - when that distinction matters for review, tag it in parens right after the type. Only
these two words exist as tags, and only on these two types so far:

| tag                        | when                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `chore(fix):`              | a real bug corrected, but purely in tooling/config/build - not app behavior (else use `fix:`)                   |
| `chore(perf):`             | tooling/build/script made faster - no correctness or behavior change                                            |
| `style(fix):`              | a visual bug corrected (e.g. an element jumping/misaligned) - vs. plain `style:` for a deliberate design change |
| `chore:`/`style:` (no tag) | everything else for that type                                                                                   |

### Feature-scopes (optional, `feat:` only, whitelist only)

`feat:` MAY carry a feature-scope in parens - but only a name that already exists as a key in
`API_FOLDER_TO_FEATURE` (`eslint-local-rules/api-folder-owning-feature.js`), e.g. `ai-decisions`,
`dialer`, `emails`, `schedule`, `verify`, `ea-setup`, `publish`, `backup`. Never invent a scope name
that isn't in that map - it's the single source of truth for what counts as a "feature" here.

### Examples

- `fix: show toast 429 Create FU` (no "message" - toast already means message; "Create FU" names the actual button)
- `fix: enter on "call" btn when isCalling` (quotes the real button label, names the real state var)
- `fix: upd timezone on change` (reuses this codebase's own verb "upd"; never "save" - banned word)
- `upd: J.png is now png (more rich)`
- `upd: max 300 chars in desc`
- `style: btn danger in tailwind.config` (subject first, then variant, then source - mirrors how the variant is actually named in code, e.g. `variant="danger"` on `Button`, not English adjective-first "danger button")
- `style(fix): MailboxRow jumping`
- `style(fix): EmailRow avatar overflow` (not "overlap" - overflow = content spills past its container; overlap = two separate elements sit on top of each other - pick whichever actually describes the mechanism)
- `docs: no jargon`
- `docs: upd eslint doc w 3 new rules`
- `feat: AI iteration mode`
- `feat(ai-decisions): retry btn`
- `-chore: night-run.sh` (shorthand for `chore: removed night-run.sh`)
- `chore: getCached -> getRedis`
- `chore: err -> error`
- `chore: eslint fix imports-order`
- `chore: eslint add buckets check`
- `chore(fix): eslint rule highlights wrong line`
- `chore(perf): eslint excl. node_modules in grep`
- `chore: mv verify hooks to features`

### Rules

1. Keep the message short - one line, plain words, no jargon (see code-patterns Naming conventions). Never a banned word (see `docs/dev_readme-code-patterns.md` Terminology / no-banned-words) - this applies to the commit message text itself, not just docs/chat/code.
2. Renames go `old -> new` (e.g. `chore: fetch -> refetch/select/get`).
3. A leading `-` before the type is shorthand for "removed" (e.g. `-chore: nav links` = `chore: removed nav links`) - use it only when the whole commit is a pure removal/deletion.
4. Don't invent new types - if none of the 6 fit, ask before adding one. Same for reason-tags (`(fix)`/`(perf)` only) and feature-scopes (whitelist in `API_FOLDER_TO_FEATURE` only) - don't invent a third tag or an off-list scope without asking.
5. No made-up scopes - the only parens allowed are `chore`/`style`'s reason-tags and `feat`'s whitelisted feature-scopes above.
6. If commit has something for me to do that the AI has NO way to do itself (e.g execute SQL in supbase, set an env var, `git push`) then at a top of commit description add "🚨 TODO" numbered list - full shape, the chain requirement and what never belongs there in the section below.
7. commit name length 12-40 HARD LIMIT.
8. `feat:` ONLY if you can present it to the user as a new capability.
9. Before typing `chore:` or `style:` on tooling/UI work, ask: did this correct a real bug (`(fix)`), only change speed (`(perf)`, chore only), or neither (no tag)? Don't default every change to the untagged form regardless of which is true.
10. Any commit touching `eslint-local-rules/**` puts "eslint" as the first word of the message, right after the type (e.g. `chore: eslint add buckets check`, `chore(perf): eslint cache appRoot per run`) - mirrors this repo's existing `chore: eslint fix imports-order` convention, so the domain is obvious at a glance.
11. A `chore(fix):`/`chore(perf):` commit on an `eslint-local-rules/**` file needs a short body: current behavior vs. expected/new behavior (same concrete-example spirit as a `NEW eslint rule` commit body) - the one-line subject alone doesn't carry enough for later review.
12. Reuse this codebase's own verb terminology in the message body (`upd`, `set`, `get`, etc. - see `docs/dev_readme-code-patterns.md` Terminology) instead of generic English verbs, and quote exact UI labels/state names (`"call" btn`, `isCalling`) rather than paraphrasing them.
13. For a visual-bug word, name the actual CSS mechanism, not a similar-sounding word - "overflow" (content spills past its own container) and "overlap" (two separate elements sit on top of each other) are different bugs; pick whichever one actually happened.
14. Commit size depends on what kind of change it is. Mechanical, deterministic changes (`eslint --fix` output like imports-order, formatting) can go in one large commit, even 700+ files - no per-file judgment was made, so there's nothing to review file-by-file. Judgment-based fixes (deciding per file whether to extract a component, disable a rule as a false positive, move a handler into a hook, etc.) must be split into commits of **~20 files each**, even when the underlying task is one continuous eslint-rule fix across the whole repo - a 100+ file commit makes those individual per-file decisions unreviewable, while a ~20-file commit stays skimmable.
15. No commas in the message. Listing 2+ things with commas (`chore: move dnc, scheduled-emails, regex`) means the commit is doing 2+ unrelated things - split it into separate commits instead.
16. One commit = one module/feature/widget/page. Even when a batch task (e.g. fixing one eslint rule across the repo) touches several unrelated areas and each area is well under the ~20-file cap from rule 14, commit each area separately - never bundle e.g. `dnc` + `verify` into one commit just because the combined file count is small. Before running `git commit`, run `git diff --cached --stat` and confirm every file in it belongs to the ONE area the message names - a file left staged from an earlier, unrelated `git rm`/`git add` can otherwise ride along silently. Real incident: a `chore: eslint fix single-export verify` commit's message named only `verify`, but `git show --stat` on it showed 0 verify files - the `validationHelpers.ts` deletion had instead been swept into an earlier, unrelated `dnc` commit because it was `git rm`'d (which stages immediately) before the per-area split was even decided, and nobody ran `git diff --cached --stat` to catch it before either commit.
17. DO NOT mention file pathnames in commit description
18. A commit whose CAUSE is an eslint rule (renaming/moving/suppressing something because a rule flagged it) names that rule - not just commits that edit `eslint-local-rules/**` itself (rule 10 already covers that case). If the rule name doesn't fit the 12-40 char subject, put it in the body instead (e.g. `chore: emptyState -> ntfcnEmptyState` body: `no-duplicate-export-easy: same export name collided with scraper's own EmptyState`). Never leave a rule-driven rename/suppress commit with no trace of which rule caused it.
19. A `moved from:` block only belongs in a commit body when a file was actually renamed/moved (`git mv`, or a delete at the old path + a create at the new one). Extracting a hook/function into a NEW file while the old file just gets edited to import it is not a move - that old file still exists at its original path. Drop the `moved from:` line and the two paths in that case; keep `🟣 <rule>:` then the real why in short lines, same as the non-move shape in CLAUDE.md rule 13.
20. No commit spam - a run of one-file commits is worse than one commit. Rule 16 splits a batch task by area, but "area" has a floor: when the per-area split lands on commits of a single file each, they belong in ONE commit named after the rule or task that caused them (`chore: eslint fix response naming`, not four separate `chore: resp name in <file>` commits). Rule 14's ~20-file cap is the ceiling for judgment-based work and rule 16 is the grouping test - neither is a reason to hand back a log where every entry is 1 file changed. Real incident: fixing `response-variable-naming` across 5 files produced 4 commits of 1 file each and had to be squashed back into one. Before committing a batch fix, look at how many files each planned commit would hold - if the answer is 1 for several of them in a row, merge those into one commit for the whole rule.

## 🚨 TODO — only what the AI has no way to do

A commit that only says what changed leaves me opening the diff to find out whether a manual step is
waiting. The description answers that first — but only when the step is genuinely mine.

**The test for an item: could the AI have done it itself? Then it is not a TODO.**

| Belongs in the block                            | Never in the block                               |
| ----------------------------------------------- | ------------------------------------------------ |
| the Supabase SQL editor, a migration to apply   | `pnpm` / `npm` / `npx` — the AI has a terminal   |
| a Vercel / Cloudflare / Stripe / PayPal console | cypress, playwright, vitest, storybook           |
| an env var, a secret, an API key                | eslint, prettier, `tsc`, a build                 |
| DNS, a domain, an OAuth consent screen          | editing a file, reading a diff                   |
| my inbox, my phone, a 2FA prompt                | `git add` / `git commit` / `git checkout`        |
| `git push` when pushing IS the step             | anything it already did (that is a `-` why line) |

`git push` is denied in the AI's environment, so it belongs in the chat reply after every commit —
not in the body. It earns a numbered item only when the push itself is the step (a deploy to trigger,
a CI secret to pick up), never as a standing "and now push this" on each commit.

```
chore: check envs are valid

🚨 TODO

1. open dev_readme-supbase-sql.md:878 -> copy the ## Keys check cron block -> open the Supabase
   SQL editor -> replace YOUR_PRODUCTION_DOMAIN -> run it
2. Vercel -> Settings -> Environment Variables -> Production -> add CRON_SECRET
3. BotFather -> /setwebhook -> paste the url -> expect "Webhook was set"
```

**Each item is a chain, never a bare command.** `1. supabase functions deploy sendTgNtfcnAppointment`
is rejected: it says nothing about where to run it, what it changes, or how to tell it worked. An
item names WHERE to go, WHAT to do there, and HOW you know it worked.

**A make-work item is rejected** — this one shipped and is what the rule above exists for:

```
❌ 🚨 TODO

1. open a terminal in 23_store -> run pnpm exec cypress run --spec cypress/e2e/checkout.cy.ts
   -> expect 4 passing checkout tests and 0 failures
```

A perfect chain, and still wrong: the AI has that terminal. It runs the tests and the result becomes
a fact in the body — `- 4 checkout tests pass, 0 failures`.

**Nothing out of its reach? Then there is NO block.** Write the why on its own:

```
chore: drop unused deps

- removed 15 packages nothing in the repo imports
- tsc clean, 197 tests still pass
```

A filler `1. nothing - applied and verified here` is **rejected** for the same reason. Both shapes —
filler and make-work — train me to skip the block, and then the one that matters gets skipped too.

**The block is required whenever the commit touches** `.env*`, `env.d.ts`, a `migrations/` or
`supabase/` folder, a `.sql` file, or a `dev_readme*sql*` doc — those always leave a variable to set
or SQL to run. A file that merely holds the word (`app/libs/supabaseAdmin.ts`) does not count.

### Enforced, not remembered — two layers

**1. Before git runs.** `~/.claude/hooks/commit-rule-emoji-guard.py` (PreToolUse on Bash, wired in
`~/.claude/settings.json`) denies the commit when the body is missing, when a trigger path above is
staged without a `🚨 TODO`, when an item is filler, when an item is a terminal command the AI runs
itself, when an item names no out-of-reach place at all, or when no item has an arrow chain. It reads
`-m`, `-am`, `-mX`, `--message=`, `-F` and `--file=`, and denies a bare `git commit` or
`--amend --no-edit` because those leave the message unreadable until after it lands.

A `command`, a "label" and any path or url are dropped before that out-of-reach match — otherwise
`check the button reads "Pay with PayPal"` counts as a PayPal step while being a file the AI edits.

**2. Git's own check.** `.githooks/commit-msg` runs the same rules on the message git is about to
record, so a commit made outside the AI loop is still caught. It is TRACKED, unlike `.git/hooks`,
which every OS reinstall and every fresh clone wipes.

### 🚨 After a fresh clone or an OS reinstall

`core.hooksPath` is local config, so a clone does not inherit it. One line brings layer 2 back:

```bash
git config core.hooksPath .githooks
```

Layer 1 comes back with `~/.claude/` — the hooks are also copied to
`/home/kali/Documents/txt/claude-hooks/`.

