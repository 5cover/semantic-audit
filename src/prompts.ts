import type { AuditTaskDefinition, DecisionMode } from './types.js'
import { stringifyYaml } from './util.js'

function section(level: number, title: string, body: string) {
  return `${'#'.repeat(level)} ${title}\n\n${body.trim()}`
}

function list(values: readonly string[]) {
  return values.map(value => `- ${value}`).join('\n')
}

function renderRules(definition: AuditTaskDefinition) {
  return definition.analysis.ruleGroups
    .map(group => {
      const rules = group.rules
        .map(rule => {
          const parts = [section(4, rule.title, rule.description)]
          if (rule.signals?.length) parts.push(section(5, 'Discovery signals', list(rule.signals)))
          if (rule.questions?.length) parts.push(section(5, 'Review questions', list(rule.questions)))
          if (rule.nonFindings?.length) parts.push(section(5, 'Do not report', list(rule.nonFindings)))
          if (rule.resolutions?.length) parts.push(section(5, 'Typical resolutions', list(rule.resolutions)))
          return parts.join('\n\n')
        })
        .join('\n\n')
      const introduction = group.introduction === undefined ? '' : `${group.introduction.trim()}\n\n`
      return `${section(3, group.title, introduction + rules)}`
    })
    .join('\n\n')
}

function decisionPolicy(definition: AuditTaskDefinition, mode: DecisionMode) {
  if (mode === 'manual') {
    return 'Leave every `decision` as `null`. A recommendation is advisory and is not authorization.'
  }

  const criteria = definition.automaticDecisions?.criteria
  if (criteria === undefined) {
    throw new Error(`Task '${definition.id}' does not support safe automatic decisions.`)
  }

  return `For a recommendation that satisfies every criterion below, set \`decision\` to the recommendation option key. Otherwise leave \`decision\` as \`null\`.\n\n${list(criteria)}`
}

export function renderAnalysisPrompt(options: {
  definition: AuditTaskDefinition
  inputs: string
  output: string
  decisionMode: DecisionMode
  auditJsonSchema: Record<string, unknown>
}) {
  const { definition } = options
  const taskSections = definition.analysis.sections?.map(item => section(3, item.title, item.body)).join('\n\n') ?? ''
  const protectedModel =
    definition.analysis.protectedModel === undefined
      ? ''
      : `\n\n${section(3, 'Protected model', definition.analysis.protectedModel)}`
  const taskInputs =
    definition.analysis.inputs === undefined
      ? ''
      : `\n\n${section(3, 'Task-specific inputs', definition.analysis.inputs)}`

  return `# Semantic audit

${section(2, 'Stage', `Perform the analysis stage for the configured task. Examine the complete target and produce the structured audit. Do not modify target artifacts.`)}

${section(2, 'Inputs', options.inputs)}

${section(
  2,
  'Generic method',
  `### Establish the model

Infer the target's actual semantics, functions, contracts, and protected properties from the supplied evidence.

### Discover candidates

Search broadly using lexical, structural, comparative, and semantic signals. A surface match is evidence for inspection, not a finding by itself.

### Adjudicate with evidence

Report only concrete mismatches supported by the target or its references. Do not report generic best practices without project-specific evidence. Every finding must include a short, verbatim \`excerpt\` from the target that makes it immediately recognizable. For cluster, cross-section, or global findings, use one representative instance. Consider relationships between distant producers, consumers, sections, and representations.

### Consolidate findings

Create one finding per independently reviewable root decision. Combine repeated symptoms of the same underlying issue and keep distinct decisions separate.

### Recommend options

Provide concrete options whose semantic effects are clear. Preserve the target when an edit would require unresolved design judgment.`
)}

${section(2, `Task: ${definition.name}`, `${definition.analysis.objective.trim()}${taskInputs}${protectedModel}\n\n${taskSections}\n\n${renderRules(definition)}${definition.analysis.finalTest === undefined ? '' : `\n\n${section(3, 'Final test', definition.analysis.finalTest)}`}`)}

${section(2, 'Decision policy', decisionPolicy(definition, options.decisionMode))}

${section(2, 'Output', `${options.output.trim()}\n\nThe audit must conform to the schema and use the example only as a shape reference.\n\n### Audit schema\n\n\`\`\`yaml\n${stringifyYaml(options.auditJsonSchema).trim()}\n\`\`\`\n\n### Example audit\n\n\`\`\`yaml\n${stringifyYaml(definition.exampleAudit).trim()}\n\`\`\``)}
`
}

export function renderApplicationPrompt(options: {
  definition: AuditTaskDefinition
  inputs: string
  audit: string
  output: string
}) {
  const taskSections = options.definition.application.sections
    .map(item => section(3, item.title, item.body))
    .join('\n\n')

  return `# Semantic audit application

${section(2, 'Stage', `Apply only the decisions authorized in the supplied audit. The analysis is complete. Do not search for new findings, broaden existing findings, or perform opportunistic cleanup.`)}

${section(2, 'Inputs', `${options.inputs.trim()}\n\n### Audit\n\n\`\`\`yaml\n${options.audit.trim()}\n\`\`\``)}

${section(2, 'Authority', `For each finding, use \`decision\` first and \`note\` second. The recommendation is advisory only.\n\n- An option key selects that option.\n- \`custom\` applies only the instruction in \`note\`.\n- \`reject\`, \`defer\`, and \`null\` make no target change.\n- A selected \`keep\` option records a kept outcome without changing the target.`)}

${section(2, 'Application method', `Locate the exact material using the stable location and verbatim excerpt. Apply the smallest change that fulfills the selected option or custom note. Preserve surrounding semantics and structure.\n\nAfter a successful content change, record an \`applied\` execution result and describe the actual operation. Record \`kept\` for a selected keep option. If the source no longer matches safely or validation fails, leave that location unchanged and record \`blocked\`. Leave execution null for rejected, deferred, and open findings.\n\nPreserve every analysis field. Update only execution data, derived summary values, and task-defined after-application diagnostics.`)}

${section(2, `Task: ${options.definition.name}`, taskSections)}

${section(2, 'Validation', `Confirm that every target change corresponds to an actionable decision, unresolved findings remain unchanged, protected semantics remain intact, and the resulting artifact remains structurally valid.`)}

${section(2, 'Output', options.output)}
`
}

export const analysisOutputEmit =
  'Emit only the audit YAML, wrapped in a Markdown code block. Do not append prose commentary.'

export const applicationOutputEmit =
  'Emit the updated target artifact and the updated audit YAML. Do not add a new review or new recommendations.'
