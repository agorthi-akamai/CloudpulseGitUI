#!/opt/homebrew/bin/bash


echo "===="
echo "=   CloudpulseGitUI Setup Script   ="
echo "===="

# Check prerequisites: node, npm
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed. Please install it before proceeding."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is not installed. Please install it before proceeding."
  exit 1
fi

# Check pnpm and install if missing
if command -v pnpm >/dev/null 2>&1; then
  echo "✅ pnpm is installed."
else
  echo "📦 Installing pnpm globally..."
  npm install -g pnpm
fi

# Environments list
ENVS=(prod alpha devCloud staging)

declare -A MANAGER_OAUTHS
declare -A CLIENT_IDS

# Prompt for MANAGER_OAUTH for each env
for ENV in "${ENVS[@]}"; do
  while :; do
    read -rp "Enter MANAGER_OAUTH for $ENV (required): " val
    if [[ -n $val ]]; then
      MANAGER_OAUTHS[$ENV]=$val
      break
    else
      echo "MANAGER_OAUTH cannot be empty."
    fi
  done
done

# Prompt for REACT_APP_CLIENT_ID for each env
for ENV in "${ENVS[@]}"; do
  while :; do
    read -rp "Enter REACT_APP_CLIENT_ID for $ENV (required): " val
    if [[ -n $val ]]; then
      CLIENT_IDS[$ENV]=$val
      break
    else
      echo "REACT_APP_CLIENT_ID cannot be empty."
    fi
  done
done

# Prompt for REPO_PATH once
while :; do
  read -rp "Enter repository path (REPO_PATH) for backend (required): " REPO_PATH_VAL
  if [[ -n $REPO_PATH_VAL ]]; then
    break
  else
    echo "REPO_PATH cannot be empty."
  fi
done

# Constants
BACKEND_PORT=3006
FRONTEND_PORT=3005
BROWSER=none
REACT_APP_LAUNCH_DARKLY_ID="5cd5be32283709081fd70fbb"
REACT_APP_LKE_HIGH_AVAILABILITY_PRICE="60"
REACT_APP_APP_ROOT="http://localhost:3000"

declare -A LOGIN_ROOTS=(
  [prod]="https://login.linode.com"
  [alpha]="https://login.dev.linode.com"
  [devCloud]="https://login.devcloud.linode.com"
  [staging]="https://login.staging.linode.com"
)

declare -A API_ROOTS=(
  [prod]="https://api.linode.com/v4"
  [alpha]="https://api.dev.linode.com/v4"
  [devCloud]="https://api.devcloud.linode.com/v4"
  [staging]="https://api.staging.linode.com/v4"
)

# Function to build JSON config string for each environment
build_config() {
  local ENV=$1
  printf '{"REACT_APP_LOGIN_ROOT":"%s","REACT_APP_API_ROOT":"%s","REACT_APP_CLIENT_ID":"%s","REACT_APP_APP_ROOT":"%s","REACT_APP_LKE_HIGH_AVAILABILITY_PRICE":"%s","REACT_APP_LAUNCH_DARKLY_ID":"%s","MANAGER_OAUTH":"%s"}' \
    "${LOGIN_ROOTS[$ENV]}" \
    "${API_ROOTS[$ENV]}" \
    "${CLIENT_IDS[$ENV]}" \
    "$REACT_APP_APP_ROOT" \
    "$REACT_APP_LKE_HIGH_AVAILABILITY_PRICE" \
    "$REACT_APP_LAUNCH_DARKLY_ID" \
    "${MANAGER_OAUTHS[$ENV]}"
}

CONFIG_PROD=$(build_config prod)
CONFIG_ALPHA=$(build_config alpha)
CONFIG_DEVCLOUD=$(build_config devCloud)
CONFIG_STAGING=$(build_config staging)

FRONTEND_DIR="frontend"

if [[ -d $FRONTEND_DIR ]]; then
  echo "Installing frontend dependencies..."
  cd "$FRONTEND_DIR" || exit 1
  if [[ ! -f package.json ]]; then
    npm init -y
  fi
  pnpm add react react-dom @mui/material @mui/icons-material @mui/x-data-grid dotenv

  ENV_FILE_PATH="$(pwd)/.env"

  cat > .env <<EOT
PORT=$FRONTEND_PORT
BROWSER=$BROWSER
Backendport=$BACKEND_PORT
REPO_PATH=$REPO_PATH_VAL
REACT_APP_API_URL=http://localhost:$BACKEND_PORT

CONFIG_PROD='$CONFIG_PROD'
CONFIG_ALPHA='$CONFIG_ALPHA'
CONFIG_DEVCLOUD='$CONFIG_DEVCLOUD'
CONFIG_STAGING='$CONFIG_STAGING'
EOT

  echo "Wrote .env file inside $FRONTEND_DIR at $ENV_FILE_PATH with backend and frontend configs."
  cd - || exit 1
else
  echo "Frontend directory '$FRONTEND_DIR' not found."
  exit 1
fi

echo ""
echo "=== Configuration Summary ==="
echo "Backendport=$BACKEND_PORT"
echo "REPO_PATH=$REPO_PATH_VAL"
echo "Frontend PORT=$FRONTEND_PORT"
echo ""
echo "CONFIG_PROD=$CONFIG_PROD"
echo "CONFIG_ALPHA=$CONFIG_ALPHA"
echo "CONFIG_DEVCLOUD=$CONFIG_DEVCLOUD"
echo "CONFIG_STAGING=$CONFIG_STAGING"
echo ""
echo "Setup complete!"
