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
        label: 'packages/automation-contracts',
        href: '/reference/packages/automation-contracts/',
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
        label: 'packages/core (brewery-core)',
        href: '/reference/packages/core/',
      },
      {
        type: 'link',
        label: 'packages/crp-contracts',
        href: '/reference/packages/crp-contracts/',
      },
      {
        type: 'link',
        label: 'packages/i18n',
        href: '/reference/packages/i18n/',
      },
      {
        type: 'link',
        label: 'packages/i18n-keys',
        href: '/reference/packages/i18n-keys/',
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
        label: 'packages/module-sdk',
        href: '/reference/packages/module-sdk/',
      },
      {
        type: 'link',
        label: 'packages/mrp-contracts',
        href: '/reference/packages/mrp-contracts/',
      },
      {
        type: 'link',
        label: 'packages/navigation',
        href: '/reference/packages/navigation/',
      },
      {
        type: 'link',
        label: 'packages/pim-contracts',
        href: '/reference/packages/pim-contracts/',
      },
      {
        type: 'link',
        label: 'packages/recipes-ui',
        href: '/reference/packages/recipes-ui/',
      },
      {
        type: 'link',
        label: 'packages/rendering',
        href: '/reference/packages/rendering/',
      },
      {
        type: 'link',
        label: 'packages/test-mcp',
        href: '/reference/packages/test-mcp/',
      },
      {type: 'link', label: 'packages/ui', href: '/reference/packages/ui/'},
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
