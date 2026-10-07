import { banknoteProposalLint, reportCompression, diegeticSalience } from './tasks/index.js'

export const registry = {
  'report-compression.analyze': reportCompression.templates.analyze,
  'report-compression.apply': reportCompression.templates.apply,
  'report-compression.prevent': reportCompression.templates.prevent,
  'report-compression.schema': reportCompression.templates.schema,
  'banknote-proposal-lint.analyze': banknoteProposalLint.templates.analyze,
  'banknote-proposal-lint.apply': banknoteProposalLint.templates.apply,
  'banknote-proposal-lint.prevent': banknoteProposalLint.templates.prevent,
  'banknote-proposal-lint.schema': banknoteProposalLint.templates.schema,
  'scenario-salience.analyze': diegeticSalience.templates.analyze,
  'scenario-salience.apply': diegeticSalience.templates.apply,
  'scenario-salience.prevent': diegeticSalience.templates.prevent,
  'scenario-salience.schema': diegeticSalience.templates.schema,
} as const

export default registry
