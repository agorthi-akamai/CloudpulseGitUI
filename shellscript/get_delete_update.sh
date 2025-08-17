#!/bin/bash
set -euo pipefail

# ---------------------------
# Function: Set HOST and TOKEN based on environment
# ---------------------------
getEnvConfig() {
  local envKey=$1
  case $envKey in
    prod)
      HOST="https://api.linode.com/v4beta"
      TOKEN="703354058b618e2fdb797bc8af1188f92dd0f058a436d17c35bc2a34ed2a3426"
      ;;
    alpha)
      HOST="https://api.dev.linode.com/v4beta"
      TOKEN="9c956852ea96954acbad105b850caf2338dce03600126c5496ddb477be58ebc0"
      ;;
    devCloud)
      HOST="https://api.devcloud.linode.com/v4beta"
      TOKEN="955ebd71b0afcd363e1f1c1a1aa76569d4d72dd247cc12ae5c29a94c01866ef9"
      ;;
    staging)
      HOST="https://api.staging.linode.com/v4beta"
      TOKEN="b082b2eacf82592994c66fab256f28a02d2ccfd74a65b3ed6182f28320e94d1e"
      ;;
    *)
      echo "❌ Unknown environment: $envKey"
      exit 1
      ;;
  esac
}

usage() {
  echo "Usage: $0 -e <prod|alpha|devCloud|staging>"
  exit 1
}

# ---------------------------
# Parse -e option
# ---------------------------
ENV=""
while getopts "e:" opt; do
  case $opt in
    e) ENV="$OPTARG" ;;
    *) usage ;;
  esac
done
[ -z "$ENV" ] && usage

# Load environment config
getEnvConfig "$ENV"

# Temp file
RESP_FILE="$(mktemp)"
trap 'rm -f "$RESP_FILE"' EXIT

echo "📡 Fetching user alert definitions from $ENV ..."

# ---------------------------
# Fetch alert-definitions
# ---------------------------
HTTP_CODE=$(curl -sS -o "$RESP_FILE" -w "%{http_code}" \
  "${HOST}/monitor/alert-definitions?page_size=500" \
  -H "Accept: application/json, text/plain, */*" \
  -H "Accept-Language: en-US,en;q=0.9" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Connection: keep-alive" \
  -H "Origin: http://localhost:3000" \
  -H "Referer: http://localhost:3000/" \
  -H "Sec-Fetch-Dest: empty" \
  -H "Sec-Fetch-Mode: cors" \
  -H "Sec-Fetch-Site: cross-site" \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  --insecure)

if [ "$HTTP_CODE" -ne 200 ]; then
  echo "❌ GET failed (HTTP $HTTP_CODE). Response body:"
  cat "$RESP_FILE" || true
  exit 1
fi

# Ensure .data is an array to avoid jq null iteration
if ! jq -e 'has("data") and (.data | type=="array")' "$RESP_FILE" >/dev/null; then
  echo "❌ Unexpected response shape (missing .data array):"
  cat "$RESP_FILE"
  exit 1
fi

# ---------------------------
# Select only user alerts with enabled/disabled status
# ---------------------------
MATCH_TSV="$(jq -r '
  .data[]
  | select(.type=="user" and (.status=="enabled" or .status=="disabled"))
  | [(.id|tostring),
     (.label // ""),
     (.status // ""),
     (.service // .service_type // "unknown"),
     (.type // "")]
  | @tsv
' "$RESP_FILE")"

if [ -z "$MATCH_TSV" ]; then
  echo "✅ No matching user alert definitions with status enabled/disabled."
  exit 0
fi

# Print table
printf "\n%-10s  %-30s  %-10s  %-12s  %-6s\n" "Alert ID" "Alert Name" "Status" "Service Type" "Type"
printf "%-10s  %-30s  %-10s  %-12s  %-6s\n" "---------" "------------------------------" "--------" "------------" "----"

while IFS=$'\t' read -r id name status service typev; do
  printf "%-10s  %-30s  %-10s  %-12s  %-6s\n" "$id" "$name" "$status" "$service" "$typev"
done <<< "$MATCH_TSV"

# ---------------------------
# Confirm deletion
# ---------------------------
read -r -p $'\n⚠️  Delete ALL the above alerts? (y/N): ' CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "❌ Deletion cancelled."
  exit 0
fi

# ---------------------------
# Delete alerts (service-specific first, then fallback)
# ---------------------------
DELETED=0
FAILED=0

while IFS=$'\t' read -r id name status service typev; do
  echo "🗑️  Deleting ID=$id Name=\"$name\" (service: $service)"

  # Try service-specific endpoint
  CODE1=$(curl -sS -o /dev/null -w "%{http_code}" \
    -X DELETE "${HOST}/monitor/services/${service}/alert-definitions/${id}" \
    -H "Accept: application/json, text/plain, */*" \
    -H "Accept-Language: en-US,en;q=0.9" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Connection: keep-alive" \
    -H "Origin: http://localhost:3000" \
    -H "Referer: http://localhost:3000/" \
    -H "Sec-Fetch-Dest: empty" \
    -H "Sec-Fetch-Mode: cors" \
    -H "Sec-Fetch-Site: cross-site" \
    -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
    -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"' \
    -H 'sec-ch-ua-mobile: ?0' \
    -H 'sec-ch-ua-platform: "macOS"' \
    --insecure || true)

  if [[ "$CODE1" == "204" || "$CODE1" == "200" ]]; then
    echo "✅ Deleted via /monitor/services/${service}/alert-definitions/${id}"
    ((DELETED++))
    continue
  fi

  # Fallback: generic endpoint (if supported)
  CODE2=$(curl -sS -o /dev/null -w "%{http_code}" \
    -X DELETE "${HOST}/monitor/alert-definitions/${id}" \
    -H "Authorization: Bearer $TOKEN" \
    --insecure || true)

  if [[ "$CODE2" == "204" || "$CODE2" == "200" ]]; then
    echo "✅ Deleted via /monitor/alert-definitions/${id}"
    ((DELETED++))
  else
    echo "❌ Failed to delete ID=$id (service code: $CODE1, fallback code: $CODE2)"
    ((FAILED++))
  fi
done <<< "$MATCH_TSV"

echo ""
echo "Summary: deleted=$DELETED failed=$FAILED"
