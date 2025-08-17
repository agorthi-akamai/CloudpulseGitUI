#!/bin/bash

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
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
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
echo "Total user-type alerts count: $count"
