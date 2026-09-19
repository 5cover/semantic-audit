import { zod as z } from '@tempalace/core'
import { defineAuditTask } from '../tasks.js'

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
    task: {
      id: 'chapter-conformance',
    },
    sources: [
      {
        file: 'Chapter 3: The address',
        role: 'target',
        description: 'Complete chapter draft supplied in the user message.',
      },
      {
        file: 'scenario.md',
        role: 'reference',
        description:
          'Authoritative story state, Chapter 3 requirements, procedural resolution, and continuity into Chapter 4.',
      },
      {
        file: 'typography.md',
        role: 'reference',
        description: 'Narrative and documentary presentation conventions.',
      },
      {
        file: 'style.md',
        role: 'reference',
        description: 'Character-bound narration, evidentiary continuity, and manuscript realization principles.',
      },
      {
        file: 'canon.md',
        role: 'reference',
        description: 'Canonical Beth incident and emergency-call sequence.',
      },
    ],
    summary: {
      findings: {
        total: 2,
        decided: 0,
        open: 2,
        applied: 0,
        kept: 0,
        blocked: 0,
      },
    },
    findings: {
      'CH3-001': {
        title: 'Missing evidentiary screening before the final emergency-call mismatch',
        location: {
          file: 'Chapter 3: The address',
          section: "Back at Ortiz's desk",
          anchor:
            'Several emergency attempts in the carrier material had no corresponding event at the dispatch center.',
        },
        related_locations: [
          {
            file: 'Chapter 3: The address',
            section: 'Second Gene interview',
            anchor:
              "The device extraction gave them the recent calls. The carrier filled in older ones. Ortiz had dispatch's returns beside both.",
          },
          {
            file: 'Chapter 3: The address',
            section: 'Second Gene interview',
            anchor: 'The dispatch center has no call from you at that time.',
          },
          {
            file: 'scenario.md',
            section: "3. THE ADDRESS / Reconstructing Gene's calls",
            anchor: 'Investigators test ordinary explanations for the missing calls',
          },
          {
            file: 'scenario.md',
            section: '4. THE INTERMEDIARY / The carrier question',
            anchor: 'Ortiz gives the carrier engineers the small set of dated calls developed in Chapter 3.',
          },
        ],
        scope: 'cross_section',
        excerpt:
          'Several emergency attempts in the carrier material had no corresponding event at the dispatch center.',
        issue:
          'The chapter establishes discrepancies between carrier and dispatch records but does not show investigators testing ordinary explanations or reducing the discrepancies to a smaller set of completed emergency attempts. The final evidentiary state is therefore broader and less discriminating than the scenario requires Chapter 4 to inherit.',
        rationale:
          "The scenario distinguishes an apparent mismatch from a reproducible evidentiary problem. Some dates must be eliminated after checking incomplete or abandoned calls, carrier failure, missing dispatch records, and handset malfunction. The surviving set must contain attempts sufficiently established by device and carrier evidence to support the next chapter's carrier analysis. Gene's uncertainty about what happened during the incidents does not establish or eliminate technical explanations for the call discrepancies. The draft's record comparison is compatible with the required investigation, but the necessary screening and resulting narrowed set are not established.",
        priority: 'high',
        confidence: 'high',
        options: {
          A: {
            action: 'insert',
            description:
              'Add a compact investigative passage after the initial comparison of carrier and dispatch records. Establish that investigators check the ordinary explanations, discard dates that cannot support a completed-attempt finding, and retain a smaller set of discrepancies. Preserve the second Gene interview and its existing date-driven dialogue. Make clear that the screening establishes the mismatch without identifying the cause.',
            risk: 'low',
          },
          B: {
            action: 'insert',
            description:
              "Distribute the evidentiary screening across the existing record-comparison passage and the transition out of the second interview. Let the comparison explain which dates qualify for further analysis, then make the final surviving set explicit after Gene's recollections have been tested.",
            risk: 'low',
          },
          C: {
            action: 'keep',
            description:
              "Retain the current chapter and relocate the ordinary-explanation screening to Chapter 4, revising that chapter's incoming evidentiary state accordingly. This requires changing the selected division of investigative work between Chapters 3 and 4.",
            risk: 'medium',
          },
        },
        recommendation: 'A',
        decision: null,
        note: null,
        execution: null,
        payload: {
          kind: 'missing_story_requirement',
          scenarioExcerpt:
            'Investigators test ordinary explanations for the missing calls: incomplete attempts, abandoned calls, carrier failure, missing dispatch records and handset malfunction. Those checks eliminate some dates. A smaller set remains in which device and carrier evidence establish a completed emergency attempt while the dispatch center has no corresponding event.',
          scenarioRequirement:
            'Chapter 3 must establish a screened, reduced set of completed emergency attempts with no corresponding dispatch events. The cause remains unknown.',
          changeSize: 'local',
          existingProseReuse: 'mostly',
        },
      },
      'CH3-002': {
        title: 'Carrier records appear without the required acquisition basis',
        location: {
          file: 'Chapter 3: The address',
          section: "Back at Ortiz's desk",
          anchor: "Ortiz requested the old emergency records associated with Gene's address.",
        },
        related_locations: [
          {
            file: 'Chapter 3: The address',
            section: 'Second Gene interview',
            anchor: 'The device extraction gave them the recent calls. The carrier filled in older ones.',
          },
          {
            file: 'scenario.md',
            section: "3. THE ADDRESS / Reconstructing Gene's calls",
            anchor:
              'Investigators obtain the relevant carrier and dispatch-center records through ordinary legal process.',
          },
        ],
        scope: 'local',
        excerpt:
          "Ortiz requested the old emergency records associated with Gene's address. The returns came in pieces.",
        issue:
          "The draft moves from Gene's limited consent to examine his current phone to the acquisition of older carrier records without establishing the separate ordinary legal process required by the scenario.",
        rationale:
          "Gene's consent is explicitly limited to the forensic examination of his current device. The older carrier records are a separate evidentiary source and the scenario specifies that investigators obtain them through ordinary legal process. The acquisition does not require a new scene or the identification of a particular legal instrument, but the existing transition should preserve the distinction between consent-based device examination and independently obtained carrier records.",
        priority: 'low',
        confidence: 'high',
        options: {
          A: {
            action: 'replace',
            description:
              'Adjust the sentence introducing the emergency-record returns to establish that Ortiz obtains the relevant carrier and dispatch records through ordinary legal process. Retain the existing description of the returns arriving in pieces.',
            risk: 'low',
          },
          B: {
            action: 'insert',
            description:
              "Add one sentence identifying the separate acquisition of carrier and dispatch records before the chapter begins comparing them with Gene's phone extraction.",
            risk: 'low',
          },
          C: {
            action: 'keep',
            description:
              'Preserve the existing compressed acquisition as implicit ordinary investigative process, accepting that the source of authority for older carrier records remains unstated.',
            risk: 'low',
          },
        },
        recommendation: 'A',
        decision: null,
        note: null,
        execution: null,
        payload: {
          kind: 'missing_story_requirement',
          scenarioExcerpt:
            'Investigators obtain the relevant carrier and dispatch-center records through ordinary legal process.',
          scenarioRequirement:
            'Preserve the separate lawful acquisition of carrier and dispatch records without expanding routine record-gathering into a procedural scene.',
          changeSize: 'local',
          existingProseReuse: 'mostly',
        },
      },
    },
  },
})
