#!/bin/bash
set -e

echo "========================================"
echo "=   CloudpulseGitUI Fullstack Setup    ="
echo "========================================"

# --- Utility function ---
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# --- Dependency checks ---
if ! command_exists node; then
  echo "❌ Error: Node.js not found. Please install Node.js before continuing."
  exit 1
fi
if ! command_exists npm; then
  echo "❌ Error: npm not found. Please install npm before continuing."
  exit 1
fi

# --- PNPM setup ---
if ! command_exists pnpm; then
  echo "📦 pnpm not found. Installing pnpm globally..."
  npm install -g pnpm
else
  echo "✅ pnpm is installed globally."
fi

# --- Prompt for REPO_PATH ---
echo "Please enter your CloudManage repo location:"
read -p "> " REPO_PATH_INPUT

if [ -z "$REPO_PATH_INPUT" ]; then
  echo "❌ REPO_PATH cannot be empty. Please rerun the script and enter a valid path."
  exit 1
fi

# --- Backend install ---
BACKEND_DIR="backend"
if [ -d "$BACKEND_DIR" ]; then
  echo "📂 Installing backend dependencies..."
  cd "$BACKEND_DIR"

  if [ ! -f package.json ]; then
    echo "No package.json found in backend, initializing..."
    npm init -y
  fi

  pnpm add express cors body-parser glob dotenv

  # Create backend .env if missing
  if [ ! -f .env ]; then
    echo "📄 Creating backend/.env..."
    cat <<EOT > .env
PORT=3006
REPO_PATH=$REPO_PATH_INPUT
EOT
  else
    echo "ℹ️ backend/.env already exists."
  fi

  cd ..
else
  echo "⚠️ Warning: Backend directory '$BACKEND_DIR' not found."
fi

# --- Frontend install ---
FRONTEND_DIR="frontend"
if [ -d "$FRONTEND_DIR" ]; then
  echo "📂 Installing frontend dependencies..."
  cd "$FRONTEND_DIR"

  if [ ! -f package.json ]; then
    echo "No package.json found in frontend, initializing..."
    npm init -y
  fi

  pnpm add react react-dom @mui/material @mui/icons-material @mui/x-data-grid dotenv

  # Create frontend .env if missing
  FRONTEND_ENV_PATH="./.env"
  if [ ! -f "$FRONTEND_ENV_PATH" ]; then
    echo "📄 Creating frontend/.env..."
    cat <<EOT > "$FRONTEND_ENV_PATH"
PORT=3005
BROWSER=none

REACT_APP_API_URL=http://localhost:3006
EOT
  else
    echo "ℹ️ frontend/.env already exists."
  fi

  echo "Frontend .env path: $(pwd)/$FRONTEND_ENV_PATH"

  cd ..
else
  echo "⚠️ Warning: Frontend directory '$FRONTEND_DIR' not found."
fi

# --- .gitignore setup ---
GITIGNORE_FILE=".gitignore"
touch "$GITIGNORE_FILE"
GITIGNORE_ENTRIES=("package-lock.json" "*.env" "*.class")

for entry in "${GITIGNORE_ENTRIES[@]}"; do
  if ! grep -Fxq "$entry" "$GITIGNORE_FILE"; then
    echo "➕ Adding '$entry' to $GITIGNORE_FILE"
    echo "$entry" >> "$GITIGNORE_FILE"
  fi
done

echo ""
echo "========================================"
echo "= ✅ Setup Complete!                   ="
echo "========================================"
echo ""
echo "👉 To start the backend:"
echo "   cd backend && node index.js"
echo ""
echo "👉 To start the frontend:"
echo "   cd frontend && pnpm dev   (or npm start)"
echo ""

