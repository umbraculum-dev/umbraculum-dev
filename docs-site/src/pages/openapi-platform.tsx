import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import {OpenApiRedocEmbed} from '../components/OpenApiRedocEmbed';

export default function OpenApiPlatformPage(): ReactNode {
  return (
    <Layout
      title="Platform OpenAPI"
      description="Browsable Redoc view of the Umbraculum platform OpenAPI catalog (platform module profile)."
    >
      <main className="openapi-redoc-page">
        <OpenApiRedocEmbed specPath="/openapi/openapi.json" />
      </main>
    </Layout>
  );
}
