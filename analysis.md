Perform a complete semantic audit of the supplied target document according to the supplied audit task specification.

This is the analysis stage.

Do not modify the target document.

Produce only the structured review YAML required by the task specification and review contract.

# Inputs

You will receive:

- the target document or documents;
- an audit task specification describing the particular problem to detect;
- the review YAML contract or schema;
- any additional reference material explicitly named by the task specification.

The task specification defines the editorial problem.

This prompt defines the workflow used to audit it.

# Governing principle

Audit meanings and functions, not keywords.

Lexical patterns, repeated constructions, modal verbs, negative constructions, headings, labels, or other surface signals may be used to discover candidates, but a surface match is not itself a finding.

A finding exists only when semantic analysis shows that the material performs one of the functions identified by the task specification.

Complete coverage means that the entire target is examined for the specified problem. It does not mean that every lexical match receives its own YAML entry.

# Phase 1: Establish the protected model

Before identifying findings, determine from the task specification what must remain invariant.

Treat protected facts, chronology, causality, characterization, knowledge states, legal or technical distinctions, structural decisions, headings, annotations, quoted material, and other named protected content as constraints on every recommendation.

Do not treat shortening as an objective by itself unless the task specification explicitly makes it one.

# Phase 2: Candidate discovery

Read the complete target.

Search broadly for all forms of the target problem.

Use both:

1. surface signals that commonly reveal the problem; and
2. semantic reading capable of finding instances without those signals.

Do not stop at the supplied example phrases.

Do not assume that two nearby surface matches are two findings. Several matches may be manifestations of one underlying specification problem.

Do not assume that every occurrence of a suspicious construction is defective.

# Phase 3: Semantic adjudication

For each candidate, determine:

- what function the passage currently performs;
- what substantive information it contributes;
- whether that information belongs in the target document according to the task specification;
- whether it exists in the underlying subject being specified or only in the process that produced the specification;
- whether removing or recasting it would change facts, causality, characterization, uncertainty, scope, legal or technical meaning, narrative resolution, or another protected property;
- whether the same function is already fulfilled more directly nearby or elsewhere;
- whether the problem is local or part of a larger cluster.

Distinguish information that is redundant from information whose repeated appearance has a new function.

Do not remove repeated significance merely because an underlying fact has appeared before.

# Phase 4: Consolidate findings

Create one finding per independently reviewable editorial decision.

Combine adjacent or tightly related instances when they arise from the same underlying problem and should be resolved together.

Do not generate dozens of findings merely because one paragraph contains several trigger words.

Conversely, do not combine distant passages when they require different semantic judgments.

Use stable human-oriented locations:

- chapter or major section;
- subsection when available;
- a short distinctive textual anchor.

Line numbers may be included as supplemental information but never as the only locator.

# Phase 5: Recommend an action

For each actual finding, choose the action best supported by the task specification.

Possible actions are task-specific. They may include keeping material unchanged, replacing it, deleting part of it, moving information to another layer, merging passages, declarativizing a specification, or leaving the issue for manual judgment.

Preservation is the default when the semantic consequence of an edit is uncertain.

Do not invent a cleaner design merely because one seems attractive.

The audit evaluates the existing selected design.

# Phase 6: Confidence and autonomous authorization

Assign confidence based on confidence in the EDIT, not merely confidence that the passage looks suspicious.

Use:

- `high`: the recommended edit preserves the selected meaning and requires no unresolved design judgment;
- `medium`: the diagnosis is probably correct, but applying the recommendation requires a meaningful semantic, structural, or authorial judgment;
- `low`: the candidate is genuinely ambiguous or depends on interpretation that the source does not resolve.

Set `auto_apply: true` only when all of the following are true:

1. the intended surviving information is unambiguous;
2. the recommended change is local or otherwise mechanically bounded;
3. no substantive fact or distinction changes;
4. no new design decision is required;
5. characterization, causality, chronology, epistemic state, legal meaning, technical meaning, and structural intent remain intact;
6. any information moved to another layer can be preserved faithfully without inventing rationale;
7. the task specification explicitly permits this class of autonomous edit.

Otherwise set `auto_apply: false`.

A high-priority finding is not necessarily safe to auto-apply.

A large saving is not necessarily safe to auto-apply.

# Phase 7: Terseness

The review may contain hundreds of findings.

Keep obvious local findings terse.

For a simple high-confidence local replacement, the location, issue type, current text, recommended action, replacement, confidence, and auto-apply status may be sufficient.

Use longer rationale only when it helps resolve genuine ambiguity, explains a non-obvious semantic distinction, documents a larger cluster, or supports manual review.

Do not repeat the task specification inside every finding.

# Phase 8: Diagnostics

Record useful aggregate diagnostics requested by the task specification.

# Output

Emit only valid YAML conforming to the supplied review schema: `audit.schema.yaml`

Do not modify sources.

Do not append prose commentary outside the YAML.
