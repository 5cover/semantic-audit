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
import { scenarioSalience } from 'semantic-audit/tasks'

const prompt = await scenarioSalience.templates.analyze.run({
  inputs: 'Audit scenario.md. Use style.md as a reference.',
  decisionMode: 'manual',
  output: 'Emit the audit YAML only.',
})
```

Only `scenarioSalience` supports `decisionMode: "safe"`. In that opt-in mode, the analysis may copy a safe recommendation option key into `decision`. There is no separate `auto_apply` field.

## Validation

Every task owns the complete audit contract composed from generic and task-specific Zod schemas.

```ts
import { readFile } from 'node:fs/promises'
import { reportCompression } from 'semantic-audit/tasks'

const yaml = await readFile('compression-review.yaml', 'utf8')
const result = reportCompression.validateAuditYaml(yaml)

if (!result.success) {
  throw new Error(result.issues.join('\n'))
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
import { defineAuditTask } from 'semantic-audit'
import * as z from 'zod'

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
})
```

`defineAuditTask` validates `exampleAudit` immediately and rejects an incomplete definition.

The task produces two independent prompts. The analysis prompt receives the target and creates an audit. The
application prompt receives the target and a reviewed audit, then applies only its authorized decisions. Both prompts
repeat the task specification and audit contract. The `Audit schema` and `Example audit` blocks below are elided only
because they are generated directly from the composed schemas and example above.

With these inputs:

```ts
const analysisPrompt = await terminologyAudit.templates.analyze.run({
  inputs: 'target.md is the terminology document to review.',
  decisionMode: 'manual',
  output: 'Emit only the audit YAML.',
})

const applicationPrompt = await terminologyAudit.templates.apply.run({
  inputs: 'target.md is the terminology document to update.',
  audit: `
task:
  id: terminology-audit
sources:
  - file: target.md
    role: target
summary:
  findings:
    total: 1
    decided: 1
    open: 0
    applied: 0
    kept: 0
    blocked: 0
findings:
  T1:
    location:
      file: target.md
      section: API reference
      anchor: client token
    related_locations: []
    scope: local
    excerpt: "The client token authenticates each request."
    issue: The target uses client token for the canonical access token.
    priority: medium
    confidence: high
    options:
      A:
        action: replace
        description: Use the canonical term access token.
        replacement: "The access token authenticates each request."
        risk: low
    recommendation: A
    decision: A
    note: null
    execution: null
    payload:
      canonicalTerm: access token
`,
  output: 'Emit the updated target and audit YAML.',
})
```

The analysis template renders:

````md
# Semantic audit

## Stage

Perform the analysis stage for the configured task. Examine the complete target and produce the structured audit. Do not modify target artifacts.

## Inputs

target.md is the terminology document to review.

## Generic method

### Establish the model

Infer the target's actual semantics, functions, contracts, and protected properties from the supplied evidence.

### Discover candidates

Search broadly using lexical, structural, comparative, and semantic signals. A surface match is evidence for inspection, not a finding by itself.

### Adjudicate with evidence

Report only concrete mismatches supported by the target or its references. Do not report generic best practices without project-specific evidence. Every finding must include a short, verbatim `excerpt` from the target that makes it immediately recognizable. For cluster, cross-section, or global findings, use one representative instance. Consider relationships between distant producers, consumers, sections, and representations.

### Consolidate findings

Create one finding per independently reviewable root decision. Combine repeated symptoms of the same underlying issue and keep distinct decisions separate.

### Recommend options

Provide concrete options whose semantic effects are clear. Preserve the target when an edit would require unresolved design judgment.

## Task: Terminology audit

Find terms that conflict with the vocabulary established by the target.

### Terminology rules

#### Semantic drift

Find two terms used for one concept when the target establishes one as canonical.

## Decision policy

Leave every `decision` as `null`. A recommendation is advisory and is not authorization.

## Output

Emit only the audit YAML.

The audit must conform to the schema and use the example only as a shape reference.

### Audit schema

```yaml
<the composed terminology-audit schema, including canonicalTerm>
```

### Example audit

```yaml
<the exampleAudit above>
```
````

With that reviewed audit, the application template independently renders:

````md
# Semantic audit application

## Stage

Apply only the decisions authorized in the supplied audit. The analysis is complete. Do not search for new findings, broaden existing findings, or perform opportunistic cleanup.

## Inputs

target.md is the terminology document to update.

### Audit

```yaml
task:
  id: terminology-audit
sources:
  - file: target.md
    role: target
summary:
  findings:
    total: 1
    decided: 1
    open: 0
    applied: 0
    kept: 0
    blocked: 0
findings:
  T1:
    location:
      file: target.md
      section: API reference
      anchor: client token
    related_locations: []
    scope: local
    excerpt: 'The client token authenticates each request.'
    issue: The target uses client token for the canonical access token.
    priority: medium
    confidence: high
    options:
      A:
        action: replace
        description: Use the canonical term access token.
        replacement: 'The access token authenticates each request.'
        risk: low
    recommendation: A
    decision: A
    note: null
    execution: null
    payload:
      canonicalTerm: access token
```

## Authority

For each finding, use `decision` first and `note` second. The recommendation is advisory only.

- An option key selects that option.
- `custom` applies only the instruction in `note`.
- `reject`, `defer`, and `null` make no target change.
- A selected `keep` option records a kept outcome without changing the target.

## Application method

Locate the exact material using the stable location and verbatim excerpt. Apply the smallest change that fulfills the selected option or custom note. Preserve surrounding semantics and structure.

After a successful content change, record an `applied` execution result and describe the actual operation. Record `kept` for a selected keep option. If the source no longer matches safely or validation fails, leave that location unchanged and record `blocked`. Leave execution null for rejected, deferred, and open findings.

Preserve every analysis field. Update only execution data, derived summary values, and task-defined after-application diagnostics.

## Task specification: Terminology audit

Find semantic terminology drift.

### Objective

Find terms that conflict with the vocabulary established by the target.

### Terminology rules

#### Semantic drift

Find two terms used for one concept when the target establishes one as canonical.

### Replacement discipline

Change only references covered by the selected finding.

## Audit contract

The updated audit must preserve the supplied findings and conform to this composed contract. Task-specific payload schemas are included here.

### Audit schema

```yaml
<the composed terminology-audit schema, including canonicalTerm>
```

## Validation

Confirm that every target change corresponds to an actionable decision, unresolved findings remain unchanged, protected semantics remain intact, and the resulting artifact remains structurally valid.

## Output

Emit the updated target and audit YAML.
````

## Development

Semantic Audit currently links to the experimental Tempalace checkout in the adjacent repository.

```sh
pnpm run build
pnpm run typecheck
pnpm run test
```
