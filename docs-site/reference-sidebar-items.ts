import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

type ReferenceSidebarItem = Extract<
  SidebarsConfig[string],
  readonly unknown[]
>[number];

/** Shared sidebar links for all module README reference pages. */
export const referenceSidebarItems = [
  {type: 'link', label: 'Reference home', href: '/reference/'},
  {
    type: 'category',
    label: 'Apps',
    collapsed: false,
    items: [
      {type: 'link', label: 'apps/web', href: '/reference/apps/web/'},
      {type: 'link', label: 'apps/web/e2e', href: '/reference/apps/web/e2e/'},
      {type: 'link', label: 'apps/native', href: '/reference/apps/native/'},
    ],
  },
  {
    type: 'category',
    label: 'Services',
    items: [
      {type: 'link', label: 'services/api', href: '/reference/services/api/'},
      {
        type: 'link',
        label: 'services/api/src/seed',
        href: '/reference/services/api/src/seed/',
      },
    ],
  },
  {
    type: 'category',
    label: 'Packages',
    items: [
      {
        type: 'link',
        label: 'packages/modules/ai-tool-sdk',
        href: '/reference/packages/modules/ai-tool-sdk/',
      },
      {
        type: 'link',
        label: 'packages/platform/api-client',
        href: '/reference/packages/platform/api-client/',
      },
      {
        type: 'link',
        label: 'packages/modules/automation-contracts',
        href: '/reference/packages/modules/automation-contracts/',
      },
      {
        type: 'link',
        label: 'packages/verticals/brewery/beerjson',
        href: '/reference/packages/verticals/brewery/beerjson/',
      },
      {
        type: 'link',
        label: 'packages/platform/contracts',
        href: '/reference/packages/platform/contracts/',
      },
      {
        type: 'link',
        label: 'packages/verticals/brewery/core (brewery-core)',
        href: '/reference/packages/verticals/brewery/core/',
      },
      {
        type: 'link',
        label: 'packages/modules/crp-contracts',
        href: '/reference/packages/modules/crp-contracts/',
      },
      {
        type: 'link',
        label: 'packages/platform/i18n',
        href: '/reference/packages/platform/i18n/',
      },
      {
        type: 'link',
        label: 'packages/modules/i18n-keys',
        href: '/reference/packages/modules/i18n-keys/',
      },
      {
        type: 'link',
        label: 'packages/platform/i18n-react',
        href: '/reference/packages/platform/i18n-react/',
      },
      {
        type: 'link',
        label: 'packages/platform/media',
        href: '/reference/packages/platform/media/',
      },
      {
        type: 'link',
        label: 'packages/modules/module-sdk',
        href: '/reference/packages/modules/module-sdk/',
      },
      {
        type: 'link',
        label: 'packages/modules/mrp-contracts',
        href: '/reference/packages/modules/mrp-contracts/',
      },
      {
        type: 'link',
        label: 'packages/platform/navigation',
        href: '/reference/packages/platform/navigation/',
      },
      {
        type: 'link',
        label: 'packages/modules/pim-contracts',
        href: '/reference/packages/modules/pim-contracts/',
      },
      {
        type: 'link',
        label: 'packages/verticals/brewery/recipes-ui',
        href: '/reference/packages/verticals/brewery/recipes-ui/',
      },
      {
        type: 'link',
        label: 'packages/platform/rendering',
        href: '/reference/packages/platform/rendering/',
      },
      {
        type: 'link',
        label: 'packages/platform/test-mcp',
        href: '/reference/packages/platform/test-mcp/',
      },
      {type: 'link', label: 'packages/platform/ui', href: '/reference/packages/platform/ui/'},
    ],
  },
  {
    type: 'link',
    label: 'Documentation home',
    href: '/',
  },
] as const satisfies readonly ReferenceSidebarItem[];

/** Main docs sidebar — omits the back-link to Documentation home. */
export const referenceSidebarItemsForDocs = referenceSidebarItems.filter(
  (item) => item.type !== 'link' || item.href !== '/',
);
