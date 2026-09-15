# Semantic Audit

Semantic Audit is a reusable audit-then-apply workflow for LLM-assisted review. It is intended for issues that behave like lint rules but require semantic, cross-cutting judgment rather than syntax or keyword matching.

The workflow separates three concerns:

1. Analysis reads the complete target and produces a structured YAML audit without modifying it.
2. A user reviews the options and fills each finding's `decision` and optional `note`.
3. Application changes only findings with an explicit actionable decision and records the outcome.

Recommendations are advisory. The default analysis mode leaves every decision at `null`, so passing an untouched audit to the application stage makes no changes.

## Built-in tasks

The package includes three faithful tasks derived from real workflows:

- `reportCompression`: editorial and PDF-layout compression for a Typst apprenticeship report;
- `banknoteProposalLint`: specification lint for a recto-verso banknote series intended for image generation;
- `scenarioSalience`: semantic-salience review for an annotated Markdown scenario used for chapter generation.

The Power Apps and general static-analysis prompts that informed the evidence model are not built-in tasks because they do not yet use the decision artifact and application phase.

```ts
import { scenarioSalience } from 'semantic-audit/tasks';

const prompt = await scenarioSalience.templates.analyze.run({
  inputs: 'Audit scenario.md. Use style.md as a reference.',
  decisionMode: 'manual',
  output: 'Emit the audit YAML only.',
});
```

Only `scenarioSalience` supports `decisionMode: "safe"`. In that opt-in mode, the analysis may copy a safe recommendation option key into `decision`. There is no separate `auto_apply` field.

## Validation

Every task owns the complete audit contract composed from generic and task-specific Zod schemas.

```ts
import { readFile } from 'node:fs/promises';
import { reportCompression } from 'semantic-audit/tasks';

const yaml = await readFile('compression-review.yaml', 'utf8');
const result = reportCompression.validateAuditYaml(yaml);

if (!result.success) {
  throw new Error(result.issues.join('\n'));
}
```

Use `task.auditSchema` for direct Zod integration, `task.auditJsonSchema` for editor tooling, or `task.templates.schema` to render the composed draft 2020-12 schema as YAML.

Validation checks both structure and relationships that JSON Schema cannot express conveniently, including recommendation and decision references, custom notes, execution authority, and summary counts.

## Tempalace registry

The root `templates.ts` registry exposes three entries per built-in task:

```text
report-compression.analyze
report-compression.apply
report-compression.schema
banknote-proposal-lint.analyze
banknote-proposal-lint.apply
banknote-proposal-lint.schema
scenario-salience.analyze
scenario-salience.apply
scenario-salience.schema
```

For example:

```sh
tp scenario-salience.analyze +inputs "Audit scenario.md" +decisionMode safe
tp scenario-salience.schema
```

## Defining a task

`defineAuditTask` is the extension point for project-specific audits. A task provides:

- stable metadata and its allowed option actions;
- task-specific Zod payload schemas;
- free-form prose sections without headings;
- structured rule groups with stable IDs;
- application guidance;
- a valid minimal audit example;
- optional safe-decision criteria.

```ts
import { z } from 'zod';
import { defineAuditTask } from 'semantic-audit';

export const terminologyAudit = defineAuditTask({
  id: 'terminology-audit',
  name: 'Terminology audit',
  description: 'Find semantic terminology drift.',
  actions: ['replace', 'keep'],
  schemas: {
    findingPayload: z.strictObject({ canonicalTerm: z.string() }),
  },
  analysis: {
    objective: 'Find terms that conflict with the vocabulary established by the target.',
    ruleGroups: [
      {
        id: 'terminology',
        title: 'Terminology rules',
        rules: [
          {
            id: 'drift',
            title: 'Semantic drift',
            description: 'Find two terms used for one concept when the target establishes one as canonical.',
          },
        ],
      },
    ],
  },
  application: {
    sections: [
      {
        id: 'terminology-apply',
        title: 'Replacement discipline',
        body: 'Change only references covered by the selected finding.',
      },
    ],
  },
  exampleAudit: {
    version: 1,
    task: { id: 'terminology-audit' },
    sources: [{ file: 'target.md', role: 'target' }],
    summary: {
      findings: {
        total: 0,
        decided: 0,
        open: 0,
        applied: 0,
        kept: 0,
        blocked: 0,
      },
    },
    findings: {},
  },
});
```

`defineAuditTask` validates `exampleAudit` immediately and rejects an incomplete definition.

## Development

Semantic Audit currently links to the experimental Tempalace checkout in the adjacent repository.

```sh
pnpm run build
pnpm run typecheck
pnpm run test
```
