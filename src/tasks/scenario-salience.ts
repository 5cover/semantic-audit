import * as z from 'zod';
import { defineAuditTask } from '../tasks.js';

const kinds = [
  'counterfactual_salience',
  'defensive_specification',
  'resolved_modal',
  'writer_imperative',
  'authorial_rationale',
  'interpretive_scaffolding',
  'scope_perimeter',
  'rederivation',
  'duplicate_realization_instruction',
  'empty_precision',
  'thesis_restatement',
  'strategic_alternative',
  'epistemic_boundary',
  'legal_boundary',
  'technical_boundary',
  'other',
] as const;

const owners = ['story', 'author', 'none', 'mixed', 'unclear'] as const;

export const scenarioSalience = defineAuditTask({
  id: 'scenario-salience',
  name: 'Scenario salience',
  description: 'Audit an annotated scenario for context that gives a chapter generator unwanted semantic salience.',
  actions: ['keep', 'replace', 'remove', 'move', 'split', 'merge', 'deduplicate', 'restructure', 'other'],
  schemas: {
    taskPayload: z.strictObject({
      author_annotation_format: z.literal('markdown_blockquote'),
      generator_facing_content: z.string().min(1),
      protected_content: z.array(z.string().min(1)),
      diagnostic_terms: z.array(z.string().min(1)).optional(),
    }),
    summaryPayload: z.strictObject({
      by_kind: z.record(z.string(), z.int().min(0)),
      by_owner: z.record(z.enum(owners), z.int().min(0)),
      estimated_effect: z.strictObject({
        llm_facing_words_removed: z.int().min(0),
        words_moved_to_annotations: z.int().min(0),
      }),
    }),
    findingPayload: z.strictObject({
      kinds: z.array(z.enum(kinds)).min(1),
      owner: z.enum(owners),
      information_effect: z
        .strictObject({
          preserves: z.array(z.string()),
          removes_from_llm_context: z.array(z.string()),
          moves_to_author_annotation: z.array(z.string()),
        })
        .optional(),
      annotation: z.string().optional(),
    }),
    diagnostics: z.strictObject({
      before: z.record(z.string(), z.int().min(0)),
      after: z.record(z.string(), z.int().min(0)).nullable(),
      note: z.string().min(1),
    }),
  },
  automaticDecisions: {
    criteria: [
      'The finding has high confidence and the selected option has low risk.',
      'The intended surviving story state is already explicit and unambiguous.',
      'The change is local or otherwise mechanically bounded.',
      'No fact, chronology, causality, characterization, knowledge state, legal distinction, technical distinction, or structural intent changes.',
      'No meaningful alternative inside the story is erased.',
      'No new story or generation-policy decision is required.',
      'Any material moved to an annotation is preserved faithfully.',
    ],
  },
  analysis: {
    objective: `Audit the complete annotated scenario for information that artificially enlarges it or gives the chapter generator unnecessary semantic votes toward stories, interpretations, emphases, explanations, or realizations outside the selected story. This is not general compression.`,
    inputs: `The primary target is the complete annotated scenario. Ordinary Markdown reaches the chapter generator. Markdown blockquotes are author-facing annotations stripped before generation. Use style, typography, canon, or other policy files only when explicitly supplied as references.`,
    protectedModel: `Preserve selected story state, chronology, causality, characterization, character and institutional knowledge, live alternatives, legal and evidentiary distinctions, technical and physical boundaries, narrative-resolution properties, headings, exact quoted dialogue, and existing author annotations.`,
    sections: [
      {
        id: 'scenario-ownership',
        title: 'Information ownership',
        body: `Classify questionable information as story, author, none, mixed, or unclear. Story information remains generator-facing. Useful design history belongs in an author annotation. Information useful to neither can be removed. Mixed material should be split only when its parts can be preserved safely. Unclear ownership requires manual review.`,
      },
    ],
    ruleGroups: [
      {
        id: 'scenario-families',
        title: 'Finding families',
        rules: [
          {
            id: 'counterfactual',
            title: 'Counterfactual salience',
            description: `Find passages that specify the selected state by also naming an unwanted alternative that does not contribute to the story.`,
            signals: ['rather than, but not, instead of, without', 'avoid, do not turn, no need'],
            nonFindings: [
              'A live strategic choice.',
              'A consequential legal, epistemic, physical, or technical boundary.',
            ],
          },
          {
            id: 'defensive',
            title: 'Defensive or prophylactic specification',
            description: `Find material whose principal function is to prevent an imagined generator misunderstanding already excluded by a complete positive specification.`,
            nonFindings: [
              'Negative facts, refusals, failures, prohibitions, exclusions, and absences that change the story.',
            ],
          },
          {
            id: 'modal',
            title: 'Resolved propositions modalized as preferences',
            description: `Find settled events or narrative properties expressed as should, may, might, could, ideally, preferably, or similar authorial uncertainty.`,
            resolutions: ['State the settled property declaratively when scope and meaning remain identical.'],
            nonFindings: [
              'Character uncertainty.',
              'Legal or physical possibility.',
              'A reusable normative generation invariant.',
            ],
          },
          {
            id: 'imperative',
            title: 'Writer-addressed imperatives',
            description: `Find direct commands to write, show, narrate, dramatize, keep, avoid, or foreground when the same information belongs as a property of the selected artifact.`,
            nonFindings: ['A global generation policy whose scope would change when declarativized.'],
          },
          {
            id: 'rationale',
            title: 'Authorial rationale in generator-facing text',
            description: `Find design history, rejected branches, thematic explanations, and warnings that remain useful to the author but not to generation.`,
            resolutions: ['Move useful rationale to a blockquote.', 'Remove rationale with no continuing value.'],
          },
          {
            id: 'scaffolding',
            title: 'Interpretive scaffolding and reader management',
            description: `Find sentences that classify, preview, or announce significance already demonstrated by adjacent story information.`,
            signals: ['the distinction is important', 'this matters because', 'importantly, crucially'],
          },
          {
            id: 'perimeter',
            title: 'Scope-perimeter narration',
            description: `Find propositions defined through an exhaustive outside perimeter when the selected positive scope is sufficient.`,
            nonFindings: ['Exclusions that actively determine law, evidence, knowledge, causality, or action.'],
          },
          {
            id: 'rederivation',
            title: 'Re-derivation of established information',
            description: `Find later passages that reconstruct an established mechanism or causal chain when only its changed consequence or significance is active.`,
            nonFindings: ['Repeated information whose function has changed.'],
          },
          {
            id: 'duplicate-instruction',
            title: 'Duplicate realization instructions',
            description: `Find generation instructions that merely repeat an already-selected story state without governing a separate realization choice.`,
          },
          {
            id: 'empty-precision',
            title: 'Empty precision or classification language',
            description: `Find analytical labels such as narrow, precise, bounded, meaningful, or procedural that do not identify an actual dimension of scope.`,
          },
          {
            id: 'thesis',
            title: 'Thesis and significance restatement',
            description: `Find instructions that ask eventual prose to state a conclusion already carried by the specified events.`,
            nonFindings: ['An interpretation that genuinely occurs in a character or institution.'],
          },
        ],
      },
    ],
    finalTest: `Treat the scenario as a finished specification, not a record of the reasoning that produced it. Ask whether the chapter generator benefits from knowing each questionable passage.`,
  },
  application: {
    sections: [
      {
        id: 'scenario-apply-ownership',
        title: 'Ownership-preserving edits',
        body: `Keep story-owned information in ordinary Markdown. Move author-owned information only to Markdown blockquotes. When splitting mixed material, preserve each part in its correct layer without inventing rationale.`,
      },
      {
        id: 'scenario-apply-semantics',
        title: 'Semantic preservation',
        body: `Do not replace a removed hypothetical with a synonym, change possibility into fact, erase a live alternative, remove a repeated fact whose function changed, or alter protected annotations. Preserve the selected story state after every edit.`,
      },
    ],
  },
  exampleAudit: {
    task: {
      id: 'scenario-salience',
      payload: {
        author_annotation_format: 'markdown_blockquote',
        generator_facing_content: 'Ordinary Markdown reaches the chapter generator; blockquotes do not.',
        protected_content: ['story facts', 'chronology', 'causality', 'knowledge states', 'existing annotations'],
        diagnostic_terms: ['rather than', 'should', 'do not'],
      },
    },
    sources: [{ file: 'scenario.md', role: 'target', description: 'Complete annotated scenario', words: 27959 }],
    summary: {
      findings: { total: 1, decided: 0, open: 1, applied: 0, kept: 0, blocked: 0 },
      payload: {
        by_kind: { resolved_modal: 1 },
        by_owner: { story: 1, author: 0, none: 0, mixed: 0, unclear: 0 },
        estimated_effect: { llm_facing_words_removed: 1, words_moved_to_annotations: 0 },
      },
    },
    diagnostics: {
      before: { should: 65 },
      after: null,
      note: 'Lexical counts are discovery diagnostics, never optimization targets.',
    },
    findings: {
      SS001: {
        location: {
          file: 'scenario.md',
          section: 'Chapter 11: Sentence',
          anchor: 'His final contribution should remain mundane',
        },
        related_locations: [],
        scope: 'local',
        current: 'His final contribution should remain mundane enough that the accumulated year gives it weight.',
        issue: 'A settled narrative property is modalized as an authorial preference.',
        priority: 'medium',
        confidence: 'high',
        options: {
          A: {
            action: 'replace',
            description: 'State the settled property declaratively.',
            replacement: 'His final contribution remains mundane enough that the accumulated year gives it weight.',
            risk: 'low',
          },
        },
        recommendation: 'A',
        decision: null,
        note: null,
        execution: null,
        payload: { kinds: ['resolved_modal'], owner: 'story' },
      },
    },
  },
});
