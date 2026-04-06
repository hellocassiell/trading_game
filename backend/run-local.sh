#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JDK_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"

if [[ ! -d "$JDK_HOME" ]]; then
  echo "JDK not found at $JDK_HOME"
  echo "Install it with: brew install openjdk@17"
  exit 1
fi

export JAVA_HOME="$JDK_HOME"
export PATH="$JAVA_HOME/bin:/opt/homebrew/bin:$PATH"

echo "Using JAVA_HOME=$JAVA_HOME"
echo "Note: Project is compiled with --release 8, compatible with JDK 8+"
java -version
echo

cd "$ROOT_DIR"
exec mvn spring-boot:run
