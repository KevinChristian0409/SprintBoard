# SprintBoard

![Playwright Tests](https://github.com/KevinChristian0409/SprintBoard/actions/workflows/playwright.yml/badge.svg)

**SprintBoard** is a full-stack project management application inspired by Jira-style workflows and Kanban boards. It allows users to create and manage projects, organize tasks through a visual workflow, collaborate with project members, and track work from a centralized dashboard.

> **Mini Jira-style project management application built with React, TypeScript, Node.js, Express, and MongoDB.**

## 🚀 Live Demo

**[Open SprintBoard](https://sprint-board-seven-omega.vercel.app)**

The application is deployed with:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Protected application routes
- Protected backend API routes
- Password hashing with bcrypt
- Automatic JWT authorization for API requests
- Logout functionality

### 📁 Project Management

- Create projects
- View projects
- View individual project details
- Update projects
- Delete projects
- Project descriptions
- Custom project colors
- Project creator/manager permissions
- Project member management

### 📋 Task Management

- Create tasks
- View tasks
- View individual task details
- Update tasks
- Delete tasks
- Assign tasks to project members
- Task descriptions
- Task priorities
- Task due dates
- Task tags
- Task ordering
- Drag-and-drop Kanban workflow

### 🔄 Kanban Workflow

Tasks can be organized across four workflow stages:

```text
Backlog → In Progress → Review → Done
```

Task status can be updated through the Kanban board using drag and drop.

### 👥 Team Collaboration

- Search for registered users
- Invite users to projects
- View pending project invitations
- Accept project invitations
- Reject project invitations
- View project members
- Remove project members
- Project-manager authorization for member administration

### 📊 Dashboard

The dashboard provides an overview of:

- Total projects
- Total tasks
- Completed tasks
- Tasks currently in progress
- Recent projects

---

## 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- dnd-kit
- Lucide React
- React Hot Toast

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- CORS
- dotenv

### Testing

- Playwright
- TypeScript
- Page Object Model
- Playwright Fixtures
- UI and API Automation
- GitHub Actions

### Deployment & Development

- Git
- GitHub
- Vercel
- Render
- MongoDB Atlas

---

## 🧪 Automated Testing

SprintBoard includes a dedicated Playwright test suite covering both the frontend and backend.

**[View the complete testing documentation](tests/README.md)**

### Test Strategy

The suite separates responsibilities so each test stays focused:

- **UI tests** validate real user workflows through the browser.
- **API tests** validate backend contracts, status codes, authorization, and CRUD behavior.
- **Fixtures** create isolated projects/tasks and clean them up after tests.
- **Authentication setup** creates one reusable authenticated browser state for protected UI tests.
- **Page Objects** keep selectors and common interactions out of the test cases.

### Cross-Browser Coverage

The Playwright suite validates critical workflows across three browser engines:

- **Chromium** runs the primary UI regression suite.
- **Firefox** runs public and authenticated critical workflows.
- **WebKit** provides Safari-engine coverage for public and authenticated critical workflows.
- **API tests** run independently from browser automation.

| Test Area                     | Chromium | Firefox | WebKit |
| ----------------------------- | :------: | :-----: | :----: |
| Authentication & Registration |   Yes    |   Yes   |  Yes   |
| Smoke Testing                 |   Yes    |   Yes   |  Yes   |
| Unauthenticated Access        |   Yes    |   Yes   |  Yes   |
| Project Workflows             |   Yes    |   Yes   |  Yes   |
| Task Workflows                |   Yes    |   Yes   |  Yes   |
| Protected Routes              |   Yes    |   Yes   |  Yes   |

Chromium receives the full regression suite, while Firefox and WebKit provide targeted cross-browser coverage of the application's highest-value workflows.

### Coverage

The suite covers:

- Login and registration validation
- Authentication state and protected routes
- Project creation and navigation
- Project modal behavior
- Task creation with different values
- Task editing and cancellation
- Task deletion and confirmation dialogs
- Project member dialog and search
- API authentication
- API authorization
- Project CRUD
- Task CRUD
- Task status updates
- User search API

---

## 🏗️ Architecture

SprintBoard uses a client-server architecture where the React frontend communicates with a REST API built with Node.js and Express. MongoDB provides persistent data storage through Mongoose.

```text
                         ┌──────────────────────┐
                         │    User / Browser    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  React + TypeScript  │
                         │        Vite          │
                         │                      │
                         │ React Router         │
                         │ Axios                │
                         │ Tailwind CSS         │
                         │ dnd-kit              │
                         └──────────┬───────────┘
                                    │
                               REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Node.js + Express  │
                         │                      │
                         │ Routes               │
                         │ Controllers          │
                         │ JWT Authentication   │
                         │ Authorization        │
                         └──────────┬───────────┘
                                    │
                                Mongoose
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     MongoDB Atlas    │
                         │                      │
                         │ Users                │
                         │ Projects             │
                         │ Tasks                │
                         │ Invitations          │
                         └──────────────────────┘
```

### Production Deployment

```text
                 Vercel
             React Frontend
                    │
                    │ HTTPS / REST API
                    ▼
                 Render
           Node.js + Express API
                    │
                    │ Mongoose
                    ▼
             MongoDB Atlas
                Database
```

---

## 📂 Project Structure

```text
SprintBoard/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── vercel.json
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   ├── pages/
│   ├── auth.setup.ts
│   ├── playwright.config.ts
│   └── README.md
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🔑 Authentication Flow

SprintBoard uses JSON Web Tokens to authenticate users and protect application resources.

### Registration

1. The user submits their name, email, and password.
2. The backend checks whether the email already exists.
3. The password is hashed using bcrypt.
4. The user is stored in MongoDB.
5. A JWT is generated for the authenticated user.
6. The frontend stores the authentication token.

### Login

1. The user submits their email and password.
2. The backend searches for the corresponding account.
3. bcrypt compares the submitted password with the stored password hash.
4. A JWT is generated after successful authentication.
5. The frontend stores the token.
6. Axios attaches the token to protected API requests.

### Protected Routes

The backend authentication middleware verifies the JWT before allowing access to protected project and task endpoints.

The frontend also uses protected routes to prevent unauthenticated users from accessing application pages.

---

## 🔌 REST API

The backend exposes REST API endpoints for authentication, project management, team collaboration, and task management.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Projects

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Project Collaboration

```text
GET    /api/projects/users/search
POST   /api/projects/:id/invite
POST   /api/projects/:id/accept
POST   /api/projects/:id/reject
DELETE /api/projects/:id/members
```

### Tasks

```text
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/status
```

### Health Check

```text
GET /api/health
```

The health-check endpoint is used to verify that the backend service is running.

---

## 🗄️ Data Models

### User

The User model contains:

- Name
- Email
- Password hash
- Role
- Creation and update timestamps

### Project

The Project model contains:

- Project name
- Description
- Project color
- Project creator
- Project members
- Project invitations
- Invitation status
- Invitation timestamp
- Creation and update timestamps

### Task

The Task model contains:

- Title
- Description
- Status
- Priority
- Project
- Assigned user
- Due date
- Display order
- Tags
- Creation and update timestamps

---

## 🚀 Getting Started

### Prerequisites

Before running SprintBoard locally, make sure you have:

- Node.js
- Git
- A MongoDB database, such as MongoDB Atlas

### 1. Clone the Repository

```bash
git clone https://github.com/KevinChristian0409/SprintBoard.git
cd SprintBoard
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open a second terminal and run:

```bash
cd server
npm install
```

### 4. Configure the Backend

Create a `.env` file inside the `server` directory.

Add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### Environment Variables

| Variable     | Purpose                                                |
| ------------ | ------------------------------------------------------ |
| `MONGO_URI`  | MongoDB connection string                              |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens              |
| `CLIENT_URL` | Frontend URL allowed by the backend CORS configuration |

The repository includes `server/.env.example` as a template.

> **Never commit your `.env` file, MongoDB credentials, or JWT secret to GitHub.**

### 5. Start the Backend

From the `server` directory:

```bash
node server.js
```

The backend runs locally on:

```text
http://localhost:5000
```

You can verify the API is running by visiting:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "OK"
}
```

### 6. Configure the Frontend

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

### 7. Start the Frontend

From the `client` directory:

```bash
npm run dev
```

The frontend runs locally on:

```text
http://localhost:5173
```

---

## ☁️ Production Deployment

SprintBoard is deployed as separate frontend and backend services.

### Frontend — Vercel

The React/Vite frontend is deployed on Vercel.

**Live Application:**

https://sprint-board-seven-omega.vercel.app

### Backend — Render

The Node.js/Express backend is deployed on Render.

### Database — MongoDB Atlas

MongoDB Atlas provides the persistent database used by the production backend.

---

## 🔒 Security

SprintBoard uses several security practices to protect application data:

- Passwords are hashed with bcrypt before being stored.
- JWTs authenticate protected API requests.
- Backend middleware validates authenticated requests.
- Protected frontend routes prevent unauthenticated access.
- Project access is checked before users can manage project resources.
- Project-manager permissions are enforced for project administration.
- Environment variables are used for sensitive configuration.
- `.env` files are excluded from source control.

---

## 🧪 Development Commands

### Run the Frontend

```bash
cd client
npm run dev
```

### Build the Frontend

```bash
cd client
npm run build
```

### Run Frontend Linting

```bash
cd client
npm run lint
```

### Preview the Frontend Production Build

```bash
cd client
npm run preview
```

### Run the Backend

```bash
cd server
node server.js
```

### Run Automated Tests

```bash
cd tests
npm test
```

See [`tests/README.md`](tests/README.md) for the complete Playwright test commands and framework details.

---

## 🤖 Continuous Integration

GitHub Actions runs the Playwright automation suite automatically.

The workflow:

- Installs dependencies
- Installs Playwright browsers
- Runs the automated test suite
- Reports test failures through the GitHub Actions workflow

Sensitive test credentials are provided through GitHub Actions secrets rather than stored in the repository.

---

## 🎯 What This Project Demonstrates

- React and TypeScript development
- REST API development
- Node.js and Express
- MongoDB and Mongoose
- JWT authentication
- Password hashing
- Protected routes
- Authorization and access control
- CRUD operations
- Kanban workflow implementation
- Drag-and-drop interfaces
- Team collaboration features
- API integration with Axios
- Playwright UI and API automation
- Page Object Model
- Playwright fixtures
- Reusable authentication state
- API-based test data setup
- Test isolation and cleanup
- Git and GitHub workflows
- GitHub Actions
- Cloud deployment

---

## 📄 License

This project was created for portfolio and educational purposes.
