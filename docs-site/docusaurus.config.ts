import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import fs from 'node:fs';
import path from 'node:path';
import {toDocusaurusAnnouncementBar} from '../apps/website/scripts/announcement-theme.mjs';

const announcementConfig = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../apps/website/announcement.config.json'),
    'utf8',
  ),
) as {
  enabled: boolean;
  id: string;
  variant?: 'info' | 'warning' | 'critical';
  dismissible?: boolean;
  html: string;
};

const announcementBar = toDocusaurusAnnouncementBar(announcementConfig);

const repoRoot = path.resolve(__dirname, '..');
const docsRoot = path.resolve(repoRoot, 'docs');
const githubBase = 'https://github.com/umbraculum-dev/umbraculum-dev';
const referenceAppsReadmes = [
  'web/README.md',
  'web/e2e/README.md',
  'native/README.md',
  'native/brewery/README.md',
];
const referenceServicesReadmes = [
  'api/README.md',
  'api/src/seed/README.md',
];
const referencePackagesReadmes = [
  'modules/ai-tool-sdk/README.md',
  'platform/api-client/README.md',
  'modules/automation-contracts/README.md',
  'verticals/brewery/beerjson/README.md',
  'platform/contracts/README.md',
  'verticals/brewery/contracts/README.md',
  'verticals/brewery/core/README.md',
  'modules/crp-contracts/README.md',
  'verticals/brewery/i18n/README.md',
  'platform/i18n/README.md',
  'modules/i18n-keys/README.md',
  'platform/i18n-react/README.md',
  'verticals/brewery/media-assets/README.md',
  'platform/media/README.md',
  'modules/module-sdk/README.md',
  'modules/mrp-contracts/README.md',
  'platform/navigation/README.md',
  'modules/pim-contracts/README.md',
  'verticals/brewery/recipes-ui/README.md',
  'platform/rendering/README.md',
  'platform/test-mcp/README.md',
  'platform/ui/README.md',
];

const excludedDocs = new Set(
  [
    'design/pr1-contracts-migration-handoff.md',
    'design/pr3-routes-migration-handoff.md',
    'design/architectural-audit-template.md',
    'design/validation-library-adoption-audit.md',
  ].map((relativePath) => path.resolve(docsRoot, relativePath)),
);

function isExternalUrl(url: string): boolean {
  if (url.startsWith('/home/')) {
    return false;
  }

  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(url);
}

