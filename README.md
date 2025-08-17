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
