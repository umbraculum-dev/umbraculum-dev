import React, {useEffect, useRef, type ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useColorMode} from '@docusaurus/theme-common';
import {getRedocTheme} from '../openapi/redocTheme';

declare global {
  interface Window {
    Redoc?: {
      init: (
        specUrl: string,
        options: Record<string, unknown>,
        element: HTMLElement,
        callback?: () => void,
      ) => void;
    };
  }
}

const REDOC_STANDALONE =
  'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';

function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[src="${src}"]`)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

type OpenApiRedocEmbedProps = {
  /** Static spec path under docs-site/static, e.g. `/openapi/brewery.json`. */
  specPath: string;
};

export function OpenApiRedocEmbed({specPath}: OpenApiRedocEmbedProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const specUrl = useBaseUrl(specPath);
  const {colorMode} = useColorMode();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await loadScript(REDOC_STANDALONE);
      if (cancelled || !containerRef.current || !window.Redoc) {
        return;
      }

      containerRef.current.innerHTML = '';
      window.Redoc.init(
        specUrl,
        {
          theme: getRedocTheme(colorMode),
          scrollYOffset: 0,
          hideDownloadButton: false,
        },
        containerRef.current,
      );
    })().catch(() => {
      // Redoc load failures surface as an empty main region; static JSON remains at specUrl.
    });

    return () => {
      cancelled = true;
    };
  }, [specUrl, colorMode]);

  return <div ref={containerRef} className="openapi-redoc-host" />;
}
