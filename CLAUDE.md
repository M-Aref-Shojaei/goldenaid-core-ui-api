# Golden Aid Online - Core UI API Workspace

You are working in the `core-ui-api` shared package.

**CRITICAL INSTRUCTION:** Follow this workflow for every task:

---

## 1. Before any work — read

- `@../golden-aid-online/docs/GoldenAid/00-Index/Home.md`
- `@../golden-aid-online/docs/GoldenAid/03-Frontend/core-ui-api/Core-UI-API.md`
- `@../golden-aid-online/docs/GoldenAid/03-Frontend/core-ui-api/Structure.md`
- `@../golden-aid-online/docs/GoldenAid/03-Frontend/core-ui-api/Schemas.md`
- `@../golden-aid-online/docs/GoldenAid/03-Frontend/core-ui-api/Tests.md`

---

## 2. Before starting work — log the task

**b) Add the task to the global Bug Registry:**

- Append a new row to `@../golden-aid-online/docs/GoldenAid/08-Issues/Bug-Registry.md`
- Use the next available TASK-xxx ID
- Set status to 🟡 In Progress
- Update the `updated:` date in the frontmatter

---

## 4. When asked to "push"

Do NOT run `git push` immediately. First, review every file changed since the last push and update all related vault docs (Structure.md, Schemas.md, Tests.md, and the project doc) so they match the code. Then complete every gate:

1. **Task complete** — feature/fix fully implemented, no TODOs left in code
2. **Coding standards** — JSDoc on all exported components/hooks/utils, no `console.log` left
3. **All tests pass** — `npm test` from `frontend/core-ui-api/` → zero failures
4. **Lint clean** — `npm run lint` → zero errors
5. **Docs updated** — Structure / Schemas / Tests .md reflect the changes
6. **Task closed** — marked ✅ Solved in Bug Registry and Core-UI-API.md
7. **Commit message** — `<type>(core-ui-api): <summary>`

Only after all gates are green: `git add`, `git commit`, `git push`.

Full checklist: `@../golden-aid-online/docs/GoldenAid/02-Governance/Push-Checklist.md`

---

## 3. When done — update all docs

- Before creating the report, review the actual code diff for this task (not the original plan) and base the report and all doc updates below on what was actually implemented
- Create a report file at `@../golden-aid-online/docs/GoldenAid/08-Issues/reports/<ID>-<short-name>.md` summarizing what was done (problem, solution, files changed), and link it from the Report column in Bug-Registry.md
- Mark the task ✅ Solved in `@../golden-aid-online/docs/GoldenAid/08-Issues/Bug-Registry.md`
- Mark the task complete in `@../golden-aid-online/docs/GoldenAid/03-Frontend/core-ui-api/Core-UI-API.md`
- Move the completed task to the bottom of its list/table in both Bug-Registry.md and Core-UI-API.md, so open and 🟡 In Progress tasks stay visible at the top
- If folder/file layout changed → update `@../golden-aid-online/docs/GoldenAid/03-Frontend/core-ui-api/Structure.md`
- If types, exports, or API client changed → update `@../golden-aid-online/docs/GoldenAid/03-Frontend/core-ui-api/Schemas.md`
- If tests were added or changed → update `@../golden-aid-online/docs/GoldenAid/03-Frontend/core-ui-api/Tests.md`
