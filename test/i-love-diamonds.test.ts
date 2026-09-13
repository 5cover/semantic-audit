import { analysisPrompt, outputEmit } from '../src/index.js'
import { scenarioSalience } from '../src/tasks/scenario-salience.js'

const inputs = `Sources are from project files.
- scenario.md: authoritative scenario, file to audit
Reference story sources:
- typography.md: typography rules
- style.md: writing style and tone
- canon.md: story context, worldbuilding detail and canon elements.`

console.log(
  analysisPrompt.run({
    inputs,
    output: outputEmit,
    task: scenarioSalience,
  })
)
