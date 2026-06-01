import React, {useEffect, useRef, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

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

export default function OpenApiBreweryPage(): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const specUrl = useBaseUrl('/openapi/brewery.json');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await loadScript(REDOC_STANDALONE);
      if (cancelled || !containerRef.current || !window.Redoc) {
        return;
      }
      window.Redoc.init(specUrl, {}, containerRef.current);
    })().catch(() => {
      // Redoc load failures surface as an empty main region; static JSON remains at specUrl.
    });

    return () => {
      cancelled = true;
    };
  }, [specUrl]);

  return (
    <Layout
      title="Brewery OpenAPI"
      description="Browsable Redoc view of the brewery vertical OpenAPI add-on (reference profile)."
    >
      <main
        style={{
          minHeight: 'calc(100vh - var(--ifm-navbar-height))',
        }}
      >
        <div ref={containerRef} />
      </main>
    </Layout>
  );
}
