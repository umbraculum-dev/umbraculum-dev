import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Mirrors the categories in docs/README.md.
 * Pass 2 adds a dedicated Reference docs instance for workspace READMEs.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'README',
      label: 'Documentation home',
    },
    {
      type: 'category',
      label: 'Start here',
      collapsed: false,
      items: [
        'PLATFORM-ARCHITECTURE',
        'ROADMAP',
        'LICENSING',
        'ARCHITECTURE-REV02',
      ],
    },
    {
      type: 'category',
      label: 'Repository structure',
      items: ['REPOSITORY-STRUCTURE'],
    },
    {
      type: 'category',
      label: 'Vision & strategy',
      items: [
        'PLATFORM-ARCHITECTURE',
        'ROADMAP',
        'LICENSING',
        'TIER-PRICING-ANALYSIS',
        'CORE-DEVELOPMENT-AND-COMMUNITY',
      ],
    },
    {
      type: 'category',
      label: 'Modules ecosystem',
      items: [
        'MODULES',
        'modules/README',
        {
          type: 'category',
          label: 'Canonical modules',
          items: [
            'modules/canonical/automation',
            'modules/canonical/pim',
            'modules/canonical/mrp',
            'modules/canonical/wms',
            'modules/canonical/crm',
            'modules/canonical/crp',
          ],
        },
        {
          type: 'category',
          label: 'Vertical configurations',
          items: [
            {
              type: 'category',
              label: 'brewery reference vertical',
              items: [
                'modules/verticals/brewery/README',
                'modules/verticals/brewery/BEERJSON-FIRST',
                'modules/verticals/brewery/EQUIPMENT-AND-GRAVITY-ANALYSIS',
                'modules/verticals/brewery/WATER-CHEM-MASH-PH-MODEL',
                'modules/verticals/brewery/YEAST-MATH',
                'modules/verticals/brewery/RAW-MATERIALS-SEEDABLE-SOURCES',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Contributing a module',
          items: [
            'modules/contribute/README',
            'modules/contribute/canonical-module',
            'modules/contribute/vertical-configuration',
            'modules/contribute/horizontal-package',
            'modules/contribute/third-party-module',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'AI consultant',
      items: [
        'AI-CONSULTANT',
        'help/asking-umbraculum',
        'help/README',
      ],
    },
    {
      type: 'category',
      label: 'Stack & dependencies',
      items: ['OPEN-SOURCE-STACK', 'CURSOR-PLUGINS'],
    },
    {
      type: 'category',
      label: 'Governance (RFCs)',
      items: [
        'rfcs/README',
        'rfcs/modules-tiers-governance-and-automation-placement',
        'rfcs/canonical-module-physical-layout',
        'rfcs/validation-library-adoption',
        'rfcs/canonical-pim',
        'rfcs/docs-site',
        'rfcs/amend-rfc-0002-brewery-file-move-acceleration',
        'rfcs/canonical-document-rendering',
        'rfcs/notifications-outbound-delivery',
      ],
    },
    {
      type: 'category',
      label: 'Design',
      items: [
        'design/canonical-automation-module-surface',
        'design/web-route-group-audit',
        'design/openplc-mailbox-emitter-pr-shape',
        'design/canonical-pim-module-surface',
        'design/canonical-pim-build-log',
        'design/canonical-document-rendering-engine-rationale',
        'design/brewery-scope-migration-plan',
        'design/brewery-scope-migration-per-package-handoff',
        'design/rfc-0005-execution-plan',
      ],
    },
    {
      type: 'category',
      label: 'Product',
      items: ['ROLLOUT', 'SEO', 'AGENTIC-JOBS'],
    },
    {
      type: 'category',
      label: 'Architecture — platform-wide',
      items: [
        'ARCHITECTURE-REV02',
        'NATIVE-STRATEGY-AND-CI',
        'REACT-NATIVE-KICKOFF-READINESS',
      ],
    },
    {
      type: 'category',
      label: 'Architecture — auth & security',
      items: ['AUTH-STRATEGY', 'AUTH-HARDENING-ASSESSMENT', 'AUTH-QA'],
    },
    {
      type: 'category',
      label: 'Architecture — data & infrastructure',
      items: [
        'POSTGRES-REPLICATION-ARCHITECTURE',
        'DB-REPLICATION-AND-ROUTING-VERIFICATION',
        'PGPOOL-VERIFICATION',
        'REDIS-ARCHITECTURE',
      ],
    },
    {
      type: 'category',
      label: 'Architecture — billing',
      items: ['ORG-BILLING-STRIPE-REVENUECAT-FASTIFY'],
    },
    {
      type: 'category',
      label: 'Engineering — development',
      items: [
        'GETTING-STARTED',
        'FOUNDATION-HARDENING',
        'CODING-STANDARDS',
        'LINTING',
        'TYPING',
        'TAMAGUI',
        'CONTRACTS-VALIDATION-STRATEGY',
        'TESTING',
        'DOCS-README-STANDARDS',
        'DEVELOPMENT-ACCESSIBILITY',
        'DEVELOPMENT-NATIVE-LOCAL',
        'I18N-AUDIT',
        'CORE-DEVELOPMENT-AND-COMMUNITY',
        'NON-FRONTIER-EXECUTOR-FITNESS-TRACKER',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/INTEGRATION-TOKENS',
        'integrations/TILT',
        'integrations/FLOATING-HYDROMETERS',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'archive/README',
        {type: 'link', label: 'apps/web', href: '/reference/apps/web/'},
        {
          type: 'link',
          label: 'apps/web/e2e',
          href: '/reference/apps/web/e2e/',
        },
        {
          type: 'link',
          label: 'apps/native',
          href: '/reference/apps/native/',
        },
        {
          type: 'link',
          label: 'services/api',
          href: '/reference/services/api/',
        },
        {
          type: 'link',
          label: 'services/api/src/seed',
          href: '/reference/services/api/src/seed/',
        },
        {
          type: 'link',
          label: 'packages/ai-tool-sdk',
          href: '/reference/packages/ai-tool-sdk/',
        },
        {
          type: 'link',
          label: 'packages/api-client',
          href: '/reference/packages/api-client/',
        },
        {
          type: 'link',
          label: 'packages/beerjson',
          href: '/reference/packages/beerjson/',
        },
        {
          type: 'link',
          label: 'packages/contracts',
          href: '/reference/packages/contracts/',
        },
        {
          type: 'link',
          label: 'packages/i18n',
          href: '/reference/packages/i18n/',
        },
        {
          type: 'link',
          label: 'packages/i18n-react',
          href: '/reference/packages/i18n-react/',
        },
        {
          type: 'link',
          label: 'packages/media',
          href: '/reference/packages/media/',
        },
        {
          type: 'link',
          label: 'packages/navigation',
          href: '/reference/packages/navigation/',
        },
        {
          type: 'link',
          label: 'packages/recipes-ui',
          href: '/reference/packages/recipes-ui/',
        },
        {
          type: 'link',
          label: 'packages/test-mcp',
          href: '/reference/packages/test-mcp/',
        },
        {
          type: 'link',
          label: 'packages/ui',
          href: '/reference/packages/ui/',
        },
      ],
    },
  ],
};

export default sidebars;
