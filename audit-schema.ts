import { JSONSchema } from 'zod/v4/core'

export const auditSchema = (o: {
  payloadSchema: JSONSchema.JSONSchema
  diagnosticsSchema?: JSONSchema.JSONSchema
  estimatedEffectSchema?: JSONSchema.JSONSchema
}) =>
  ({
    $title: 'Generic audit workflow review',
    description:
      'Task-agnostic structured review produced by an analysis stage, optionally edited by a human, and consumed by a separate application stage. Task-specific semantics live only in open-ended payload objects.',
    type: 'object',
    required: ['task', 'source', 'summary', 'findings', ...(o.diagnosticsSchema ? ['diagnostics'] : [])],
    properties: {
      task: {
        type: 'object',
        required: ['id', 'payload'],
        properties: {
          id: { type: 'string', minLength: 1, description: 'Stable identifier for the audit task.' },
          payload: { $ref: '#/$defs/payload' },
        },
      },
      source: {
        type: 'object',
        required: ['file'],
        properties: {
          file: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          words: { type: 'integer', minimum: 0 },
        },
      },
      summary: {
        type: 'object',
        required: ['findings', 'payload'],
        properties: {
          findings: {
            type: 'object',
            required: ['total', 'auto_authorized', 'open', 'applied', 'blocked'],
            properties: {
              total: { type: 'integer', minimum: 0 },
              auto_authorized: { type: 'integer', minimum: 0 },
              open: { type: 'integer', minimum: 0 },
              applied: { type: 'integer', minimum: 0 },
              blocked: { type: 'integer', minimum: 0 },
            },
          },
          ...(o.estimatedEffectSchema ? { estimated_effect: o.estimatedEffectSchema } : undefined),
          payload: { $ref: '#/$defs/payload' },
        },
      },
      ...(o.diagnosticsSchema ? { diagnostics: o.diagnosticsSchema } : undefined),
      findings: {
        type: 'object',
        description: 'Map of independently reviewable findings keyed by stable handles.',
        additionalProperties: { $ref: '#/$defs/finding' },
      },
    },
    $defs: {
      payload: o.payloadSchema,
      finding: {
        type: 'object',
        required: [
          'location',
          'scope',
          'issue',
          'recommendation',
          'confidence',
          'auto_apply',
          'payload',
          'decision',
          'note',
        ],
        properties: {
          location: { $ref: '#/$defs/location' },
          related_locations: { type: 'array', items: { $ref: '#/$defs/location' }, default: [] },
          scope: { type: 'string', enum: ['local', 'cluster', 'cross_section', 'global'] },
          current: { type: 'string', description: 'Exact affected source text when useful for review.' },
          issue: { type: 'string', minLength: 1, description: 'Concise diagnosis of the problem.' },
          rationale: { type: 'string', description: 'Optional reasoning for non-obvious findings.' },
          recommendation: { $ref: '#/$defs/recommendation' },
          confidence: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'Confidence that the recommended edit is semantically safe.',
          },
          auto_apply: {
            type: 'boolean',
            description: 'Whether the application stage may execute the recommendation without human approval.',
          },
          payload: { $ref: '#/$defs/payload' },
          decision: {
            type: ['string', 'null'],
            enum: ['approve', 'reject', 'custom', 'defer', null],
            description: 'Human decision. Analysis leaves this null.',
          },
          note: { type: ['string', 'null'], description: 'Human instruction or explanation.' },
          execution: { $ref: '#/$defs/execution' },
        },
        allOf: [
          {
            if: { properties: { auto_apply: { const: true } } },
            then: { properties: { confidence: { const: 'high' } } },
          },
          {
            if: { properties: { decision: { const: 'custom' } } },
            then: { properties: { note: { type: 'string', minLength: 1 } } },
          },
        ],
      },
      location: {
        type: 'object',
        required: ['file', 'section', 'anchor'],
        properties: {
          file: { type: 'string', minLength: 1 },
          section: { type: 'string', minLength: 1 },
          anchor: { type: 'string', minLength: 1 },
          line_start: { type: 'integer', minimum: 1 },
          line_end: { type: 'integer', minimum: 1 },
        },
      },
      recommendation: {
        type: 'object',
        required: ['action'],
        properties: {
          action: {
            type: 'string',
            enum: [
              'keep',
              'replace',
              'remove',
              'move',
              'split',
              'merge',
              'deduplicate',
              'restructure',
              'manual_review',
              'other',
            ],
          },
          replacement: { type: 'string' },
          description: { type: 'string' },
        },
      },
      execution: {
        type: 'object',
        required: ['outcome', 'note'],
        properties: {
          outcome: { type: 'string', enum: ['applied', 'blocked'] },
          note: { type: 'string', minLength: 1 },
        },
      },
    },
  }) satisfies JSONSchema.JSONSchema
