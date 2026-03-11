#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-5500}"

echo "Starting local server at http://localhost:${PORT}"
echo "Basic survey:    http://localhost:${PORT}/survey-basic/"
echo "Rephrase survey: http://localhost:${PORT}/survey-rephrase/"

python3 -m http.server "${PORT}"
