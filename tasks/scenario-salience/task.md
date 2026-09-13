Audit the complete annotated scenario for information that artificially enlarges the scenario or gives the chapter generator unnecessary semantic votes toward stories, interpretations, emphases, explanations, or realizations that are not part of the selected story.

The objective is not general compression.

The objective is to make the generator-facing scenario more nearly represent the selected story itself rather than the design conversation, rejected stories, anticipated generator mistakes, or explanatory scaffolding that produced it.

The target document contains both:

- ordinary Markdown, which is visible to the chapter generator;
- author-facing blockquote annotations, which are stripped before chapter generation.

This distinction is fundamental to the audit.

# Inputs

Primary target:

- the complete annotated scenario file.

Reference sources, only when explicitly supplied:

- style rules;
- typography rules;
- other generation-policy files necessary to determine whether scenario material duplicates or conflicts with an established rule.

Do not use outside story knowledge to redesign the scenario.

# Outputs

Produce:

1. a complete structured YAML audit;
2. after the separate application stage, an updated annotated scenario;
3. the same YAML audit updated with the actions actually applied.

Existing author-facing blockquotes are protected unless a finding explicitly concerns the organization of annotations themselves.

New author-facing blockquotes may be added when material is useful to the author. They disappear from the compiled LLM-facing scenario.

# Core model

The scenario contains:

- selected story state;
- selected chronology and causality;
- character and institutional knowledge states;
- meaningful alternatives that actually exist inside the story;
- legal, evidentiary, technical, physical, and procedural boundaries that affect the story;
- narrative-resolution properties necessary for the chapter generator;
- reusable generation invariants whose presence materially improves generation.

It needs not contain a shadow scenario made of stories the author rejected, feared, compared against, or used only to reason toward the selected version.

A distinction that was useful while designing the story does not automatically remain useful when generating the finished story.

# Primary audit question

For every alternative, exclusion, contrast, qualification, instruction, interpretation, or rejected realization, ask:

> Where does this information exist?

Possible answers:

- `story`: it exists in a character's mind, institutional decision space, legal theory, evidentiary distinction, physical possibility, causal structure, explicit choice, or other part of the selected fictional model;
- `author`: it records useful design history, rationale, a rejected branch, or an important warning for future revision, but the prose generator does not benefit from seeing it;
- `none`: it exists only as a hypothetical bad generation, prophylactic clarification, conversational residue, or unnecessary explanation;
- `mixed`: part belongs to the story and part belongs only to the author;
- `unclear`: determining ownership requires a design judgment.

This ownership classification is central to the audit.

# Finding families

Audit for all of the following semantically, not merely by keyword.

## Counterfactual salience

Find passages that specify X by also supplying an unwanted Y:

- X rather than Y;
- X but not Y;
- X instead of Y;
- X without Y;
- not X but Y;
- avoid Y;
- do not turn X into Y;
- keep X from becoming Y;
- no need to Y;
- Y is unnecessary;
- or semantically equivalent constructions.

The critical question whether Y contributes useful information to the selected story.

If the generator were already going to realize X correctly, ask whether knowing Y would improve the resulting story.

If not, Y is likely context pollution.

Preserve contrasts when the alternative genuinely exists inside the story or when an unintuitive and consequential boundary cannot be specified safely without it.

Do not preserve Y merely because naming Y helped establish X during development.

## Defensive or prophylactic specification

Find material whose principal function is to prevent an imagined generator misunderstanding.

Typical cases include:

- enumerating what evidence does not establish before stating what it does establish;
- listing things a character does not mean before stating what they mean;
- explaining that a scene is not some unwanted genre or emotional mode;
- warning against an interpretation already excluded by a sufficiently precise positive specification.

A negative proposition earns its information; it does not automatically earn contextual presence.

Keep negative facts, refusals, failures, prohibitions, exclusions, and absences that genuinely belong to the story.

## Resolved propositions modalized as preferences

Audit authorial uses of:

- should;
- may;
- might;
- could;
- probably;
- perhaps;
- ideally;
- preferably;
- similar modal or preference language.

