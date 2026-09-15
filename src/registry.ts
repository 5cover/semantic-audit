import { banknoteProposalLint, reportCompression, scenarioSalience } from './tasks/index.js';

export const registry = {
  'report-compression.analyze': reportCompression.templates.analyze,
  'report-compression.apply': reportCompression.templates.apply,
  'report-compression.schema': reportCompression.templates.schema,
  'banknote-proposal-lint.analyze': banknoteProposalLint.templates.analyze,
  'banknote-proposal-lint.apply': banknoteProposalLint.templates.apply,
  'banknote-proposal-lint.schema': banknoteProposalLint.templates.schema,
  'scenario-salience.analyze': scenarioSalience.templates.analyze,
  'scenario-salience.apply': scenarioSalience.templates.apply,
  'scenario-salience.schema': scenarioSalience.templates.schema,
} as const;

export default registry;
