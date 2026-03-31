#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_DIR="$ROOT_DIR/deploy"
ENV_FILE="$DEPLOY_DIR/env/backend.demo.env"
ENV_EXAMPLE="$DEPLOY_DIR/env/backend.demo.env.example"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.demo.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Create it first, for example:"
  echo "  cp $ENV_EXAMPLE $ENV_FILE"
  exit 1
fi

mkdir -p "$ROOT_DIR/deploy/runtime"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

echo
echo "Demo deployment started."
echo "Check containers with:"
echo "  docker compose -f $COMPOSE_FILE --env-file $ENV_FILE ps"