No unresolved authorial uncertainty belongs in the LLM-facing scenario.

When a modalized statement is actually a settled event, state, relationship, or narrative property, prefer the corresponding declarative specification.

Example class:

`His final contribution should remain mundane.`

usually represents settled state:

`His final contribution remains mundane.`

Do not mechanically remove modality from:

- character beliefs;
- legal standards;
- physical or institutional possibilities;
- genuine alternatives inside the story;
- reusable generation invariants where the normative formulation itself governs multiple downstream realizations.

For reusable invariants such as `Attribution should be earned`, determine whether the modality carries useful cross-cutting scope. Do not auto-rewrite such cases merely to eliminate the word `should`.

## Writer-addressed imperatives

Audit direct commands embedded in scenario content, including constructions such as:

- write;
- show;
- narrate;
- dramatize;
- experience;
- keep;
- let;
- use;
- establish;
- avoid;
- preserve;
- compress;
- foreground;
- similar writer-addressed instructions.

Determine whether the same information can be represented more cleanly as a property of the selected story or intended narrative realization.

Prefer:

`The warrant execution is experienced directly at the physical boundaries where authority becomes consequential.`

over a writer-addressed command such as:

`Dramatize the warrant execution at the important boundaries.`

when the declarative version preserves the exact intended scope.

Do not perform a mechanical imperative-to-passive transformation.

The useful conversion is:

`instruction to writer -> property of selected artifact/story realization`

not:

`imperative grammar -> bureaucratic declarative grammar`.

Global or genuinely cross-cutting generation policies may require manual judgment when declarativization could alter their scope or force.

## Authorial rationale in generator-facing text

Find passages that explain:

- why the chosen version is better;
- why an alternative was rejected;
- what thematic effect a choice is intended to produce;
- what generator mistake the specification is preventing;
- the design history that led to the current version.

When that information remains useful to the author but does not belong in generation context, move it to an author-facing blockquote.

When it has no continuing value, remove it.

Do not delete valuable design rationale merely to reduce length.

## Interpretive scaffolding and reader management

Find sentences that primarily classify, preview, evaluate, or explain adjacent story information instead of contributing story state.

Examples include constructions equivalent to:

- the distinction is important;
- the question is narrow;
- the result is significant;
- the reason is practical;
- this matters because;
- the useful point is;
- this creates a contrast;
- importantly;
- crucially.

Prefer the concrete proposition when the following material already demonstrates the classification.

Interpretation remains legitimate when it exists inside character or institutional state.

## Scope-perimeter narration in the specification

Find passages that define a proposition by exhaustively constructing what lies outside it:

`not X, not Y, not Z, only A`

especially where A alone sufficiently specifies the selected state.

Preserve exclusions when the different scopes are legally, evidentially, epistemically, or causally active.

Remove perimeter construction whose only purpose is to reassure the generator that A does not imply hypothetical alternatives.

## Re-derivation of established information

Find later passages that reconstruct an already-established mechanism, causal chain, legal theory, technical system, or motivation from the beginning when the later section only needs its consequence, changed significance, evidentiary use, or character reaction.

Elide repeated derivation, not repeated significance.

Do not remove a repeated fact when its function has changed.

Do not replace precise established information with vague references when the detail is active again.

## Duplicate realization instructions

Find cases where ordinary scenario state already specifies X and an adjacent `Generation instruction`, warning, or realization sentence merely tells the generator to produce X again.

Preserve a separate instruction when it governs a real generation choice not contained in the substantive scenario.

Remove or integrate it when it merely repeats the already-selected state.

## Empty precision or classification language

Audit terms such as:

- narrow;
- precise;
- specific;
- bounded;
- limited;
- concrete;
- practical;
- meaningful;
- material;
- distinct;
- controlled;
- local;
- procedural;

when they merely signal analytical discipline instead of identifying an actual dimension of scope or difference.

Do not replace them mechanically with synonyms.

When the underlying scope can be stated directly, prefer the scope itself.

## Thesis and significance restatement

