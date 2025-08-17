### Installation Guide

We have included a `setup.sh` script to help you install all dependencies easily.

Before running the script, please give it execution permissions:( chmod +x setup.sh)

# Installation Guide

| Step | Directory         | Command                                                                                      | Notes                                                                 |
|------|-------------------|----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1. Global Setup | Global            | `npm install -g pnpm`                                                                 | Optional but recommended for package management                       |
| 2. Frontend Setup | `/frontend`       | `npm install react react-dom @mui/material @mui/icons-material @mui/x-data-grid dotenv` <br>or<br> `pnpm install` | Installs React, Material UI libraries, and dotenv                     |
| 3. Backend Setup | `/backend`        | `npm install express cors body-parser glob dotenv` <br>or<br> `pnpm install`           | Backend server dependencies                                           |
| 4. Git Setup | Global            | Install and configure **git** manually                                                  | Backend relies on git commands                                        |
| 5. Env Config | Backend & Frontend | Use backend API: `GET /env?env=prod` (or `alpha`, `devCloud`, `staging`)              | Dynamically writes proper `.env` files                                |
| 6. Run Backend | `/backend`        | `node index.js` (or equivalent start command)                                          | Starts the Express backend server                                     |
| 7. Run Frontend | `/frontend`       | `npm start` <br>or<br> `pnpm dev`                                                      | Starts React development server                                       |
| 8. Optional Tools | Project root     | Install Cypress and other automation tools as needed                                   | Supports automation via backend routes and Cypress                    |

#Env file location

#/CloudpulseGitUI/frontend/.env
