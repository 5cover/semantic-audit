import { template, zod as z } from '@tempalace/core'

import YAML from 'yaml'
import { createAuditSchemas } from './schema.js'
import {
  defaultAnalysisOutput,
  defaultApplicationOutput,
  renderAnalysisPrompt,
  renderApplicationPrompt,
} from './prompts.js'
import type { AuditTask, AuditTaskDefinition, AuditValidationResult, DecisionMode } from './types.js'
import { stringifyYaml } from './util.js'

function validateDefinition(definition: AuditTaskDefinition) {
  const stableId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!stableId.test(definition.id)) throw new Error(`Invalid task id '${definition.id}'.`)

  const assertBodyHasNoHeadings = (label: string, body: string) => {
    if (/^#{1,6}\s/m.test(body)) {
      throw new Error(`${label} contains a Markdown heading. Headings are owned by the prompt renderer.`)
    }
  }

  assertBodyHasNoHeadings(`Task '${definition.id}' objective`, definition.analysis.objective)
  if (definition.analysis.inputs !== undefined)
    assertBodyHasNoHeadings(`Task '${definition.id}' inputs`, definition.analysis.inputs)
  if (definition.analysis.protectedModel !== undefined)
    assertBodyHasNoHeadings(`Task '${definition.id}' protected model`, definition.analysis.protectedModel)
  if (definition.analysis.finalTest !== undefined)
    assertBodyHasNoHeadings(`Task '${definition.id}' final test`, definition.analysis.finalTest)

  const ids = new Set<string>()
  for (const group of definition.analysis.ruleGroups) {
    if (!stableId.test(group.id)) throw new Error(`Invalid rule group id '${group.id}'.`)
    if (ids.has(group.id)) throw new Error(`Duplicate task item id '${group.id}'.`)
    ids.add(group.id)
    if (group.introduction !== undefined) assertBodyHasNoHeadings(`Rule group '${group.id}'`, group.introduction)
    for (const rule of group.rules) {
      if (!stableId.test(rule.id)) throw new Error(`Invalid rule id '${rule.id}'.`)
      if (ids.has(rule.id)) throw new Error(`Duplicate task item id '${rule.id}'.`)
      ids.add(rule.id)
      assertBodyHasNoHeadings(`Rule '${rule.id}'`, rule.description)
    }
  }
  for (const current of definition.analysis.sections ?? []) {
    if (!stableId.test(current.id)) throw new Error(`Invalid section id '${current.id}'.`)
    if (ids.has(current.id)) throw new Error(`Duplicate task item id '${current.id}'.`)
    ids.add(current.id)
    assertBodyHasNoHeadings(`Section '${current.id}'`, current.body)
  }
  for (const current of definition.application.sections) {
    if (!stableId.test(current.id)) throw new Error(`Invalid section id '${current.id}'.`)
    if (ids.has(current.id)) throw new Error(`Duplicate task item id '${current.id}'.`)
    ids.add(current.id)
    assertBodyHasNoHeadings(`Section '${current.id}'`, current.body)
  }

  if (new Set(definition.actions).size !== definition.actions.length) {
    throw new Error(`Task '${definition.id}' declares duplicate actions.`)
  }
  if (definition.actions.some(action => !/^[a-z][a-z0-9_]*$/.test(action))) {
    throw new Error(`Task '${definition.id}' declares an invalid action.`)
  }
}

function formatIssues(error: z.ZodError) {
  return error.issues.map(issue => {
    const path = issue.path.length === 0 ? '<root>' : issue.path.join('.')
    return `${path}: ${issue.message}`
  })
}

type SupportedDecisionMode<Definition extends AuditTaskDefinition> = Definition extends {
  readonly automaticDecisions: { readonly criteria: readonly string[] }
}
  ? DecisionMode
  : 'manual'

export function defineAuditTask<const Definition extends AuditTaskDefinition>(
  definition: Definition
): AuditTask<SupportedDecisionMode<Definition>> {
  validateDefinition(definition)
  const { structuralSchema, auditSchema } = createAuditSchemas(definition)
  const auditJsonSchema = z.toJSONSchema(structuralSchema, {
    target: 'draft-2020-12',
    reused: 'inline',
    override: ctx => {
      if (
        ctx.jsonSchema.type === 'integer' ||
        (Array.isArray(ctx.jsonSchema.type) && ctx.jsonSchema.type.includes('integer'))
      ) {
        if (ctx.jsonSchema.minimum === Number.MIN_SAFE_INTEGER) delete ctx.jsonSchema.minimum
        if (ctx.jsonSchema.maximum === Number.MAX_SAFE_INTEGER) delete ctx.jsonSchema.maximum
      }
    },
  }) as Record<string, unknown>
  auditJsonSchema.$title = `${definition.name} audit`
  auditJsonSchema.description = `Structured audit for the ${definition.name} task.`

  const decisionModeSchema =
    definition.automaticDecisions === undefined
      ? z.literal('manual').default('manual')
      : z.enum(['manual', 'safe']).default('manual')

  const analyze = template({
    name: `${definition.name}: analyze`,
    description: definition.description,
    input: z.object({
      inputs: z.string().min(1),
      output: z.string().min(1).default(defaultAnalysisOutput),
      decisionMode: decisionModeSchema,
    }),
    output: z.string(),
    run: input => renderAnalysisPrompt({ definition, auditJsonSchema, ...input }),
  })

  const apply = template({
    name: `${definition.name}: apply`,
    description: `Render the application prompt for ${definition.name}.`,
    input: z.object({
      inputs: z.string().min(1),
      audit: z.string().min(1),
      output: z.string().min(1).default(defaultApplicationOutput),
    }),
    output: z.string(),
    run: input => renderApplicationPrompt({ definition, ...input }),
  })

  const schema = template({
    name: `${definition.name}: schema`,
    description: `Render the composed audit schema for ${definition.name}.`,
    output: z.string(),
    run: () => stringifyYaml(auditJsonSchema),
  })

  function validateAudit(value: unknown): AuditValidationResult {
    const result = auditSchema.safeParse(value)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, issues: formatIssues(result.error) }
  }

  function validateAuditYaml(source: string): AuditValidationResult {
    try {
      return validateAudit(YAML.parse(source))
    } catch (error) {
      return { success: false, issues: [error instanceof Error ? error.message : String(error)] }
    }
  }

  const exampleResult = validateAudit(definition.exampleAudit)
  if (!exampleResult.success) {
    throw new Error(`Invalid example for task '${definition.id}':\n${exampleResult.issues.join('\n')}`)
  }

  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    definition,
    auditSchema,
    auditJsonSchema,
    templates: { analyze, apply, schema },
    validateAudit,
    validateAuditYaml,
  } as AuditTask<SupportedDecisionMode<Definition>>
}
