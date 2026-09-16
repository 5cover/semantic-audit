import * as z from 'zod';
import { defineAuditTask } from '../tasks.js';

const estimatedGain = z.strictObject({
  words: z.int().min(1).optional(),
  pages: z.int().min(1).optional(),
});

export const reportCompression = defineAuditTask({
  id: 'report-compression',
  name: 'Report compression',
  description: 'Audit a Typst apprenticeship report for editorial and page-layout compression opportunities.',
  actions: [
    'remove',
    'compress',
    'merge',
    'move_to_appendix',
    'replace',
    'resize',
    'reposition',
    'combine',
    'adjust_spacing',
    'adjust_break',
    'restructure',
    'deduplicate',
    'keep',
    'other',
  ],
  schemas: {
    taskPayload: z.strictObject({
      source_format: z.literal('typst'),
      page_limit: z.int().min(1),
      excluded_content: z.array(z.string()),
    }),
    summaryPayload: z.strictObject({
      current_words: z.int().min(0),
      current_pages: z.int().min(0).optional(),
      by_scale: z.strictObject({
        macro: z.int().min(0),
        micro: z.int().min(0),
        structural: z.int().min(0),
      }),
      estimated_gain: z.strictObject({
        conservative: estimatedGain,
        recommended: estimatedGain,
        aggressive: estimatedGain,
      }),
      general_observations: z.array(z.string()).optional(),
    }),
    findingPayload: z.strictObject({
      scale: z.enum(['macro', 'micro', 'structural']),
      type: z.enum([
        'remove',
        'compress',
        'merge',
        'move_to_appendix',
        'replace',
        'restructure',
        'deduplicate',
        'other',
      ]),
      information_effect: z
        .strictObject({
          removed: z.array(z.string()).optional(),
          preserved: z.array(z.string()).optional(),
          added: z.array(z.string()).optional(),
        })
        .optional(),
      quality_effect: z
        .strictObject({
          is: z.enum(['improves', 'neutral', 'tradeoff']),
          because: z.string().min(1).optional(),
        })
        .optional(),
    }),
    optionPayload: z.strictObject({
      estimated_gain: estimatedGain,
      information_effect: z
        .strictObject({
          removed: z.array(z.string()).optional(),
          preserved: z.array(z.string()).optional(),
          added: z.array(z.string()).optional(),
        })
        .optional(),
    }),
  },
  analysis: {
    objective: `Effectuer une revue éditoriale structurée du rapport afin d'identifier des possibilités de compression significatives. Réduire la longueur sans appauvrir le contenu, casser les raisonnements ou transformer la prose en style télégraphique. La limite de pages est une contrainte, pas un quota justifiant des dégradations.`,
    inputs: `Analyser les sources Typst principales, les consignes et les volumes attendus. Exclure les annexes indiquées dans le contexte d'exécution. Compiler le PDF lorsque l'analyse de pagination l'exige et utiliser les autres ressources seulement pour comprendre ou vérifier un passage.`,
    protectedModel: `Préserver les faits importants, dates utiles, relations causales, décisions et justifications, résultats, distinctions conceptuelles, détails techniques utiles, progression argumentative, voix personnelle, terminologie, références croisées Typst et contraintes explicites. Une répétition reste légitime lorsque sa fonction argumentative change.`,
    sections: [
      {
        id: 'report-philosophy',
        title: 'Philosophie de compression',
        body: `Chercher à compresser les fonctions argumentatives, pas seulement les phrases. Privilégier les changements qui augmentent simultanément la densité informationnelle, la clarté et la hiérarchie des idées. Ne pas proposer de micro-optimisations cosmétiques dont le gain est négligeable.`,
      },
      {
        id: 'report-estimation',
        title: 'Estimation et priorité',
        body: `Estimer les gains sans les forcer à atteindre la cible. La priorité combine bénéfice attendu et risque éditorial. Pour les passages ambigus, proposer plusieurs options réellement distinctes. Pour une modification locale, fournir si possible le remplacement exact.`,
      },
    ],
    ruleGroups: [
      {
        id: 'report-levels',
        title: 'Niveaux de compression',
        rules: [
          {
            id: 'macro',
            title: 'Compression macro',
            description: `Rechercher les développements disproportionnés, répétitions entre sections, exemples redondants, détails techniques excessifs et contenus qui peuvent être fusionnés, supprimés, condensés ou déplacés en annexe.`,
            questions: [
              `Quelle fonction argumentative le passage remplit-il?`,
              `Cette fonction est-elle déjà remplie ailleurs?`,
              `Son volume est-il proportionné à son importance?`,
            ],
            nonFindings: [
              `Une idée répétée dans un nouveau rôle argumentatif.`,
              `Un développement long qui porte un raisonnement essentiel.`,
            ],
          },
          {
            id: 'micro',
            title: 'Compression micro',
            description: `Rechercher les phrases sans apport, redondances locales, formulations indirectes, transitions vides, métadiscours et chaînes causales qui peuvent être exprimées plus densément.`,
            resolutions: [
              `Fusionner des phrases ou paragraphes.`,
              `Remplacer par une formulation plus directe.`,
              `Supprimer uniquement la portion sans fonction.`,
            ],
            nonFindings: [
              `Un simple synonyme plus court sans gain matériel.`,
              `Une séparation de phrases qui protège le rythme ou la distinction entre fait et interprétation.`,
            ],
          },
          {
            id: 'structural',
            title: 'Compression structurelle',
            description: `Inspecter la composition PDF pour trouver les zones blanches, figures ou tableaux provoquant des sauts coûteux, titres orphelins, espacements cumulés et blocs Typst empêchant une coupure utile.`,
            signals: [
              `Page faiblement remplie.`,
              `Figure isolée.`,
              `Court paragraphe repoussé.`,
              `Cascade de pagination défavorable.`,
            ],
            resolutions: [
              `Redimensionner ou repositionner sans perdre en lisibilité.`,
              `Ajuster un espacement ou une coupure.`,
              `Combiner des éléments lorsque leur lecture reste claire.`,
            ],
            nonFindings: [
              `Réduire les marges, le corps ou l'interligne imposés.`,
              `Miniaturiser artificiellement le document.`,
            ],
          },
        ],
      },
    ],
    finalTest: `Une bonne proposition réduit le volume ou récupère de l'espace tout en préservant la fonction du passage. Si atteindre la limite restante exige un arbitrage dommageable, le signaler au lieu de présenter cette suppression comme souhaitable.`,
  },
  application: {
    sections: [
      {
        id: 'report-apply-preservation',
        title: 'Préservation éditoriale',
        body: `Préserver les faits, dates, causalités, distinctions, décisions, résultats, terminologie, voix à la première personne, références utiles et cohérence avec les paragraphes voisins. Ne pas produire une prose télégraphique.`,
      },
      {
        id: 'report-apply-typst',
        title: 'Validité Typst',
        body: `Préserver les labels, références croisées, figures, termes de glossaire, citations, composants, notes et références bibliographiques. Adapter uniquement ce qui est nécessaire à la décision sélectionnée et vérifier le PDF lorsque la pagination est concernée.`,
      },
    ],
  },
  exampleAudit: {
    version: 1,
    task: {
      id: 'report-compression',
      payload: { source_format: 'typst', page_limit: 30, excluded_content: ['annexes'] },
    },
    sources: [
      { file: 'src/', role: 'target', description: 'Corps principal Typst', words: 12600, pages: 32 },
      { file: 'resources/consignes.txt', role: 'reference' },
    ],
    summary: {
      findings: { total: 1, decided: 0, open: 1, applied: 0, kept: 0, blocked: 0 },
      payload: {
        current_words: 12600,
        current_pages: 32,
        by_scale: { macro: 0, micro: 1, structural: 0 },
        estimated_gain: {
          conservative: { words: 45 },
          recommended: { words: 45 },
          aggressive: { words: 45 },
        },
      },
    },
    findings: {
      MI1: {
        location: { file: 'src/project.typ', section: 'Réalisation technique', anchor: 'Cette architecture permet' },
        related_locations: [],
        scope: 'local',
        current: 'Cette architecture permet ainsi de garantir une séparation claire et explicite des responsabilités.',
        issue: 'La phrase reformule une séparation déjà démontrée par le paragraphe.',
        priority: 'high',
        confidence: 'high',
        options: {
          A: {
            action: 'remove',
            description: 'Supprimer la phrase de conclusion redondante.',
            risk: 'low',
            payload: {
              estimated_gain: { words: 14 },
              information_effect: { preserved: ['la séparation des responsabilités démontrée auparavant'] },
            },
          },
        },
        recommendation: 'A',
        decision: null,
        note: null,
        execution: null,
        payload: {
          scale: 'micro',
          type: 'remove',
          information_effect: { removed: ['reformulation redondante'], preserved: ['raisonnement technique'] },
          quality_effect: { is: 'improves', because: 'La relation technique devient plus directe.' },
        },
      },
    },
  },
});
