import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import {OpenApiRedocEmbed} from '../components/OpenApiRedocEmbed';

export default function OpenApiBreweryPage(): ReactNode {
  return (
    <Layout
      title="Brewery OpenAPI"
      description="Browsable Redoc view of the brewery vertical OpenAPI add-on (reference profile)."
    >
      <main className="openapi-redoc-page">
        <OpenApiRedocEmbed specPath="/openapi/brewery.json" />
      </main>
    </Layout>
  );
}
