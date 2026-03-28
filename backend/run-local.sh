#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JDK17_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"

if [[ ! -d "$JDK17_HOME" ]]; then
  echo "JDK 17 not found at $JDK17_HOME"
  echo "Install it with: brew install openjdk@17"
  exit 1
fi

export JAVA_HOME="$JDK17_HOME"
export PATH="$JAVA_HOME/bin:/opt/homebrew/bin:$PATH"

echo "Using JAVA_HOME=$JAVA_HOME"
java -version
echo

cd "$ROOT_DIR"
exec mvn spring-boot:run
