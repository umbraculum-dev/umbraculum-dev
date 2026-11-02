# db-guard sidecar: psql + pcp_* against project pgpool (no Bitnami paths).
FROM debian:bookworm-slim

ARG PGPOOL2_VERSION=4.3.5-1+deb12u1
ARG POSTGRESQL_CLIENT_VERSION=15+248+deb12u1

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    bash \
    "pgpool2=${PGPOOL2_VERSION}" \
    "postgresql-client=${POSTGRESQL_CLIENT_VERSION}" \
  && rm -rf /var/lib/apt/lists/*

COPY db-guard.sh /db-guard.sh
RUN chmod +x /db-guard.sh

CMD ["bash", "/db-guard.sh"]
