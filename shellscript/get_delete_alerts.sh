#!/bin/bash

# --- Function to set HOST and TOKEN based on env ---
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
  echo "Usage: $0 -e <environment>"
  echo "Available environments: prod, alpha, devCloud, staging"
  exit 1
}

while getopts "e:" opt; do
  case $opt in
    e) ENV="$OPTARG" ;;
    *) usage ;;
  esac
done

if [ -z "$ENV" ]; then
  usage
fi

getEnvConfig "$ENV"

response_code=$(curl -s -o response.json -w "%{http_code}" "${HOST}/monitor/alert-definitions?page_size=500" \
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

echo "GET API HTTP status code: $response_code"

if [ "$response_code" -ne 200 ]; then
  echo "GET API call failed with status $response_code"
  exit 1
fi

alert_ids=$(jq -r '.data[] | select(.type=="user") | .id' response.json)
count=$(echo "$alert_ids" | grep -c .)

echo "User-type Alert IDs:"
echo "$alert_ids"

fetched_ids=()
while IFS= read -r line; do
  fetched_ids+=("$line")
done <<< "$alert_ids"

read -p "⚠️  Are you sure you want to delete $count user-type alert definitions? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "❌ Deletion cancelled."
  exit 1
fi

delete_count=0
for id in "${fetched_ids[@]}"; do
  echo "🗑️  Deleting user-type alert definition ID: $id"

  # Store full API response (body + HTTP code as last line)
  response=$(curl -s -w "\n%{http_code}" \
    "${HOST}/monitor/services/dbaas/alert-definitions/$id" \
    -X DELETE \
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

  # Extract HTTP status code (last line)
  http_code=$(echo "$response" | tail -n1)
  # Extract everything except last line as body
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" == "200" || "$http_code" == "204" ]]; then
    echo "✅ Deleted successfully."
    ((delete_count++))
  else
    echo "❌ Failed to delete alert ID: $id (HTTP $http_code)"
    echo "Response: $body"
  fi
done

echo "Total alerts deleted successfully: $delete_count"

