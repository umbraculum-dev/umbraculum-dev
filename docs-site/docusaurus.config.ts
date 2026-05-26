import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..');
const docsRoot = path.resolve(repoRoot, 'docs');
const githubBase = 'https://github.com/umbraculum-dev/umbraculum-dev';
const referenceAppsReadmes = [
  'web/README.md',
  'web/e2e/README.md',
  'native/README.md',
];
const referenceServicesReadmes = [
  'api/README.md',
  'api/src/seed/README.md',
];
const referencePackagesReadmes = [
  'ai-tool-sdk/README.md',
  'api-client/README.md',
  'beerjson/README.md',
  'contracts/README.md',
  'i18n/README.md',
  'i18n-react/README.md',
  'media/README.md',
  'navigation/README.md',
  'recipes-ui/README.md',
  'test-mcp/README.md',
  'ui/README.md',
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

        if (!sourceIsMainDocs || !isPublishableDocsMarkdown(targetPath)) {
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
  favicon: 'img/favicon.ico',
  url: 'https://docs.umbraculum.dev',
  baseUrl: '/',
  organizationName: 'umbraculum-dev',
  projectName: 'umbraculum-dev',

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
        id: 'reference-apps',
        path: '../apps',
        routeBasePath: 'reference/apps',
        include: referenceAppsReadmes,
        sidebarPath: false,
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
        sidebarPath: false,
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
        sidebarPath: false,
        editUrl:
          'https://github.com/umbraculum-dev/umbraculum-dev/tree/master/packages/',
        beforeDefaultRemarkPlugins: [rewriteRepoRelativeLinks],
      },
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    format: 'detect',
    mermaid: true,
    preprocessor: ({filePath, fileContent}) => {
      if (path.basename(filePath) !== 'REPOSITORY-STRUCTURE.md') {
        return fileContent;
      }

      return fileContent.replace(
        /```mermaid[\s\S]*?```/,
        '![Repository structure dependency diagram](/img/repository-structure.svg)',
      );
    },
    hooks: {
      onBrokenMarkdownLinks: 'ignore',
    },
  },

  themeConfig: {
    navbar: {
      title: 'Umbraculum',
      logo: {
        alt: 'Umbraculum placeholder logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/reference/apps/web/', label: 'Reference', position: 'left'},
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
            {label: 'Reference READMEs', to: '/reference/apps/web/'},
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
          ],
        },
      ],
      copyright: `Umbraculum documentation surface. Placeholder brand assets are used until maintainer-provided final assets land. © ${new Date().getFullYear()} Umbraculum contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
