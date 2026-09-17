import { zod as z } from '@tempalace/core'
import type { AuditTaskDefinition } from './types.js'

const zIntMin1 = z.int().min(1)
const zStringMin1 = z.string().min(1)
const zIntMin0 = z.int().min(0)

const locationSchema = z.object({
  file: zStringMin1,
  section: zStringMin1,
  anchor: zStringMin1.optional(),
  line: zIntMin1
    .or(z.tuple([zIntMin1, zIntMin1]))
    .describe('Relevant line or [line start, line end]')
    .optional(),
})

const executionSchema = z
  .union([
    z.null(),
    z.object({
      outcome: z.enum(['applied', 'kept', 'blocked']),
      note: zStringMin1,
    }),
  ])
  .describe('Application outcome. Null until an actionable decision is processed.')

function withOptionalPayload<T extends z.ZodRawShape>(shape: T, payload: z.ZodType | undefined) {
  return payload === undefined ? shape : { ...shape, payload }
}

export function createAuditSchemas(definition: AuditTaskDefinition) {
  const schemas = definition.schemas ?? {}
  const optionId = z.string().regex(/^[A-Z]$/)
  const action = z.enum(definition.actions)

  const optionSchema = z.object(
    withOptionalPayload(
      {
        action,
        description: zStringMin1,
        replacement: z.string().optional(),
        risk: z.enum(['low', 'medium', 'high']).optional(),
      },
      schemas.optionPayload
    )
  )

  const findingSchema = z
    .object(
      withOptionalPayload(
        {
          title: zStringMin1.optional(),
          location: locationSchema,
          related_locations: z.array(locationSchema).default([]),
          scope: z.enum(['local', 'cluster', 'cross_section', 'global']),
          excerpt: zStringMin1.describe(
            'Short verbatim excerpt from the target that makes the finding immediately recognizable. It need not contain the complete affected span. For cluster, cross-section, or global findings, choose a representative instance.'
          ),
          issue: zStringMin1,
          rationale: zStringMin1.optional(),
          priority: z.enum(['high', 'medium', 'low']),
          confidence: z.enum(['high', 'medium', 'low']),
          options: z
            .record(optionId, optionSchema)
            .describe('Concrete resolution options keyed by one uppercase letter.'),
          recommendation: optionId.describe('Advisory option key. It is not authorization by itself.'),
          decision: z
            .union([optionId, z.enum(['reject', 'defer', 'custom']), z.null()])
            .describe('Authorized option key or review state. Null means no decision.'),
          note: zStringMin1.nullable().describe('Human refinement or instruction. Required for a custom decision.'),
          execution: executionSchema,
        },
        schemas.findingPayload
      )
    )
    .strict()

  const summarySchema = z.object(
    withOptionalPayload(
      {
        findings: z.object({
          total: zIntMin0,
          decided: zIntMin0,
          open: zIntMin0,
          applied: zIntMin0,
          kept: zIntMin0,
          blocked: zIntMin0,
        }),
      },
      schemas.summaryPayload
    )
  )

  const structuralSchema = z.object({
    task: z.object(withOptionalPayload({ id: z.literal(definition.id) }, schemas.taskPayload)),
    sources: z
      .array(
        z.object({
          file: zStringMin1,
          role: z.enum(['target', 'reference']),
          description: zStringMin1.optional(),
          words: zIntMin0.optional(),
          pages: zIntMin0.optional(),
        })
      )
      .min(1)
      .describe('Target artifacts and supporting references examined by the audit.'),
    summary: summarySchema,
    ...(schemas.diagnostics === undefined ? {} : { diagnostics: schemas.diagnostics }),
    findings: z
      .record(zStringMin1, findingSchema)
      .describe('Independently reviewable findings keyed by stable handles.'),
  })

  const auditSchema = structuralSchema.superRefine((audit, context) => {
    const findings = Object.values(audit.findings)
    const counts = {
      total: findings.length,
      decided: findings.filter(finding => finding.decision !== null).length,
      open: findings.filter(finding => finding.decision === null).length,
      applied: findings.filter(finding => finding.execution?.outcome === 'applied').length,
      kept: findings.filter(finding => finding.execution?.outcome === 'kept').length,
      blocked: findings.filter(finding => finding.execution?.outcome === 'blocked').length,
    }

    for (const [name, expected] of Object.entries(counts)) {
      if (audit.summary.findings[name as keyof typeof counts] !== expected) {
        context.addIssue({
          code: 'custom',
          path: ['summary', 'findings', name],
          message: `Expected ${expected} from the finding records.`,
        })
      }
    }

    for (const [handle, finding] of Object.entries(audit.findings)) {
      if (!(finding.recommendation in finding.options)) {
        context.addIssue({
          code: 'custom',
          path: ['findings', handle, 'recommendation'],
          message: 'Recommendation must reference an existing option.',
        })
      }

      if (/^[A-Z]$/.test(finding.decision ?? '') && !((finding.decision as string) in finding.options)) {
        context.addIssue({
          code: 'custom',
          path: ['findings', handle, 'decision'],
          message: 'Decision must reference an existing option.',
        })
      }

      if (finding.decision === 'custom' && finding.note === null) {
        context.addIssue({
          code: 'custom',
          path: ['findings', handle, 'note'],
          message: 'A custom decision requires a note.',
        })
      }

      if (
        finding.execution !== null &&
        (finding.decision === null || finding.decision === 'reject' || finding.decision === 'defer')
      ) {
        context.addIssue({
          code: 'custom',
          path: ['findings', handle, 'execution'],
          message: 'Only a selected option or custom decision can have an execution result.',
        })
      }

      if (finding.execution?.outcome === 'kept' && /^[A-Z]$/.test(finding.decision ?? '')) {
        const selected = finding.options[finding.decision as string]
        if (selected?.action !== 'keep') {
          context.addIssue({
            code: 'custom',
            path: ['findings', handle, 'execution', 'outcome'],
            message: 'The kept outcome requires a selected keep option.',
          })
        }
      }
    }
  })

  return { structuralSchema, auditSchema }
}
