import type { Template, zod as z } from '@tempalace/core'

export type DecisionMode = 'manual' | 'safe'

export interface AnalysisTemplateInput<Mode extends DecisionMode = DecisionMode> {
  readonly inputs: string
  readonly output: string
  readonly decisionMode: Mode
}

export interface ApplicationTemplateInput {
  readonly inputs: string
  readonly audit: string
  readonly output: string
}

export interface AuditRule {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly signals?: readonly string[]
  readonly questions?: readonly string[]
  readonly nonFindings?: readonly string[]
  readonly resolutions?: readonly string[]
}

export interface AuditRuleGroup {
  readonly id: string
  readonly title: string
  readonly introduction?: string
  readonly rules: readonly AuditRule[]
}

export interface AuditPromptSection {
  readonly id: string
  readonly title: string
  readonly body: string
}

export interface AuditTaskSchemas {
  readonly taskPayload?: z.ZodType
  readonly summaryPayload?: z.ZodType
  readonly findingPayload?: z.ZodType
  readonly optionPayload?: z.ZodType
  readonly diagnostics?: z.ZodType
}

export interface AuditTaskDefinition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly actions: readonly [string, ...string[]]
  readonly analysis: {
    readonly objective: string
    readonly inputs?: string
    readonly protectedModel?: string
    readonly sections?: readonly AuditPromptSection[]
    readonly ruleGroups: readonly AuditRuleGroup[]
    readonly finalTest?: string
  }
  readonly application: {
    readonly sections: readonly AuditPromptSection[]
  }
  readonly schemas?: AuditTaskSchemas
  readonly exampleAudit: unknown
  readonly automaticDecisions?: {
    readonly criteria: readonly string[]
  }
}

export type AuditValidationResult =
  { readonly success: true; readonly data: unknown } | { readonly success: false; readonly issues: readonly string[] }

export interface AuditTask<Mode extends DecisionMode = DecisionMode> {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly definition: AuditTaskDefinition
  readonly auditSchema: z.ZodType
  readonly auditJsonSchema: Record<string, unknown>
  readonly templates: {
    readonly analyze: Template<AnalysisTemplateInput<Mode>, string>
    readonly apply: Template<ApplicationTemplateInput, string>
    readonly schema: Template<Record<string, never>, string>
  }
  validateAudit(value: unknown): AuditValidationResult
  validateAuditYaml(source: string): AuditValidationResult
}
