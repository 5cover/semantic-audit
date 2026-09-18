import { defineAuditTask } from 'semantic-audit'
import { zod as z } from '@tempalace/core'

export const chapterConformance = defineAuditTask({
  id: 'chapter-conformance',
  name: 'Chapter conformance',
  description:
    'Audit an existing drafted chapter against the latest authoritative scenario while preserving compatible prose and surfacing only changes needed for final-story conformance, including explicit procedural-dramatization requirements.',

  actions: ['replace', 'insert', 'remove', 'move', 'restructure', 'keep'],

  schemas: {
    findingPayload: z.object({
      kind: z.enum([
        'story_conflict',
        'missing_story_requirement',
        'realization_mismatch',
        'continuity_mismatch',
        'arc_mismatch',
      ]),

      scenarioExcerpt: z
        .string()
        .min(1)
        .describe('Short verbatim excerpt from the final scenario supporting the finding.'),

      scenarioRequirement: z
        .string()
        .min(1)
        .describe(
          'Concise statement of the final-scenario requirement that the current chapter does not fully satisfy.'
        ),

      changeSize: z.enum(['local', 'scene', 'structural']),

      existingProseReuse: z.enum(['mostly', 'partly', 'little', 'unknown']),
    }),
  },

  analysis: {
    objective: `
Audit the current drafted chapter against the latest authoritative scenario as an existing manuscript, not as prose to regenerate.

The final scenario is authoritative for selected story state, chronology, causality, character and institutional knowledge, live alternatives, legal and evidentiary distinctions, technical and physical boundaries, character arcs, required events, and explicitly selected realization properties.

Preserve the current chapter by default. Report only differences that require a decision because the chapter conflicts with the final story, omits necessary setup or handoff, violates an explicit realization requirement, or materially diverges from the final character arc.

A chapter may differ from how the final scenario would now cause a fresh generator to write it and still be conformant. Do not treat newer generation guidance, stylistic preferences, or alternative possible realizations as retroactive obligations unless the final scenario makes the resulting property explicit and the existing prose materially fails it.
`,

    ruleGroups: [
      {
        id: 'story-state',
        title: 'Selected story state',
        rules: [
          {
            id: 'conflict',
            title: 'Story conflict',
            description: `
Find facts, chronology, causal relationships, knowledge states, legal or evidentiary states, technical boundaries, or live alternatives in the chapter that conflict with the final scenario.

Do not report harmless differences in wording, emphasis, ordering, or incidental detail when both realizations remain compatible with the same selected story state.
`,
          },
          {
            id: 'missing-required-state',
            title: 'Missing required story material',
            description: `
Find final-scenario material absent from the chapter only when that absence matters: the scenario marks it as a required event, later causality or knowledge depends on it, or the chapter must establish it for a later handoff.

Absence by itself is not a finding. Scenario detail may remain implicit, off-page, or unused unless the final scenario makes its presence consequential.
`,
          },
        ],
      },

      {
        id: 'continuity',
        title: 'Continuity and handoff',
        rules: [
          {
            id: 'incoming-state',
            title: 'Incoming state',
            description: `
Find cases where the chapter begins from a state incompatible with the final scenario's chronology, prior consequences, knowledge, custody status, access limits, evidence state, relationships, or other established conditions.
`,
          },
          {
            id: 'outgoing-state',
            title: 'Outgoing handoff',
            description: `
Find cases where the chapter fails to establish state that the final scenario requires later chapters to inherit, or establishes a materially different state.
`,
          },
        ],
      },

      {
        id: 'realization',
        title: 'Narrative resolution and procedural dramatization',
        rules: [
          {
            id: 'explicit-resolution',
            title: 'Explicit realization requirement',
            description: `
Treat explicit final-scenario decisions about narrative resolution as requirements, especially the chapter's "Procedural dramatization" section.

Compare the current manuscript with the selected resolution: direct scene, compressed process, selective transcript, document, playback, off-page event, or other explicitly assigned mode. Report a finding when the draft realizes materially different resolution even if the underlying facts are technically present.
`,
          },
          {
            id: 'procedural-selection',
            title: 'Procedural scene selection',
            description: `
Check whether events the final scenario specifically assigns to direct dramatization are actually experienced at that resolution, and whether process explicitly assigned to compression remains compressed.

Do not demand exhaustive procedure. The final scenario's selection of what deserves scene time controls.
`,
          },
          {
            id: 'mode-function',
            title: 'Presentation mode',
            description: `
Where the final scenario explicitly assigns transcript, documentary, playback, or narrative treatment for a functional reason, report material mode mismatches. Do not report ordinary prose choices that remain within the selected mode.
`,
          },
        ],
      },

      {
        id: 'character-arc',
        title: 'Character arc conformance',
        rules: [
          {
            id: 'behavior',
            title: 'Behavioral continuity',
            description: `
Find behavior, choices, motives, or relationship state that materially conflict with the final cross-cutting character model or with changes that the final scenario now requires to accumulate across chapters.

Do not retrofit abstract characterization labels onto prose that already embodies a compatible character state.
`,
          },
          {
            id: 'strategy',
            title: 'Strategic continuity',
            description: `
For characters whose strategy matters across chapters, report choices that break the final scenario's selected objectives or decision logic when the mismatch changes story causality or later interpretation.

Do not report a newer cross-cutting generation instruction merely because an older chapter was written before that instruction existed.
`,
          },
        ],
      },

      {
        id: 'preservation',
        title: 'Preserve compatible manuscript',
        rules: [
          {
            id: 'no-regeneration',
            title: 'No regeneration pressure',
            description: `
The current chapter is a manuscript with accumulated human edits, not an obsolete generator output. Do not recommend rewriting material simply because a fresh generation from the final scenario might differ.
`,
          },
          {
            id: 'no-style-backport',
            title: 'No automatic style backport',
            description: `
Do not turn later style rules, cross-cutting generation policies, or scenario-cleanup decisions into findings unless the existing chapter contains an actual story, arc, continuity, or explicit-realization problem.

Prefer keeping prose that remains compatible with the final scenario.
`,
          },
          {
            id: 'change-size',
            title: 'Expose change magnitude',
            description: `
Classify every finding as local, scene, or structural.

Use local when the issue can be resolved without materially rebuilding a scene.
Use scene when a scene must be inserted, expanded, compressed, or substantially reworked.
Use structural only when the chapter's sequencing or multiple scenes must change.

Also state how much existing prose appears reusable. This is an audit estimate, not authorization to rewrite.
`,
          },
        ],
      },
    ],
  },

  application: {
    sections: [
      {
        id: 'preserve-manuscript',
        title: 'Preservation default',
        body: `
Apply only explicitly selected findings. Preserve all unaffected prose exactly where practical. Do not regenerate the chapter, harmonize style globally, or apply unreviewed differences from the final scenario.
`,
      },
      {
        id: 'bounded-repair',
        title: 'Bounded repair',
        body: `
Use the smallest edit that satisfies the selected scenario requirement.

For local findings, modify only the necessary passage.
For scene findings, reuse existing prose, dialogue, transitions, and scene material wherever they remain compatible.
For structural findings, change only the approved structure and preserve unaffected scenes.
`,
      },
      {
        id: 'realization-repair',
        title: 'Realization repair',
        body: `
When an approved finding concerns procedural dramatization or another explicit realization requirement, change the narrative resolution only to the extent authorized by that finding. Do not expand adjacent procedural material merely because the scenario contains it.
`,
      },
      {
        id: 'conflict-discipline',
        title: 'Unexpected conflicts',
        body: `
If applying an approved finding reveals a new contradiction, missing prerequisite, or scenario ambiguity not covered by the finding, do not solve it opportunistically. Leave the additional material unchanged and block the finding if the approved repair cannot be completed safely without a new decision.
`,
      },
      {
        id: 'notes-authority',
        title: 'Review notes',
        body: `
Treat the user's note as controlling within the selected finding. A note may narrow the option, preserve specified prose, choose a different integration point, or direct that the scenario rather than the manuscript be reconsidered. Do not broaden the note beyond the finding.
`,
      },
    ],
  },

  exampleAudit: {
    task: { id: 'chapter-conformance' },

    sources: [
      {
        file: 'chapter-6.md',
        role: 'target',
      },
      {
        file: 'scenario.md',
        role: 'reference',
      },
    ],

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