function splitUrl(url: string): {pathname: string; suffix: string} {
  const suffixStart = url.search(/[?#]/);
  if (suffixStart === -1) {
    return {pathname: url, suffix: ''};
  }

  return {
    pathname: url.slice(0, suffixStart),
    suffix: url.slice(suffixStart),
  };
}

function isPublishableDocsMarkdown(targetPath: string): boolean {
  if (!targetPath.startsWith(`${docsRoot}${path.sep}`)) {
    return false;
  }

  if (excludedDocs.has(targetPath)) {
    return false;
  }

  return (
    fs.existsSync(targetPath) &&
    fs.statSync(targetPath).isFile() &&
    /\.(?:md|mdx)$/i.test(targetPath)
  );
}

function toGithubUrl(targetPath: string, suffix: string): string {
  if (!targetPath.startsWith(repoRoot)) {
    return `${githubBase}/tree/master${suffix}`;
  }

  const existingPath = fs.existsSync(targetPath)
    ? targetPath
    : path.resolve(repoRoot, path.relative(repoRoot, targetPath));
  const relativePath = path.relative(repoRoot, existingPath);
  const kind =
    fs.existsSync(existingPath) && fs.statSync(existingPath).isDirectory()
      ? 'tree'
      : 'blob';

  return `${githubBase}/${kind}/master/${encodeURI(relativePath)}${suffix}`;
}

const CONTRACTS_VERSION_MARKER = '**Contract version:**';

function injectContractsVersionBanner(
  filePath: string,
  fileContent: string,
): string {
  if (!filePath.includes(`${path.sep}packages${path.sep}`)) {
    return fileContent;
  }

  if (!filePath.endsWith(`${path.sep}README.md`)) {
    return fileContent;
  }

  const packageDir = path.dirname(filePath);
  const packageName = path.basename(packageDir);
  if (!packageName.endsWith('-contracts')) {
    return fileContent;
  }

  if (fileContent.includes(CONTRACTS_VERSION_MARKER)) {
    return fileContent;
  }

  const versionPath = path.join(packageDir, 'src', 'version.ts');
  if (!fs.existsSync(versionPath)) {
    return fileContent;
  }

  const versionSrc = fs.readFileSync(versionPath, 'utf8');
  const versionMatch = versionSrc.match(
    /export const CONTRACT_VERSION\s*=\s*"([^"]+)"/,
  );
  if (!versionMatch) {
    return fileContent;
  }

  const contractVersion = versionMatch[1];
  const banner = [
    '',
    '> [!INFO]',
    `> **Contract version:** \`${contractVersion}\` (from \`src/version.ts\`). Pin npm as \`@umbraculum/${packageName}@${contractVersion}\`. Per [RFC-0005](/rfcs/docs-site) this page tracks \`master\` until the first P6 docs snapshot is cut.`,
    '',
  ].join('\n');

  const afterNote = fileContent.replace(
    /(> \[!NOTE\][\s\S]*?)\n\n/,
    `$1\n${banner}\n`,
  );
  if (afterNote !== fileContent) {
    return afterNote;
  }

  return fileContent.replace(
    /(^#[^\n]+\n(?:[^\n#].*\n)?)\n/,
    `$1${banner}\n`,
  );
}

function toReferenceDocsUrl(sourcePath: string, targetPath: string): string | undefined {
  const referenceRoots: Array<{root: string; routeBase: string}> = [
    {root: path.resolve(repoRoot, 'apps'), routeBase: 'reference/apps'},
    {root: path.resolve(repoRoot, 'services'), routeBase: 'reference/services'},
    {root: path.resolve(repoRoot, 'packages'), routeBase: 'reference/packages'},
  ];

  for (const {root, routeBase} of referenceRoots) {
    if (
      !sourcePath.startsWith(`${root}${path.sep}`) ||
      !targetPath.startsWith(`${root}${path.sep}`)
    ) {
      continue;
    }

    const relativeTarget = path.relative(root, targetPath);
    if (!relativeTarget.endsWith('README.md')) {
      continue;
    }

    const routeSegment = relativeTarget
      .slice(0, -'/README.md'.length)
      .replace(/\\/g, '/');

    return `/${routeBase}/${routeSegment ? `${routeSegment}/` : ''}`;
  }

  return undefined;
}

function rewriteRepoRelativeLinks() {
  return (tree: {children?: unknown[]}, file: {path?: string}) => {
    const sourcePath = file.path ? path.resolve(file.path) : docsRoot;
    const sourceDir = path.dirname(sourcePath);
    const sourceIsMainDocs = sourcePath.startsWith(`${docsRoot}${path.sep}`);

    const visit = (node: unknown): void => {
      if (!node || typeof node !== 'object') {
        return;
      }

      const maybeLink = node as {type?: string; url?: string; children?: unknown[]};
      if (
        (maybeLink.type === 'link' || maybeLink.type === 'image') &&
        typeof maybeLink.url === 'string' &&
        !isExternalUrl(maybeLink.url)
      ) {
        const {pathname, suffix} = splitUrl(maybeLink.url);
        const targetPath = path.resolve(sourceDir, pathname);

        if (sourceIsMainDocs && isPublishableDocsMarkdown(targetPath)) {
          // Keep relative links inside publishable docs/ as in-site routes.
        } else if (!sourceIsMainDocs) {
          const referenceUrl = toReferenceDocsUrl(sourcePath, targetPath);
          maybeLink.url = referenceUrl
            ? `${referenceUrl}${suffix}`
            : toGithubUrl(targetPath, suffix);
        } else {
          maybeLink.url = toGithubUrl(targetPath, suffix);
        }
      }

      if (Array.isArray(maybeLink.children)) {
        maybeLink.children.forEach(visit);
      }
    };

    visit(tree);
  };
}

const config: Config = {
  title: 'Umbraculum Documentation',
  tagline: 'Operational-application toolset — canonical reference',
  favicon: 'img/umbi.png',
  url: 'https://docs.umbraculum.dev',
  baseUrl: '/',
  organizationName: 'umbraculum-dev',
  projectName: 'umbraculum-dev',

  clientModules: [require.resolve('./src/clientModules/chunk-reload.ts')],

  // RFC-0005 P7 — flip to false when public alpha is declared (with robots.txt).
  noIndex: true,

  onBrokenLinks: 'throw',

  future: {
    v4: true,
    faster: true,
    experimental_vcs: 'default-v2',
  },

  storage: {
    type: 'localStorage',
    namespace: true,
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/umbraculum-dev/umbraculum-dev/tree/master/docs/',
          exclude: [
            '**/design/pr1-contracts-migration-handoff.md',
            '**/design/pr3-routes-migration-handoff.md',
            '**/design/architectural-audit-template.md',
            '**/design/validation-library-adoption-audit.md',
          ],
          beforeDefaultRemarkPlugins: [
            rewriteRepoRelativeLinks,
          ],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference-index',
        path: 'reference-index',
        routeBasePath: 'reference',
        include: ['README.md'],
        sidebarPath: './sidebars-reference.ts',
        editUrl:
          'https://github.com/umbraculum-dev/umbraculum-dev/tree/master/docs-site/reference-index/',
        beforeDefaultRemarkPlugins: [rewriteRepoRelativeLinks],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference-apps',
        path: '../apps',
        routeBasePath: 'reference/apps',
        include: referenceAppsReadmes,
        sidebarPath: './sidebars-reference.ts',
        editUrl:
          'https://github.com/umbraculum-dev/umbraculum-dev/tree/master/apps/',
        beforeDefaultRemarkPlugins: [rewriteRepoRelativeLinks],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference-services',
        path: '../services',
        routeBasePath: 'reference/services',
        include: referenceServicesReadmes,
        sidebarPath: './sidebars-reference.ts',
        editUrl:
          'https://github.com/umbraculum-dev/umbraculum-dev/tree/master/services/',
        beforeDefaultRemarkPlugins: [rewriteRepoRelativeLinks],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference-packages',
        path: '../packages',
        routeBasePath: 'reference/packages',
        include: referencePackagesReadmes,
        sidebarPath: './sidebars-reference.ts',
        editUrl:
          'https://github.com/umbraculum-dev/umbraculum-dev/tree/master/packages/',
        beforeDefaultRemarkPlugins: [rewriteRepoRelativeLinks],
      },
    ],
  ],

  themes: [
    '@docusaurus/theme-mermaid',
  [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        indexDocs: true,
        docsRouteBasePath: [
          '/',
          'reference',
          'reference/apps',
          'reference/services',
          'reference/packages',
        ],
      },
    ],
  ],

  markdown: {
    format: 'detect',
    mermaid: true,
    preprocessor: ({filePath, fileContent}) => {
      let content = fileContent;

      if (path.basename(filePath) === 'REPOSITORY-STRUCTURE.md') {
        content = content.replace(
          /```mermaid[\s\S]*?```/,
          '![Repository structure dependency diagram](/img/repository-structure.svg)',
        );
      }

      content = injectContractsVersionBanner(
        filePath ? path.resolve(filePath) : '',
        content,
      );

      return content;
    },
    hooks: {
      onBrokenMarkdownLinks: 'ignore',
    },
  },

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    ...(announcementBar !== undefined ? {announcementBar} : {}),
    navbar: {
      title: 'Umbraculum',
      logo: {
        alt: 'Umbi — Umbraculum mascot',
        src: 'img/umbi.png',
        width: 32,
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/reference/', label: 'Reference', position: 'left'},
        {
          href: 'https://forum.umbraculum.dev',
          label: 'Community forum',
          position: 'right',
        },
        {
          href: 'https://github.com/umbraculum-dev/umbraculum-dev',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Documentation home', to: '/'},
            {label: 'RFC index', to: '/rfcs/'},
            {label: 'Open-source stack', to: '/OPEN-SOURCE-STACK'},
            {label: 'Module reference', to: '/reference/'},
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/umbraculum-dev/umbraculum-dev',
            },
            {
              label: 'MANIFESTO',
              href: 'https://github.com/umbraculum-dev/umbraculum-dev/blob/master/MANIFESTO.md',
            },
            {
              label: 'Support & sponsorship',
              href: 'https://umbraculum.dev/support/',
            },
            {
              label: 'Community forum',
              href: 'https://forum.umbraculum.dev',
            },
          ],
        },
      ],
      copyright: `Public alpha (target <time datetime="2026-07-01">1&nbsp;July&nbsp;2026</time>) · docs track <code>master</code><br />© ${new Date().getFullYear()} Umbraculum contributors. Documentation is AGPLv3-aligned with the monorepo core.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