Find scenario instructions that ask eventual prose to state a thematic, emotional, strategic, or interpretive conclusion already carried by specified events.

If the meaning belongs only to authorial design rationale, move it to an annotation.

If the interpretation genuinely occurs in a character's understanding, preserve that change in character state.

# Important non-findings

Do not treat the following as defects merely because they contain contrast, negation, modality, or repetition:

- a character actively choosing between X and Y;
- an institution selecting one legal response over another;
- evidence excluding a live competing theory;
- a witness distinguishing observation from inference;
- a legally meaningful difference between two characterizations;
- a physical or technical limitation;
- a prohibition or absence that changes action;
- genuine uncertainty belonging to a character or institution;
- repeated information whose function has changed;
- repeated negative syntax where accumulation itself is part of the specified experience;
- a close, unintuitive, and important boundary whose omission would materially change likely generation.

# Information ownership and action

Use these default relationships:

`story`:
keep the information in ordinary scenario text, though its wording may still be improved if another finding applies.

`author`:
move it to an author-facing blockquote when it remains useful.

`none`:
remove it or restate only the selected positive specification.

`mixed`:
split the story-relevant information from the author-facing rationale when this can be done safely.

`unclear`:
leave unchanged and require manual review.

# Autonomous-edit threshold

Set `auto_apply: true` only when the finding is high-confidence and all of the following hold:

1. the selected surviving state is already explicit;
2. the removed or moved material has a clear ownership classification;
3. no character, institution, legal theory, evidentiary chain, technical mechanism, chronology, or causal relationship loses information;
4. no meaningful alternative inside the story is erased;
5. no new story or generation-policy decision is required;
6. the replacement is a direct local consequence of the existing specification;
7. any annotation movement preserves useful rationale faithfully;
8. the edit does not require deciding whether an ambiguous distinction is important.

Examples that are normally safe to auto-apply:

- deleting a rejected generator hypothetical after a complete positive specification;
- converting a clearly settled event-level `should` into declarative form;
- converting a local writer-addressed imperative into the equivalent declarative artifact property when scope is unchanged;
- moving an explicitly authorial rationale clause into a blockquote while retaining the selected story proposition;
- removing an announcement sentence whose following sentence already performs exactly the same function.

Examples that require manual review:

- deciding whether an alternative existed in Rick's actual strategic decision space;
- deciding whether a legal distinction remains necessary;
- changing a reusable global generation invariant;
- merging distant specifications;
- removing an exclusion that may encode an epistemic boundary;
- deciding whether a rejected branch remains valuable authorial rationale;
- any edit that changes more than realization language and begins to redesign the story.

# Preservation requirements

This is not a general rewrite or polish pass.

Preserve unless directly implicated by a finding:

- all story facts;
- chronology;
- causality;
- characterization;
- knowledge states;
- legal detail;
- technical detail;
- procedural state;
- narrative-resolution decisions;
- chapter structure;
- headings;
- named generation policies;
- transcript or typography requirements;
- exact quoted dialogue;
- existing author-facing blockquotes;
- the Description;
- any other material explicitly marked as protected.

Do not improve unrelated prose.

Do not normalize terminology for style.

Do not shorten merely because a shorter sentence is possible.

Do not target a word-count reduction.

# Diagnostic searches

Use lexical searches to support complete coverage, including at minimum families around:

- `not`
- `do not`
- `does not`
- `never`
- `without`
- `rather than`
- `instead`
- `but not`
- `avoid`
- `no need`
- `need not`
- `should`
- `should not`
- `may`
- `might`
- `could`
- common imperative generation verbs
- common interpretive classifiers

Also identify semantically equivalent constructions that contain none of these strings.

Record before/after counts as diagnostics only.

The goal is not to drive those counts toward zero.

# Final governing test

Treat the scenario as a finished specification, not as a record of the reasoning that produced it.

For each questionable passage, ask:

> Does the chapter generator benefit from knowing this?

If the answer is no but the author does, move it to the author layer.

If neither benefits, remove it.

If the generator needs it because it belongs to the selected story or a necessary generation boundary, keep it.
