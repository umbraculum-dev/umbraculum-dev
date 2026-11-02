# Project-owned pgpool-II image (no Bitnami). Pin Debian bookworm packages.
FROM debian:bookworm-slim

ARG PGPOOL2_VERSION=4.3.5-1+deb12u1
ARG POSTGRESQL_CLIENT_VERSION=15+248+deb12u1

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    "pgpool2=${PGPOOL2_VERSION}" \
    "postgresql-client=${POSTGRESQL_CLIENT_VERSION}" \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /var/run/pgpool /var/log/postgresql /config \
  && chown -R postgres:postgres /var/run/pgpool /var/log/postgresql /etc/pgpool2

COPY docker-entrypoint.sh /usr/local/bin/pgpool-entrypoint.sh
RUN chmod +x /usr/local/bin/pgpool-entrypoint.sh

USER postgres
EXPOSE 5432 9898
ENTRYPOINT ["/usr/local/bin/pgpool-entrypoint.sh"]
