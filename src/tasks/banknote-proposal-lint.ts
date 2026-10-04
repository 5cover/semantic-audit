import { zod as z } from '@tempalace/core'
import { defineAuditTask } from '../tasks.js'
import type { AuditRule } from '../types.js'

const categories = [
  'unresolved_alternative',
  'soft_optionality',
  'weak_preference',
  'negative_sediment',
  'broad_negation',
  'contrastive_overdefinition',
  'enumeration_pressure',
  'additive_accumulation',
  'missing_representation_channel',
  'abstract_visual_noun',
  'concept_leakage',
  'unspecified_hierarchy',
  'unspecified_cardinality',
  'unspecified_camera',
  'camera_or_spatial_alternative',
  'relational_vagueness',
  'unbounded_modifier',
  'style_without_construction',
  'rendering_ambiguity',
  'recto_verso_duplication',
  'cross_denomination_sameness',
  'cross_denomination_rendering_drift',
  'stale_concept_residue',
  'cross_section_contradiction',
  'duplicated_rule',
  'repeated_exception_handling',
  'false_precision',
  'missing_precision',
  'workflow_leakage',
  'proposal_leakage',
  'negative_to_positive_refactor',
  'choice_budget_overload',
  'noun_hierarchy_overload',
  'normative_polarity',
  'resolution_asymmetry',
  'other',
] as const

function rule(id: string, title: string, description: string, signals: readonly string[] = []): AuditRule {
  return { id, title, description, ...(signals.length === 0 ? {} : { signals }) }
}

const promptRules: readonly AuditRule[] = [
  rule(
    'unresolved-alternative',
    'Unresolved alternatives',
    'Executable descriptions must resolve materially different subjects, layouts, symbols, or scene concepts.',
    ['or, either, one of, alternatively', 'branches that independently control the composition']
  ),
  rule(
    'soft-optionality',
    'Soft optionality',
    'Important visual elements must not remain optional when their presence changes identity, hierarchy, or continuity.'
  ),
  rule(
    'weak-preference',
    'Weak preference instead of decision',
    'Art direction requiring a settled choice must not use preferably, ideally, should, may, or similar wording.'
  ),
  rule(
    'negative-sediment',
    'Negative sediment',
    'Obsolete prohibitions must be removed when a positive replacement or canonical decision already exists.'
  ),
  rule(
    'broad-negation',
    'Broad or untestable negation',
    'Negative instructions such as avoid clutter must define an observable positive target.'
  ),
  rule(
    'contrastive-overdefinition',
    'Contrastive over-definition',
    'Targets must not be defined mainly through rejected alternatives that may prime those alternatives during generation.'
  ),
  rule(
    'enumeration-pressure',
    'Enumeration pressure',
    'Lists must not give many objects equal semantic weight when they compete for visible representation.'
  ),
  rule(
    'additive-accumulation',
    'Additive instruction accumulation',
    'Repeated additions must resolve priorities rather than exceed the available visual hierarchy.'
  ),
  rule(
    'representation-channel',
    'Missing or weak representation channel',
    'Abstract concepts must specify the object, material, spatial, graphic, or lighting channel that depicts them.'
  ),
  rule(
    'abstract-visual-noun',
    'Abstract visual nouns and placeholder architecture',
    'Nouns such as innovation, culture, or infrastructure must not stand in for a drawable subject.'
  ),
  rule(
    'concept-leakage',
    'Concept leakage into executable prompts',
    'Analytical rationale or theme language must not reach an image prompt without a concrete visual role.'
  ),
  rule(
    'hierarchy',
    'Unspecified hierarchy',
    'Scenes with several major elements require an explicit dominant subject or ordering.'
  ),
  rule(
    'cardinality',
    'Unspecified cardinality',
    'Plurals and collections require a count when it materially changes silhouette, density, or balance.'
  ),
  rule(
    'camera',
    'Unspecified camera or viewpoint',
    'Scenes whose geometry depends on viewpoint require a shot, angle, distance, or orientation.'
  ),
  rule(
    'camera-alternative',
    'Camera or spatial alternatives',
    'Prompts must not offer incompatible cameras, viewpoints, or spatial arrangements.'
  ),
  rule(
    'relational-vagueness',
    'Relational vagueness',
    'Elements described as near, around, behind, connected, or integrated require enough spatial relation to stabilize composition.'
  ),
  rule(
    'relative-modifier',
    'Unbounded relative modifiers',
    'Comparative terms such as larger, subtle, close, sparse, or prominent require a usable reference.'
  ),
  rule(
    'style-construction',
    'Style adjectives without construction',
    'Style labels require concrete consequences for shape, material, palette, lighting, texture, or composition.'
  ),
  rule(
    'rendering-ambiguity',
    'Rendering ambiguity or mixed rendering vocabularies',
    'Rendering modes and vocabulary must remain compatible rather than push generations toward different media.'
  ),
  rule(
    'recto-verso-duplication',
    'Recto-verso duplication',
    'Paired faces must form a deliberate relationship rather than restate the same subject, composition, and semantic function.'
  ),
  rule(
    'denomination-sameness',
    'Cross-denomination sameness',
    'Denominations require distinguishable protagonists or silhouettes within the series.'
  ),
  rule(
    'rendering-drift',
    'Cross-denomination rendering drift',
    'Every denomination must follow the series rendering grammar unless a supported purpose justifies departure.'
  ),
  rule(
    'stale-residue',
    'Stale concept residue',
    'Superseded names, motifs, or choices must not remain in tables, prompts, accessibility text, or summaries.'
  ),
  rule(
    'contradiction',
    'Cross-section contradiction',
    'The same decision must remain consistent across rationale, prompt, continuity, evaluation, and summary sections.'
  ),
  rule(
    'duplicated-rule',
    'Duplicated rules and local sediment',
    'Local copies of a shared rule must add contextual behavior or be removed to prevent drift from the source of truth.'
  ),
  rule(
    'exceptions',
    'Repeated exception handling',
    'Repeated caveats require a better-scoped common rule or a single modeled exception.'
  ),
  rule(
    'false-precision',
    'False precision',
    'Exact values must correspond to a meaningful controllable variable and avoid unjustified certainty.'
  ),
  rule(
    'missing-precision',
    'Missing precision in high-leverage variables',
    'Counts, hierarchy, camera, scale, placement, and representation require values when they strongly affect the result.'
  ),
  rule(
    'workflow-leakage',
    'Workflow leakage into proposal',
    'Generation experiments, temporary prompts, rejected attempts, and process notes must not remain in the selected proposal.'
  ),
  rule(
    'proposal-leakage',
    'Proposal leakage into reusable workflow',
    'Project-specific banknote decisions must not be expressed as global generation rules.'
  ),
  rule(
    'positive-refactor',
    'Negative-to-positive refactor opportunity',
    'Vague or redundant negative instructions require a specific positive target.'
  ),
  rule(
    'choice-budget',
    'Choice-budget overload',
    'Scenes must not leave several independent high-leverage variables unresolved at once.'
  ),
  rule(
    'noun-hierarchy',
    'Noun-hierarchy overload',
    'Concrete nouns must not compete excessively for protagonist or secondary-subject status.'
  ),
  rule(
    'normative-polarity',
    'Normative polarity',
    'Positive requirements and negative restrictions must remain balanced when imbalance would weaken executability.'
  ),
  rule(
    'resolution-symmetry',
    'Resolution symmetry',
    'Parallel denominations and paired faces require comparable levels of visual resolution.'
  ),
]

