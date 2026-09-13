Apply the authorized decisions contained in the supplied audit YAML to the supplied target document.

This is the execution stage.

The analysis has already occurred.

Do not search for new findings.

Do not broaden existing findings.

Do not reinterpret unresolved findings merely because you believe you can improve them.

# Inputs

You will receive:

- the target document;
- the audit task specification;
- the completed review YAML produced by the analysis stage.

# Authority order

For each finding, use this order of authority:

1. explicit human `decision`;
2. explicit human `note`;
3. an analysis-stage recommendation with `auto_apply: true`;
4. the original target text.

The task specification remains binding throughout.

A human decision overrides autonomous authorization.

# Findings to apply

Apply a finding when either:

- a human decision explicitly approves or customizes an action; or
- `auto_apply: true`, no human decision overrides it, and the recommended action remains applicable to the current source.

Leave unchanged:

- findings with `auto_apply: false` and no human approval;
- findings marked `keep`;
- deferred findings;
- findings whose source context no longer matches safely.

Do not infer approval from confidence alone.

# Application principles

Modify only material covered by an authorized finding.

Preserve surrounding content unless a minimal local adjustment is required for grammar, paragraph continuity, Markdown validity, or the exact operation specified by the finding.

When an authorized finding:

- removes a counterfactual, retain the selected story state;
- declarativizes a modal or imperative, preserve its exact semantic scope;
- moves rationale to author annotation, preserve that rationale faithfully and keep it out of ordinary LLM-facing text;
- splits mixed material, keep story-owned information in ordinary text and author-owned information in blockquote form;
- deduplicates material, preserve the occurrence whose function is active at that location;
- removes interpretive scaffolding, ensure the underlying proposition remains present.

Do not compensate for deleted material by inventing a new explanation elsewhere.

Do not replace a removed unwanted hypothetical with a synonym or equivalent hypothetical.

# Author-facing annotations

Follow the target document's annotation convention exactly.

When the task specification defines Markdown blockquotes as author-facing annotations:

- preserve all existing annotations unless explicitly authorized otherwise;
- add a new blockquote only when the finding explicitly authorizes moving material into the author layer;
- do not expose a moved counterfactual elsewhere in ordinary scenario text;
- do not expand the rationale beyond what the source supports.

# Manual findings

Do not edit open findings.

Their unchanged presence is intentional pending review.

If a human later fills `decision` or `note`, a subsequent application run may apply those instructions without rerunning the analysis.

# Validation

After applying all authorized findings, compare the result against the original target.

Validate all of the following:

- every content change corresponds to an authorized finding;
- every `auto_apply: false` unresolved finding remains unchanged;
- protected facts and distinctions remain intact;
- chapter order and heading structure remain intact unless explicitly authorized;
- protected exact text remains exact;
- existing author annotations remain unchanged except where explicitly authorized;
- no rewrite introduced a new unwanted counterfactual or equivalent semantic residue;
- declarativization did not change possibility into fact when possibility was substantive;
- removing a contrast did not erase a real character, legal, institutional, evidentiary, or technical alternative;
- removing a repeated derivation did not remove a later changed function;
- Markdown remains structurally valid.

If an authorized change fails validation:

1. revert that individual change;
2. leave the source unchanged at that location;
3. mark the finding `applied: false`;
4. record the failure in `action_taken`;
5. set its status to `blocked`;
6. do not improvise a different edit.

# Updating the audit YAML

For every finding, preserve the original analysis fields.

Update execution fields only.

For an applied finding:

- `applied: true`
- `status: applied`
- `action_taken`: concise description of the actual operation

For an authorized but unsafe or impossible finding:

- `applied: false`
- `status: blocked`
- `action_taken`: concise explanation

For an unresolved manual finding:

- `applied: false`
- `status: open`

For an intentional keep:

- `applied: false`
- `status: kept`

Update aggregate summary counts and after-edit diagnostics.

Do not erase the original wording, recommendation, confidence, or rationale from the audit.

# Output

Emit exactly:

1. the updated target document;
2. the updated review YAML.

Do not emit an additional prose review.

Do not report new findings.
