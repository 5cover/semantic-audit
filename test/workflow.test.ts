import assert from 'node:assert/strict';
import test from 'node:test';
import { template, validateRegistry } from '@tempalace/core';
import YAML from 'yaml';
import { registry } from '../src/registry.js';
import { banknoteProposalLint, reportCompression, scenarioSalience } from '../src/tasks/index.js';
import { stringifyYaml } from '../src/util.js';
import { analysisOutputEmit } from '../src/prompts.js';

const tasks = [reportCompression, banknoteProposalLint, scenarioSalience];

test('all built-in examples satisfy their composed contracts', () => {
  for (const task of tasks) {
    const result = task.validateAudit(task.definition.exampleAudit);
    assert.equal(result.success, true, result.success ? undefined : result.issues.join('\n'));
  }
});

test('schema templates emit parseable draft 2020-12 schemas', async () => {
  for (const task of tasks) {
    const source = await task.templates.schema.run();
    const parsed = YAML.parse(source) as unknown;
    assert(typeof parsed === 'object' && parsed !== null && '$schema' in parsed && 'type' in parsed);
    assert.equal(parsed.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(parsed.type, 'object');
  }
});

test('relational validation rejects unknown recommendations and incorrect summaries', () => {
  const audit = structuredClone(scenarioSalience.definition.exampleAudit) as any;
  audit.findings.SS001.recommendation = 'B';
  audit.summary.findings.total = 4;

  const result = scenarioSalience.validateAudit(audit);
  assert.equal(result.success, false);
  if (!result.success) {
    assert(result.issues.some(issue => issue.includes('recommendation')));
    assert(result.issues.some(issue => issue.includes('summary.findings.total')));
  }
});

test('every finding requires a non-empty verbatim excerpt', () => {
  const audit = structuredClone(scenarioSalience.definition.exampleAudit) as any;
  delete audit.findings.SS001.excerpt;

  const result = scenarioSalience.validateAudit(audit);
  assert.equal(result.success, false);
  if (!result.success) assert(result.issues.some(issue => issue.includes('findings.SS001.excerpt')));
});

test('findings reject the replaced current field', () => {
  const audit = structuredClone(scenarioSalience.definition.exampleAudit) as any;
  audit.findings.SS001.current = audit.findings.SS001.excerpt;

  const result = scenarioSalience.validateAudit(audit);
  assert.equal(result.success, false);
  if (!result.success) assert(result.issues.some(issue => issue.includes('Unrecognized key')));
});

test('custom decisions require a note', () => {
  const audit = structuredClone(reportCompression.definition.exampleAudit) as any;
  audit.findings.MI1.decision = 'custom';
  audit.summary.findings.decided = 1;
  audit.summary.findings.open = 0;

  const result = reportCompression.validateAudit(audit);
  assert.equal(result.success, false);
  if (!result.success) assert(result.issues.some(issue => issue.includes('custom decision requires a note')));
});

test('rejected findings cannot claim an execution result', () => {
  const audit = structuredClone(banknoteProposalLint.definition.exampleAudit) as any;
  audit.findings.PL1.decision = 'reject';
  audit.findings.PL1.execution = { outcome: 'applied', note: 'Changed the prompt.' };
  audit.summary.findings.decided = 1;
  audit.summary.findings.open = 0;
  audit.summary.findings.applied = 1;

  const result = banknoteProposalLint.validateAudit(audit);
  assert.equal(result.success, false);
  if (!result.success) assert(result.issues.some(issue => issue.includes('execution result')));
});

test('YAML validation uses the same composed contract', () => {
  const source = stringifyYaml(reportCompression.definition.exampleAudit);
  assert.equal(reportCompression.validateAuditYaml(source).success, true);
  assert.equal(reportCompression.validateAuditYaml('findings: [').success, false);
});

test('manual analysis prompt is neutral, nested, and non-authorizing', async () => {
  const prompt = await scenarioSalience.templates.analyze.run({
    inputs: 'scenario.md is the target.',
    output: 'Emit YAML.',
    decisionMode: 'manual',
  });

  assert.equal(prompt.match(/^# /gm)?.length, 1);
  assert.match(prompt, /^## Generic method/m);
  assert.match(prompt, /^### Finding families/m);
  assert.match(prompt, /^#### Counterfactual salience/m);
  assert.match(prompt, /Leave every `decision` as `null`/);
  assert.match(prompt, /short, verbatim `excerpt`/);
  assert.doesNotMatch(prompt, /\[object Object\]/);
});

test('safe decisions are available only for scenario salience', async () => {
  assert.equal(
    scenarioSalience.templates.analyze.input.safeParse({
      inputs: 'x',
      decisionMode: 'safe',
      output: analysisOutputEmit,
    }).success,
    true
  );
  assert.equal(
    reportCompression.templates.analyze.input.safeParse({
      inputs: 'x',
      decisionMode: 'safe',
      output: analysisOutputEmit,
    }).success,
    false
  );
  assert.equal(
    banknoteProposalLint.templates.analyze.input.safeParse({
      inputs: 'x',
      decisionMode: 'safe',
      output: analysisOutputEmit,
    }).success,
    false
  );

  const prompt = await scenarioSalience.templates.analyze.run({
    inputs: 'scenario.md',
    output: 'Emit YAML.',
    decisionMode: 'safe',
  });
  assert.match(prompt, /set `decision` to the recommendation option key/);
  assert.doesNotMatch(prompt, /auto_apply/);
});

test('application prompt applies decisions without discovering findings', async () => {
  const prompt = await banknoteProposalLint.templates.apply.run({
    inputs: 'proposal.md is the target.',
    audit: 'review.yaml contains the audit.',
    output: 'Modify the files and summarize.',
  });

  assert.match(prompt, /Do not search for new findings/);
  assert.match(prompt, /`reject`, `defer`, and `null` make no target change/);
  assert.match(prompt, /Preserve every analysis field/);
});
test('task application templates retain their parameterized interfaces', async () => {
  const scenarioFix = template({
    name: 'scenario fix',
    input: scenarioSalience.templates.apply.input,
    output: scenarioSalience.templates.apply.output,
    run: input => scenarioSalience.templates.apply.run(input),
  });

  const prompt = await scenarioFix.run({
    inputs: 'scenario.md is the target.',
    audit: 'review.yaml contains the audit.',
    output: 'Emit the updated files.',
  });

  assert.match(prompt, /Semantic audit application/);
});

test('task schema templates retain their inputless interfaces', async () => {
  const renderedSchema = template({
    name: 'scenario schema',
    output: scenarioSalience.templates.schema.output,
    run: () => scenarioSalience.templates.schema.run(),
  });

  const source = await renderedSchema.run();
  assert.equal((YAML.parse(source) as { $schema: unknown }).$schema, 'https://json-schema.org/draft/2020-12/schema');
});

test('the root Tempalace registry exposes all built-in phases', () => {
  const validated = validateRegistry(registry);
  assert.equal(Object.keys(validated).length, 9);
  for (const task of tasks) {
    assert(`${task.id}.analyze` in validated);
    assert(`${task.id}.apply` in validated);
    assert(`${task.id}.schema` in validated);
  }
});