export const banknoteProposalLint = defineAuditTask({
  id: 'banknote-proposal-lint',
  name: 'Banknote proposal lint',
  description: 'Audit a banknote series design proposal for specification smells that reduce image-generation quality.',
  actions: [
    'select',
    'remove',
    'replace',
    'rewrite_positive',
    'consolidate',
    'specify',
    'rank',
    'synchronize',
    'centralize',
    'move',
    'keep',
    'other',
  ],
  schemas: {
    taskPayload: z.strictObject({
      artifact: z.literal('banknote_series_design_proposal'),
      paired_faces: z.boolean(),
    }),
    summaryPayload: z.strictObject({
      by_category: z.record(z.string(), z.int().min(0)),
      by_priority: z.strictObject({
        high: z.int().min(0),
        medium: z.int().min(0),
        low: z.int().min(0),
      }),
      by_confidence: z.strictObject({
        high: z.int().min(0),
        medium: z.int().min(0),
        low: z.int().min(0),
      }),
      reviewed_scene_specifications: z.int().min(0),
      choice_overload_scenes: z.int().min(0),
      instruction_polarity: z.strictObject({
        positive_requirements: z.int().min(0),
        negative_restrictions: z.int().min(0),
        note: z.string().min(1).optional(),
      }),
      general_observations: z.array(z.string()).optional(),
    }),
    findingPayload: z.strictObject({
      category: z.enum(categories),
      detector: z.strictObject({
        proxies: z.array(z.string().min(1)).min(1),
        false_positive_risk: z.string().min(1),
        false_negative_risk: z.string().min(1),
      }),
      reveals: z.string().min(1),
      review_questions: z.array(z.string().min(1)).min(1),
      quality_effect: z
        .strictObject({
          is: z.enum([
            'improves_determinism',
            'improves_clarity',
            'reduces_redundancy',
            'improves_consistency',
            'mixed',
            'neutral',
          ]),
          because: z.string().min(1),
        })
        .optional(),
    }),
    optionPayload: z.strictObject({
      expected_effect: z.array(z.string().min(1)).min(1),
    }),
  },
  analysis: {
    objective: `Perform a structured lint review of the complete design proposal. Identify specification smells likely to create ambiguity, instability, drift, unnecessary prompt length, weak hierarchy, or inconsistent image generation. Evaluate the selected proposal rather than redesigning the series from taste alone.`,
    inputs: `Use the complete proposal, its executable image prompts, shared visual rules, denomination-specific rationale, recto-verso relationships, continuity tables, accessibility descriptions, and any explicitly supplied generation constraints.`,
    protectedModel: `Preserve settled concepts, deliberate ambiguity, series identity, denomination distinctions, cultural meaning, security-ready motifs, accessibility intent, material constraints, and user-authored art-direction choices unless a finding directly demonstrates a conflict.`,
    sections: [
      {
        id: 'banknote-evidence',
        title: 'Evidence and detector discipline',
        body: `Use lexical and structural proxies to discover candidates, then adjudicate them semantically. Each finding records why the proxy is meaningful here and the risks of false positives and false negatives. Do not report a smell merely because a word such as or, should, avoid, subtle, or symbolic appears.`,
      },
      {
        id: 'banknote-options',
        title: 'Options and ranking',
        body: `Offer genuinely different, executable resolutions. Distinguish priority, which measures the value of resolving the issue, from confidence, which measures confidence in the diagnosis and proposed edit. A recommendation remains advisory.`,
      },
      {
        id: 'banknote-macro',
        title: 'Series-level questions',
        body: `Check whether every denomination has a distinct visual proposition, whether recto and verso form an intentional pair, whether shared rules remain centralized, and whether prompts, tables, summaries, and rationale agree on the selected design.`,
      },
    ],
    ruleGroups: [{ id: 'banknote-detectors', title: 'Specification risks', rules: promptRules }],
    finalTest: `A finding must identify a concrete specification problem, explain how it affects generation or maintainability, and offer an action precise enough to apply after a human decision.`,
  },
  application: {
    sections: [
      {
        id: 'banknote-apply-principles',
        title: 'Proposal preservation',
        body: `Preserve the core concept, settled user decisions, terminology, intentional ambiguity and conceptual nuance. Increase determinism only where selected. Do not replace one vague formulation with another.`,
      },
      {
        id: 'banknote-apply-consistency',
        title: 'Dependent representations',
        body: `When a decision selects a branch, camera, hierarchy, count, representation channel, or canonical concept, update only the listed or necessarily dependent prompts, tables, continuity text, accessibility descriptions, and summaries. Remove stale terminology from those locations.`,
      },
      {
        id: 'banknote-apply-negative',
        title: 'Positive refactors',
        body: `When replacing a negative instruction, state the selected positive invariant and remove the old prohibition unless it blocks a separate, specific and plausible failure.`,
      },
    ],
  },
  exampleAudit: {
    task: {
      id: 'banknote-proposal-lint',
      payload: { artifact: 'banknote_series_design_proposal', paired_faces: true },
    },
    sources: [{ file: 'proposal.md', role: 'target', description: 'Complete banknote series proposal' }],
    summary: {
      findings: { total: 1, decided: 0, open: 1, applied: 0, kept: 0, blocked: 0 },
      payload: {
        by_category: { unspecified_cardinality: 1 },
        by_priority: { high: 1, medium: 0, low: 0 },
        by_confidence: { high: 0, medium: 1, low: 0 },
        reviewed_scene_specifications: 12,
        choice_overload_scenes: 0,
        instruction_polarity: {
          positive_requirements: 84,
          negative_restrictions: 39,
          note: 'Approximate semantic counts, not a score.',
        },
      },
    },
    findings: {
      PL1: {
        title: 'Secondary satellite-dish count is unstable',
        location: { file: 'proposal.md', section: '10 euro verso prompt', anchor: 'secondary dishes' },
        related_locations: [],
        scope: 'local',
        excerpt: 'Secondary dishes surround the primary observatory dish.',
        issue: 'The number of large secondary dishes is unspecified, allowing materially different site density.',
        rationale: 'Large dishes strongly affect silhouette and balance.',
        priority: 'high',
        confidence: 'medium',
        options: {
          A: {
            action: 'specify',
            description: 'Specify exactly two secondary dishes.',
            replacement:
              'One dominant parabolic dish anchors the site, with exactly two smaller secondary dishes behind it.',
            risk: 'low',
            payload: { expected_effect: ['stabilizes composition', 'preserves the one-plus-two hierarchy'] },
          },
        },
        recommendation: 'A',
        decision: null,
        note: null,
        execution: null,
        payload: {
          category: 'unspecified_cardinality',
          detector: {
            proxies: ['major plural object without a count'],
            false_positive_risk: 'Counts are unnecessary for low-value background details.',
            false_negative_risk: 'A vague singular collective can create the same instability.',
          },
          reveals: 'A high-leverage secondary quantity remains open.',
          review_questions: ['How many secondary dishes should appear?'],
          quality_effect: {
            is: 'improves_consistency',
            because: 'Independent generations receive the same large-object count.',
          },
        },
      },
    },
  },
})
