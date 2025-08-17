# CloudpulseGitUI

Step	Directory	Command / Packages to Install	Notes
1. Global Setup	Global	npm install -g pnpm	Optional but recommended for package management
2. Frontend Setup	/frontend	npm install react react-dom @mui/material @mui/icons-material @mui/x-data-grid dotenv
or
pnpm install	Installs React and MUI libraries plus dotenv
3. Backend Setup	/backend	npm install express cors body-parser glob dotenv
or
pnpm install	Backend server dependencies
4. Git Setup	Global	Install and configure git as needed	Backend relies on git commands
5. Env Config	Backend & Frontend	Use backend API /env?env=prod (or alpha, devCloud, staging) to generate .env files	Dynamically writes proper .env files
6. Run Backend	/backend	node index.js or equivalent start command	Starts the Express backend server
7. Run Frontend	/frontend	npm start or pnpm dev	Starts React development server
8. Optional Tools	Project root	Install Cypress and other automation tools as needed	Automation via backend routes and Cypress


Below is a ready-to-use `README.md` template for your CloudpulseGitUI repo, written in clear Markdown. It explains the app’s purpose, features, architecture, setup, and how to get started, referencing App.js, your dashboard screenshot, `setup.sh`, and `install.md`.

***

# CloudpulseGitUI

CloudpulseGitUI is a developer dashboard for effortless Git branch management, environment switching, remotes control, and automation—backed by a full-stack (React/Node.js) implementation. It’s designed for teams who want visual control over local branches, remotes, and CI automation—all from the browser.

***

## Features

- **Branch Management:** List, search, create, delete, and checkout branches from an interactive, filterable table.
- **Environment Switching:** Instantly switch between _Production_, _Alpha_, _Staging_, and _DevCloud_ for testing and development.
- **Remotes Management:** Add or remove Git remotes through the UI.
- **Automation:** Run Cypress E2E tests via UI dialogs (with dynamic spec selection).
- **Stash & Pull:** Stash uncommitted changes, pull latest from upstream, with force/safety options.
- **Quick Start Local Development Server:** Launch the frontend dev server from the dashboard.
- **Branch Stats & Logging:** View commit history and per-file TypeScript stats for any branch.

***

## Application Architecture

### React Frontend (`App.js`)
- The main UI logic is in `App.js`, built with React and Material UI (`@mui/material`, `@mui/x-data-grid`).
- State is managed for branches, remotes, dialogs, environment, notifications, and automation.
- Connects to backend APIs to interact with the local Git repo.
- Modern, attractive UI (see screenshot below).

### Express Backend (`index.js`)
- Serves as the bridge between UI and your on-disk Git repository.
- REST endpoints for all core Git operations, remotes management, environment config, and test automation.
- Safe command execution, branch/spec caching, and `.env` file control.

***

## Dashboard UI Example

![CloudpulseGitUI Dashboard local branches, sorted and filterable.
- Action buttons for **Create**, **Pull**, **Stash**, **Switch** environment, **Start** dev, **Run Specs**, **Add/Remove Remote**.
- Dialog-based UX for all destructive or critical actions.

***

## Quick Start Guide

### 🔥 The Fast Way: One-Command Setup

From your repo root, run:

```bash
bash setup.sh
```

- Checks/deploys Node.js, npm, pnpm, and asks for your managed repo path.
- Installs backend and frontend dependencies.
- Creates and fills `.env` files as needed.
- Sets up `.gitignore`.

#### To start after setup:
```bash
cd backend && node index.js    # Starts backend server (API)
cd frontend && pnpm dev        # Starts React frontend (UI)
```

***

### Manual Setup (see [`install.md`](./install.md))

| Step      | Directory          | Command(s)                                                                | Notes                                       |
|-----------|--------------------|---------------------------------------------------------------------------|---------------------------------------------|
| Backend   | `backend`          | `pnpm install`                                                            | Express, REST API                           |
| Frontend  | `frontend`         | `pnpm install`                                                            | React, Material UI, dotenv                  |
| .env      | both/back/front    | API `/env?env={NAME}` or manually edit `.env` files                       | Supports dynamic environment switching      |
| Start BE  | `backend`          | `node index.js`                                                           | API on `localhost:3006` (default)           |
| Start FE  | `frontend`         | `pnpm dev` (or `npm start`)                                               | UI at `localhost:3005` (default)            |

***

## File Reference

- **App.js** – Main React component/UI logic.
- **index.js** – Express backend/API with all endpoint routes.
- **install.md** – Step-by-step installation table (can follow manually).
- **setup.sh** – Bash script for automated setup of stack.
- **Screenshot** – Live sample UI above shows dashboard after a successful start.

***

## Getting Started

1. Make sure Node.js, npm, and git are installed on your system.
2. Clone this repository and run `bash setup.sh` **or** follow the steps in `install.md`.
3. Launch the backend and frontend as described above.
4. Open [http://localhost:3005](http://localhost:3005) in your browser.
5. Start managing your Git repository visually!

***

## Environment Files

- The app dynamically configures both backend and frontend `.env` files using the `/env?env=prod` (or other) API endpoint, but you can edit these manually if needed. See `install.md` for paths.

***

This project saves time on everyday Git operations and lets your entire team manage code branches, environments, and automations with confidence—all from the browser.
